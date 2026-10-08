import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Councilor, QuestionItem } from '../types';
import councilorData from '../data.json';
import { useSearchSort } from '../context/SearchSortContext';

const typedData = councilorData as Councilor[];

export default function Home() {
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

  const getRecentQuestionPreview = (questions: QuestionItem[]) => {
    const currentQs = questions.filter(q => q.isCurrentTerm);
    if (currentQs.length === 0) return null;
    
    // Get the most recent question
    const recentQ = currentQs[0];
    
    let previewContent = null;
    let hasMore = false;
    
    if (recentQ.newsletter) {
      previewContent = (
        <div style={{ color: 'var(--soka-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span>📖</span> {recentQ.newsletter.title}
        </div>
      );
    } else {
      // Extract main items
      const mainItems = recentQ.details.filter(d => !/^[ア-ンa-zA-Z]、/.test(d) && !d.startsWith('　'));
      if (mainItems.length === 0) return null;
      
      const previewText = mainItems[0].replace(/^\d+\s/, '');
      hasMore = mainItems.length > 1;
      previewContent = (
        <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {previewText} {hasMore && <span style={{ color: 'var(--text-secondary)' }}>ほか</span>}
        </div>
      );
    }
    
    return (
      <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', borderLeft: '3px solid var(--soka-green)', fontSize: '0.85rem' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
          最近の質問 ({recentQ.meeting})
        </div>
        {previewContent}
      </div>
    );
  };

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

      <div className="councilor-list">
        {filteredData.map((councilor, idx) => (
          <div 
            key={idx} 
            className="councilor-card"
            onClick={() => navigate(`/councilor/${encodeURIComponent(councilor.councilor)}`)}
          >
            <div className="card-top">
              <span className="councilor-faction">{councilor.faction}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              {councilor.officialPhoto ? (
                <img 
                  src={councilor.officialPhoto} 
                  alt={councilor.councilor} 
                  style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                />
              ) : (
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--soka-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--soka-green)', fontSize: '0.8rem' }}>No Photo</div>
              )}
              <h2 className="councilor-name" style={{ marginBottom: 0 }}>{councilor.councilor}</h2>
            </div>
            
            <div className="stats-row">
              <span className="stat-primary">
                今期 質問回数： {councilor.currentTermCount}回
              </span>
              <span className="stat-secondary">
                （議員期間：約{councilor.tenureYears}年 / 総質問回数：{councilor.totalCount}回）
              </span>
            </div>

            {getRecentQuestionPreview(councilor.questions)}
          </div>
        ))}
      </div>
      
      {filteredData.length === 0 && (
        <div style={{textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)'}}>
          該当する情報が見つかりませんでした。
        </div>
      )}

      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.6'
      }}>
        ※草加市議会のルールにより、議会三役（議長・副議長・監査）および議会運営委員長は一般質問を行いません。役職就任により実質的な質問可能回数が異なる点にご留意ください。
      </div>
    </div>
  );
}
