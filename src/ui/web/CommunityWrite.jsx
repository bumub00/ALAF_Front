import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import './CommunityWrite.css'; // ★ 전용 CSS 연결

const CATEGORY_DATA = {
  '가방': [{ id: 1, name: '여성용가방' }, { id: 2, name: '남성용가방' }, { id: 3, name: '기타가방' }],
  '귀금속': [{ id: 4, name: '반지' }, { id: 5, name: '목걸이' }, { id: 6, name: '귀걸이' }, { id: 7, name: '시계' }, { id: 8, name: '기타 귀금속' }],
  '도서용품': [{ id: 9, name: '학습서적' }, { id: 10, name: '소설' }, { id: 11, name: '컴퓨터서적' }, { id: 12, name: '만화책' }, { id: 13, name: '기타 서적' }],
  '서류': [{ id: 14, name: '서류' }, { id: 15, name: '기타 서류' }],
  '쇼핑백': [{ id: 16, name: '쇼핑백' }],
  '스포츠용품': [{ id: 17, name: '스포츠용품' }],
  '악기': [{ id: 18, name: '건반악기' }, { id: 19, name: '타악기' }, { id: 20, name: '관악기' }, { id: 21, name: '현악기' }, { id: 22, name: '기타 악기' }],
  '의류': [{ id: 23, name: '여성의류' }, { id: 24, name: '남성의류' }, { id: 25, name: '아기의류' }, { id: 26, name: '모자' }, { id: 27, name: '신발' }, { id: 28, name: '기타 의류' }],
  '자동차': [{ id: 29, name: '자동차열쇠' }, { id: 30, name: '네비게이션' }, { id: 31, name: '자동차번호판' }, { id: 32, name: '임시번호판' }, { id: 33, name: '기타 자동차용품' }],
  '전자기기': [{ id: 34, name: '태블릿' }, { id: 35, name: '스마트워치' }, { id: 36, name: '무선이어폰' }, { id: 37, name: '카메라' }, { id: 38, name: '기타 전자기기' }],
  '지갑': [{ id: 39, name: '여성용지갑' }, { id: 40, name: '남성용지갑' }, { id: 41, name: '기타 지갑' }],
  '증명서': [{ id: 42, name: '신분증' }, { id: 43, name: '면허증' }, { id: 44, name: '여권' }, { id: 45, name: '기타 증명서' }],
  '컴퓨터': [{ id: 46, name: '삼성노트북' }, { id: 47, name: 'LG노트북' }, { id: 48, name: '애플노트북' }, { id: 49, name: '기타 컴퓨터' }],
  '카드': [{ id: 50, name: '신용(체크)카드' }, { id: 51, name: '일반카드' }, { id: 52, name: '교통카드' }, { id: 53, name: '기타 카드' }],
  '현금': [{ id: 54, name: '현금' }],
  '유가증권': [{ id: 55, name: '어음' }, { id: 56, name: '상품권' }, { id: 57, name: '채권' }, { id: 58, name: '기타 유가증권' }],
  '휴대폰': [{ id: 59, name: '삼성휴대폰' }, { id: 60, name: 'LG휴대폰' }, { id: 61, name: '아이폰' }, { id: 62, name: '기타 휴대폰' }, { id: 63, name: '기타 통신기기' }],
  '기타물품': [{ id: 64, name: '기타 물품' }]
};

const CommunityWrite = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [formData, setFormData] = useState({
    post_type: 'LOST', 
    title: '',
    content: '',
    category_id: 1, 
    image: null
  });
  const [majorCategory, setMajorCategory] = useState('가방');
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMajorChange = (e) => {
      const newMajor = e.target.value;
      setMajorCategory(newMajor);
      setFormData({ ...formData, category_id: CATEGORY_DATA[newMajor][0].id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const submitData = new FormData();
    submitData.append('post_type', formData.post_type);
    submitData.append('title', formData.title);
    submitData.append('content', formData.content);
    submitData.append('category_id', formData.category_id);
    if (formData.image) submitData.append('image', formData.image);

    try {
      await axios.post('http://49.50.138.248:8080/api/posts', submitData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('게시글이 등록되었습니다!');
      navigate('/community');
    } catch (error) {
      console.error(error);
      alert('등록에 실패했습니다.');
    }
  };

  return (
    <div className="write-container">
      {/* ★ 공통 헤더 적용 ★ */}
      <header className="pc-header">
        <div className="header-inner">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.jpg" alt="ALAF Logo" style={{ height: '36px', width: 'auto' }} />
            <h1 className="logo-text">ALAF</h1>
          </div>
          <div className="pc-nav-menu">
             <button className="menu-item" onClick={() => navigate(-1)}>돌아가기</button>
          </div>
        </div>
      </header>

      <main className="write-main">
        <div className="write-box">
          <div className="write-header">
            <h2>커뮤니티 글쓰기</h2>
          </div>

          <form className="write-form-grid" onSubmit={handleSubmit}>
            
            {/* 글 종류 선택 (토글 버튼) */}
            <div className="form-group">
              <label>어떤 글인가요?</label>
              <div className="type-toggle-group">
                <button 
                  type="button" 
                  className={`type-btn ${formData.post_type === 'LOST' ? 'active-lost' : ''}`}
                  onClick={() => setFormData({...formData, post_type: 'LOST'})}
                >
                  물건을 주웠어요 (습득)
                </button>
                <button 
                  type="button" 
                  className={`type-btn ${formData.post_type === 'LOOKING_FOR' ? 'active-looking' : ''}`}
                  onClick={() => setFormData({...formData, post_type: 'LOOKING_FOR'})}
                >
                  물건을 찾아요 (분실)
                </button>
              </div>
            </div>

            {/* 카테고리 선택 */}
            <div className="form-row">
                <div className="form-group">
                    <label>대분류</label>
                    <select value={majorCategory} onChange={handleMajorChange} className="select-field">
                      {Object.keys(CATEGORY_DATA).map(major => (
                          <option key={major} value={major}>{major}</option>
                      ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>소분류</label>
                    <select 
                      value={formData.category_id} 
                      onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })} 
                      className="select-field"
                    >
                      {CATEGORY_DATA[majorCategory].map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                </div>
            </div>

            {/* 제목 */}
            <div className="form-group">
              <label>제목</label>
              <input 
                type="text" required 
                placeholder="예: 도서관 3층에서 에어팟 본체 주웠습니다." 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="input-field" 
              />
            </div>

            {/* 내용 */}
            <div className="form-group">
              <label>상세 내용</label>
              <textarea 
                required 
                placeholder="물건의 특징이나 발견한 위치 등을 상세히 적어주세요." 
                value={formData.content} 
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="textarea-field" 
              />
            </div>

            {/* 사진 첨부 */}
            <div className="form-group">
              <label>사진 첨부 (선택)</label>
              <label className="image-upload-box">
                {preview ? (
                  <img src={preview} alt="미리보기" style={{ height: '100%', objectFit: 'contain', borderRadius: '10px' }} />
                ) : (
                  <div className="upload-placeholder">
                    <ImageIcon size={32} color="#adb5bd" />
                    <span>클릭하여 사진 업로드</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            </div>

            <button type="submit" className="submit-btn">
              등록하기
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CommunityWrite;