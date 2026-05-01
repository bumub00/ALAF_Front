import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WebLogin.css'; 

const WebLogin = () => {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [inputs, setInputs] = useState({ id: '', pw: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    
    if (!inputs.id || !inputs.pw) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    
    axios.post('http://49.50.138.248:8080/api/auth/login', { 
      email: inputs.id, 
      password: inputs.pw 
    })
    .then((res) => {
      if (!res.data || !res.data.token || !res.data.user) {
        throw new Error(res.data?.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
      }

      const { token, user } = res.data;
      localStorage.setItem('token', token); 

      if (typeof login === 'function') {
        login(user); 
      }
      
      navigate('/'); 
    })
    .catch((error) => {
      console.error("로그인 에러:", error);
      const errorMsg = error.response?.data?.message || '로그인에 실패했습니다.';
      alert(errorMsg);
    });
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        
        {/* ★ onClick 삭제: 클릭해도 홈으로 가지 않음 ★ */}
        <div className="login-logo">
          <img src="/logo.jpg" alt="ALAF Logo" />
          <h1>ALAF</h1>
        </div>
        
        <h2 className="login-title">로그인</h2>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <input 
            name="id" 
            className="input-field"
            placeholder="아이디 (이메일)" 
            value={inputs.id} 
            onChange={handleChange}
          />
          <input 
            name="pw" 
            type="password" 
            className="input-field"
            placeholder="비밀번호" 
            value={inputs.pw} 
            onChange={handleChange}
          />
          <button type="submit" className="submit-btn">
            로그인
          </button>
        </form>

        <div className="extra-links">
          <p>
            계정이 없으신가요?{' '}
            <span className="link-text" onClick={() => navigate('/signup')}>
              회원가입
            </span>
          </p>
          <button className="back-btn" onClick={() => navigate('/')}>
            메인으로 돌아가기
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default WebLogin;