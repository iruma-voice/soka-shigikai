import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Table, ArrowUpDown, X } from 'lucide-react';
import { useSearchSort } from '../context/SearchSortContext';
import { useState } from 'react';
import './BottomNav.css';

export default function BottomNav() {
  const location = useLocation();
  const { sortOption, setSortOption } = useSearchSort();
  const [showSortModal, setShowSortModal] = useState(false);

  const isHome = location.pathname === '/';
  const isTable = location.pathname === '/table';

  return (
    <>
      {showSortModal && (
        <div className="modal-overlay" onClick={() => setShowSortModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>並び替え</h3>
              <button className="close-button" onClick={() => setShowSortModal(false)}><X size={20} /></button>
            </div>
            <div className="sort-options">
              <button 
                className={`sort-button ${sortOption === 'current_desc' ? 'active' : ''}`}
                onClick={() => { setSortOption('current_desc'); setShowSortModal(false); }}
              >
                今期の質問が多い順
              </button>
              <button 
                className={`sort-button ${sortOption === 'current_asc' ? 'active' : ''}`}
                onClick={() => { setSortOption('current_asc'); setShowSortModal(false); }}
              >
                今期の質問が少ない順
              </button>
              <button 
                className={`sort-button ${sortOption === 'total_desc' ? 'active' : ''}`}
                onClick={() => { setSortOption('total_desc'); setShowSortModal(false); }}
              >
                累計の質問が多い順
              </button>
              <button 
                className={`sort-button ${sortOption === 'faction_order' ? 'active' : ''}`}
                onClick={() => { setSortOption('faction_order'); setShowSortModal(false); }}
              >
                会派順
              </button>
              <button 
                className={`sort-button ${sortOption === 'default' ? 'active' : ''}`}
                onClick={() => { setSortOption('default'); setShowSortModal(false); }}
              >
                標準（あいうえお順）
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        <Link to="/" className={`nav-item ${isHome ? 'active' : ''}`}>
          <LayoutGrid size={20} className="nav-icon" />
          <span>カード</span>
        </Link>
        <Link to="/table" className={`nav-item ${isTable ? 'active' : ''}`}>
          <Table size={20} className="nav-icon" />
          <span>リスト(表)</span>
        </Link>
        <button className="nav-item sort-nav-item" onClick={() => setShowSortModal(true)}>
          <ArrowUpDown size={20} className="nav-icon" />
          <span>並び替え</span>
        </button>
      </nav>
    </>
  );
}
