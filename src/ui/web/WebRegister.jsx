import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemContext } from '../../context/ItemContext';
import { UserContext } from '../../context/UserContext';
import { Camera, X } from 'lucide-react'; // ★ ArrowLeft 삭제
import './WebRegister.css';

// -----------------------------------------------------------
// [데이터 정의] 카테고리 및 건물 리스트
// -----------------------------------------------------------
const CATEGORY_DATA = {
  '가방': ['여성용가방', '남성용가방', '기타 가방'],
  '귀금속': ['반지', '목걸이', '귀걸이', '시계', '기타 귀금속'],
  '도서용품': ['학습서적', '소설', '컴퓨터서적', '만화책', '기타 서적'],
  '서류': ['서류', '기타 서류'],
  '쇼핑백': ['쇼핑백'],
  '스포츠용품': ['스포츠용품'],
  '악기': ['건반악기', '타악기', '관악기', '현악기', '기타 악기'],
  '의류': ['여성의류', '남성의류', '아기의류', '모자', '신발', '기타 의류'],
  '자동차': ['자동차열쇠', '네비게이션', '자동차번호판', '임시번호판', '기타 자동차용품'],
  '전자기기': ['태블릿', '스마트워치', '무선이어폰', '카메라', '기타 전자기기'],
  '지갑': ['여성용지갑', '남성용지갑', '기타 지갑'],
  '증명서': ['신분증', '면허증', '여권', '기타 증명서'],
  '컴퓨터': ['삼성노트북', 'LG노트북', '애플노트북', '기타 컴퓨터'],
  '카드': ['신용(체크)카드', '일반카드', '교통카드', '기타 카드'],
  '현금': ['현금'],
  '유가증권': ['어음','상품권','채권','기타 유가증권'],
  '휴대폰': ['삼성휴대폰', 'LG휴대폰', '아이폰', '기타 휴대폰', '기타 통신기기'],
  '기타물품': ['기타 물품']
};

const NODE_LIST = [
  { id: 1, name: 'A동 (기계,디자인)' }, { id: 2, name: 'B동 (기계설계,메카)' },
  { id: 3, name: 'C동 (에너지,전기)' }, { id: 4, name: 'D동 (신소재,생명화학)' },
  { id: 5, name: 'E동 (SW)' }, { id: 6, name: '체육관' },
  { id: 7, name: 'G동 (경영)' }, { id: 8, name: 'P동 (반도체)' },
  { id: 9, name: '산학융합관(전자공학부)' }, { id: 10, name: 'TIP (기술혁신파크)' },
  { id: 11, name: '종합교육관 (중앙도서관)' }, { id: 12, name: '제2생활관' },
  { id: 13, name: '행정동' }, { id: 14, name: '체육관' },
  { id: 15, name: '창업보육센터' }, { id: 16, name: '시흥비즈니스센터' },
  { id: 17, name: '운동장' }, { id: 18, name: '주차타워' },
  { id: 19, name: 'TU광장 (벙커)' }, { id: 20, name: '기타(교내)' },
  { id: 21, name: '기타(교외)' }
];

