import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AlertSettings.css'; // ★ 전용 CSS 연결

// 백엔드 명세와 동일하게 띄어쓰기 없는 카테고리 대분류 하드코딩
const MAJOR_CATEGORIES = [
  '가방', '귀금속', '도서용품', '서류', '쇼핑백', '스포츠용품',
  '악기', '의류', '자동차', '전자기기', '지갑', '증명서',
  '컴퓨터', '카드', '현금', '유가증권', '휴대폰', '기타물품'
];

const AlertSettings = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get('http://49.50.138.248:8080/api/alerts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.data.alerts) {
          setSelectedCategories(response.data.alerts);
        }
      } catch (error) {
        console.error('알림 설정 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const handleToggle = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleSave = async () => {
    try {
      await axios.post('http://49.50.138.248:8080/api/alerts', 
        { categories: selectedCategories }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('알림 설정이 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error('알림 저장 실패:', error);
      alert('알림 설정 저장에 실패했습니다.');
    }
  };

  if (loading) return <div className="alert-loading">알림 설정 불러오는 중...</div>;

  return (
    <div className="alert-settings-container">
      {/* ★ 중복되던 <h3> 제목 삭제하고 설명글만 깔끔하게 남김 ★ */}
      <p className="alert-desc">
        선택하신 카테고리의 새로운 분실물이 등록되면 이메일로 알려드립니다.
      </p>

      <div className="alert-checkbox-grid">
        {MAJOR_CATEGORIES.map((category) => (
          <label key={category} className="alert-checkbox-label">
            <input 
              type="checkbox" 
              checked={selectedCategories.includes(category)}
              onChange={() => handleToggle(category)}
              className="alert-checkbox-input"
            />
            <span className="alert-checkbox-text">{category}</span>
          </label>
        ))}
      </div>

      {/* ★ 다크 블루 색상이 적용된 저장 버튼 ★ */}
      <div className="alert-btn-wrapper">
        <button onClick={handleSave} className="alert-save-btn">
          알림 설정 저장
        </button>
      </div>
    </div>
  );
};

export default AlertSettings;