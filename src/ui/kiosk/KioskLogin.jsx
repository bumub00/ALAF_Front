// src/ui/kiosk/KioskLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, Loader2, AlertTriangle } from "lucide-react";
import "./KioskLogin.css"; // ★ 전용 CSS 연결

const MAIN_API = process.env.REACT_APP_API_BASE || "http://49.50.138.248:8080";

const KioskLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setMsg("이메일(아이디)과 비밀번호를 입력해주세요.");
      return;
    }

    setBusy(true);
    setMsg("");

    try {
      const res = await fetch(`${MAIN_API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `로그인 실패 (${res.status})`);
      }

      navigate("/kiosk/recovery-list", {
        state: { token: data.token, user: data.user },
      });
    } catch (err) {
      console.error(err);
      setMsg(err.message || "로그인 실패: 이메일/비밀번호를 확인해주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-container">
      {/* 상단 헤더 */}
      <header className="login-header">
        <button onClick={() => navigate("/kiosk")} className="back-btn">
          <ArrowLeft size={24} />
          <span>뒤로</span>
        </button>
      </header>

      {/* 중앙 메인 영역 (카드 형태) */}
      <main className="login-main">
        <div className="login-card">
          <div className="login-card-header">
            <h3>로그인</h3>
            <p>내 분실물을 찾기 위해 로그인해 주세요.</p>
          </div>

          <div className="login-form">
            <input
              type="text"
              placeholder="이메일(아이디)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              className="login-input"
            />

            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
          </div>

          {msg && (
            <div className="login-error">
              <AlertTriangle size={16} />
              <span>{msg}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={busy}
            className={`login-btn ${busy ? 'busy' : ''}`}
          >
            {busy ? <Loader2 className="spin" size={24} /> : <LogIn size={24} />}
            로그인
          </button>
        </div>
      </main>
    </div>
  );
};

export default KioskLogin;