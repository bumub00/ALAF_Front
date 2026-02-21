import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, X } from 'lucide-react';
import { UserContext } from '../../context/UserContext.js'; 

// 이메일 인증을 포함한 2단계 회원가입 페이지 컴포넌트
const WebSignup = () => {
  const navigate = useNavigate();
  // 가입 직후 자동 로그인을 처리하기 위해 UserContext 사용
  const { login } = useContext(UserContext);

  // -----------------------------------------------------------
  // 1. [상태 관리] 회원가입 진행 단계 및 UI 상태
  // -----------------------------------------------------------
  const [step, setStep] = useState(1); // 1: 정보입력, 2: 이메일 인증
  const [showTerms, setShowTerms] = useState(false); // 약관 동의 모달창 표시 여부
  const [isLoading, setIsLoading] = useState(false); // API 통신 중 로딩 상태 방지용

  // -----------------------------------------------------------
  // 2. [상태 관리] 사용자 입력 데이터 (DB 스키마와 매핑)
  // -----------------------------------------------------------
  const [inputs, setInputs] = useState({
    email: '', 
    password: '', 
    name: '', 
    phone_number: '' 
  });

  // 유효성 검사 관련 상태
  const [isFormValid, setIsFormValid] = useState(false); // 1단계 폼 유효성 통과 여부
  const [touched, setTouched] = useState({}); // 특정 필드를 한 번이라도 클릭했는지 여부 (에러 메시지 표시용)
  
  // 이메일 인증 관련 상태
  const [verifyCode, setVerifyCode] = useState(''); // 사용자가 입력한 인증번호 6자리
  const [timeLeft, setTimeLeft] = useState(180); // 인증번호 타이머 (3분 = 180초)

  // 약관 동의 체크박스 상태
  const [agreements, setAgreements] = useState({
    all: false, term1: false, term2: false, term3: false, term4: false, term5: false,
  });

  // 개별 약관 상세 내용 모달 상태 (null이면 닫힘)
  const [termDetail, setTermDetail] = useState(null);

  // -----------------------------------------------------------
  // 3. [Effect] 2단계(인증번호 입력) 진입 시 타이머 작동 로직
  // -----------------------------------------------------------
  useEffect(() => {
    let timer;
    // step이 2이고 시간이 남아있을 때만 1초마다 감소
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => { setTimeLeft((prev) => prev - 1); }, 1000);
    }
    // 컴포넌트 언마운트 또는 timeLeft 변경 시 기존 타이머 정리(메모리 누수 방지)
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // 초(seconds)를 mm:ss 형식의 문자열로 변환
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 일반 텍스트 입력 핸들러
  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // 입력창 포커스 아웃 핸들러 (유효성 에러 메시지 렌더링에 사용)
  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  // -----------------------------------------------------------
  // 4. [Effect] 1단계 입력 폼 실시간 유효성 검사
  // -----------------------------------------------------------
  useEffect(() => {
    if (step === 1) {
      const isValid = 
        inputs.email.includes('@') && 
        inputs.password.length >= 4 &&
        inputs.name.length > 0 &&
        inputs.phone_number.length >= 10;
      setIsFormValid(isValid); // 모두 만족하면 약관 동의 버튼 활성화
    }
  }, [inputs, step]);

  // -----------------------------------------------------------
  // 5. [핸들러] 약관 동의 로직 (전체 동의 / 개별 동의)
  // -----------------------------------------------------------
  const handleAllCheck = () => {
    const newValue = !agreements.all; // 현재 전체동의 상태의 반대값
    setAgreements({ all: newValue, term1: newValue, term2: newValue, term3: newValue, term4: newValue, term5: newValue });
  };

  const handleSingleCheck = (key) => {
    const newState = { ...agreements, [key]: !agreements[key] };
    // 하위 5개 항목이 모두 체크되었는지 확인하여 '전체 동의' 상태 자동 조절
    const allChecked = newState.term1 && newState.term2 && newState.term3 && newState.term4 && newState.term5;
    setAgreements({ ...newState, all: allChecked });
  };

  // -----------------------------------------------------------
  // 6. [API 통신] 약관 동의 완료 및 인증번호 발송 요청
  // -----------------------------------------------------------
  const handleConfirmTerms = async () => {
    if (!agreements.term1 || !agreements.term2 || !agreements.term3 || !agreements.term4) {
      return alert('필수 약관에 모두 동의해주세요.');
    }
    
    setShowTerms(false);
    setIsLoading(true);

    try {
      // 백엔드에 입력한 이메일로 인증번호 메일 발송 요청
      const res = await fetch('http://localhost:8080/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputs.email }), 
      });
      const data = await res.json();

      if (res.ok) {
        alert('이메일로 인증번호가 발송되었습니다.');
        setTimeLeft(180); // 타이머 3분 초기화
        setStep(2); // 2단계 화면으로 전환
      } else {
        alert(data.message || '인증번호 발송에 실패했습니다.');
      }
    } catch (error) {
      console.error('Email send error:', error);
      alert('서버와 통신할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 재발송 요청
  const handleResend = () => {
    if(isLoading) return;
    setVerifyCode(''); // 기존 입력된 코드 지우기
    handleConfirmTerms(); 
  };

  // -----------------------------------------------------------
  // 7. [API 통신] 최종 인증번호 검증 및 회원가입 데이터 저장
  // -----------------------------------------------------------
  const handleFinalVerification = async () => {
    if (timeLeft === 0) return alert('입력 시간이 초과되었습니다. 다시 받아주세요.');
    if (verifyCode.length !== 6) return alert('인증번호 6자리를 입력해주세요.');

    setIsLoading(true);
    try {
      // (1) 이메일 인증번호 일치 여부 검증
      const verifyRes = await fetch('http://localhost:8080/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputs.email, code: verifyCode }),
      });
      
      if (!verifyRes.ok) {
        setIsLoading(false);
        const verifyData = await verifyRes.json();
        return alert(verifyData.message || '인증번호가 틀렸습니다.');
      }

      // (2) 인증 성공 시, 입력해둔 유저 정보로 최종 회원가입 요청
      const registerRes = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs), 
      });
      const registerData = await registerRes.json();

      if (registerRes.ok) {
        // 회원가입 성공 처리: 발급된 토큰 저장 및 자동 로그인(Context) 처리
        localStorage.setItem('token', registerData.token);
        login(registerData.user);
        
        alert(`${inputs.name}님 환영합니다! 가입이 완료되었습니다.`);
        navigate('/'); // 메인 홈페이지로 이동
      } else {
        alert(registerData.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('서버 에러가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI 컴포넌트들 ---

  // 상단 뒤로가기 헤더 컴포넌트
  const Header = ({ title, onBack }) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30, position: 'relative', justifyContent: 'center' }}>
      <button onClick={onBack} style={{ position: 'absolute', left: 0, border: 'none', background: 'none', cursor: 'pointer' }}>
        <ArrowLeft size={24} color="#333" />
      </button>
      <h2 style={{ fontSize: 18, fontWeight: '700', color: '#333', margin: 0 }}>{title}</h2>
    </div>
  );

  // 개별 약관 상세 내용 화면 렌더링 분기
  if (termDetail) {
    return (
      <div className="pc-container" style={{ alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ background: 'white', padding: '40px 30px', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: 420, minHeight: 600, display: 'flex', flexDirection: 'column' }}>
          <Header title={termDetail.title} onBack={() => setTermDetail(null)} />
          <div style={{ flex: 1, overflowY: 'auto', fontSize: 14, color: '#555', lineHeight: '1.6', whiteSpace: 'pre-wrap', padding: '10px 5px' }}>
            {termDetail.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pc-container" style={{ alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ background: 'white', padding: '40px 30px', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: 420, minHeight: 600, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {/* =========================================
            [Step 1] 기본 회원 정보 입력 화면
            ========================================= */}
        {step === 1 && (
          <>
            <Header title="회원가입" onBack={() => navigate(-1)} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1, overflowY: 'auto', paddingRight: 5 }}>
              <div>
                <h4 style={{ margin: '0 0 15px 0', fontSize: 16, color: '#333' }}>계정 정보</h4>
                
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>아이디 (이메일)</label>
                  <input 
                    name="email" type="email" placeholder="example@tukorea.ac.kr" value={inputs.email} 
                    onChange={handleChange} onBlur={handleBlur}
                    style={inputs.email ? activeInputStyle : inputStyle}
                  />
                  {(touched.email && !inputs.email.includes('@')) && <span style={errorTextStyle}>올바른 이메일 형식을 입력해주세요</span>}
                </div>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>비밀번호</label>
                  <input 
                    name="password" type="password" placeholder="비밀번호 입력" value={inputs.password} 
                    onChange={handleChange} onBlur={handleBlur}
                    style={inputs.password ? activeInputStyle : inputStyle}
                  />
                </div>
              </div>

              <div style={{ height: 1, background: '#eee', margin: '5px 0' }}></div>

              <div>
                <h4 style={{ margin: '0 0 15px 0', fontSize: 16, color: '#333' }}>기본 정보</h4>
                
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>이름</label>
                  <input 
                    name="name" placeholder="이름 입력" value={inputs.name} 
                    onChange={handleChange} onBlur={handleBlur}
                    style={inputs.name ? activeInputStyle : inputStyle}
                  />
                </div>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>휴대폰번호</label>
                  <input 
                    name="phone_number" placeholder="-없이 숫자만 입력" maxLength="11"
                    value={inputs.phone_number} onChange={handleChange} onBlur={handleBlur}
                    style={inputs.phone_number.length > 9 ? activeInputStyle : inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* 입력 폼 유효성 검사 통과 시 활성화되는 '약관 동의' 모달 호출 버튼 */}
            <button 
              onClick={() => setShowTerms(true)} disabled={!isFormValid}
              style={{ ...activeButtonStyle, marginTop: 20, background: isFormValid ? '#2c3e50' : '#dcdcdc', color: isFormValid ? 'white' : '#999', cursor: isFormValid ? 'pointer' : 'default' }}
            >
              인증하고 가입하기
            </button>
          </>
        )}

        {/* =========================================
            [모달] 약관 동의 슬라이드업 바텀시트
            ========================================= */}
        {showTerms && (
          <>
            <div onClick={() => setShowTerms(false)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 9 }}></div>
            
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', maxHeight: '75%', background: 'white', zIndex: 10, display: 'flex', flexDirection: 'column', borderTopLeftRadius: 24, borderTopRightRadius: 24, animation: 'slideUp 0.3s ease-out' }}>
              
              <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: '1px solid #eee' }}>
                 <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>약관 동의</h3>
                 <button onClick={() => setShowTerms(false)} style={{ position: 'absolute', right: 20, background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#333" /></button>
              </div>
              
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                <div onClick={handleAllCheck} style={{ background: '#f8f9fa', padding: '15px', borderRadius: 12, display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: 15 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: agreements.all ? '#0ca678' : '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Check size={16} color="white" /></div>
                  <span style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>전체 동의</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* window.open을 통해 팝업창으로 약관 상세 확인 페이지 렌더링 */}
                  <TermItem text="ALAF 이용약관 (필수)" checked={agreements.term1} onCheck={() => handleSingleCheck('term1')} onView={() => window.open('/terms/1', '_blank', 'width=500,height=700,top=100,left=100')} />
                  <TermItem text="개인정보 수집 이용 동의 (필수)" checked={agreements.term2} onCheck={() => handleSingleCheck('term2')} onView={() => window.open('/terms/2', '_blank', 'width=500,height=700,top=100,left=100')} />
                  <TermItem text="이메일 본인확인 인증동의 (필수)" checked={agreements.term3} onCheck={() => handleSingleCheck('term3')} onView={() => window.open('/terms/3', '_blank', 'width=500,height=700,top=100,left=100')} />
                  <TermItem text="위치정보 이용약관 동의 (필수)" checked={agreements.term4} onCheck={() => handleSingleCheck('term4')} onView={() => window.open('/terms/4', '_blank', 'width=500,height=700,top=100,left=100')} />
                  <TermItem text="이벤트 마케팅 수신 동의 (선택)" checked={agreements.term5} onCheck={() => handleSingleCheck('term5')} onView={() => window.open('/terms/5', '_blank', 'width=500,height=700,top=100,left=100')} />
                </div>
              </div>
              
              <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
                 <button 
                    onClick={handleConfirmTerms} disabled={isLoading}
                    style={{ ...activeButtonStyle, background: (agreements.term1 && agreements.term2 && agreements.term3 && agreements.term4) ? '#2c3e50' : '#dcdcdc' }}
                 >
                    {isLoading ? '발송 중...' : '동의하고 인증번호 받기'}
                 </button>
              </div>
            </div>
          </>
        )}

        {/* =========================================
            [Step 2] 이메일 인증번호 확인 화면
            ========================================= */}
        {step === 2 && (
          <>
            <Header title="이메일 인증" onBack={() => setStep(1)} />
            
            <div style={{ flex: 1, paddingTop: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 }}>인증번호를 입력해주세요.</h3>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 30 }}>{inputs.email}로 발송되었습니다.</p>

              <div style={fieldGroupStyle}>
                <label style={labelStyle}>인증번호</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input 
                    placeholder="인증번호 6자리" maxLength="6"
                    value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)}
                    style={{ ...inputStyle, paddingRight: 60 }} 
                  />
                  {/* 동적 타이머 렌더링 */}
                  <span style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', color: '#ff6b6b', fontSize: 14, fontWeight: '500' }}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 15, textAlign: 'center', fontSize: 13, color: '#888' }}>
                인증번호를 받지 못하셨나요? 
                <span onClick={handleResend} style={{ marginLeft: 5, color: '#333', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>다시 받기</span>
              </div>
            </div>

            <button 
              onClick={handleFinalVerification} 
              disabled={verifyCode.length < 6 || isLoading}
              style={{ ...activeButtonStyle, marginTop: 20, background: verifyCode.length >= 6 ? '#2c3e50' : '#dcdcdc' }}
            >
              {isLoading ? '가입 처리 중...' : '인증하고 가입 완료'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* --- 하위 컴포넌트 & 스타일 영역 --- */

// 개별 약관 동의 리스트 아이템 컴포넌트
const TermItem = ({ text, checked, onCheck, onView }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' }}>
    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }} onClick={onCheck}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', border: checked ? 'none' : '1px solid #ddd', background: checked ? '#0ca678' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
        {checked && <Check size={14} color="white" />}
      </div>
      <span style={{ fontSize: 14, color: '#333' }}>{text}</span>
    </div>
    <div style={{ padding: '5px', cursor: 'pointer' }} onClick={onView}>
      <ChevronRight size={18} color="#ccc" />
    </div>
  </div>
);

// 공통 스타일 정의 객체
const labelStyle = { display: 'block', fontSize: 13, color: '#666', marginBottom: 8 };
const fieldGroupStyle = { marginBottom: 20 };
const errorTextStyle = { display: 'block', fontSize: 12, color: '#ff6b6b', marginTop: 6 };
const inputStyle = { width: '100%', height: 48, padding: '0 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, outline: 'none', boxSizing: 'border-box' };
const activeInputStyle = { ...inputStyle, border: '1px solid #333' };
const activeButtonStyle = { width: '100%', height: 52, borderRadius: 8, border: 'none', background: '#2c3e50', color: 'white', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' };

// 바텀시트 슬라이드 애니메이션을 위한 전역 스타일 주입
const slideUpStyle = document.createElement('style');
slideUpStyle.innerHTML = `@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`;
document.head.appendChild(slideUpStyle);

export default WebSignup;