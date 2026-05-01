import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { MAIN_SERVER } from "../config"; 

// 키오스크 전용 분실물 전역 상태 관리 컨텍스트
export const KioskItemContext = createContext();

export const KioskItemProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const BASE_URL = MAIN_SERVER;

  // 전체 분실물 목록 조회
  const fetchItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/items`);
      const mappedList = response.data.map((dbItem) => ({
        id: dbItem.item_id,
        title: dbItem.name,
        date: dbItem.created_at ? dbItem.created_at.split("T")[0] : "",
        image: dbItem.image_url ? `${BASE_URL}${dbItem.image_url}` : null,
        status: dbItem.status || "보관중",
      }));
      setItems(mappedList);
    } catch (error) {
      console.error("목록 로드 실패:", error);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 특정 분실물 상세 조회
  const getItemDetail = async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/items/${id}`);
      const data = response.data;
      return {
        id: data.item_id,
        title: data.name,
        date: data.found_date ? data.found_date.split("T")[0] : "",
        location: `${data.address || ""} ${data.detail_address || ""}`.trim(),
        category: data.category_name || "기타",
        desc: data.description || "",
        image: data.image_url ? `${BASE_URL}${data.image_url}` : null,
        status: data.status || "보관중",
      };
    } catch (error) {
      console.error("상세 정보 로드 실패:", error);
      return null;
    }
  };

  // 키오스크 환경 맞춤형 신규 분실물 등록
  const addItem = async (inputs, imageFile) => {
    try {
      const formData = new FormData();
      
      // 날짜 값 누락 시 현재 날짜(YYYY-MM-DD)로 기본값 처리
      const foundDate = inputs?.date || inputs?.found_date || new Date().toISOString().slice(0, 10);

      formData.append("name", inputs.title);
      formData.append("description", inputs.desc || "");
      formData.append("found_date", foundDate); 

      // 키오스크 전용 단순화된 카테고리 매핑
      const categoryMap = {
        "전자기기": 1, "지갑": 2, "지갑/카드": 2, "가방": 3, "의류": 4, "기타": 5,
      };
      formData.append("category_id", categoryMap[inputs.category] || 5);

      // 입력된 위치 키워드를 분석하여 건물 ID(place_id) 자동 부여
      let placeId = 1;
      if (inputs.location?.includes("학생")) placeId = 2;
      else if (inputs.location?.includes("도서")) placeId = 3;
      formData.append("place_id", placeId);

      if (imageFile) formData.append("image", imageFile);

      await axios.post(`${BASE_URL}/api/items`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // 키오스크 네트워크 환경을 고려한 타임아웃 지연 설정 (20초)
        timeout: 20000,
      });

      // 등록 성공 시 목록 갱신
      await fetchItems();
      return true;
    } catch (error) {
      console.error("등록 실패:", error);
      alert(`등록 실패: ${error.response?.data?.error || error.message}`);
      return false;
    }
  };

  return (
    <KioskItemContext.Provider value={{ items, fetchItems, getItemDetail, addItem, BASE_URL }}>
      {children}
    </KioskItemContext.Provider>
  );
};