// src/ui/kiosk/hwApi.js
const HW_BASE = (process.env.REACT_APP_HW_BASE || "http://localhost:8000").replace(/\/$/, "");

// 공통 fetch(JSON)
async function postJSON(path) {
  const res = await fetch(`${HW_BASE}${path}`, { method: "POST" });
  const text = await res.text();

  let data = null;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = data?.error || data?.detail || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// 카메라 캡처: { ok:true, image_url:"/image?ts=..." }
export async function hwCapture() {
  return await postJSON("/api/camera/capture");
}

// 이미지 URL 만들기
export function hwImageUrl(image_url) {
  if (!image_url) return "";
  if (image_url.startsWith("http")) return image_url;
  return `${HW_BASE}${image_url}`;
}

// ✅ AI 분석 (latest.jpg 기준)
export async function hwAnalyze() {
  // { ok, title, desc, category_id, major_name, sub_name }
  return await postJSON("/api/ai/analyze");
}

// ✅ 잠금장치: open(sec초 유지), close(즉시 OFF)
export async function hwLockerOpen(lockerNo = 1, sec = 30) {
  return await postJSON(`/api/locker/open/${lockerNo}?sec=${sec}`);
}
export async function hwLockerClose(lockerNo = 1) {
  return await postJSON(`/api/locker/close/${lockerNo}`);
}