import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemContext } from '../../context/ItemContext';
import { UserContext } from '../../context/UserContext';
import WebLogin from './WebLogin';
import { ArrowLeft, Camera, X } from 'lucide-react';

// -----------------------------------------------------------
// [데이터 정의] 카테고리(대분류-소분류) 및 건물(장소) 리스트
// -----------------------------------------------------------
const CATEGORY_DATA = {
  '가방': ['여성용가방', '남성용가방', '기타가방'],
  '귀금속': ['반지', '목걸이', '귀걸이', '시계', '기타'],
  // ... (중략: 기존 데이터 유지) ...
  '기타물품': ['기타물품']
};

const NODE_LIST = [
  { id: 1, name: 'A동 (종합교육관)' },
  { id: 2, name: 'B동 (기계관)' },
  // ... (중략) ...
  { id: 8, name: '기타' }
];

const WebRegister = () => {
  // 전역 상태에서 등록 함수(addItem)와 유저 정보(user) 가져오기
  const { addItem } = useContext(ItemContext);
  const { user } = useContext(UserContext); 
  const navigate = useNavigate();
  
  // 파일 업로드 input 태그를 제어하기 위한 ref
  const fileInputRef = useRef(null);

  // 1. [상태 관리] 입력 폼 데이터 및 UI 상태
  const [majorCategory, setMajorCategory] = useState('가방'); // 대분류 선택값
  const [inputs, setInputs] = useState({
    title: '',
    category: '여성용가방', // 초기값: 가방의 첫 번째 소분류
    nodeId: '',         
    detailLocation: '', 
    date: '',
    desc: '',
    image: null // 미리보기용 이미지 URL
  });
  
  // 실제 서버로 전송할 파일 객체 (File Object)
  const [realImageFile, setRealImageFile] = useState(null);

  // -----------------------------------------------------------
  // 🚨 [보안] 비로그인 상태 접근 차단 (로그인 페이지로 리다이렉트)
  // returnUrl을 지정하여 로그인 후 다시 이 페이지로 돌아오도록 설정
  // -----------------------------------------------------------
  if (!user) {
    return <WebLogin returnUrl="/register" />;
  }

  // -----------------------------------------------------------
  // 2. [핸들러] 입력값 변경 처리
  // -----------------------------------------------------------
  
  // 대분류 변경 시 -> 소분류 목록을 해당 대분류의 첫 번째 항목으로 자동 갱신
  const handleMajorChange = (e) => {
    const newMajor = e.target.value;
    setMajorCategory(newMajor);
    
    setInputs(prev => ({
      ...prev,
      category: CATEGORY_DATA[newMajor][0] 
    }));
  };

  // 일반 텍스트 입력 필드 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  // 이미지 박스 클릭 시 숨겨진 input[type="file"] 클릭 트리거
  const handleBoxClick = () => fileInputRef.current.click();
  
  // 파일 선택 시 미리보기 생성 및 파일 객체 저장
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setInputs({ ...inputs, image: imageUrl });
      setRealImageFile(file);
    }
  };

  // 이미지 삭제 버튼 클릭 시 초기화
  const handleRemoveImage = (e) => {
    e.stopPropagation(); // 부모(박스) 클릭 이벤트 전파 방지
    setInputs({ ...inputs, image: null });
    setRealImageFile(null); 
  };

  // -----------------------------------------------------------
  // 3. [등록 요청] 서버로 데이터 전송
  // -----------------------------------------------------------
  const handleSubmit = async () => {
    // 필수 입력값 검증
    if (!inputs.title || !inputs.nodeId || !inputs.detailLocation || !inputs.date) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    // Context의 addItem 함수 호출 (FormData 생성 및 axios 통신은 거기서 수행)
    const success = await addItem(inputs, realImageFile);

    if (success) {
      alert('습득물이 서버에 등록되었습니다!');
      navigate('/'); // 메인 화면으로 이동
    }
  };

  return (
    <div className="pc-container">
      
      {/* 상단 헤더 */}
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

      {/* 메인 등록 폼 영역 */}
      <main className="pc-main">
        <div style={{ maxWidth: 800, margin: '0 auto', background: 'white', padding: 40, borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h2 style={{ borderBottom: '2px solid #333', paddingBottom: 20, marginBottom: 30 }}>
            습득물 등록
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* 물건명 입력 */}
            <div className="form-group">
              <label style={{display:'block', fontWeight:'bold', marginBottom:8}}>물건명 (필수)</label>
              <input name="title" placeholder="예: 삼성 갤럭시 S24" value={inputs.title} onChange={handleChange} style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd'}} />
            </div>

            {/* 카테고리 선택 (대분류 -> 소분류) */}
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

            {/* 날짜 및 장소 입력 */}
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

            {/* 사진 업로드 영역 (커스텀 디자인) */}
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

            {/* 상세 설명 및 등록 버튼 */}
            <div className="form-group">
              <label style={{display:'block', fontWeight:'bold', marginBottom:8}}>상세 설명</label>
              <textarea name="desc" placeholder="내용 입력" value={inputs.desc} onChange={handleChange} style={{width:'100%', height: 120, padding:12, borderRadius:8, border:'1px solid #ddd', resize:'none'}} />
            </div>

            <button onClick={handleSubmit} style={{ width: '100%', padding: 16, background: '#2c3e50', color: 'white', borderRadius: 10, fontSize: 18, fontWeight: 'bold', marginTop: 20, cursor: 'pointer', border: 'none' }}>등록 완료</button>

          </div>
        </div>
      </main>
    </div>
  );
};

export default WebRegister;