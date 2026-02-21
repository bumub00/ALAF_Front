import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 웹 전용 분실물 전역 상태 관리 컨텍스트
export const ItemContext = createContext();

// 서버 카테고리 ID(숫자) -> 프론트 노출용 한글명 매핑 객체
const CATEGORY_ID_MAP = {
  1: '여성용가방', 2: '남성용가방', 3: '기타가방',
  4: '반지', 5: '목걸이', 6: '귀걸이', 7: '시계', 8: '기타(귀금속)',
  9: '학습서적', 10: '소설', 11: '컴퓨터서적', 12: '만화책', 13: '기타서적',
  14: '서류', 15: '기타(서류)',
  16: '쇼핑백',
  17: '스포츠용품',
  18: '건반악기', 19: '타악기', 20: '관악기', 21: '현악기', 22: '기타악기',
  23: '어음', 24: '상품권', 25: '채권', 26: '기타(유가증권)',
  27: '여성의류', 28: '남성의류', 29: '아기의류', 30: '모자', 31: '신발', 32: '기타의류',
  33: '자동차열쇠', 34: '네비게이션', 35: '자동차번호판', 36: '임시번호판', 37: '기타(자동차용품)',
  38: '태블릿', 39: '스마트워치', 40: '무선이어폰', 41: '카메라', 42: '기타(전자기기)',
  43: '여성용지갑', 44: '남성용지갑', 45: '기타지갑',
  46: '신분증', 47: '면허증', 48: '여권', 49: '기타(증명서)',
  50: '삼성노트북', 51: 'LG노트북', 52: '애플노트북', 53: '기타(컴퓨터)',
  54: '신용(체크)카드', 55: '일반카드', 56: '교통카드', 57: '기타카드',
  58: '현금',
  59: '삼성휴대폰', 60: 'LG휴대폰', 61: '아이폰', 62: '기타휴대폰', 63: '기타통신기기',
  64: '기타물품', 65: '무안공항유류품', 66: '유류품', 67: '무주물'
};

// 등록 폼 입력용 한글명 -> 서버 전송용 카테고리 ID 역방향 매핑 객체
const CATEGORY_NAME_MAP = Object.fromEntries(
  Object.entries(CATEGORY_ID_MAP).map(([id, name]) => [name, parseInt(id)])
);

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]); 
  const BASE_URL = 'http://localhost:8080'; 

  // 전체 분실물 목록 조회
  const fetchItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/items`);
      
      const mappedList = response.data.map(dbItem => ({
        id: dbItem.item_id,
        title: dbItem.name,
        date: dbItem.created_at ? dbItem.created_at.split('T')[0] : '', 
        image: dbItem.image_url ? `${BASE_URL}${dbItem.image_url}` : null, 
        category: CATEGORY_ID_MAP[dbItem.category_id] || '기타물품',
        status: dbItem.display_status || dbItem.status || '보관중'
      }));
      
      setItems(mappedList);
    } catch (error) {
      console.error("목록 로드 실패:", error);
    }
  };

  useEffect(() => {
    fetchItems();
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
        lock_message: data.lock_message
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

  return (
    <ItemContext.Provider value={{ items, fetchItems, getItemDetail, addItem, BASE_URL }}>
      {children}
    </ItemContext.Provider>
  );
};