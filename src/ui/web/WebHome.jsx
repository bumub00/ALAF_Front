import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 👇 [수정 1] 사용하지 않는 MapPin 제거함
import { Search, Menu, ChevronRight } from 'lucide-react'; 
import { ItemContext } from '../../context/ItemContext';
import './WebHome.css';

// -----------------------------------------------------------
// [상수 데이터] 카테고리 대분류 - 소분류 정의
// -----------------------------------------------------------
const CATEGORY_DATA = {
  '가방': ['여성용가방', '남성용가방', '기타가방'],
  '귀금속': ['반지', '목걸이', '귀걸이', '시계', '기타'],
  '도서용품': ['학습서적', '소설', '컴퓨터서적', '만화책', '기타서적'],
  '서류': ['서류', '기타물품'],
  '쇼핑백': ['쇼핑백'],
  '스포츠용품': ['스포츠용품'],
  '악기': ['건반악기', '타악기', '관악기', '현악기', '기타악기'],
  '유가증권': ['어음', '상품권', '채권', '기타'],
  '의류': ['여성의류', '남성의류', '아기의류', '모자', '신발', '기타의류'],
  '자동차': ['자동차열쇠', '네비게이션', '자동차번호판', '임시번호판', '기타용품'],
  '전자기기': ['태블릿', '스마트워치', '무선이어폰', '카메라', '기타용품'],
  '지갑': ['여성용지갑', '남성용지갑', '기타지갑'],
  '증명서': ['신분증', '면허증', '여권', '기타'],
  '컴퓨터': ['삼성노트북', 'LG노트북', '애플노트북', '기타'],
  '카드': ['신용(체크)카드', '일반카드', '교통카드', '기타카드'],
  '현금': ['현금'],
  '휴대폰': ['삼성휴대폰', 'LG휴대폰', '아이폰', '기타휴대폰', '기타통신기기'],
  '유류품': ['무안공항유류품', '유류품'],
  '무주물': ['무주물'],
  '기타물품': ['기타물품']
};

