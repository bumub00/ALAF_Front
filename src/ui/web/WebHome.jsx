import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp } from 'lucide-react'; 
import { ItemContext } from '../../context/ItemContext';
import './WebHome.css';

const CATEGORY_DATA = {
  '가방': ['여성용가방', '남성용가방', '기타 가방'],
  '귀금속': ['반지', '목걸이', '귀걸이', '시계', '기타 귀금속'],
  '도서용품': ['학습서적', '소설', '컴퓨터서적', '만화책', '기타 서적'],
  '서류': ['서류', '기타 서류'],
  '쇼핑백': ['쇼핑백'],
  '스포츠용품': ['스포츠용품'],
  '악기': ['건반악기', '타악기', '관악기', '현악기', '기타 악기'],
  '의류': ['여성의류', '남성의류', '아기의류', '모자', '신발', '기타 의류'],
  '자동차': ['자동차열쇠', '네비게이션', '자동차번호판', '임시번호판', '기타 자동차용품'],
  '전자기기': ['태블릿', '스마트워치', '무선이어폰', '카메라', '기타 전자기기'],
  '지갑': ['여성용지갑', '남성용지갑', '기타 지갑'],
  '증명서': ['신분증', '면허증', '여권', '기타 증명서'],
  '컴퓨터': ['삼성노트북', 'LG노트북', '애플노트북', '기타 컴퓨터'],
  '카드': ['신용(체크)카드', '일반카드', '교통카드', '기타 카드'],
  '현금': ['현금'],
  '유가증권': ['어음','상품권','채권','기타 유가증권'],
  '휴대폰': ['삼성휴대폰', 'LG휴대폰', '아이폰', '기타 휴대폰', '기타 통신기기'],
  '기타물품': ['기타 물품']
};

const WebHome = () => {
  const { items, fetchItems } = useContext(ItemContext); 
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('전체'); 
  const [sortBy, setSortBy] = useState('date'); 
  const [searchTerm, setSearchTerm] = useState(''); 
  
  const [expandedMenu, setExpandedMenu] = useState(null); 

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleLogoClick = () => {
    setActiveCategory('전체'); 
    setExpandedMenu(null);
    setSearchTerm('');         
    setSortBy('date');         
    navigate('/');             
    window.scrollTo(0, 0);   
    
    setPage(1);
    setHasMore(true);
    fetchItems(1, false); 
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    const moreAvailable = await fetchItems(nextPage, true);
    setPage(nextPage);
    setHasMore(moreAvailable);
  };

  const handleMajorClick = (majorCat) => {
    setExpandedMenu(expandedMenu === majorCat ? null : majorCat);
    setActiveCategory(majorCat); 
  };

  const getProcessedItems = () => {
    let processed = items;

    if (activeCategory !== '전체') {
      const isMajorCategory = Object.keys(CATEGORY_DATA).includes(activeCategory);
      if (isMajorCategory) {
        const subCategories = CATEGORY_DATA[activeCategory];
        processed = processed.filter(item => subCategories.includes(item.category));
      } else {
        processed = processed.filter(item => item.category === activeCategory);
      }
    }

    if (searchTerm.trim() !== '') {
      const lowerQuery = searchTerm.toLowerCase();
      processed = processed.filter(item => {
        return (item.title || item.name || '').toLowerCase().includes(lowerQuery);
      });
    }
    
    return [...processed].sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date); 
      if (sortBy === 'views') return (b.view_count || 0) - (a.view_count || 0);
      return 0;
    });
  };

  const finalItems = getProcessedItems();

  return (
    <div className="pc-container">
      <header className="pc-header">
        <div className="header-inner">
          
          <div className="logo" onClick={handleLogoClick} style={{cursor:'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <img src="/logo.jpg" alt="ALAF Logo" style={{ height: '36px', width: 'auto' }} />
            <h1 className="logo-text">ALAF</h1>
          </div>

          <div className="pc-search-bar">
            <input 
              type="text" 
              placeholder="물건명으로 검색" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <button><Search size={18} /></button>
          </div>

          <div className="pc-nav-menu">
             {/* ★ 버튼 클래스 통일 (primary 제거) ★ */}
             <button className="menu-item" onClick={() => navigate('/register')}>분실물 등록</button>
             <button className="menu-item" onClick={() => navigate('/community')}>커뮤니티</button>
             <button className="menu-item" onClick={() => navigate('/mypage')}>마이페이지</button>
          </div>
        </div>
      </header>

      <div className="pc-layout">
        
        <aside className="pc-sidebar">
          <ul className="sidebar-menu">
            <li 
              className={`menu-item-base ${activeCategory === '전체' ? 'active' : ''}`}
              onClick={() => { setActiveCategory('전체'); setExpandedMenu(null); }}
            >
              전체 보기
            </li>
            
            {Object.keys(CATEGORY_DATA).map((majorCat) => {
              const isExpanded = expandedMenu === majorCat;
              const isGroupActive = activeCategory === majorCat || CATEGORY_DATA[majorCat].includes(activeCategory);

              return (
                <div key={majorCat} className="sidebar-group">
                  <li 
                    className={`menu-item-base major-cat ${isGroupActive ? 'active' : ''}`}
                    onClick={() => handleMajorClick(majorCat)}
                  >
                    <span>{majorCat}</span>
                    {isExpanded ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#ccc" />}
                  </li>
                  
                  {isExpanded && (
                    <ul className="sidebar-sub-menu">
                      {CATEGORY_DATA[majorCat].map((subCat) => (
                        <li 
                          key={subCat}
                          className={`sub-cat-item ${activeCategory === subCat ? 'sub-active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation(); 
                            setActiveCategory(subCat);
                          }}
                        >
                          {subCat}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </ul>
        </aside>

        <main className="pc-main-content">
          <div className="section-header">
            <h2>
               {searchTerm 
                 ? `"${searchTerm}" 검색 결과` 
                 : (activeCategory === '전체' ? '실시간 습득물 현황' : activeCategory)}
            </h2>
            <div className="sort-options">
              <span className={sortBy === 'date' ? 'active-sort' : ''} onClick={() => setSortBy('date')}>최신순</span>
              <span className={sortBy === 'views' ? 'active-sort' : ''} onClick={() => setSortBy('views')}>조회순</span>
            </div>
          </div>

          <div className="pc-grid">
            {finalItems.length > 0 ? (
              finalItems.map((data) => (
                <div key={data.id} className="pc-card" onClick={() => navigate(`/detail/${data.id}`)}>
                  <div className="card-img">
                    {data.image ? (
                      <img src={data.image} alt="물건 사진" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="img-text">No Image</span>
                    )}
                  </div>
                  <div className="card-info">
                    <h3 className="card-title">{data.title}</h3>
                    <div className="card-meta">
                      <span className="card-date">{data.date}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
                      조회 {data.view_count || 0}회
                    </div>
                    <div className={`card-status ${data.status === '해결됨' ? 'done' : ''}`}>
                      {data.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '해당 카테고리의 물건이 없습니다.'}
              </div>
            )}
          </div>

          {hasMore && finalItems.length > 0 && (
            <div className="load-more-container">
              <button onClick={handleLoadMore} className="load-more-btn">더보기</button>
            </div>
          )}
        </main>
      </div>

      <footer className="pc-footer">
        <p>© 2026 ALAF Team. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WebHome;