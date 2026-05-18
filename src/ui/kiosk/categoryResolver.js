// src/ui/kiosk/categoryResolver.js

// 문자열 정규화(공백/괄호 제거, 소문자)
const norm = (s = "") =>
  String(s).trim().replace(/\s+/g, "").replace(/[()]/g, "").toLowerCase();

/**
 * ✅ SQL의 Category INSERT 순서대로 category_id를 매핑한 표
 * (너가 올린 SQL 기준)
 */
const SUB_TO_ID = {
  // 1) 가방 (1~3)
  [norm("여성용가방")]: 1,
  [norm("남성용가방")]: 2,
  [norm("기타가방")]: 3,

  // 2) 귀금속 (4~11)
  [norm("반지")]: 4,
  [norm("목걸이")]: 5,
  [norm("귀걸이")]: 6,
  [norm("시계")]: 7,
  [norm("기타 귀금속")]: 8,

  // 3) 도서용품 (9~13)  ← 주의: 너 SQL은 "기타 서적" 이런 식이라 정규화로 흡수
  [norm("학습서적")]: 9,
  [norm("소설")]: 10,
  [norm("컴퓨터서적")]: 11,
  [norm("만화책")]: 12,
  [norm("기타 서적")]: 13,

  // 4) 서류 (14~15)
  [norm("서류")]: 14,
  [norm("기타 서류")]: 15,

  // 5) 쇼핑백 (16)
  [norm("쇼핑백")]: 16,

  // 6) 스포츠용품 (17)
  [norm("스포츠용품")]: 17,

  // 7) 악기 (18~22)
  [norm("건반악기")]: 18,
  [norm("타악기")]: 19,
  [norm("관악기")]: 20,
  [norm("현악기")]: 21,
  [norm("기타 악기")]: 22,

  // 8) 의류 (23~28)
  [norm("여성의류")]: 23,
  [norm("남성의류")]: 24,
  [norm("아기의류")]: 25,
  [norm("모자")]: 26,
  [norm("신발")]: 27,
  [norm("기타 의류")]: 28,

  // 9) 자동차 (29~33)
  [norm("자동차열쇠")]: 29,
  [norm("네비게이션")]: 30,
  [norm("자동차번호판")]: 31,
  [norm("임시번호판")]: 32,
  [norm("기타 자동차용품")]: 33,

  // 10) 전자기기 (34~38)
  [norm("태블릿")]: 34,
  [norm("스마트워치")]: 35,
  [norm("무선이어폰")]: 36,
  [norm("카메라")]: 37,
  // SQL에 '기타 전자기기)' 처럼 괄호 오타가 있어도 norm로 흡수됨
  [norm("기타 전자기기")]: 38,

  // 11) 지갑 (39~41)
  [norm("여성용지갑")]: 39,
  [norm("남성용지갑")]: 40,
  [norm("기타 지갑")]: 41,

  // 12) 증명서 (42~45)
  [norm("신분증")]: 42,
  [norm("면허증")]: 43,
  [norm("여권")]: 44,
  [norm("기타 증명서")]: 45,

  // 13) 컴퓨터 (46~49)
  [norm("삼성노트북")]: 46,
  [norm("LG노트북")]: 47,
  [norm("애플노트북")]: 48,
  [norm("기타 컴퓨터")]: 49,

  // 14) 카드 (50~53)
  [norm("신용(체크)카드")]: 50,
  [norm("일반카드")]: 51,
  [norm("교통카드")]: 52,
  [norm("기타 카드")]: 53,

  // 15) 현금 (54)
  [norm("현금")]: 54,

  // 16) 유가증권 (55~58)
  [norm("어음")]: 55,
  [norm("상품권")]: 56,
  [norm("채권")]: 57,
  [norm("기타 유가증권")]: 58,

  // 17) 휴대폰 (59~63)
  [norm("삼성휴대폰")]: 59,
  [norm("LG휴대폰")]: 60,
  [norm("아이폰")]: 61,
  [norm("기타 휴대폰")]: 62,
  [norm("기타 통신기기")]: 63,

  // 18) 기타물품 (64)
  [norm("기타 물품")]: 64,
  [norm("기타물품")]: 64,
};

/**
 * ✅ AI 결과(major/sub) -> category_id 로 변환
 * - sub_name이 있으면 sub 기준으로 우선 매핑
 * - 없으면 major 기준 "기타"로 fallback 하고,
 * - 최후는 기타물품(64)
 */
export function resolveCategoryIdFromAi(major_name, sub_name) {
  const subKey = norm(sub_name);
  if (subKey && SUB_TO_ID[subKey]) return SUB_TO_ID[subKey];

  // major 기준 fallback(대분류별 기타)
  const maj = norm(major_name);
  const majorFallback = {
    [norm("가방")]: SUB_TO_ID[norm("기타가방")],
    [norm("귀금속")]: SUB_TO_ID[norm("기타 귀금속")],
    [norm("도서용품")]: SUB_TO_ID[norm("기타 서적")],
    [norm("서류")]: SUB_TO_ID[norm("기타 서류")],
    [norm("악기")]: SUB_TO_ID[norm("기타 악기")],
    [norm("의류")]: SUB_TO_ID[norm("기타 의류")],
    [norm("자동차")]: SUB_TO_ID[norm("기타 자동차용품")],
    [norm("전자기기")]: SUB_TO_ID[norm("기타 전자기기")],
    [norm("지갑")]: SUB_TO_ID[norm("기타 지갑")],
    [norm("증명서")]: SUB_TO_ID[norm("기타 증명서")],
    [norm("컴퓨터")]: SUB_TO_ID[norm("기타 컴퓨터")],
    [norm("카드")]: SUB_TO_ID[norm("기타 카드")],
    [norm("유가증권")]: SUB_TO_ID[norm("기타 유가증권")],
    [norm("휴대폰")]: SUB_TO_ID[norm("기타 휴대폰")],
    [norm("기타물품")]: 64,
  };

  return majorFallback[maj] || 64;
}