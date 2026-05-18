// src/ui/kiosk/KioskRecoveryList.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Box, RefreshCw, AlertTriangle } from "lucide-react";
import "./KioskRecoveryList.css"; // ★ 전용 CSS 연결

const MAIN_API = process.env.REACT_APP_API_BASE || "http://49.50.138.248:8080";

const KioskRecoveryList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = location.state?.token || null;
  const user = location.state?.user || null;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 🔒 토큰 없으면 로그인으로
  useEffect(() => {
    if (!token) {
      navigate("/kiosk/login");
    }
  }, [token, navigate]);

  const fetchApproved = async () => {
    if (!token) return;

    setLoading(true);
    setErr("");

    try {
      const res = await fetch(`${MAIN_API}/api/kiosk/approved`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `조회 실패 (${res.status})`);
      }

      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr(e.message || "오류가 발생했습니다.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApproved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSelect = (row) => {
    navigate("/kiosk/retrieval-locker", {
      state: {
        requestId: row.request_id,
        itemId: row.item_id,
        title: row.name,
        imageUrl: row.image_url ? `${MAIN_API}${row.image_url}` : null,
        lockerNumber: row.locker_number || 1,
        token,
      },
    });
  };

  return (
    <div className="recovery-container">
     {/* 상단 헤더 */}
      <header className="recovery-header">
        <button onClick={() => navigate("/kiosk")} className="back-btn">
          <ArrowLeft size={24} />
          <span>처음으로</span>
        </button>

        {/* ★ 개인화된 이름 제거하고 심플하게 변경 ★ */}
        <h1 className="header-title">
          회수 가능 목록
        </h1>

        <button
          onClick={fetchApproved}
          disabled={loading}
          className={`refresh-btn ${loading ? 'loading' : ''}`}
        >
          <RefreshCw size={18} className={loading ? "spin" : ""} />
          <span>새로고침</span>
        </button>
      </header>

      {/* 에러 표시 영역 */}
      {err && (
        <div className="recovery-error">
          <AlertTriangle size={18} />
          <span>{err}</span>
        </div>
      )}

      {/* 회수 목록 리스트 영역 */}
      <main className="recovery-list">
        {loading ? (
          <div className="recovery-empty">
            <RefreshCw size={40} className="spin" color="#adb5bd" />
            <p>목록을 불러오는 중입니다...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="recovery-empty">
            <Box size={50} color="#adb5bd" />
            <p>승인된 회수 물건이 없습니다.</p>
          </div>
        ) : (
          <div className="card-grid">
            {items.map((row) => (
              <div
                key={`${row.item_id}-${row.request_id}`}
                onClick={() => handleSelect(row)}
                className="recovery-card"
              >
                {/* 물건 사진 */}
                <div className="card-img-box">
                  {row.image_url ? (
                    <img src={`${MAIN_API}${row.image_url}`} alt={row.name} />
                  ) : (
                    <Box size={32} color="#b0b8c1" />
                  )}
                </div>

                {/* 물건 이름 및 보관함 번호 표시 */}
                <div className="card-info">
                  <h3 className="card-title">{row.name}</h3>
                  <div className="locker-badge">
                    보관함 #{row.locker_number || 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default KioskRecoveryList;