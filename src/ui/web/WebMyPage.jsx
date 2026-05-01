import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, User, ShieldCheck, Mail, Phone, Package, ClipboardList, Bell } from 'lucide-react';
import WebLogin from './WebLogin';
import AlertSettings from './AlertSettings';
import './WebMyPage.css';

const WebMyPage = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  if (!user) {
    return <WebLogin />;
  }

  return (
    <div className="pc-container mypage-container">
      
      {/* ★ 공통 헤더 + logo.jpg 적용 ★ */}
      <header className="pc-header">
        <div className="header-inner">
          <div className="logo" onClick={() => navigate('/')} style={{cursor:'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <img src="/logo.jpg" alt="ALAF Logo" style={{ height: '36px', width: 'auto' }} />
            <h1 className="logo-text">ALAF</h1>
          </div>

          <div className="pc-nav-menu">
             {/* ★ "돌아가기"로 텍스트 변경 및 화살표 삭제 ★ */}
             <button className="menu-item" onClick={() => navigate('/')}>
               돌아가기
             </button>
          </div>
        </div>
      </header>

      <main className="pc-main mypage-main">
        <div className="mypage-content">
            <h2 className="mypage-title">마이페이지</h2>

            {/* 1. 내 정보 영역 */}
            <div className="profile-card">
                <div className="profile-avatar">
                    <User size={40} color="#8cb4d6" />
                </div>
                
                <div className="profile-info">
                    <h3>{user.name} 님</h3>
                    <div className="info-row">
                        <Mail size={16} /> {user.email}
                    </div>
                    <div className="info-row">
                        <Phone size={16} /> {user.phone_number || '전화번호 미등록'}
                    </div>
                </div>
                
                <button className="logout-btn" onClick={logout}>
                    <LogOut size={16} /> 로그아웃
                </button>
            </div>
            
            {/* 2. 알림 설정 영역 */}
            <div className="section-container">
                <h3 className="section-title">
                    <Bell size={22} color="var(--alaf-blue-main)" /> 이메일 키워드 알림 설정
                </h3>
                <div className="settings-wrapper">
                  <AlertSettings />
                </div>
            </div>

            {/* 3. 관리자 전용 메뉴 */}
            {user && user.role === 'ADMIN' && (
                <div className="section-container">
                    <h3 className="section-title admin-title">
                        <ShieldCheck size={22} /> 관리자 전용 메뉴
                    </h3>
                    <div className="admin-card" onClick={() => navigate('/admin/requests')}>
                        <div className="admin-card-text">
                            <h4>회수 신청 심사 목록</h4>
                            <p>사용자들이 제출한 증거를 확인하고 승인 및 거절을 처리합니다.</p>
                        </div>
                        <div className="admin-card-btn">이동하기</div>
                    </div>
                </div>
            )}

            {/* 4. 활동 내역 영역 */}
            <div className="activity-container">
                
                {/* 4-1. 등록한 분실물 */}
                <div className="section-container">
                    <h3 className="section-title">
                        <Package size={22} color="var(--alaf-blue-dark)" /> 내가 등록한 분실물
                    </h3>
                    <div className="empty-box">
                        아직 등록하신 분실물이 없습니다.
                    </div>
                </div>

                {/* 4-2. 회수 신청 내역 */}
                <div className="section-container">
                    <h3 className="section-title">
                        <ClipboardList size={22} color="#f59f00" /> 내가 회수 신청한 분실물
                    </h3>
                    <div className="empty-box">
                        아직 회수 신청하신 내역이 없습니다.
                    </div>
                </div>

            </div>
            
        </div>
      </main>

      <footer className="pc-footer">
        <p>© 2026 ALAF Team. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WebMyPage;