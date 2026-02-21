import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, ChevronRight } from 'lucide-react'; 
import { ItemContext } from '../../context/ItemContext';
import './WebHome.css';

// -----------------------------------------------------------
// [상수 데이터] 카테고리 대분류 - 소분류 매핑 정의
// (웹 환경의 상세한 67개 분류 체계를 그룹화하여 UI 드롭다운에 사용)
// -----------------------------------------------------------
const CATEGORY_DATA = {
  '가방': ['여성용가방', '남성용가방', '기타가방'],
  '귀금속': ['반지', '목걸이', '귀걸이', '시계', '기타(귀금속)'],
  '도서용품': ['학습서적', '소설', '컴퓨터서적', '만화책', '기타서적'],
  '서류': ['서류', '기타(서류)'],
  '쇼핑백': ['쇼핑백'],
  '스포츠용품': ['스포츠용품'],
  '악기': ['건반악기', '타악기', '관악기', '현악기', '기타악기'],
  '유가증권': ['어음', '상품권', '채권', '기타(유가증권)'],
  '의류': ['여성의류', '남성의류', '아기의류', '모자', '신발', '기타의류'],
  '자동차': ['자동차열쇠', '네비게이션', '자동차번호판', '임시번호판', '기타(자동차용품)'],
  '전자기기': ['태블릿', '스마트워치', '무선이어폰', '카메라', '기타(전자기기)'],
  '지갑': ['여성용지갑', '남성용지갑', '기타지갑'],
  '증명서': ['신분증', '면허증', '여권', '기타(증명서)'],
  '컴퓨터': ['삼성노트북', 'LG노트북', '애플노트북', '기타(컴퓨터)'],
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
  // 1. [상태 관리] 데이터 필터링 및 정렬을 위한 상태값
  // -----------------------------------------------------------
  const [activeCategory, setActiveCategory] = useState('전체'); // 현재 선택된 카테고리
  const [sortBy, setSortBy] = useState('date'); // 정렬 기준 (date: 최신순, views: 조회순)
  const [searchTerm, setSearchTerm] = useState(''); // 검색창 입력값

  // -----------------------------------------------------------
  // 2. [UI 액션] 로고 클릭 시 모든 검색/필터 상태 초기화 및 홈 복귀
  // -----------------------------------------------------------
  const handleLogoClick = () => {
    setActiveCategory('전체'); 
    setSearchTerm('');         
    setSortBy('date');         
    navigate('/');             
    window.scrollTo(0, 0);     
  };

  // -----------------------------------------------------------
  // 3. [데이터 가공] 원본 목록(items)에 카테고리 -> 검색 -> 정렬 순차 적용
  // -----------------------------------------------------------
  const getProcessedItems = () => {
    let processed = items;

    // (1) 카테고리 필터링 적용
    if (activeCategory !== '전체') {
      // 선택한 값이 '대분류'인지(CATEGORY_DATA의 키값인지) 확인
      const isMajorCategory = Object.keys(CATEGORY_DATA).includes(activeCategory);

      if (isMajorCategory) {
        // 대분류 클릭 시: 해당 대분류에 속한 '모든 소분류' 목록을 포함하여 필터링
        const subCategories = CATEGORY_DATA[activeCategory];
        processed = processed.filter(item => subCategories.includes(item.category));
      } else {
        // 소분류 클릭 시: 정확히 이름이 일치하는 아이템만 필터링
        processed = processed.filter(item => item.category === activeCategory);
      }
    }

    // (2) 텍스트 검색 필터링 적용 (대소문자 구분 없이 물건명/제목 기준 검색)
    if (searchTerm.trim() !== '') {
      const lowerQuery = searchTerm.toLowerCase();
      processed = processed.filter(item => {
        return (item.title || item.name || '').toLowerCase().includes(lowerQuery);
      });
    }
    
    // (3) 정렬 로직 적용
    return [...processed].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date); // 최신 날짜 우선
      } else if (sortBy === 'views') {
        return (b.views || 0) - (a.views || 0); // 조회수 높은 순 우선
      }
      return 0;
    });
  };

  // 필터링이 완료된 최종 렌더링용 배열
  const finalItems = getProcessedItems();

  return (
    <div className="pc-container">
      
      {/* --------------------------------------------------
          [상단 헤더 영역] 로고, 검색창, 메뉴 버튼
          -------------------------------------------------- */}
      <header className="pc-header">
        <div className="header-inner">
          <div className="logo" onClick={handleLogoClick} style={{cursor:'pointer'}}>
            <h1>ALAF</h1>
            <span className="logo-sub">Any Lost Any Found</span>
          </div>

          <div className="pc-search-bar">
            <input 
              type="text" 
              placeholder="물건명으로 검색" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <button><Search size={20} /></button>
          </div>

          <div className="pc-nav-menu">
             <button className="menu-item primary" onClick={() => navigate('/register')}>분실물 등록</button>
             <button className="menu-item" onClick={() => navigate('/mypage')}>마이페이지</button>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------
          [메인 영역] 카테고리 메뉴, 정렬 탭, 물건 그리드 리스트
          -------------------------------------------------- */}
      <main className="pc-main">
        
        {/* [좌측 카테고리 드롭다운 메뉴] */}
        <div className="category-dropdown-container">
          <div className="dropdown-trigger">
            <Menu size={24} color="white" />
            <span>카테고리</span>
          </div>

          <ul className="main-menu">
            <li className="menu-item-li" onClick={() => setActiveCategory('전체')}>
              <span className="menu-text">전체 보기</span>
            </li>
            
            {/* 대분류 순회 출력 및 마우스 오버 시 소분류 서브메뉴 표시 */}
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
                          e.stopPropagation(); // 이벤트 버블링 방지
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

        {/* [리스트 상단 헤더 및 정렬 옵션] */}
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

        {/* [분실물 리스트 그리드 출력 영역] */}
        <div className="pc-grid">
          {finalItems.length > 0 ? (
            finalItems.map((data) => (
              <div 
                key={data.id} 
                className="pc-card"
                onClick={() => navigate(`/detail/${data.id}`)} // 카드 클릭 시 상세 페이지 이동
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
            // 결과 없음 처리 화면
            <div style={{ gridColumn: '1 / -1', padding: 100, textAlign: 'center', color: '#888', background: 'white', borderRadius: 16 }}>
              {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '해당 카테고리의 물건이 없습니다.'}
            </div>
          )}
        </div>
      </main>

      {/* 푸터 영역 */}
      <footer className="pc-footer">
        <p>© 2026 ALAF Team. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WebHome;