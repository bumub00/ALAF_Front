import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemContext } from '../../context/ItemContext';
import { UserContext } from '../../context/UserContext';
import WebLogin from './WebLogin';
import { ArrowLeft, Camera, X } from 'lucide-react';

const CATEGORY_DATA = {
  '가방': ['여성용가방', '남성용가방', '기타가방'],
  '귀금속': ['반지', '목걸이', '귀걸이', '시계', '기타(귀금속)'],
  '도서용품': ['학습서적', '소설', '컴퓨터서적', '만화책', '기타서적'],
  '서류': ['서류', '기타(서류)'],
  '쇼핑백': ['쇼핑백'],
  '스포츠용품': ['스포츠용품'],
  '악기': ['건반악기', '타악기', '관악기', '현악기', '기타악기'],
  '의류': ['여성의류', '남성의류', '아기의류', '모자', '신발', '기타의류'],
  '자동차': ['자동차열쇠', '네비게이션', '자동차번호판', '임시번호판', '기타(자동차용품)'],
  '전자기기': ['태블릿', '스마트워치', '무선이어폰', '카메라', '기타(전자기기)'],
  '지갑': ['여성용지갑', '남성용지갑', '기타지갑'],
  '증명서': ['신분증', '면허증', '여권', '기타(증명서)'],
  '컴퓨터': ['삼성노트북', 'LG노트북', '애플노트북', '기타(컴퓨터)'],
  '카드': ['신용(체크)카드', '일반카드', '교통카드', '기타카드'],
  '현금': ['현금'],
  '유가증권': ['유가증권'],
  '휴대폰': ['삼성휴대폰', 'LG휴대폰', '아이폰', '기타휴대폰', '기타통신기기'],
  '기타물품': ['기타물품']
};

const NODE_LIST = [
  { id: 1, name: 'A동 (종합교육관)' },
  { id: 2, name: 'B동 (기계관)' },
  { id: 3, name: 'C동 (에너지,전기)' },
  { id: 4, name: 'D동 (신소재,생명화학)' },
  { id: 5, name: 'E동 (SW)' },
  { id: 6, name: '체육관' },
  { id: 7, name: 'G동 (경영)' },
  { id: 8, name: 'P동 (반도체)' },
  { id: 9, name: '산학융합관 (전자공학부)' },
  { id: 10, name: 'TIP (기술혁신파크)' },
  { id: 11, name: '종합교육관 (중앙도서관)' },
  { id: 12, name: '제2생활관' },
  { id: 13, name: '행정동' },
  { id: 14, name: '체육관' },
  { id: 15, name: '창업보육센터' },
  { id: 16, name: '시흥비즈니스센터)' },
  { id: 17, name: '운동장' },
  { id: 18, name: '주차타워' },
  { id: 19, name: 'TU광장 (벙커)' },
  { id: 20, name: '기타 (교내)' },
  { id: 21, name: '기타 (교외)' },
];

