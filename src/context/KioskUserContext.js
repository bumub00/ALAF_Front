import React, { createContext, useState } from 'react';

// 이름 변경: UserContext -> KioskUserContext
export const KioskUserContext = createContext();

// 이름 변경: UserProvider -> KioskUserProvider
export const KioskUserProvider = ({ children }) => {
  const [user, setUser] = useState(null); 

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

  const logout = () => {
    setUser(null); 
  };

  return (
    <KioskUserContext.Provider value={{ user, login, logout }}>
      {children}
    </KioskUserContext.Provider>
  );
};