import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
// 주의: ../config 파일이 실제로 있는지 확인 필요! 없다면 'http://localhost:8080' 등으로 변경
import { MAIN_SERVER } from "../config"; 

// 이름 변경: ItemContext -> KioskItemContext
export const KioskItemContext = createContext();

// 이름 변경: ItemProvider -> KioskItemProvider
export const KioskItemProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const BASE_URL = MAIN_SERVER;

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

  const addItem = async (inputs, imageFile) => {
    try {
      const formData = new FormData();
      const foundDate = inputs?.date || inputs?.found_date || new Date().toISOString().slice(0, 10);

      formData.append("name", inputs.title);
      formData.append("description", inputs.desc || "");
      formData.append("found_date", foundDate); 

      const categoryMap = {
        "전자기기": 1, "지갑": 2, "지갑/카드": 2, "가방": 3, "의류": 4, "기타": 5,
      };
      formData.append("category_id", categoryMap[inputs.category] || 5);

      let placeId = 1;
      if (inputs.location?.includes("학생")) placeId = 2;
      else if (inputs.location?.includes("도서")) placeId = 3;
      formData.append("place_id", placeId);

      if (imageFile) formData.append("image", imageFile);

      await axios.post(`${BASE_URL}/api/items`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 20000,
      });

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