const WebRegister = () => {
  const { addItem } = useContext(ItemContext);
  const { user } = useContext(UserContext); 
  const navigate = useNavigate();
  
  const fileInputRef = useRef(null);

  const [majorCategory, setMajorCategory] = useState('가방'); 
  const [inputs, setInputs] = useState({
    title: '',
    category: '여성용가방', 
    nodeId: '',         
    detailLocation: '', 
    date: '',
    desc: '',
    image: null 
  });
  
  const [realImageFile, setRealImageFile] = useState(null);

  const handleMajorChange = (e) => {
    const newMajor = e.target.value;
    setMajorCategory(newMajor);
    
    setInputs(prev => ({
      ...prev,
      category: CATEGORY_DATA[newMajor][0] 
    }));
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
           <button 
             onClick={() => navigate(-1)} 
             style={{display:'flex', alignItems:'center', gap:5, cursor:'pointer', fontWeight:'bold', fontSize: 16, border:'none', background:'none'}}
           >
             <ArrowLeft size={24} /> 뒤로가기
           </button>
        </div>
      </header>

      <main className="pc-main">
        <div style={{ maxWidth: 800, margin: '0 auto', background: 'white', padding: 40, borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h2 style={{ borderBottom: '2px solid #333', paddingBottom: 20, marginBottom: 30 }}>
            습득물 등록
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            <div className="form-group">
              <label style={{display:'block', fontWeight:'bold', marginBottom:8}}>물건명 (필수)</label>
              <input name="title" placeholder="예: 삼성 갤럭시 S24" value={inputs.title} onChange={handleChange} style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd'}} />
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={{display:'block', fontWeight:'bold', marginBottom:8}}>대분류</label>
                <select 
                  value={majorCategory} 
                  onChange={handleMajorChange} 
                  style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', cursor:'pointer'}}
                >
                  {Object.keys(CATEGORY_DATA).map(major => (
                    <option key={major} value={major}>{major}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{display:'block', fontWeight:'bold', marginBottom:8}}>상세 분류</label>
                <select 
                  name="category" 
                  value={inputs.category} 
                  onChange={handleChange} 
                  style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', cursor:'pointer'}}
                >
                  {CATEGORY_DATA[majorCategory].map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
               <div style={{ flex: 1 }}>
                <label style={{display:'block', fontWeight:'bold', marginBottom:8}}>습득 날짜 (필수)</label>
                <input name="date" type="date" value={inputs.date} onChange={handleChange} style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd'}} />
              </div>
              
              <div style={{ flex: 2, display: 'flex', gap: 10 }}>
                 <div style={{ flex: 1 }}>
                   <label style={{display:'block', fontWeight:'bold', marginBottom:8}}>건물 (필수)</label>
                   <select 
                     name="nodeId" value={inputs.nodeId} onChange={handleChange} 
                     style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', cursor:'pointer'}}
                   >
                     <option value="" disabled>건물 선택</option>
                     {NODE_LIST.map(node => (
                       <option key={node.id} value={node.id}>{node.name}</option>
                     ))}
                   </select>
                 </div>
                 <div style={{ flex: 1 }}>
                   <label style={{display:'block', fontWeight:'bold', marginBottom:8}}>세부 장소 (필수)</label>
                   <input name="detailLocation" placeholder="예: 304호 책상 위" value={inputs.detailLocation} onChange={handleChange} style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd'}} />
                 </div>
              </div>
            </div>

            <div className="form-group">
              <label style={{display:'block', fontWeight:'bold', marginBottom:8}}>사진 첨부</label>
              
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
              
              <div onClick={handleBoxClick} style={{ width: '100%', height: 250, background: inputs.image ? `url(${inputs.image}) center/contain no-repeat #f8f9fa` : '#f8f9fa', borderRadius: 10, border: '2px dashed #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa', cursor: 'pointer', position: 'relative' }}>
                {!inputs.image ? (
                  <>
                    <Camera size={40} style={{ marginBottom: 10 }} />
                    <span>클릭해서 사진 업로드</span>
                  </>
                ) : (
                  <button onClick={handleRemoveImage} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label style={{display:'block', fontWeight:'bold', marginBottom:8}}>상세 설명</label>
              <textarea name="desc" placeholder="내용 입력" value={inputs.desc} onChange={handleChange} style={{width:'100%', height: 120, padding:12, borderRadius:8, border:'1px solid #ddd', resize:'none'}} />
            </div>

            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 14, color: user ? '#27ae60' : '#e74c3c' }}>
              {user ? '🎁 습득물 등록 시 포인트가 지급됩니다.' : '💡 비회원으로 등록되며, 포인트는 지급되지 않습니다.'}
            </div>
            
            <button onClick={handleSubmit} style={{ width: '100%', padding: 16, background: '#2c3e50', color: 'white', borderRadius: 10, fontSize: 18, fontWeight: 'bold', marginTop: 20, cursor: 'pointer', border: 'none' }}>등록 완료</button>

          </div>
        </div>
      </main>
    </div>
  );
};

export default WebRegister;