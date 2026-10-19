import { Link, useLocation } from 'react-router-dom';
import { Vote, BarChart3, FileText, Image } from 'lucide-react';
import './BottomNav.css';

export default function BottomNav() {
  const location = useLocation();

  const isElection = location.pathname === '/' || location.pathname === '/election';
  const isAnalytics = location.pathname === '/election/analytics';
  const isQuestions = location.pathname === '/cards' || location.pathname === '/table' || location.pathname.startsWith('/councilor/');
  const isPosters = location.pathname === '/posters';

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${isElection ? 'active' : ''}`}>
        <Vote size={20} className="nav-icon" />
        <span>選挙結果</span>
      </Link>
      <Link to="/election/analytics" className={`nav-item ${isAnalytics ? 'active' : ''}`}>
        <BarChart3 size={20} className="nav-icon" />
        <span>新旧比較</span>
      </Link>
      <Link to="/cards" className={`nav-item ${isQuestions ? 'active' : ''}`}>
        <FileText size={20} className="nav-icon" />
        <span>一般質問</span>
      </Link>
      <Link to="/posters" className={`nav-item ${isPosters ? 'active' : ''}`}>
        <Image size={20} className="nav-icon" />
        <span>前回公報</span>
      </Link>
    </nav>
  );
}

