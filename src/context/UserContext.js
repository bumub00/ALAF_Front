import React, { createContext, useState, useEffect } from 'react';

// 웹 전용 사용자(로그인) 전역 상태 관리 컨텍스트
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // 현재 로그인된 사용자 정보 상태 (null: 비로그인)
  const [user, setUser] = useState(null); 

  // 앱 실행(새로고침) 시 로컬 스토리지 확인하여 로그인 세션 유지
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user'); 

    if (token && storedUser) {
      // 토큰과 유저 정보가 모두 존재하면 상태 복구
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 로그인 처리 (상태 업데이트 및 로컬 스토리지 영구 저장)
  const login = (userData) => {
    setUser(userData);
    // 새로고침해도 정보가 유지되도록 문자열로 변환하여 저장
    localStorage.setItem('user', JSON.stringify(userData)); 
    return true; 
  };

  // 로그아웃 처리 (상태 초기화 및 저장된 토큰/정보 삭제)
  const logout = () => {
    setUser(null); 
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');  
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};