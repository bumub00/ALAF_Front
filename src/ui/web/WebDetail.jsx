import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ItemContext } from '../../context/ItemContext';
import { ArrowLeft, MapPin, Calendar, AlertCircle } from 'lucide-react';
import axios from 'axios';

const WebDetail = () => {
  const { id } = useParams();
  const { getItemDetail } = useContext(ItemContext);
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [proofData, setProofData] = useState({ address: '', desc: '', file: null });

  const submitClaim = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('item_id', id);
    formData.append('proof_detail_address', proofData.address);
    formData.append('proof_description', proofData.desc);
    if (proofData.file) formData.append('image', proofData.file);

    try {
      await axios.post('http://localhost:8080/api/requests', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('회수 신청이 완료되었습니다! (48시간 동안 선점됨)');
      window.location.reload(); 
    } catch (error) {
      alert(error.response?.data?.message || '신청 실패');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await getItemDetail(id);
      if (data) setItem(data);
      setLoading(false); 
    };
    loadData();
  }, [id, getItemDetail]);

  if (loading) return <div style={{padding:50, textAlign:'center'}}>데이터 불러오는 중...</div>;
  if (!item) return <div style={{padding:50, textAlign:'center'}}>물건 정보를 찾을 수 없습니다.</div>;
  
  return (
    <div className="pc-container" style={{paddingBottom: 50, background:'#f8f9fa', minHeight:'100vh'}}>
      
      {/* 👇 [수정] 상단 헤더 바 (다른 페이지와 디자인 통일 & 완전 좌측 정렬) */}
      <header className="pc-header">
        <div className="header-inner">
           <button 
             onClick={() => navigate(-1)} 
             style={{
               display:'flex', alignItems:'center', gap:5, 
               cursor:'pointer', fontWeight:'bold', fontSize: 16, 
               border:'none', background:'none', color:'#333'
             }}
           >
             <ArrowLeft size={24} /> 뒤로가기
           </button>
        </div>
      </header>

      {/* 메인 콘텐츠 (헤더 높이만큼 띄워줌) */}
      <main className="pc-main" style={{ marginTop: 20 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 50, background: 'white', padding: 50, borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          
          {/* [왼쪽] 이미지 영역 */}
          <div style={{ flex: 1 }}>
            <div style={{
              width:'100%', aspectRatio:'1/1', 
              borderRadius:20, overflow:'hidden', border:'1px solid #eee',
              display:'flex', alignItems:'center', justifyContent:'center', background:'#fafafa'
            }}>
              {item.image ? (
                <img src={item.image} alt="물건" style={{width:'100%', height:'100%', objectFit:'contain'}} />
              ) : (
                <span style={{color:'#ccc'}}>이미지 없음</span>
              )}
            </div>
          </div>

          {/* [오른쪽] 텍스트 정보 영역 */}
          <div style={{ flex: 1, display:'flex', flexDirection:'column' }}>
            
            {/* 카테고리 & 제목 */}
            <div>
                <span style={{background:'#f1f3f5', color:'#495057', padding:'6px 12px', borderRadius:20, fontSize:13, fontWeight:'600'}}>
                  {item.category}
                </span>
                <h1 style={{marginTop:15, marginBottom:10, fontSize:32, fontWeight:'800', color:'#212529'}}>
                  {item.title}
                </h1>
                <p style={{color:'#868e96', fontSize:14}}>
                  상태: {item.status}
                </p>
            </div>
            
            <div style={{height:1, background:'#eee', margin:'25px 0'}}></div>

            {/* 날짜 & 장소 정보 */}
            <div style={{display:'flex', flexDirection:'column', gap:15}}>
               <div style={{display:'flex', gap:12, alignItems:'center', color:'#495057'}}>
                 <Calendar size={20} color="#adb5bd"/> 
                 <span style={{fontWeight:'600', minWidth:60}}>습득일</span>
                 <span>{item.date}</span>
               </div>
               <div style={{display:'flex', gap:12, alignItems:'center', color:'#495057'}}>
                 <MapPin size={20} color="#adb5bd"/> 
                 <span style={{fontWeight:'600', minWidth:60}}>습득장소</span>
                 <span>{item.location}</span>
               </div>
            </div>

            <div style={{height:1, background:'#eee', margin:'25px 0'}}></div>

            {/* 상세 설명 */}
            <div style={{flex:1}}>
              <h4 style={{fontSize:16, fontWeight:'700', marginBottom:12}}>상세 설명</h4>
              <p style={{color:'#495057', lineHeight:1.6, whiteSpace: 'pre-line', fontSize:15}}>
                {item.desc || item.description || "상세 설명이 없습니다."}
              </p>
            </div>

            {/* 경고 박스 */}
            <div style={{
                marginTop: 30, padding: '16px 20px', background: '#FFF5F5', color: '#C92A2A',
                borderRadius: 8, fontSize: 13, lineHeight: 1.5, display:'flex', gap:12, alignItems:'flex-start'
            }}>
              <AlertCircle size={18} style={{marginTop:2, flexShrink:0}} />
              <div>
                <span style={{fontWeight:'bold'}}>본인의 물건이 확실한가요?</span> 타인의 물건을 허위로 수령 신청할 경우<br/>
                관련 법에 의해 처벌받을 수 있습니다.
              </div>
            </div>

            {/* 폼 영역 */}
            {!showForm ? (
                <button 
                    onClick={() => setShowForm(true)} 
                    disabled={item.is_available === false}
                    style={{
                        width:'100%', padding:18, 
                        background: item.is_available === false ? '#adb5bd' : '#343a40', 
                        color:'white', borderRadius:12, fontSize:16, fontWeight:'700', 
                        cursor: item.is_available === false ? 'not-allowed' : 'pointer', 
                        marginTop:15, border:'none'
                }}>
                  {item.is_available === false ? '현재 수령 불가' : '내 물건 수령 신청하기'}
                </button>
            ) : (
                <form onSubmit={submitClaim} style={{marginTop: 20, padding: 20, border: '1px solid #ddd', borderRadius: 12}}>
                    <h4 style={{marginBottom: 15, fontSize: 16}}>증거 제출 (본인 물건 인증)</h4>
                    
                    <label style={{fontSize: 13, fontWeight: 'bold'}}>증거 사진 첨부</label>
                    <input type="file" accept="image/*" onChange={(e) => setProofData({...proofData, file: e.target.files[0]})} style={{marginBottom: 15, width: '100%'}} />

                    <label style={{fontSize: 13, fontWeight: 'bold'}}>상세 습득 장소 유추</label>
                    <input type="text" placeholder="예: A동 3층 화장실 세면대 위" value={proofData.address} onChange={(e) => setProofData({...proofData, address: e.target.value})} style={{width: '100%', padding: 10, marginBottom: 15, borderRadius: 8, border: '1px solid #ccc'}} />

                    <label style={{fontSize: 13, fontWeight: 'bold'}}>상세 설명 (물건 특징)</label>
                    <textarea placeholder="예: 케이스 뒤에 라이언 스티커가 붙어있습니다." value={proofData.desc} onChange={(e) => setProofData({...proofData, desc: e.target.value})} style={{width: '100%', padding: 10, marginBottom: 15, borderRadius: 8, border: '1px solid #ccc', minHeight: 80}} />

                    <div style={{display: 'flex', gap: 10}}>
                        <button type="button" onClick={() => setShowForm(false)} style={{flex: 1, padding: 12, background: '#eee', border: 'none', borderRadius: 8, cursor: 'pointer'}}>취소</button>
                        <button type="submit" style={{flex: 2, padding: 12, background: '#2b8a3e', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer'}}>제출하기</button>
                    </div>
                </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WebDetail;