import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Unlock, Lock, Loader2, AlertTriangle } from "lucide-react";
import { hwLockerOpen, hwLockerClose } from "./hwApi";
import "./KioskLocker.css"; // ★ 전용 CSS 연결

const KioskLocker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;

  const lockerNumber = useMemo(() => {
    return data?.lockerNumber ?? data?.locker_number ?? data?.locker ?? 1;
  }, [data]);

  const [count, setCount] = useState(30);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const closedRef = useRef(false);

  useEffect(() => {
    if (!data) return;

    const open = async () => {
      try {
        setErr(null);
        await hwLockerOpen(lockerNumber, 30);
      } catch (e) {
        setErr(`보관함 열기 실패: ${e.message}`);
      }
    };

    open();
  }, [data, lockerNumber]);

  useEffect(() => {
    if (!data) return;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCloseLocker(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleCloseLocker = async () => {
    if (closedRef.current) return;
    closedRef.current = true;

    setBusy(true);
    try {
      await hwLockerClose(lockerNumber);
    } catch (e) {
      console.warn("locker close failed:", e);
    } finally {
      setBusy(false);
      navigate("/kiosk/confirm", { state: data });
    }
  };

  if (!data) return null;

  return (
    <div className="locker-container">
      
      {/* 자물쇠 아이콘 (애니메이션 적용) */}
      <div className="locker-icon-wrapper">
        <Unlock size={70} strokeWidth={2.5} />
      </div>

      <h1 className="locker-title">
        보관함이 열렸습니다!
      </h1>
      <p className="locker-desc">
        보관함 <b className="highlight-text">#{lockerNumber}</b>에 물건을 넣고 문을 닫아주세요.
      </p>

      {/* 에러 발생 시 알림창 */}
      {err && (
        <div className="locker-error">
          <AlertTriangle size={18} />
          <span>{err}</span>
        </div>
      )}

      {/* 카운트다운 타이머 */}
      <div className="locker-timer-wrapper">
        <div className="locker-timer">{count}</div>
        <p className="locker-timer-text">
          초 후 자동으로 잠기고 다음 단계로 넘어갑니다.
        </p>
      </div>

      {/* 즉시 잠금 버튼 */}
      <button
        onClick={handleCloseLocker}
        disabled={busy}
        className={`locker-close-btn ${busy ? 'busy' : ''}`}
      >
        {busy ? <Loader2 className="spin" size={28} /> : <Lock size={28} />}
        보관 완료 (즉시 잠금)
      </button>

    </div>
  );
};

export default KioskLocker;