const WebRegister = () => {
  const { addItem } = useContext(ItemContext);
  const { user } = useContext(UserContext); 
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [majorCategory, setMajorCategory] = useState('가방');
  const [inputs, setInputs] = useState({
    title: '', category: '여성용가방', nodeId: '', detailLocation: '', date: '', desc: '', image: null
  });
  
  const [realImageFile, setRealImageFile] = useState(null);

  const handleMajorChange = (e) => {
    const newMajor = e.target.value;
    setMajorCategory(newMajor);
    setInputs(prev => ({ ...prev, category: CATEGORY_DATA[newMajor][0] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  const handleBoxClick = () => fileInputRef.current.click();
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setInputs({ ...inputs, image: imageUrl });
      setRealImageFile(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation(); 
    setInputs({ ...inputs, image: null });
    setRealImageFile(null); 
  };

  const handleSubmit = async () => {
    if (!inputs.title || !inputs.nodeId || !inputs.detailLocation || !inputs.date) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }
    const success = await addItem(inputs, realImageFile);
    if (success) {
      alert('습득물이 서버에 등록되었습니다!');
      navigate('/'); 
    }
  };

  return (
    <div className="pc-container">
      
      <header className="pc-header">
        <div className="header-inner">
          <div className="logo" onClick={() => navigate('/')} style={{cursor:'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <img src="/logo.jpg" alt="ALAF Logo" style={{ height: '36px', width: 'auto' }} />
            <h1 className="logo-text">ALAF</h1>
          </div>

          <div className="pc-nav-menu">
             {/* ★ 화살표 아이콘 제거 및 텍스트만 남김 ★ */}
             <button className="menu-item" onClick={() => navigate(-1)}>
               돌아가기
             </button>
          </div>
        </div>
      </header>

      <main className="pc-main register-main">
        <div className="register-box">
          <div className="register-header">
            <h2>습득물 등록</h2>
            <p>습득하신 물건의 정보를 정확하게 입력해 주세요.</p>
          </div>

          <div className="register-form-grid">
            
            <div className="form-group">
              <label>물건명 <span className="required">*</span></label>
              <input name="title" className="input-field" placeholder="예: 삼성 갤럭시 S24, 검은색 가죽 지갑" value={inputs.title} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>대분류 <span className="required">*</span></label>
                <select value={majorCategory} onChange={handleMajorChange} className="input-field select-field">
                  {Object.keys(CATEGORY_DATA).map(major => (
                    <option key={major} value={major}>{major}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>상세 분류 <span className="required">*</span></label>
                <select name="category" value={inputs.category} onChange={handleChange} className="input-field select-field">
                  {CATEGORY_DATA[majorCategory].map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row form-row-3">
               <div className="form-group">
                <label>습득 날짜 <span className="required">*</span></label>
                <input name="date" type="date" value={inputs.date} onChange={handleChange} className="input-field" />
              </div>
              
              <div className="form-group">
                <label>건물 <span className="required">*</span></label>
                <select name="nodeId" value={inputs.nodeId} onChange={handleChange} className="input-field select-field">
                  <option value="" disabled>건물 선택</option>
                  {NODE_LIST.map(node => (
                    <option key={node.id} value={node.id}>{node.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>세부 장소 <span className="required">*</span></label>
                <input name="detailLocation" placeholder="예: 304호 창가쪽 책상" value={inputs.detailLocation} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div className="form-group">
              <label>사진 첨부</label>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
              
              <div className="image-upload-box" onClick={handleBoxClick} style={{ background: inputs.image ? `url(${inputs.image}) center/contain no-repeat #f7f7f9` : '#f7f7f9' }}>
                {!inputs.image ? (
                  <div className="upload-placeholder">
                    <Camera size={36} color="#aaa" />
                    <span>클릭하여 사진 업로드</span>
                  </div>
                ) : (
                  <button className="image-remove-btn" onClick={handleRemoveImage}><X size={18} /></button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>상세 설명</label>
              <textarea name="desc" className="input-field textarea-field" placeholder="물건의 특징이나 습득 당시의 상황을 자세히 적어주시면 주인을 찾는 데 큰 도움이 됩니다." value={inputs.desc} onChange={handleChange} />
            </div>

            <div className="info-message">
              {user 
                ? <span className="user-info">습득물 등록 시 매너 포인트가 지급됩니다.</span> 
                : <span className="guest-info">비회원으로 등록 중입니다. (포인트 미지급)</span>
              }
            </div>

            <button className="submit-btn" onClick={handleSubmit}>습득물 등록 완료</button>

          </div>
        </div>
      </main>

      <footer className="pc-footer">
        <p>© 2026 ALAF Team. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WebRegister;