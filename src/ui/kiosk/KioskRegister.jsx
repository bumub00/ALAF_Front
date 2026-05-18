// src/ui/kiosk/KioskRegister.jsx
import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { ItemContext } from "../../context/ItemContext";
import "./KioskRegister.css";

const NODE_LIST = [
  { id: 1,  name: "A동 (기계,디자인)" }, { id: 2,  name: "B동 (기계설계,메카)" },
  { id: 3,  name: "C동 (에너지,전기)" }, { id: 4,  name: "D동 (신소재,생명화학)" },
  { id: 5,  name: "E동 (SW)" }, { id: 6,  name: "G동 (경영)" },
  { id: 7,  name: "P동 (반도체)" }, { id: 8,  name: "산학융합관(전자공학부)" },
  { id: 9,  name: "TIP (기술혁신파크)" }, { id: 10, name: "종합교육관 (중앙도서관)" },
  { id: 11, name: "제2생활관" }, { id: 12, name: "행정동" },
  { id: 13, name: "체육관" }, { id: 14, name: "창업보육센터" },
  { id: 15, name: "시흥비즈니스센터" }, { id: 16, name: "운동장" },
  { id: 17, name: "주차타워" }, { id: 18, name: "TU광장 (벙커)" },
  { id: 19, name: "기타 (교내)" }, { id: 20, name: "기타 (교외)" },
];

const SUB_TO_CATEGORY_ID = {
  "여성용가방": 1, "남성용가방": 2, "기타가방": 3,
  "반지": 4, "목걸이": 5, "귀걸이": 6, "시계": 7, "기타 귀금속": 8,
  "학습서적": 9, "소설": 10, "컴퓨터서적": 11, "만화책": 12, "기타 서적": 13,
  "서류": 14, "기타 서류": 15, "쇼핑백": 16, "스포츠용품": 17,
  "건반악기": 18, "타악기": 19, "관악기": 20, "현악기": 21, "기타 악기": 22,
  "여성의류": 23, "남성의류": 24, "아기의류": 25, "모자": 26, "신발": 27, "기타 의류": 28,
  "자동차열쇠": 29, "네비게이션": 30, "자동차번호판": 31, "임시번호판": 32, "기타 자동차용품": 33,
  "태블릿": 34, "스마트워치": 35, "무선이어폰": 36, "카메라": 37, "기타 전자기기": 38,
  "여성용지갑": 39, "남성용지갑": 40, "기타 지갑": 41,
  "신분증": 42, "면허증": 43, "여권": 44, "기타 증명서": 45,
  "삼성노트북": 46, "LG노트북": 47, "애플노트북": 48, "기타 컴퓨터": 49,
  "신용(체크)카드": 50, "일반카드": 51, "교통카드": 52, "기타 카드": 53,
  "현금": 54, "어음": 55, "상품권": 56, "채권": 57, "기타 유가증권": 58,
  "삼성휴대폰": 59, "LG휴대폰": 60, "아이폰": 61, "기타 휴대폰": 62, "기타 통신기기": 63,
  "기타 물품": 64,
};

const SUB_TO_MAJOR_NAME = {
  "여성용가방": "가방", "남성용가방": "가방", "기타가방": "가방",
  "반지": "귀금속", "목걸이": "귀금속", "귀걸이": "귀금속", "시계": "귀금속", "기타 귀금속": "귀금속",
  "학습서적": "도서용품", "소설": "도서용품", "컴퓨터서적": "도서용품", "만화책": "도서용품", "기타 서적": "도서용품",
  "서류": "서류", "기타 서류": "서류", "쇼핑백": "쇼핑백", "스포츠용품": "스포츠용품",
  "건반악기": "악기", "타악기": "악기", "관악기": "악기", "현악기": "악기", "기타 악기": "악기",
  "여성의류": "의류", "남성의류": "의류", "아기의류": "의류", "모자": "의류", "신발": "의류", "기타 의류": "의류",
  "자동차열쇠": "자동차용품", "네비게이션": "자동차용품", "자동차번호판": "자동차용품", "임시번호판": "자동차용품", "기타 자동차용품": "자동차용품",
  "태블릿": "전자기기", "스마트워치": "전자기기", "무선이어폰": "전자기기", "카메라": "전자기기", "기타 전자기기": "전자기기",
  "여성용지갑": "지갑", "남성용지갑": "지갑", "기타 지갑": "지갑",
  "신분증": "증명서", "면허증": "증명서", "여권": "증명서", "기타 증명서": "증명서",
  "삼성노트북": "컴퓨터", "LG노트북": "컴퓨터", "애플노트북": "컴퓨터", "기타 컴퓨터": "컴퓨터",
  "신용(체크)카드": "카드", "일반카드": "카드", "교통카드": "카드", "기타 카드": "카드", "현금": "현금",
  "어음": "유가증권", "상품권": "유가증권", "채권": "유가증권", "기타 유가증권": "유가증권",
  "삼성휴대폰": "휴대폰", "LG휴대폰": "휴대폰", "아이폰": "휴대폰", "기타 휴대폰": "휴대폰", "기타 통신기기": "휴대폰",
  "기타 물품": "기타물품"
};

function normalizeSubName(sub) {
  if (!sub) return "";
  let s = String(sub).trim();
  s = s.replace(/\(([^)]+)\)/g, " $1").replace(/\s+/g, " ").trim();
  if (s === "기타물품") s = "기타 물품";
  return s;
}

