import { Link, useLocation } from 'react-router-dom';
import { Vote, LayoutGrid, Table, Image } from 'lucide-react';
import './BottomNav.css';

export default function BottomNav() {
  const location = useLocation();

  const isElection = location.pathname === '/' || location.pathname === '/election';
  const isCards = location.pathname === '/cards';
  const isTable = location.pathname === '/table';
  const isPosters = location.pathname === '/posters';

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${isElection ? 'active' : ''}`}>
        <Vote size={20} className="nav-icon" />
        <span>2026選挙</span>
      </Link>
      <Link to="/cards" className={`nav-item ${isCards ? 'active' : ''}`}>
        <LayoutGrid size={20} className="nav-icon" />
        <span>カード</span>
      </Link>
      <Link to="/table" className={`nav-item ${isTable ? 'active' : ''}`}>
        <Table size={20} className="nav-icon" />
        <span>リスト(表)</span>
      </Link>
      <Link to="/posters" className={`nav-item ${isPosters ? 'active' : ''}`}>
        <Image size={20} className="nav-icon" />
        <span>2022年時公報</span>
      </Link>
    </nav>
  );
}

