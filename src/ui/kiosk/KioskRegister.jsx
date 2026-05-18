import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Camera, RefreshCw, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { hwCapture, hwImageUrl, hwAnalyze } from "./hwApi";
import "./KioskCapture.css"; 

const SUB_TO_CATEGORY_ID = {
  "여성용가방": 1, "남성용가방": 2, "기타가방": 3,
  "반지": 4, "목걸이": 5, "귀걸이": 6, "시계": 7, "기타 귀금속": 8,
  "학습서적": 9, "소설": 10, "컴퓨터서적": 11, "만화책": 12, "기타 서적": 13,
  "서류": 14, "기타 서류": 15, "쇼핑백": 16, "스포츠용품": 17,
  "건반악기": 18, "타악기": 19, "관악기": 20, "현악기": 21, "기타 악기": 22,
  "여성의류": 23, "남성의류": 24, "아기의류": 25, "모자": 26, "신발": 27, "기타 의류": 28,
  "자동차열쇠": 29, "네비게이션": 30, "자동차번호판": 31, "임시번호판": 32, "기타 자동차용품": 33,
  "태블릿": 34, "스마트워치": 35, "무선이어폰": 36, "카메라": 37, "기타 전자기기": 38,
  "여성용지갑": 39, "남성용지갑": 40, "기타 지갑": 41, "신분증": 42, "면허증": 43, "여권": 44, "기타 증명서": 45,
  "삼성노트북": 46, "LG노트북": 47, "애플노트북": 48, "기타 컴퓨터": 49,
  "신용(체크)카드": 50, "일반카드": 51, "교통카드": 52, "기타 카드": 53, "현금": 54,
  "어음": 55, "상품권": 56, "채권": 57, "기타 유가증권": 58,
  "삼성휴대폰": 59, "LG휴대폰": 60, "아이폰": 61, "기타 휴대폰": 62, "기타 통신기기": 63, "기타 물품": 64,
};

function normalizeSubName(sub) {
  if (!sub) return "";
  let s = String(sub).trim();
  s = s.replace(/\(([^)]+)\)/g, " $1").replace(/\s+/g, " ").trim();
  if (s === "기타물품") s = "기타 물품";
  s = s.replace(/기타\s*귀금속/g, "기타 귀금속");
  s = s.replace(/기타\s*서적/g, "기타 서적");
  s = s.replace(/기타\s*서류/g, "기타 서류");
  s = s.replace(/기타\s*악기/g, "기타 악기");
  s = s.replace(/기타\s*의류/g, "기타 의류");
  s = s.replace(/기타\s*자동차용품/g, "기타 자동차용품");
  s = s.replace(/기타\s*전자기기/g, "기타 전자기기");
  s = s.replace(/기타\s*지갑/g, "기타 지갑");
  s = s.replace(/기타\s*증명서/g, "기타 증명서");
  s = s.replace(/기타\s*컴퓨터/g, "기타 컴퓨터");
  s = s.replace(/기타\s*카드/g, "기타 카드");
  s = s.replace(/기타\s*유가증권/g, "기타 유가증권");
  s = s.replace(/기타\s*휴대폰/g, "기타 휴대폰");
  return s;
}

export default function KioskCapture() {
  const navigate = useNavigate();
  const location = useLocation();
  const lockerNumber = location.state?.lockerNumber ?? 1;

  const [imageUrl, setImageUrl] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [ai, setAi] = useState(null);
  const [aiErr, setAiErr] = useState("");

  const canNext = useMemo(() => !!imageUrl && !!ai && !analyzing, [imageUrl, ai, analyzing]);

  const handleCapture = async () => {
    if (capturing) return;
    setCapturing(true);
    setAi(null);
    setAiErr("");

    try {
      const res = await hwCapture();
      const full = hwImageUrl(res.image_url);
      const busted = full.includes("?") ? `${full}&cb=${Date.now()}` : `${full}?cb=${Date.now()}`;
      setImageUrl(busted);
    } catch (e) {
      alert(`촬영 실패: ${e.message}`);
    } finally {
      setCapturing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUrl || analyzing) return;
    setAnalyzing(true);
    setAi(null);
    setAiErr("");

    try {
      const res = await hwAnalyze();
      const normalizedSub = normalizeSubName(res.sub_name);
      const categoryId = SUB_TO_CATEGORY_ID[normalizedSub] || 64;

      setAi({
        major_name: res.major_name || "",
        sub_name: normalizedSub || "",
        category_id: categoryId,
        item_name: res.item_name || res.title || "",
        description: res.description || res.desc || "",
        raw: res.raw,
        model: res.model,
      });
    } catch (e) {
      setAiErr(e.message || "AI 분석 실패");
    } finally {
      setAnalyzing(false);
    }
  };

  const goRegister = () => {
    if (!canNext) return;
    navigate("/kiosk/register", {
      state: { lockerNumber, imageUrl, ai },
    });
  };

  return (
    <div className="capture-container">
      {/* 상단 헤더 */}
      <header className="capture-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={24} />
          <span>뒤로</span>
        </button>
        <h2 className="header-title">분실물 촬영 및 분석</h2>
        {/* ★ 우측 상단 보관함 버튼(Badge) 영역 삭제 완료 ★ */}
      </header>

      {/* 좌우 분할 메인 영역 */}
      <main className="capture-main">
        <section className="camera-section">
          {imageUrl ? (
            <img src={imageUrl} alt="capture" className="camera-img" />
          ) : (
            <div className="camera-placeholder">
              <Camera size={48} strokeWidth={1.5} />
              <p>우측의 <b>촬영 버튼</b>을 눌러<br/>물건을 촬영해주세요.</p>
            </div>
          )}
        </section>

        <section className="control-section">
          <div className="btn-group">
            <button
              onClick={handleCapture}
              disabled={capturing}
              className={`action-btn btn-capture ${capturing ? 'disabled' : ''}`}
            >
              {imageUrl ? <RefreshCw size={20} /> : <Camera size={20} />}
              {imageUrl ? "다시 촬영" : "촬영하기"}
            </button>

            <button
              onClick={handleAnalyze}
              disabled={!imageUrl || analyzing}
              className={`action-btn btn-analyze ${(!imageUrl || analyzing) ? 'disabled' : ''}`}
            >
              <Sparkles size={20} />
              {analyzing ? "분석 중..." : "AI 분석"}
            </button>
          </div>

          {aiErr && (
            <div className="ai-result error">
              <AlertTriangle size={18} />
              <div>
                <strong>분석 실패</strong>
                <p>{aiErr}</p>
              </div>
            </div>
          )}

          {ai && (
            <div className="ai-result success">
              <div className="ai-result-header">
                <CheckCircle2 size={16} />
                <span>AI 분석 완료</span>
              </div>
              
              <div className="ai-data-grid">
                <span className="ai-label">추정 물품</span>
                <span className="ai-value highlight">{ai.item_name || "-"}</span>
                
                <span className="ai-label">분류</span>
                <span className="ai-value">{ai.major_name} {">"} {ai.sub_name}</span>
              </div>

              <div className="ai-desc">
                {ai.description || "-"}
              </div>
            </div>
          )}

          {!ai && !aiErr && (
            <div className="empty-guide">
              사진 촬영 후 AI 분석을 진행하면<br/>여기에 결과가 표시됩니다.
            </div>
          )}

          <button
            onClick={goRegister}
            disabled={!canNext}
            className={`next-btn ${canNext ? 'active' : ''}`}
          >
            다음 단계로 →
          </button>
        </section>
      </main>
    </div>
  );
}