async function urlToFile(url) {
  try {
    if (url.startsWith("data:image")) {
      const res = await fetch(url);
      const blob = await res.blob();
      return new File([blob], `test_${Date.now()}.jpg`, { type: "image/jpeg" });
    }
    const r = await fetch(url, { cache: "no-store" });
    const blob = await r.blob();
    return new File([blob], `kiosk_${Date.now()}.jpg`, { type: blob.type || "image/jpeg" });
  } catch (e) {
    return new File([new Blob()], "mock.jpg", { type: "image/jpeg" });
  }
}

export default function KioskRegister() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { addItem } = useContext(ItemContext);

  const lockerNumber = state?.lockerNumber ?? 1;
  const imageUrl = state?.imageUrl ?? "";
  const ai = state?.ai ?? null;

  useEffect(() => {
    if (!imageUrl || !ai) {
      alert("촬영 정보가 없습니다.");
      navigate("/kiosk/capture");
    }
  }, [imageUrl, ai, navigate]);


  const initialSub = normalizeSubName(ai?.sub_name);
  const initialMajor = ai?.major_name || "기타물품";
  const initialCategoryId = ai?.category_id || SUB_TO_CATEGORY_ID[initialSub] || 64;

  const [inputs, setInputs] = useState({
    title: ai?.item_name || "",
    desc: ai?.description || "",
    date: new Date().toISOString().slice(0, 10),
    nodeId: "",
    detailLocation: "",
    category_id: initialCategoryId,
    sub_name: initialSub || "기타 물품",
    major_name: initialMajor,
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubChange = (e) => {
    const sub = normalizeSubName(e.target.value);
    const cid = SUB_TO_CATEGORY_ID[sub] || 64;
    const major = SUB_TO_MAJOR_NAME[sub] || "기타물품";

    setInputs((prev) => ({ 
      ...prev, 
      sub_name: sub, 
      category_id: cid, 
      major_name: major 
    }));
  };

  const handleSubmit = async () => {
    if (saving) return;
    if (!inputs.title || !inputs.nodeId || !inputs.detailLocation) {
      alert("필수 정보를 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const imageFile = await urlToFile(imageUrl);
      const ok = await addItem({ ...inputs, lockerNumber }, imageFile);
      if (!ok) return;

      navigate("/kiosk/locker", {
        state: { lockerNumber, title: inputs.title, imageUrl, ...inputs },
      });
    } catch (e) {
      alert(`등록 실패: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!imageUrl || !ai) return null;

  return (
    <div className="register-container">
      <div className="register-header">
        <button onClick={() => navigate(-1)} className="header-back-btn">
          <ArrowLeft size={28} />
        </button>
        <div className="header-title">정보 확인 및 수정</div>
        <div className="header-badge">보관함 #{lockerNumber}</div>
      </div>

      <div className="register-content">
        <div className="preview-card">
          <div className="preview-img-wrapper">
            <img src={imageUrl} alt="preview" />
          </div>
          <div className="preview-ai-section">
            <div className="ai-section-title">AI 실시간 분류 결과</div>
            <div className="tag-container">
              <Tag label="대분류" value={inputs.major_name} />
              <Tag label="소분류" value={inputs.sub_name} />
              <Tag label="ID" value={String(inputs.category_id)} mono />
            </div>
          </div>
        </div>

        <Card title="물품 정보">
          <Input label="물건명 (필수)" name="title" value={inputs.title} onChange={handleChange} placeholder="예: 에어팟 4" />
          <Textarea label="상세 설명" name="desc" value={inputs.desc} onChange={handleChange} placeholder="특징 등" />
        </Card>

        <Card title="습득 정보">
          <Input label="습득 날짜" name="date" type="date" value={inputs.date} onChange={handleChange} />
          <Select label="건물/장소 (필수)" name="nodeId" value={inputs.nodeId} onChange={handleChange} options={NODE_LIST} />
          <Input label="세부 장소 (필수)" name="detailLocation" value={inputs.detailLocation} onChange={handleChange} placeholder="예: 304호" />
        </Card>

        <Card title="카테고리 수정">
          <Input label="대분류" value={inputs.major_name} readOnly />
          <div className="select-field-group">
            <div className="field-label">소분류</div>
            <select value={inputs.sub_name} onChange={handleSubChange} className="kiosk-select-tag">
              {Object.keys(SUB_TO_CATEGORY_ID).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </Card>

        <button onClick={handleSubmit} disabled={saving} className="register-submit-btn">
          {saving ? <Loader2 className="spin" size={24} /> : <Save size={24} />}
          {saving ? "등록 중..." : "등록 완료 → 보관함 열기"}
        </button>
      </div>
    </div>
  );
}

function Card({ title, children }) { return ( <div className="form-card"> <div className="form-card-title">{title}</div> {children} </div> ); }
function Input({ label, ...props }) { return ( <div className="field-container"> <div className="field-label">{label}</div> <input {...props} className="kiosk-input-tag" /> </div> ); }
function Textarea({ label, ...props }) { return ( <div className="field-container"> <div className="field-label">{label}</div> <textarea {...props} className="kiosk-textarea-tag" /> </div> ); }
function Select({ label, name, value, onChange, options }) { return ( <div className="field-container"> <div className="field-label">{label}</div> <select name={name} value={value} onChange={onChange} className="kiosk-select-tag"> <option value="">선택하세요</option> {options.map((o) => ( <option key={o.id} value={o.id}>{o.name}</option> ))} </select> </div> ); }
function Tag({ label, value, mono }) { return ( <div className="ai-badge"> <span className="badge-label">{label}</span> <span className={`badge-value ${mono ? "mono" : ""}`}>{value}</span> </div> ); }