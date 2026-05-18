import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Search } from "lucide-react";
import "./KioskHome.css";

const KIOSK_API = process.env.REACT_APP_HW_BASE || "";     
const MAIN_API  = process.env.REACT_APP_API_BASE || "";    

async function ping(url) {
  try {
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

const KioskHome = () => {
  const navigate = useNavigate();
  const [kioskOk, setKioskOk] = useState(true);
  const [mainOk, setMainOk] = useState(true);

  const checkServers = async () => {
    const kioskHealthUrl = `${KIOSK_API.replace(/\/$/,"")}/health`;
    const mainHealthUrl  = `${MAIN_API.replace(/\/$/,"")}/health`;

    const kioskAlive = KIOSK_API ? (await ping(kioskHealthUrl)) : true;
    const mainAlive  = MAIN_API  ? (await ping(mainHealthUrl))  : true;

    setKioskOk(kioskAlive);
    setMainOk(mainAlive);
  };

  useEffect(() => {
    checkServers();
  }, []);

  const canRegister = kioskOk && mainOk;
  const canPickup = mainOk;

  return (
    <div className="kiosk-container">
      <header className="kiosk-header">
        <div className="kiosk-logo-wrapper">
          <img src="/logo.jpg" alt="ALAF Logo" className="kiosk-logo-img" />
          <h1 className="kiosk-logo-text">ALAF KIOSK</h1>
        </div>
      </header>

      <main className="kiosk-main">
        {/* 분실물 등록 버튼 */}
        <button
          onClick={() => navigate("/kiosk/capture")}
          disabled={!canRegister}
          className={`kiosk-action-card register-card ${!canRegister ? 'disabled' : ''}`}
        >
          <div className="icon-wrapper">
            <Upload size={72} strokeWidth={2.5} />
          </div>
          <h2>분실물 등록</h2>
          {/* ★ 하단 설명 문장 제거 완료 ★ */}
        </button>

        {/* 분실물 회수 버튼 */}
        <button
          onClick={() => navigate("/kiosk/login")}
          disabled={!canPickup}
          className={`kiosk-action-card pickup-card ${!canPickup ? 'disabled' : ''}`}
        >
          <div className="icon-wrapper">
            <Search size={72} strokeWidth={2.5} />
          </div>
          <h2>분실물 회수</h2>
          {/* ★ 하단 설명 문장 제거 완료 ★ */}
        </button>
      </main>
    </div>
  );
};

export default KioskHome;