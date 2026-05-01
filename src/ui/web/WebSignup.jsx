import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, X } from 'lucide-react';
import { UserContext } from '../../context/UserContext.js'; 
import './WebSignup.css';

const WebSignup = () => {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const [step, setStep] = useState(1); 
  const [showTerms, setShowTerms] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); 

  const [inputs, setInputs] = useState({ email: '', password: '', name: '', phone_number: '' });
  const [isFormValid, setIsFormValid] = useState(false); 
  const [touched, setTouched] = useState({}); 
  
  const [verifyCode, setVerifyCode] = useState(''); 
  const [timeLeft, setTimeLeft] = useState(180); 

  const [agreements, setAgreements] = useState({
    all: false, term1: false, term2: false, term3: false, term4: false, term5: false,
  });

  const [termDetail, setTermDetail] = useState(null);

  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => { setTimeLeft((prev) => prev - 1); }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  useEffect(() => {
    if (step === 1) {
      const isValid = 
        inputs.email.includes('@') && 
        inputs.password.length >= 4 &&
        inputs.name.length > 0 &&
        inputs.phone_number.length >= 10;
      setIsFormValid(isValid); 
    }
  }, [inputs, step]);

  const handleAllCheck = () => {
    const newValue = !agreements.all; 
    setAgreements({ all: newValue, term1: newValue, term2: newValue, term3: newValue, term4: newValue, term5: newValue });
  };

  const handleSingleCheck = (key) => {
    const newState = { ...agreements, [key]: !agreements[key] };
    const allChecked = newState.term1 && newState.term2 && newState.term3 && newState.term4 && newState.term5;
    setAgreements({ ...newState, all: allChecked });
  };

  const handleConfirmTerms = async () => {
    if (!agreements.term1 || !agreements.term2 || !agreements.term3 || !agreements.term4) {
      return alert('필수 약관에 모두 동의해주세요.');
    }
    
    setShowTerms(false);
    setIsLoading(true);

    try {
      const res = await fetch('http://49.50.138.248:8080/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputs.email }), 
      });
      const data = await res.json();

      if (res.ok) {
        alert('이메일로 인증번호가 발송되었습니다.');
        setTimeLeft(180); 
        setStep(2); 
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

  const handleResend = () => {
    if(isLoading) return;
    setVerifyCode(''); 
    handleConfirmTerms(); 
  };

  const handleFinalVerification = async () => {
    if (timeLeft === 0) return alert('입력 시간이 초과되었습니다. 다시 받아주세요.');
    if (verifyCode.length !== 6) return alert('인증번호 6자리를 입력해주세요.');

    setIsLoading(true);
    try {
      const verifyRes = await fetch('http://49.50.138.248:8080/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputs.email, code: verifyCode }),
      });
      
      if (!verifyRes.ok) {
        setIsLoading(false);
        const verifyData = await verifyRes.json();
        return alert(verifyData.message || '인증번호가 틀렸습니다.');
      }

      const registerRes = await fetch('http://49.50.138.248:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs), 
      });
      const registerData = await registerRes.json();

      if (registerRes.ok) {
        localStorage.setItem('token', registerData.token);
        login(registerData.user);
        alert(`${inputs.name}님 환영합니다! 가입이 완료되었습니다.`);
        navigate('/'); 
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

  const Header = ({ title, onBack }) => (
    <div className="signup-header">
      <button className="back-btn-icon" onClick={onBack}>
        <ArrowLeft size={24} color="#111" />
      </button>
      <h2>{title}</h2>
    </div>
  );

  if (termDetail) {
    return (
      <div className="signup-wrapper">
        <div className="signup-box">
          <Header title={termDetail.title} onBack={() => setTermDetail(null)} />
          <div className="term-detail-content">
            {termDetail.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-wrapper">
      <div className="signup-box">
      
        {step === 1 && (
          <div className="step-container">
            <Header title="회원가입" onBack={() => navigate(-1)} />
            
            <div className="signup-form-scroll">
              <div className="form-section">
                <h4>계정 정보</h4>
                
                <div className="form-group">
                  <label>아이디 (이메일)</label>
                  <input 
                    name="email" type="email" placeholder="example@tukorea.ac.kr" 
                    value={inputs.email} onChange={handleChange} onBlur={handleBlur}
                    className="input-field"
                  />
                  {(touched.email && !inputs.email.includes('@')) && <span className="error-text">올바른 이메일 형식을 입력해주세요</span>}
                </div>

                <div className="form-group">
                  <label>비밀번호</label>
                  <input 
                    name="password" type="password" placeholder="비밀번호 입력 (4자리 이상)" 
                    value={inputs.password} onChange={handleChange} onBlur={handleBlur}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="divider"></div>

              <div className="form-section">
                <h4>기본 정보</h4>
                
                <div className="form-group">
                  <label>이름</label>
                  <input 
                    name="name" placeholder="이름 입력" 
                    value={inputs.name} onChange={handleChange} onBlur={handleBlur}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>휴대폰번호</label>
                  <input 
                    name="phone_number" placeholder="-없이 숫자만 입력" maxLength="11"
                    value={inputs.phone_number} onChange={handleChange} onBlur={handleBlur}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <button 
              className="submit-btn" 
              onClick={() => setShowTerms(true)} 
              disabled={!isFormValid}
            >
              인증하고 가입하기
            </button>
          </div>
        )}
        {showTerms && (
          <>
            <div className="modal-overlay" onClick={() => setShowTerms(false)}></div>
            <div className="bottom-sheet">
              <div className="bottom-sheet-header">
                 <h3>약관 동의</h3>
                 <button onClick={() => setShowTerms(false)}><X size={24} color="#333" /></button>
              </div>
              
              <div className="bottom-sheet-content">
                <div className="check-all-box" onClick={handleAllCheck}>
                  <div className={`check-circle ${agreements.all ? 'active' : ''}`}>
                    <Check size={16} color="white" />
                  </div>
                  <span>전체 동의</span>
                </div>
                
                <div className="terms-list">
                  <TermItem text="ALAF 이용약관 (필수)" checked={agreements.term1} onCheck={() => handleSingleCheck('term1')} onView={() => window.open('/terms/1', '_blank', 'width=500,height=700,top=100,left=100')} />
                  <TermItem text="개인정보 수집 이용 동의 (필수)" checked={agreements.term2} onCheck={() => handleSingleCheck('term2')} onView={() => window.open('/terms/2', '_blank', 'width=500,height=700,top=100,left=100')} />
                  <TermItem text="이메일 본인확인 인증동의 (필수)" checked={agreements.term3} onCheck={() => handleSingleCheck('term3')} onView={() => window.open('/terms/3', '_blank', 'width=500,height=700,top=100,left=100')} />
                  <TermItem text="위치정보 이용약관 동의 (필수)" checked={agreements.term4} onCheck={() => handleSingleCheck('term4')} onView={() => window.open('/terms/4', '_blank', 'width=500,height=700,top=100,left=100')} />
                  <TermItem text="이벤트 마케팅 수신 동의 (선택)" checked={agreements.term5} onCheck={() => handleSingleCheck('term5')} onView={() => window.open('/terms/5', '_blank', 'width=500,height=700,top=100,left=100')} />
                </div>
              </div>
              
              <div className="bottom-sheet-footer">
                 <button 
                    className="submit-btn"
                    onClick={handleConfirmTerms} 
                    disabled={isLoading || !(agreements.term1 && agreements.term2 && agreements.term3 && agreements.term4)}
                 >
                    {isLoading ? '발송 중...' : '동의하고 인증번호 받기'}
                 </button>
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <div className="step-container">
            <Header title="이메일 인증" onBack={() => setStep(1)} />
            
            <div className="verify-content">
              <h3>인증번호를 입력해주세요.</h3>
              <p className="verify-desc">{inputs.email}로 발송되었습니다.</p>

              <div className="form-group">
                <label>인증번호</label>
                <div className="verify-input-wrapper">
                  <input 
                    className="input-field"
                    placeholder="인증번호 6자리" maxLength="6"
                    value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)}
                  />
                  <span className="timer">{formatTime(timeLeft)}</span>
                </div>
              </div>

              <div className="resend-info">
                인증번호를 받지 못하셨나요? 
                <span onClick={handleResend}>다시 받기</span>
              </div>
            </div>

            <button 
              className="submit-btn"
              onClick={handleFinalVerification} 
              disabled={verifyCode.length < 6 || isLoading}
            >
              {isLoading ? '가입 처리 중...' : '인증하고 가입 완료'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const TermItem = ({ text, checked, onCheck, onView }) => (
  <div className="term-item">
    <div className="term-item-left" onClick={onCheck}>
      <div className={`check-circle small ${checked ? 'active' : ''}`}>
        {checked && <Check size={14} color="white" />}
      </div>
      <span>{text}</span>
    </div>
    <div className="term-item-right" onClick={onView}>
      <ChevronRight size={18} color="#ccc" />
    </div>
  </div>
);

export default WebSignup;