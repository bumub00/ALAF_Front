import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';

// -----------------------------------------------------------
// [1] 페이지 컴포넌트 불러오기
// -----------------------------------------------------------
// (1) 일반 웹(PC/Mobile)용 페이지
import WebHome from './ui/web/WebHome';
import WebDetail from './ui/web/WebDetail';
import WebRegister from './ui/web/WebRegister';
import WebMyPage from './ui/web/WebMyPage';
import WebSignup from './ui/web/WebSignup';
import WebTerms from './ui/web/WebTerms';
import WebLogin from './ui/web/WebLogin';

// (2) Admin 페이지
import AdminRequests from './ui/web/AdminRequests';

// (3) 커뮤니티
import CommunityHome from './ui/web/CommunityHome';
import CommunityDetail from './ui/web/CommunityDetail';
import CommunityWrite from './ui/web/CommunityWrite';

// ★ (4) 키오스크(Raspberry Pi)용 페이지 주석 해제!
import KioskHome from './ui/kiosk/KioskHome';
import KioskRegister from './ui/kiosk/KioskRegister';
import KioskCapture from './ui/kiosk/KioskCapture';
import KioskLocker from './ui/kiosk/KioskLocker';
import KioskConfirm from './ui/kiosk/KioskConfirm';
import KioskLogin from './ui/kiosk/KioskLogin';
import KioskRecoveryList from './ui/kiosk/KioskRecoveryList';
import KioskRetrievalLocker from './ui/kiosk/KioskRetrievalLocker';

// -----------------------------------------------------------
// [2] Context (데이터 공급소) 불러오기
// -----------------------------------------------------------
import { ItemProvider } from './context/ItemContext'; 
import { UserProvider } from './context/UserContext'; 

// ★ 키오스크 전용 Provider 주석 해제 (만약 파일이 없다면 이 부분은 지우셔도 됩니다)
import { KioskItemProvider } from './context/KioskItemContext';
import { KioskUserProvider } from './context/KioskUserContext';

import './App.css';

// Axios 설정
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <UserProvider>
      <ItemProvider>
        {/* ★ 키오스크 Provider 감싸기 주석 해제 */}
        <KioskUserProvider>
          <KioskItemProvider>
            
            <BrowserRouter>
              <Routes>
                {/* [Section A] 일반 웹 페이지 라우팅 */}
                <Route path="/" element={<WebHome />} />          
                <Route path="/detail/:id" element={<WebDetail />} /> 
                <Route path="/register" element={<WebRegister />} /> 
                <Route path="/mypage" element={<WebMyPage />} />     
                <Route path="/signup" element={<WebSignup />} />     
                <Route path="/terms/:id" element={<WebTerms />} />
                <Route path="/admin/requests" element={<AdminRequests />} />
                <Route path="/community" element={<CommunityHome />} />
                <Route path="/community/write" element={<CommunityWrite />} />
                <Route path="/community/:id" element={<CommunityDetail />} />
                <Route path="/login" element={<WebLogin />} />

                {/* ★ [Section B] 키오스크 전용 라우팅 주석 해제! */}
                <Route path="/kiosk" element={<KioskHome />} /> 
                <Route path="/kiosk/register" element={<KioskRegister />} /> 
                <Route path="/kiosk/capture" element={<KioskCapture />} />  
                <Route path="/kiosk/locker" element={<KioskLocker />} />     
                <Route path="/kiosk/confirm" element={<KioskConfirm />} /> 
                <Route path="/kiosk/login" element={<KioskLogin />} />       
                <Route path="/kiosk/recovery-list" element={<KioskRecoveryList />} /> 
                <Route path="/kiosk/retrieval-locker" element={<KioskRetrievalLocker />} />
              </Routes>
            </BrowserRouter>

          </KioskItemProvider>
        </KioskUserProvider>
      </ItemProvider>
   </UserProvider>
  );
}

export default App;