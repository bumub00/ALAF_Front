import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// 관리자 전용 분실물 회수 신청 심사 목록 페이지
const AdminRequests = () => {
    // 심사 대기 중인 신청 목록 상태
    const [requests, setRequests] = useState([]);
    const navigate = useNavigate();

    // 컴포넌트 마운트 시 대기 목록 자동 로드
    useEffect(() => {
        loadRequests();
    }, []);

    // -----------------------------------------------------------
    // 1. [목록 조회] 관리자 권한으로 신청 내역 가져오기
    // -----------------------------------------------------------
    const loadRequests = async () => {
        try {
            // 관리자 인증이 필요하므로 로컬 스토리지의 토큰을 헤더에 포함하여 요청
            const res = await axios.get('http://localhost:8080/api/admin/requests', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setRequests(res.data);
        } catch (error) {
            console.error("목록 로드 실패", error);
        }
    };

    // -----------------------------------------------------------
    // 2. [심사 처리] 특정 신청건에 대한 승인/거절 로직
    // -----------------------------------------------------------
    const handleProcess = async (requestId, action) => {
        // 실수 방지를 위한 재확인 창
        if (!window.confirm(`정말 ${action === 'APPROVE' ? '승인' : '거절'} 처리하시겠습니까?`)) return;

        try {
            await axios.post(`http://localhost:8080/api/admin/requests/${requestId}/process`, { action }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('처리 완료!');
            // 심사 완료 후 목록을 최신 상태로 새로고침하여 UI 반영
            loadRequests(); 
        } catch (error) {
            alert('처리 실패');
        }
    };

    return (
        <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
            
            {/* 상단: 이전 페이지(마이페이지 등)로 돌아가는 네비게이션 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{
                        display: 'flex', gap: 8, alignItems: 'center', 
                        border: 'none', background: 'none', 
                        fontSize: 16, fontWeight: '600', color: '#555', cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={20} /> 뒤로가기
                </button>
            </div>

            <h2>🛡️ 관리자: 회수 신청 심사 목록</h2>
            {requests.length === 0 && <p style={{ marginTop: 20, color: '#888' }}>현재 대기 중인 신청이 없습니다.</p>}

            {/* 대기 중인 신청건들을 순회하며 비교 심사 카드 생성 */}
            {requests.map((req) => (
                <div key={req.request_id} style={{ display: 'flex', gap: 20, background: 'white', padding: 20, marginBottom: 20, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginTop: 20 }}>
                    
                    {/* [좌측 영역] 시스템 최초 등록 데이터 (습득자가 올린 정보) */}
                    <div style={{ flex: 1, borderRight: '1px solid #eee', paddingRight: 20 }}>
                        <h3 style={{ color: '#868e96' }}>[기존 물품 정보]</h3>
                        <p><strong>물품명:</strong> {req.item_name}</p>
                        <p><strong>발견장소:</strong> {req.original_address} ({req.original_detail_address})</p>
                        <p><strong>상세설명:</strong> {req.original_desc}</p>
                        {req.original_image && <img src={`http://localhost:8080${req.original_image}`} alt="원본" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', marginTop: 10, border: '1px solid #ddd', borderRadius: 8 }} />}
                    </div>

                    {/* [우측 영역] 사용자 제출 증거 데이터 (주인이라 주장하는 자의 정보) */}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#2b8a3e' }}>[사용자 제출 증거]</h3>
                        <p><strong>신청자:</strong> {req.requester_name} ({req.requester_email})</p>
                        <p><strong>주장하는 상세장소:</strong> <span style={{ color: 'red', fontWeight: 'bold' }}>{req.proof_detail_address}</span></p>
                        <p><strong>주장하는 특징:</strong> <span style={{ color: 'red', fontWeight: 'bold' }}>{req.proof_description}</span></p>
                        {req.proof_image_url && <img src={`http://localhost:8080${req.proof_image_url}`} alt="증거" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', marginTop: 10, border: '1px solid #ddd', borderRadius: 8 }} />}
                    </div>

                    {/* [컨트롤 영역] 관리자의 승인/거절 액션 버튼 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                        <button onClick={() => handleProcess(req.request_id, 'APPROVE')} style={{ padding: '15px 30px', background: '#228be6', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>승인하기</button>
                        <button onClick={() => handleProcess(req.request_id, 'REJECT')} style={{ padding: '15px 30px', background: '#fa5252', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>거절하기</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminRequests;