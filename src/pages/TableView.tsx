import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Councilor } from '../types';
import councilorData from '../data.json';
import { useSearchSort } from '../context/SearchSortContext';
import './TableView.css';

const typedData = councilorData as Councilor[];

export default function TableView() {
  const { searchTerm, setSearchTerm, sortOption } = useSearchSort();
  const navigate = useNavigate();

  const filteredData = useMemo(() => {
    let data = typedData.filter(c => 
      c.councilor.includes(searchTerm.replace(/\s+/g, '')) ||
      c.faction.includes(searchTerm) ||
      c.questions.some(q => q.details.some(d => d.includes(searchTerm)))
    );

    if (sortOption === 'current_desc') {
      data.sort((a, b) => b.currentTermCount - a.currentTermCount);
    } else if (sortOption === 'current_asc') {
      data.sort((a, b) => a.currentTermCount - b.currentTermCount);
    } else if (sortOption === 'total_desc') {
      data.sort((a, b) => b.totalCount - a.totalCount);
    } else if (sortOption === 'faction_order') {
      data.sort((a, b) => a.faction.localeCompare(b.faction, 'ja'));
    }

    return data;
  }, [searchTerm, sortOption]);

  return (
    <div style={{ paddingBottom: '80px' }}>
      <header className="app-header">
        <h1 className="app-title">草加市議会 一般質問アーカイブ</h1>
        <p className="app-subtitle">※今期は2022年12月以降の一般質問を集計</p>
      </header>

      <div className="search-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input 
          type="text" 
          className="search-input"
          placeholder="議員名、会派、または質問キーワードで検索..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="councilor-table">
          <thead>
            <tr>
              <th className="name-col">議員 / 会派</th>
              <th className="num-col">今期<br/>回数</th>
              <th className="num-col">累計<br/>回数</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((councilor, idx) => (
              <tr 
                key={idx} 
                onClick={() => navigate(`/councilor/${encodeURIComponent(councilor.councilor)}`)}
              >
                <td className="name-col">
                  <div className="name-cell">
                    {councilor.officialPhoto ? (
                      <img src={councilor.officialPhoto} alt={councilor.councilor} className="table-photo" />
                    ) : (
                      <div className="table-photo-placeholder"></div>
                    )}
                    <div className="name-text">
                      <span className="table-councilor-name">{councilor.councilor}</span>
                      <span className="table-councilor-faction">{councilor.faction}</span>
                    </div>
                  </div>
                </td>
                <td className="num-col font-bold" style={{ color: 'var(--soka-green)' }}>{councilor.currentTermCount}</td>
                <td className="num-col" style={{ color: 'var(--text-secondary)' }}>{councilor.totalCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div style={{textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)'}}>
          該当する情報が見つかりませんでした。
        </div>
      )}
    </div>
  );
}
