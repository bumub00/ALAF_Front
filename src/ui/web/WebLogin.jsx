import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const WebLogin = () => {
  // 전역 상태(UserContext)에서 사용자 정보를 업데이트하는 login 함수 호출
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  
  // 로그인 폼 입력값 상태 관리
  const [inputs, setInputs] = useState({ id: '', pw: '' });

  // -----------------------------------------------------------
  // 1. [입력 핸들러] 아이디/비밀번호 타이핑 시 상태 실시간 업데이트
  // -----------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  // -----------------------------------------------------------
  // 2. [로그인 요청] 백엔드 API와 통신하여 인증 수행
  // -----------------------------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault(); // 폼 제출 시 브라우저 기본 동작(새로고침) 방지
    
    if (!inputs.id || !inputs.pw) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    
    // axios를 이용한 백엔드 로그인 API 호출
    axios.post('http://49.50.138.248:8080/api/auth/login', { 
      email: inputs.id, 
      password: inputs.pw 
    })
    .then((res) => {
      // 인증 성공 시 서버에서 발급한 JWT 토큰과 유저 정보를 받음
      const { token, user } = res.data;
      
      // 보안 토큰을 로컬 스토리지에 저장 (이후 API 요청 시 Authorization 헤더에 사용)
      localStorage.setItem('token', token); 

      // 전역 상태에 로그인된 유저 정보 업데이트
      if (typeof login === 'function') {
        login(user); 
      }
      
      // 로그인 완료 후 메인 홈(/)으로 이동
      navigate('/'); 
    })
    .catch((error) => {
      // 인증 실패 (비밀번호 불일치, 없는 계정 등) 처리
      console.error("로그인 에러:", error);
      const errorMsg = error.response?.data?.message || '로그인에 실패했습니다.';
      alert(errorMsg);
    });
  };

  return (
    // 로그인 컨테이너 영역 (화면 중앙 정렬)
    <div className="pc-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      
      <div style={{ background: 'white', padding: 50, borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: 400, textAlign: 'center' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: 30 }}>ALAF 로그인</h1>
        
        {/* 로그인 폼 제출 영역 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <input 
            name="id" 
            placeholder="아이디(이메일)" 
            value={inputs.id} 
            onChange={handleChange}
            style={{ padding: 15, borderRadius: 10, border: '1px solid #ddd', fontSize: 16 }}
          />
          <input 
            name="pw" 
            type="password" 
            placeholder="비밀번호" 
            value={inputs.pw} 
            onChange={handleChange}
            style={{ padding: 15, borderRadius: 10, border: '1px solid #ddd', fontSize: 16 }}
          />
          <button 
            type="submit"
            style={{ padding: 15, marginTop: 10, background: '#2c3e50', color: 'white', borderRadius: 10, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', border:'none' }}
          >
            로그인하기
          </button>
        </form>

        {/* 부가 네비게이션 링크 */}
        <p style={{ marginTop: 20, color: '#888', fontSize: 14 }}>
            계정이 없으신가요? <span onClick={() => navigate('/signup')}
            style={{ textDecoration:'underline', cursor:'pointer', color:'#2c3e50', fontWeight:'bold' }}>회원가입</span>
        </p>
        <button 
            onClick={() => navigate('/')} 
            style={{ marginTop: 10, background:'none', border:'none', color: '#aaa', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}
        >
            메인으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default WebLogin;