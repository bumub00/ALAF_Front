import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Home } from "lucide-react"; // 살짝 더 세련된 CheckCircle2로 변경
import "./KioskConfirm.css"; // ★ 전용 CSS 연결

const KioskConfirm = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/kiosk");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="confirm-container">
      {/* 체크 아이콘 영역 (통통 튀는 애니메이션 적용) */}
      <div className="confirm-icon-wrapper">
        <CheckCircle2 size={80} strokeWidth={2.5} />
      </div>

      <h1 className="confirm-title">
        등록이 완료되었습니다
      </h1>

      <p className="confirm-subtitle">
        <span>{count}초</span> 후 자동으로 홈 화면으로 이동합니다.
      </p>

      {/* 홈으로 버튼 */}
      <button className="confirm-home-btn" onClick={() => navigate("/kiosk")}>
        <Home size={24} />
        바로 홈으로
      </button>
    </div>
  );
};

export default KioskConfirm;