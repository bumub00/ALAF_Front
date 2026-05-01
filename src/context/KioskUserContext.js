import React, { createContext, useState } from 'react';

// 키오스크 전용 사용자(로그인) 전역 상태 관리 컨텍스트
export const KioskUserContext = createContext();

export const KioskUserProvider = ({ children }) => {
  // 현재 로그인된 사용자 상태 (null: 비로그인 상태)
  const [user, setUser] = useState(null); 

  // 키오스크 로그인 처리 (현재는 API 연동 전 테스트용 더미 데이터 사용)
  const login = (id, password) => {
    const mockUser = {
      id: 1,
      userId: id,
      name: '홍길동', 
      department: '컴퓨터공학과',
      studentId: '20261234'
    };
    setUser(mockUser);
    return true; 
  };

  // 로그아웃 처리 (사용자 상태 초기화)
  const logout = () => {
    setUser(null); 
  };

  return (
    <KioskUserContext.Provider value={{ user, login, logout }}>
      {children}
    </KioskUserContext.Provider>
  );
};