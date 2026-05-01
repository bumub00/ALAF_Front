import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ItemContext } from '../../context/ItemContext';
import { UserContext } from '../../context/UserContext';
import { ArrowLeft, MapPin, Calendar, AlertCircle, Eye, Trash2 } from 'lucide-react';
import axios from 'axios';
import './WebDetail.css'; // ★ 전용 CSS 연결

const WebDetail = () => {
  const { id } = useParams();
  const { getItemDetail, deleteItem } = useContext(ItemContext);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [proofData, setProofData] = useState({ address: '', desc: '', file: null });

  useEffect(() => {
    const loadData = async () => {
      const data = await getItemDetail(id);
      if (data) setItem(data);
      setLoading(false); 
    };
    loadData();
  }, [id, getItemDetail]);

  const submitClaim = async (e) => {
    e.preventDefault(); 
    
    const formData = new FormData();
    formData.append('item_id', id);
    formData.append('proof_detail_address', proofData.address); 
    formData.append('proof_description', proofData.desc);       
    if (proofData.file) formData.append('image', proofData.file); 

    try {
      await axios.post('http://49.50.138.248:8080/api/requests', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('회수 신청이 완료되었습니다! (48시간 동안 선점됨)');
      window.location.reload(); 
    } catch (error) {
      alert(error.response?.data?.message || '신청 실패');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("정말 이 분실물을 삭제하시겠습니까?\n(삭제 후 복구할 수 없습니다.)");
    if (confirmDelete) {
      const isSuccess = await deleteItem(id);
      if (isSuccess) {
        alert("성공적으로 삭제되었습니다.");
        navigate('/'); 
      }
    }
  };

  if (loading) return <div className="detail-loading">데이터 불러오는 중...</div>;
  if (!item) return <div className="detail-loading">물건 정보를 찾을 수 없습니다.</div>;
  
  return (
    <div className="detail-container">
      
      {/* ★ 공통 헤더 + logo.jpg 적용 ★ */}
      <header className="pc-header">
        <div className="header-inner">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.jpg" alt="ALAF Logo" style={{ height: '36px', width: 'auto' }} />
            <h1 className="logo-text">ALAF</h1>
          </div>

          <div className="pc-nav-menu">
             <button className="menu-item" onClick={() => navigate(-1)}>
               돌아가기
             </button>
          </div>
        </div>
      </header>

      {/* 메인 상세 정보 카드 영역 */}
      <main className="detail-main">
        <div className="detail-card">
          
          {/* [좌측 영역] 습득물 이미지 표시 */}
          <div className="detail-image-wrapper">
            <div className="detail-image-box">
              {item.image ? (
                <img src={item.image} alt="물건" />
              ) : (
                <span className="no-image-text">이미지 없음</span>
              )}
            </div>
          </div>

          {/* [우측 영역] 텍스트 정보 및 액션 버튼 */}
          <div className="detail-info-wrapper">
            
            <div className="info-header">
                <span className="category-badge">{item.category}</span>
                <h1 className="item-title">{item.title}</h1>
                <p className={`item-status ${item.is_available === false ? 'status-unavailable' : 'status-available'}`}>
                  상태: {item.status}
                </p>
            </div>
            
            <div className="detail-divider"></div>

            <div className="info-list">
               <div className="info-row">
                 <Calendar size={18} /> 
                 <span className="info-label">습득일</span>
                 <span className="info-value">{item.date}</span>
               </div>
               <div className="info-row">
                 <MapPin size={18} /> 
                 <span className="info-label">습득장소</span>
                 <span className="info-value">{item.location}</span>
               </div>
               <div className="info-row">
                <Eye size={18} />
                 <span className="info-label">조회수</span>
                 <span className="info-value">{item.view_count}회</span>
               </div>
            </div>

            <div className="detail-divider"></div>

            {/* 허위 신청 경고 문구 */}
            <div className="warning-box">
              <AlertCircle size={18} className="warning-icon" />
              <div className="warning-text">
                <strong>본인의 물건이 확실한가요?</strong><br/>
                타인의 물건을 허위로 수령 신청할 경우 관련 법에 의해 처벌받을 수 있습니다.
              </div>
            </div>

            {/* 수령 신청 액션 영역 */}
            {!showForm ? (
                <div className="action-area">
                  <button 
                      className={`claim-btn ${item.is_available === false ? 'disabled' : ''}`}
                      onClick={() => {
                          if (!user) {
                              alert('회수 신청은 회원만 가능합니다. 로그인 후 이용해주세요.');
                              return;
                          }
                          setShowForm(true);
                      }} 
                      disabled={item.is_available === false}
                  >
                    {item.is_available === false ? '현재 수령 불가' : '내 물건 수령 신청하기'}
                  </button>
                  
                  {!user && item.is_available !== false && (
                    <div className="guest-notice">
                      💡 회수 신청은 로그인 후 이용할 수 있습니다.
                    </div>
                  )}

                  {user && user.role === 'ADMIN' && (
                    <button className="admin-delete-btn" onClick={handleDelete}>
                      <Trash2 size={16} /> 이 분실물 삭제 (관리자 전용)
                    </button>
                  )}
                </div>
            ) : (
                // 증거 제출 폼 (본인 인증)
                <form className="claim-form" onSubmit={submitClaim}>
                    <h4>증거 제출 (본인 물건 인증)</h4>
                    
                    <div className="form-group">
                      <label>증거 사진 첨부</label>
                      <input type="file" accept="image/*" onChange={(e) => setProofData({...proofData, file: e.target.files[0]})} />
                    </div>

                    <div className="form-group">
                      <label>상세 습득 장소 유추</label>
                      <input type="text" placeholder="예: A동 3층 화장실 세면대 위" value={proofData.address} onChange={(e) => setProofData({...proofData, address: e.target.value})} className="input-field" />
                    </div>

                    <div className="form-group">
                      <label>상세 설명 (물건 특징)</label>
                      <textarea placeholder="예: 케이스 뒤에 라이언 스티커가 붙어있습니다." value={proofData.desc} onChange={(e) => setProofData({...proofData, desc: e.target.value})} className="textarea-field" />
                    </div>
                    
                    <div className="detail-form-actions">
                        <button type="button" className="detail-cancel-btn" onClick={() => setShowForm(false)}>취소</button>
                        <button type="submit" className="detail-submit-btn">제출하기</button>
                    </div>
                </form>
            )}
          </div>
        </div>
      </main>

      <footer className="pc-footer">
        <p>© 2026 ALAF Team. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WebDetail;