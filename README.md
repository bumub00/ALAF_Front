# 📦 ALAF (All Lost And Found) - 스마트 분실물 통합 관리 시스템

---

## 🚧 현재 프로젝트 개발 현황 (2026.03.9 업데이트)
1. 모바일 맞춤 UI 수정

---

## 📂 프로젝트 구조 (핵심 요약)

```bash
src/
├── config.js          # ⚙️ 서버 주소 관리 (Web 8080 / Kiosk 8000)
├── context/           # 🧠 전역 상태 관리 (창고 분리)
│   ├── ItemContext.js      # [Web] 웹용 분실물 데이터 및 API
│   ├── UserContext.js      # [Web] 웹 사용자 정보 및 토큰 관리
│   ├── KioskItemContext.js # [Kiosk] 키오스크용 데이터 및 등록 로직
│   └── KioskUserContext.js # [Kiosk] 키오스크 전용 로그인/인증
├── ui/
│   ├── web/           # 🖥️ PC/Mobile 웹 페이지 (조회/검색/신청)
│   │   ├── WebHome.jsx     # 메인 (필터링, 검색)
│   │   ├── WebDetail.jsx   # 상세 (회수 신청)
│   │   ├── WebRegister.jsx # 등록 (이미지 업로드)
│   │   └── ...
│   └── kiosk/         # 📟 키오스크용 페이지 (라즈베리파이 연동)
│       └── hwApi.js   # 🛠️ 하드웨어 제어 모듈 (카메라, 잠금장치)
├── App.js             # 🚦 라우팅 및 Provider 주입
└── index.js           # 🚀 진입점
```
