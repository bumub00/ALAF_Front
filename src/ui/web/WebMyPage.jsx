import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, User, ShieldCheck, Mail, Phone, Package, ClipboardList } from 'lucide-react';
import WebLogin from './WebLogin';

// 사용자 마이페이지 및 관리자 대시보드 진입점
const WebMyPage = () => {
  // 전역 상태에서 유저 정보와 로그아웃 함수 가져오기
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  // 1. [접근 제어] 로그인 상태가 아니면 로그인 컴포넌트를 대신 렌더링
  if (!user) {
    return <WebLogin />;
  }

  return (
    <div className="pc-container" style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: 50 }}>
      
      {/* 상단 헤더 (메인으로 돌아가기) */}
      <header className="pc-header" style={{ justifyContent: 'flex-start', background: 'white', borderBottom: '1px solid #eee' }}>
        <div className="header-inner" style={{ padding: '0 20px' }}>
           <button 
             onClick={() => navigate('/')} 
             style={{ display:'flex', alignItems:'center', gap:5, cursor:'pointer', fontWeight:'bold', border:'none', background:'none', fontSize: 16, color: '#333' }}
           >
             <ArrowLeft size={24} /> 메인으로
           </button>
        </div>
      </header>

      <main className="pc-main" style={{ paddingTop: 40 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{ marginBottom: 30, fontSize: 26, fontWeight: '800', color: '#2c3e50' }}>마이페이지</h2>

            {/* 2. [내 정보 영역] 유저 기본 정보(이름, 이메일, 연락처) 출력 및 로그아웃 버튼 */}
            <div style={{ background: 'white', padding: '30px 40px', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 30, flexWrap: 'wrap' }}>
                <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={45} color="#adb5bd" />
                </div>
                
                <div style={{ flex: 1, minWidth: 200 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>{user.name} 님</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666', fontSize: 15, marginBottom: 8 }}>
                        <Mail size={16} color="#888" /> {user.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666', fontSize: 15 }}>
                        <Phone size={16} color="#888" /> {user.phone_number || '전화번호 미등록'}
                    </div>
                </div>
                
                <button 
                    onClick={logout}
                    style={{ padding: '10px 20px', border: '1px solid #ffe3e3', borderRadius: 10, color: '#fa5252', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background:'#fff5f5', fontWeight: 'bold', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#ffe3e3'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff5f5'}
                >
                    <LogOut size={18} /> 로그아웃
                </button>
            </div>

            {/* 3. [권한 분기] 로그인한 유저의 role이 'ADMIN'일 경우에만 관리자 메뉴 노출 */}
            {user && user.role === 'ADMIN' && (
                <div style={{ marginTop: 40 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2b8a3e', fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
                        <ShieldCheck size={22} /> 관리자 전용 메뉴
                    </h3>
                    <div 
                        onClick={() => navigate('/admin/requests')} 
                        style={{ 
                            background: '#ebfbee', padding: '25px 30px', borderRadius: 16, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #b2f2bb', transition: 'all 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div>
                            <h4 style={{ margin: 0, fontSize: 18, color: '#2b8a3e', fontWeight: 'bold' }}>회수 신청 심사 목록</h4>
                            <p style={{ margin: '8px 0 0', color: '#51cf66', fontSize: 14 }}>사용자들이 제출한 증거를 확인하고 승인 및 거절을 처리합니다.</p>
                        </div>
                        <div style={{ background: '#2b8a3e', color: 'white', padding: '10px 20px', borderRadius: 8, fontWeight: 'bold' }}>이동하기</div>
                    </div>
                </div>
            )}

            {/* 4. [활동 내역] 추후 백엔드 API와 연동하여 실제 데이터를 매핑할 UI 틀 */}
            <div style={{ marginTop: 50, display: 'flex', flexDirection: 'column', gap: 40 }}>
                
                {/* 4-1. 등록한 분실물 */}
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 }}>
                        <Package size={22} color="#4dabf7" /> 내가 등록한 분실물
                    </h3>
                    <div style={{ background: 'white', padding: '50px 20px', borderRadius: 16, color: '#adb5bd', textAlign: 'center', border: '1px dashed #ced4da', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        아직 등록하신 분실물이 없습니다.
                    </div>
                </div>

                {/* 4-2. 회수 신청 내역 */}
                <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 }}>
                        <ClipboardList size={22} color="#ff922b" /> 내가 회수 신청한 분실물
                    </h3>
                    <div style={{ background: 'white', padding: '50px 20px', borderRadius: 16, color: '#adb5bd', textAlign: 'center', border: '1px dashed #ced4da', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                        아직 회수 신청하신 내역이 없습니다.
                    </div>
                </div>

            </div>
            
        </div>
      </main>
    </div>
  );
};

export default WebMyPage;