const WebHome = () => {
  const { items } = useContext(ItemContext);
  const navigate = useNavigate();

  // -----------------------------------------------------------
  // 1. [상태 관리] 필터링 및 정렬을 위한 변수들
  // -----------------------------------------------------------
  const [activeCategory, setActiveCategory] = useState('전체');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');

  // -----------------------------------------------------------
  // 👇 [수정 2] 로고 클릭 시 초기화 함수 추가
  // -----------------------------------------------------------
  const handleLogoClick = () => {
    setActiveCategory('전체'); // 카테고리 초기화
    setSearchTerm('');         // 검색어 초기화
    setSortBy('date');         // 정렬 초기화
    navigate('/');             // 메인으로 이동
    window.scrollTo(0, 0);     // 스크롤 맨 위로
  };

  // -----------------------------------------------------------
  // 2. [데이터 가공 함수] 
  // -----------------------------------------------------------
  const getProcessedItems = () => {
    let processed = items;

    // (1) 카테고리 필터링
  if (activeCategory !== '전체') {
    // 1. 만약 사용자가 '소분류'(예: 여성용가방)를 직접 클릭했다면? -> 정확히 일치하는 것만 찾음
    // 2. 만약 사용자가 '대분류'(예: 가방)를 클릭했다면? -> 그 대분류에 속한 모든 소분류를 다 보여줘야 함!
    
    // 선택된 카테고리가 '대분류'인지 확인 (CATEGORY_DATA 키에 있는지 확인)
    const isMajorCategory = Object.keys(CATEGORY_DATA).includes(activeCategory);

    if (isMajorCategory) {
      // 대분류를 선택했다면, 그 아래 속한 소분류 목록을 가져와서 포함되는지 확인
      const subCategories = CATEGORY_DATA[activeCategory];
      processed = processed.filter(item => subCategories.includes(item.category));
    } else {
      // 소분류를 선택했다면, 정확히 일치하는 것만 확인
      processed = processed.filter(item => item.category === activeCategory);
    }
  }

    // (2) 검색어 필터링
    if (searchTerm.trim() !== '') {
      const lowerQuery = searchTerm.toLowerCase();
      processed = processed.filter(item => {
        return (item.title || item.name || '').toLowerCase().includes(lowerQuery);
      });
    }
    
    // (3) 정렬
    return [...processed].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });
  };

  const finalItems = getProcessedItems();

  return (
    <div className="pc-container">
      
      {/* --- 헤더 영역 --- */}
      <header className="pc-header">
        <div className="header-inner">
          {/* 👇 [수정 3] onClick에 방금 만든 handleLogoClick 함수 연결! */}
          <div className="logo" onClick={handleLogoClick} style={{cursor:'pointer'}}>
            <h1>ALAF</h1>
            <span className="logo-sub">Any Lost Any Found</span>
          </div>

          {/* 검색창 */}
          <div className="pc-search-bar">
            <input 
              type="text" 
              placeholder="물건명으로 검색" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <button><Search size={20} /></button>
          </div>

          {/* 우측 메뉴 */}
          <div className="pc-nav-menu">
             <button className="menu-item primary" onClick={() => navigate('/register')}>분실물 등록</button>
             <button className="menu-item" onClick={() => navigate('/mypage')}>마이페이지</button>
          </div>
        </div>
      </header>

      <main className="pc-main">
        
        {/* --- 카테고리 드롭다운 --- */}
        <div className="category-dropdown-container">
          <div className="dropdown-trigger">
            <Menu size={24} color="white" />
            <span>카테고리</span>
          </div>

          <ul className="main-menu">
            <li className="menu-item-li" onClick={() => setActiveCategory('전체')}>
              <span className="menu-text">전체 보기</span>
            </li>
            
            {Object.keys(CATEGORY_DATA).map((majorCat) => (
              <li key={majorCat} className="menu-item-li">
                <span className="menu-text">{majorCat}</span>
                <ChevronRight size={16} color="#ccc" className="arrow-icon" />
                
                <div className="sub-menu-panel">
                  <h4 className="sub-menu-title">{majorCat}</h4>
                  <div className="sub-menu-grid">
                    {CATEGORY_DATA[majorCat].map((subCat) => (
                      <button 
                        key={subCat} 
                        className="sub-cat-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCategory(subCat);
                        }}
                      >
                        {subCat}
                      </button>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* --- 섹션 헤더 --- */}
        <div className="section-header">
          <h2>
             {searchTerm 
               ? `🔍 "${searchTerm}" 검색 결과` 
               : (activeCategory === '전체' ? '📢 실시간 습득물 현황' : `📂 ${activeCategory}`)}
          </h2>
          <div className="sort-options">
            <span 
              className={sortBy === 'date' ? 'active-sort' : ''} 
              onClick={() => setSortBy('date')}
              style={{ cursor: 'pointer', fontWeight: sortBy === 'date' ? 'bold' : 'normal', color: sortBy === 'date' ? '#333' : '#999' }}
            >
              최신순
            </span>
            <span style={{ margin: '0 5px', color: '#ddd' }}>|</span>
            <span 
              className={sortBy === 'views' ? 'active-sort' : ''} 
              onClick={() => setSortBy('views')}
              style={{ cursor: 'pointer', fontWeight: sortBy === 'views' ? 'bold' : 'normal', color: sortBy === 'views' ? '#333' : '#999' }}
            >
              조회순
            </span>
          </div>
        </div>

        {/* --- 물건 리스트 --- */}
        <div className="pc-grid">
          {finalItems.length > 0 ? (
            finalItems.map((data) => (
              <div 
                key={data.id} 
                className="pc-card"
                onClick={() => navigate(`/detail/${data.id}`)}
              >
                <div className="card-img" style={{backgroundColor: data.imgColor || '#eee', overflow: 'hidden'}}>
                  {data.image ? (
                    <img 
                      src={data.image} 
                      alt="물건 사진" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <span className="img-text">No Image</span>
                  )}
                </div>
                
                <div className="card-info">
                  <h3 className="card-title">{data.title}</h3>
                  <div className="card-meta">
                    <span className="card-date">{data.date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 5 }}>
                    조회 {data.views || 0}회
                  </div>
                  <div className={`card-status ${data.status === '해결됨' ? 'done' : ''}`}>
                    {data.status}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: 100, textAlign: 'center', color: '#888', background: 'white', borderRadius: 16 }}>
              {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '해당 카테고리의 물건이 없습니다.'}
            </div>
          )}
        </div>
      </main>

      <footer className="pc-footer">
        <p>© 2026 ALAF Team. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WebHome;