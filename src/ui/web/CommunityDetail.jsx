import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { MessageCircle } from 'lucide-react';
import axios from 'axios';
import './CommunityDetail.css'; // ★ 전용 CSS 연결

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext); 
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`http://49.50.138.248:8080/api/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        alert('게시글을 불러올 수 없습니다.');
        navigate('/community');
      }
    };
    fetchDetail();
  }, [id, navigate]);

  if (!post) return <div className="comm-detail-loading">데이터 불러오는 중...</div>;

  const isMyPost = user && user.id === post.member_id;

  return (
    <div className="comm-detail-container">
      
      {/* ★ 공통 헤더 + 로고 가로 정렬 ★ */}
      <header className="pc-header">
        <div className="header-inner">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.jpg" alt="ALAF Logo" style={{ height: '36px', width: 'auto' }} />
            <h1 className="logo-text">ALAF</h1>
          </div>
          <div className="pc-nav-menu">
             <button className="menu-item" onClick={() => navigate(-1)}>돌아가기</button>
          </div>
        </div>
      </header>

      <main className="comm-detail-main">
        <div className="comm-detail-card">
          
          {/* 상단 뱃지 영역 (이모티콘 제거) */}
          <div className="detail-badges">
              <span className={`badge-type ${post.post_type === 'LOST' ? 'lost' : 'looking'}`}>
                  {post.post_type === 'LOST' ? '습득했어요 (보관중)' : '찾고있어요 (분실함)'}
              </span>
              <span className="badge-category">
                  {post.category_name}
              </span>
          </div>

          <h1 className="detail-title">{post.title}</h1>
          
          <div className="detail-meta">
            <span>작성자: <strong>{post.author_name}</strong></span>
            <span>{new Date(post.created_at).toLocaleString()}</span>
          </div>

          {/* 이미지 영역 */}
          {post.images && post.images.length > 0 && (
            <div className="detail-image-box">
                <img 
                  src={`http://49.50.138.248:8080${post.images[0]}`} 
                  alt="게시글 첨부" 
                />
            </div>
          )}

          {/* 본문 내용 */}
          <div className="detail-content">
            {post.content}
          </div>

          <div className="detail-divider"></div>

          {/* 액션 버튼 영역 */}
          <div className="detail-actions">
            {isMyPost ? (
              <button className="edit-btn">
                글 수정/삭제 (준비중)
              </button>
            ) : (
              <button 
                className="chat-btn"
                onClick={() => alert("채팅 기능은 향후 업데이트 예정입니다! 기대해주세요.")}
              >
                <MessageCircle size={20} />
                <span>작성자에게 1:1 채팅 보내기</span>
              </button>
            )}
          </div>

        </div>
      </main>
      
      <footer className="pc-footer">
        <p>© 2026 ALAF Team. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CommunityDetail;