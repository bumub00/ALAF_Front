import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 웹 전용 분실물 전역 상태 관리 컨텍스트
export const ItemContext = createContext();

// 서버 카테고리 ID(숫자) -> 프론트 노출용 한글명 매핑 객체
const CATEGORY_ID_MAP = {
  1: '여성용가방', 2: '남성용가방', 3: '기타 가방',
  4: '반지', 5: '목걸이', 6: '귀걸이', 7: '시계', 8: '기타 귀금속',
  9: '학습서적', 10: '소설', 11: '컴퓨터서적', 12: '만화책', 13: '기타 서적',
  14: '서류', 15: '기타 서류',
  16: '쇼핑백',
  17: '스포츠용품',
  18: '건반악기', 19: '타악기', 20: '관악기', 21: '현악기', 22: '기타 악기',
  23: '여성의류', 24: '남성의류', 25: '아기의류', 26: '모자', 27: '신발', 28: '기타 의류',
  29: '자동차열쇠', 30: '네비게이션', 31: '자동차번호판', 32: '임시번호판', 33: '기타 자동차용품',
  34: '태블릿', 35: '스마트워치', 36: '무선이어폰', 37: '카메라', 38: '기타 전자기기',
  39: '여성용지갑', 40: '남성용지갑', 41: '기타 지갑',
  42: '신분증', 43: '면허증', 44: '여권', 45: '기타 증명서',
  46: '삼성노트북', 47: 'LG노트북', 48: '애플노트북', 49: '기타 컴퓨터',
  50: '신용(체크)카드', 51: '일반카드', 52: '교통카드', 53: '기타 카드',
  54: '현금', 55:'어음', 56:'상품권', 57:'채권', 58:'기타 유가증권',
  59: '삼성휴대폰', 60: 'LG휴대폰', 61: '아이폰', 62: '기타 휴대폰', 63: '기타 통신기기',
  64: '기타 물품'
};

// 등록 폼 입력용 한글명 -> 서버 전송용 카테고리 ID 역방향 매핑 객체
const CATEGORY_NAME_MAP = Object.fromEntries(
  Object.entries(CATEGORY_ID_MAP).map(([id, name]) => [name, parseInt(id)])
);

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]); 
  const BASE_URL = 'http://49.50.138.248:8080'; 

  // 전체 분실물 목록 조회 (페이지 및 이어붙이기 로직 추가)
  const fetchItems = async (page = 1, isAppend = false) => {
    try {
      // 1. 백엔드에 페이지 번호 요청 (기본 20개씩)
      const response = await axios.get(`${BASE_URL}/api/items?page=${page}&limit=20`);
      
      const mappedList = response.data.map(dbItem => ({
        id: dbItem.item_id,
        title: dbItem.name,
        date: dbItem.created_at ? dbItem.created_at.split('T')[0] : '', 
        image: dbItem.image_url ? `${BASE_URL}${dbItem.image_url}` : null, 
        category: CATEGORY_ID_MAP[dbItem.category_id] || '기타물품',
        status: dbItem.display_status || dbItem.status || '보관중',
        view_count: dbItem.view_count || 0
      }));
      
      // 2. 무한 스크롤이면 기존 데이터 뒤에 이어 붙이고, 아니면 새로 덮어쓰기
      if (isAppend) {
        setItems(prev => [...prev, ...mappedList]);
      } else {
        setItems(mappedList);
      }

      // 3. 백엔드에서 준 데이터가 20개 미만이면 "더 이상 가져올 게 없다(false)"고 프론트에 알림
      return mappedList.length === 20;
    } catch (error) {
      console.error("목록 로드 실패:", error);
      return false; // 에러 나면 멈춤
    }
  };

  // 처음 렌더링될 때 1페이지 로드
  useEffect(() => {
    fetchItems(1, false);
  }, []);


  // 특정 분실물 상세 조회
  const getItemDetail = async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/items/${id}`);
      const data = response.data;
      
      return {
        id: data.item_id,
        title: data.name,
        date: data.found_date ? data.found_date.split('T')[0] : '',
        location: `${data.address || ''}`, 
        category: CATEGORY_ID_MAP[data.category_id] || data.category_name || '기타',
        image: data.image_url ? `${BASE_URL}${data.image_url}` : null,
        status: data.status,
        desc: data.description, 
        is_available: data.is_available, 
        lock_message: data.lock_message,
        view_count: data.view_count
      };
    } catch (error) {
      console.error("상세 정보 로드 실패:", error);
      return null;
    }
  };

  // 신규 분실물 등록
  const addItem = async (inputs, imageFile) => {
    try {
      const formData = new FormData();
      
      formData.append('name', inputs.title); 
      formData.append('description', inputs.desc); 
      formData.append('found_date', inputs.date); 
      formData.append('place_id', inputs.nodeId); 
      formData.append('detail_address', inputs.detailLocation); 

      // 한글 카테고리명을 숫자 ID로 변환하여 전송 (기본값: 64)
      const catId = CATEGORY_NAME_MAP[inputs.category] || 64;
      formData.append('category_id', catId);
            
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // 로컬스토리지 토큰 기반 인증
      const token = localStorage.getItem('token');
      // 기본 헤더 세팅
      const headers = { 
        'Content-Type': 'multipart/form-data'
      };
      // 토큰이 존재하고, 글자 그대로의 'null'이 아닐 때만 Authorization 추가
      if (token && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await axios.post(`${BASE_URL}/api/items`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });

      // 등록 성공 시 목록 갱신
      fetchItems(); 
      return true;

    } catch (error) {
      console.error("등록 실패:", error);
      alert(`등록 실패: ${error.response?.data?.error || error.message}`);
      return false;
    }
  };

  const deleteItem = async (id) => {
    try {
      const token = localStorage.getItem('token');
      // 토큰이 없으면 컷
      if (!token) {
        alert("로그인이 필요합니다.");
        return false;
      }

      const headers = { 'Authorization': `Bearer ${token}` };
      
      // 삭제 API 호출 (DELETE 메서드 사용)
      await axios.delete(`${BASE_URL}/api/items/${id}`, { headers });
      
      // 삭제 성공 후 목록 새로고침
      fetchItems(); 
      return true;
    } catch (error) {
      console.error("삭제 실패:", error);
      // 백엔드에서 에러 메시지를 보내줬다면 띄워주고, 아니면 기본 메시지
      const errorMsg = error.response?.data?.message || '삭제 권한이 없거나 오류가 발생했습니다.';
      alert(errorMsg);
      return false;
    }
  };

  return (
    <ItemContext.Provider value={{ items, fetchItems, getItemDetail, addItem, deleteItem, BASE_URL }}>
      {children}
    </ItemContext.Provider>
  );
};