import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CommunityHome.css'; 

const CommunityHome = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [postType, setPostType] = useState('ALL'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [postType]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const typeQuery = postType !== 'ALL' ? `?type=${postType}` : '';
      const response = await axios.get(`http://49.50.138.248:8080/api/posts${typeQuery}`);
      setPosts(response.data);
    } catch (error) {
      console.error("게시글을 불러오는데 실패했습니다.", error);
    }
    setLoading(false);
  };

  return (
    <div className="comm-container">
      
      <header className="pc-header">
        <div className="header-inner">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.jpg" alt="ALAF Logo" style={{ height: '36px', width: 'auto' }} />
            <h1 className="logo-text">ALAF</h1>
          </div>
          <div className="pc-nav-menu">
             {/* ★ 이모티콘 제거 및 primary-btn 클래스 삭제 (투명화) ★ */}
             <button className="menu-item" onClick={() => navigate('/community/write')}>글쓰기</button>
             <button className="menu-item" onClick={() => navigate('/')}>돌아가기</button>
          </div>
        </div>
      </header>

      <main className="comm-main">
        {/* 커뮤니티 전용 탭 */}
        <div className="comm-tabs">
          {['ALL', 'LOST', 'LOOKING_FOR'].map((type) => (
            <button 
              key={type}
              onClick={() => setPostType(type)}
              className={`comm-tab-btn ${postType === type ? 'active' : ''}`}
            >
              {/* ★ 이모티콘 제거 ★ */}
              {type === 'ALL' ? '전체 보기' : type === 'LOST' ? '습득했어요' : '찾고있어요'}
            </button>
          ))}
        </div>

        <div className="comm-grid">
          {loading ? (
            <div className="comm-empty">로딩 중...</div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.post_id} className="comm-card" onClick={() => navigate(`/community/${post.post_id}`)}>
                <div className="comm-card-img">
                  {post.thumbnail ? (
                      <img src={`http://49.50.138.248:8080${post.thumbnail}`} alt="썸네일" />
                  ) : (
                    <span className="img-text">No Image</span>
                  )}
                </div>
                
                <div className="comm-card-info">
                  <div className="comm-card-tags">
                      <span className={`type-badge ${post.post_type === 'LOST' ? 'lost' : 'looking'}`}>
                        {post.post_type === 'LOST' ? '습득물' : '분실물'}
                      </span>
                      <span className="category-badge">
                        {post.category_name}
                      </span>
                  </div>
                  
                  <h3 className="comm-card-title">{post.title}</h3>
                  
                  <div className="comm-card-meta">
                    <span className="card-date">{new Date(post.created_at).toLocaleDateString()}</span>
                    <span className="card-author">{post.author_name}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="comm-empty">
              게시글이 없습니다.
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

export default CommunityHome;