import { useState, useMemo, useRef, useEffect, type TouchEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Vote, 
  Search, 
  FileText, 
  X, 
  ChevronRight, 
  ChevronLeft,
  ExternalLink, 
  BookOpen, 
  ZoomIn, 
  RotateCcw,
  LayoutGrid,
  List
} from 'lucide-react';
import electionData from '../data/election2026.json';
import councilorData from '../data.json';
import type { Councilor } from '../types';
import './Election2026.css';

interface CandidateItem {
  id: number;
  name: string;
  kana: string;
  gender: string;
  age: number;
  party: string;
  status: string;
  job: string;
  address: string;
  website: string | null;
  posterUrl: string;
  hasPoster: boolean;
  existingCouncilorName?: string | null;
  note?: string;
}

const councilors = councilorData as Councilor[];
const councilorMap = new Map<string, Councilor>();
councilors.forEach(c => {
  councilorMap.set(c.councilor.replace(/\s+/g, ''), c);
});

export default function Election2026() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const paramTab = searchParams.get('tab');
  const paramMode = searchParams.get('mode');

  // 初期アクティブタブ: URLパラメータ、なければ「市議選（市議候補）」
  const [activeTab, setActiveTabState] = useState<'mayor' | 'council'>(() => 
    paramTab === 'mayor' ? 'mayor' : 'council'
  );

  // 表示モード状態（公報即時閲覧ビュー ⇔ 1行コンパクトリスト、初期値は'poster'）
  const [viewMode, setViewModeState] = useState<'poster' | 'list'>(() => 
    paramMode === 'list' ? 'list' : 'poster'
  );

  const setActiveTab = (tab: 'mayor' | 'council') => {
    setActiveTabState(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    }, { replace: true });
  };

  const setViewMode = (mode: 'poster' | 'list') => {
    setViewModeState(mode);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('mode', mode);
      return next;
    }, { replace: true });
  };

  // 検索・並び替え・フィルター状態
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'age_asc' | 'age_desc' | 'name' | 'questions'>('id');
  const [statusFilter, setStatusFilter] = useState<'all' | '現' | '新' | '元'>('all');
  const [partyFilter, setPartyFilter] = useState<string>('all');

  // 詳細モーダル状態
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null);

  // Lightbox状態
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string } | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const lastTouchDistRef = useRef<number | null>(null);
  const lastPanStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  const { mayor, council } = electionData;

  // 市議選候補者のフィルタリング & ソート
  const filteredCouncil = useMemo(() => {
    let list = [...(council.candidates as CandidateItem[])];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.kana.toLowerCase().includes(q) ||
        c.party.toLowerCase().includes(q) ||
        c.job.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter(c => c.status === statusFilter);
    }

    if (partyFilter !== 'all') {
      list = list.filter(c => c.party === partyFilter);
    }

    // ソート処理
    if (sortBy === 'id') {
      list.sort((a, b) => a.id - b.id);
    } else if (sortBy === 'age_asc') {
      list.sort((a, b) => a.age - b.age);
    } else if (sortBy === 'age_desc') {
      list.sort((a, b) => b.age - a.age);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.kana.localeCompare(b.kana, 'ja'));
    } else if (sortBy === 'questions') {
      list.sort((a, b) => {
        const countA = councilorMap.get(a.name.replace(/\s+/g, ''))?.totalCount || 0;
        const countB = councilorMap.get(b.name.replace(/\s+/g, ''))?.totalCount || 0;
        return countB - countA;
      });
    }

    return list;
  }, [council.candidates, searchQuery, statusFilter, partyFilter, sortBy]);

  // 市長選候補者（検索適用）
  const filteredMayor = useMemo(() => {
    let list = [...(mayor.candidates as CandidateItem[])];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.kana.toLowerCase().includes(q) ||
        c.job.toLowerCase().includes(q)
      );
    }
    return list;
  }, [mayor.candidates, searchQuery]);

  // 政党リスト（市議選用）
  const partyList = useMemo(() => {
    const set = new Set<string>();
    (council.candidates as CandidateItem[]).forEach(c => set.add(c.party));
    return Array.from(set);
  }, [council.candidates]);

  // Lightbox タッチズーム & パンハンドラー
  const handleLightboxTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistRef.current = dist;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapTimeRef.current < 280) {
        setZoomScale(prev => (prev > 1.2 ? 1 : 2.2));
        setPanPos({ x: 0, y: 0 });
      }
      lastTapTimeRef.current = now;

      lastPanStartRef.current = {
        x: e.touches[0].clientX - panPos.x,
        y: e.touches[0].clientY - panPos.y
      };
    }
  };

  const handleLightboxTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / lastTouchDistRef.current;
      setZoomScale(prev => Math.min(Math.max(prev * factor, 1), 3.5));
      lastTouchDistRef.current = dist;
    } else if (e.touches.length === 1 && lastPanStartRef.current !== null && zoomScale > 1) {
      setPanPos({
        x: e.touches[0].clientX - lastPanStartRef.current.x,
        y: e.touches[0].clientY - lastPanStartRef.current.y
      });
    }
  };

  const handleLightboxTouchEnd = () => {
    lastTouchDistRef.current = null;
    lastPanStartRef.current = null;
  };

  // モーダル表示中の背面スクロール固定
  useEffect(() => {
    if (selectedCandidate || lightboxImg) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedCandidate, lightboxImg]);

  return (
    <div className="election-page">
      {/* ====================================================================
          常時固定ヘッダー (Sticky Header)
         ==================================================================== */}
      <div className="sticky-header-wrapper">
        <div className="election-title-bar">
          <h1 className="election-main-title">
            <Vote size={20} color="var(--soka-primary)" />
            2026 草加市選挙ナビ
          </h1>
          <span className="election-dates-tag">10/11告示 10/18投開票</span>
        </div>

        {/* タブ切り替え */}
        <div className="tab-controls">
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'council' ? 'active' : ''}`}
            onClick={() => { setActiveTab('council'); setSearchQuery(''); }}
          >
            <span>市議会議員選 ({council.candidatesCount}名)</span>
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'mayor' ? 'active' : ''}`}
            onClick={() => { setActiveTab('mayor'); setSearchQuery(''); }}
          >
            <span>草加市長選 ({mayor.candidatesCount}名)</span>
          </button>
        </div>

        {/* 表示形式切り替えトグル (公報ビュー ⇔ リストビュー) */}
        <div className="view-mode-row">
          <div className="view-mode-group">
            <button 
              type="button"
              className={`view-mode-btn ${viewMode === 'poster' ? 'active' : ''}`}
              onClick={() => setViewMode('poster')}
            >
              <LayoutGrid size={13} />
              公報
            </button>
            <button 
              type="button"
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={13} />
              リスト
            </button>
          </div>
          <span className="view-mode-hint">
            {viewMode === 'poster' ? '公報タップで即全画面拡大' : '1行コンパクト比較'}
          </span>
        </div>

        {/* 検索 & ソートバー */}
        <div className="search-sort-bar">
          <div className="search-box">
            <Search size={16} className="search-icon-inside" />
            <input 
              type="text" 
              className="search-input-field"
              placeholder={activeTab === 'mayor' ? "市長選候補者を検索..." : "候補者名、ふりがな、党派、町名で検索..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {activeTab === 'council' && (
            <select 
              className="sort-select-field"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
            >
              <option value="id">届出番号順</option>
              <option value="age_asc">若い順</option>
              <option value="age_desc">高い順</option>
              <option value="name">五十音順</option>
              <option value="questions">質問実績順</option>
            </select>
          )}
        </div>

        {/* クイックフィルター（市議選のみ） */}
        {activeTab === 'council' && (
          <div className="filter-chips-row">
            <button 
              type="button"
              className={`chip ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              すべて
            </button>
            <button 
              type="button"
              className={`chip ${statusFilter === '現' ? 'active' : ''}`}
              onClick={() => setStatusFilter('現')}
            >
              現職 (23)
            </button>
            <button 
              type="button"
              className={`chip ${statusFilter === '新' ? 'active' : ''}`}
              onClick={() => setStatusFilter('新')}
            >
              新人 (14)
            </button>
            <span style={{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
            {partyList.map(p => (
              <button 
                key={p}
                type="button"
                className={`chip ${partyFilter === p ? 'active' : ''}`}
                onClick={() => setPartyFilter(partyFilter === p ? 'all' : p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ====================================================================
          コンテンツエリア
         ==================================================================== */}
      <div className="content-area">
        {activeTab === 'mayor' ? (
          /* 市長選（3名）1画面完結ブロック */
          <div>
            <div className="list-summary-stats">
              <span>草加市長選（定数1 / 候補3名）</span>
              <span className="view-mode-hint">公報タップで即全画面拡大</span>
            </div>
            <div className="mayor-grid">
              {filteredMayor.map(c => (
                <div 
                  key={c.id} 
                  className="mayor-card"
                >
                  <div className="mayor-card-header">
                    <span className="row-id-badge">届出 {c.id}</span>
                    <span className={`cud-badge ${c.status === '現' ? 'gen' : c.status === '元' ? 'moto' : 'shin'}`}>
                      {c.status === '現' ? '現職' : c.status === '元' ? '元職' : '新人'}
                    </span>
                  </div>
                  <div className="row-kana">{c.kana}</div>
                  <h2 className="mayor-name">{c.name}</h2>
                  <div className="mayor-meta-line">
                    {c.age}歳（{c.gender}）/ {c.party} / 前職: {c.job}
                  </div>

                  {/* 市長選公報（ページ内即時プレビュー & タップで即Lightbox起動） */}
                  {c.hasPoster && (
                    <div 
                      className="poster-grid-image-wrapper"
                      style={{ borderRadius: '8px', margin: '0.4rem 0', maxHeight: '180px' }}
                      onClick={() => setLightboxImg({ url: c.posterUrl, title: `${c.name} 候補（草加市長選）選挙公報` })}
                      title="タップして全画面拡大"
                    >
                      <img 
                        src={c.posterUrl} 
                        alt={`${c.name} 選挙公報`} 
                        className="poster-grid-image"
                        loading="lazy" 
                      />
                      <div className="poster-grid-zoom-pill">
                        <ZoomIn size={11} />
                        タップで全画面拡大
                      </div>
                    </div>
                  )}

                  <div className="mayor-card-footer">
                    {c.hasPoster && (
                      <button
                        type="button"
                        className="row-poster-btn"
                        onClick={() => setLightboxImg({ url: c.posterUrl, title: `${c.name} 候補（草加市長選）選挙公報` })}
                      >
                        <ZoomIn size={12} />
                        公報を全画面で拡大
                      </button>
                    )}
                    <button
                      type="button"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        fontSize: '0.82rem', 
                        color: 'var(--soka-primary)', 
                        fontWeight: 700, 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.2rem',
                        marginLeft: 'auto'
                      }}
                      onClick={() => setSelectedCandidate(c)}
                    >
                      <BookOpen size={13} />
                      <span>詳細</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 市議選（37名）公報グリッド ⇔ 1行コンパクトリスト切り替え */
          <div>
            <div className="list-summary-stats">
              <span>表示中: {filteredCouncil.length}名 / 定数 28</span>
              <span>{viewMode === 'poster' ? '公報タップで即全画面拡大' : '行タップで詳細展開'}</span>
            </div>

            {viewMode === 'poster' ? (
              /* 公報2列グリッド（即時閲覧） */
              <div className="poster-grid">
                {filteredCouncil.map(c => (
                  <div key={c.id} className="poster-grid-card">
                    <div className="poster-grid-header">
                      <span className="row-id-badge">{c.id}</span>
                      <span className={`cud-badge ${c.status === '現' ? 'gen' : 'shin'}`}>
                        {c.status === '現' ? '現' : '新'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: 'auto' }}>
                        {c.age}歳・{c.gender}
                      </span>
                    </div>

                    {/* 公報画像（タップで即Lightbox拡大） */}
                    <div 
                      className="poster-grid-image-wrapper"
                      onClick={() => setLightboxImg({ url: c.posterUrl, title: `${c.name} 候補（市議選・届出${c.id}）選挙公報` })}
                      title="タップして全画面拡大"
                    >
                      <img 
                        src={c.posterUrl} 
                        alt={`${c.name} 選挙公報`} 
                        className="poster-grid-image"
                        loading="lazy" 
                      />
                      <div className="poster-grid-zoom-pill">
                        <ZoomIn size={11} />
                        拡大
                      </div>
                    </div>

                    <div className="poster-grid-name-box">
                      <div className="row-kana">{c.kana}</div>
                      <h3 className="poster-grid-name">{c.name}</h3>
                      <div className="poster-grid-party">{c.party}</div>
                    </div>

                    <div className="poster-grid-footer">
                      <button 
                        type="button" 
                        className="poster-grid-detail-btn"
                        onClick={() => setSelectedCandidate(c)}
                      >
                        <BookOpen size={12} />
                        <span>詳細</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* 1行コンパクトリスト（公報ダイレクトボタン付き） */
              <div className="compact-list">
                {filteredCouncil.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className="candidate-row-btn"
                    onClick={() => setSelectedCandidate(c)}
                  >
                    <div className="row-left-group">
                      <span className="row-id-badge">{c.id}</span>
                      <span className={`cud-badge ${c.status === '現' ? 'gen' : 'shin'}`}>
                        {c.status === '現' ? '現' : '新'}
                      </span>
                      <div className="row-name-box">
                        <span className="row-kana">{c.kana}</span>
                        <span className="row-name">{c.name}</span>
                      </div>
                    </div>

                    <div className="row-right-group">
                      <div className="row-meta-info">
                        <span className="row-party">{c.party}</span>
                        <span className="row-sub-meta">{c.age}歳・{c.gender}</span>
                      </div>
                      {c.hasPoster && (
                        <button
                          type="button"
                          className="row-poster-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImg({ url: c.posterUrl, title: `${c.name} 候補（市議選・届出${c.id}）選挙公報` });
                          }}
                          title="選挙公報を全画面拡大"
                        >
                          <FileText size={12} />
                          公報
                        </button>
                      )}
                      <ChevronRight size={16} className="row-chevron" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {filteredCouncil.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                条件に一致する候補者が見つかりませんでした。
              </div>
            )}
          </div>
        )}
      </div>

      {/* ====================================================================
          【案1】全画面フルスクリーン詳細モーダル (Detail Fullscreen Modal)
         ==================================================================== */}
      {selectedCandidate && (
        <div className="detail-modal-overlay">
          {/* 上部固定ナビゲーションバー */}
          <div className="detail-modal-top-bar">
            <button 
              type="button"
              className="detail-modal-back-btn"
              onClick={() => setSelectedCandidate(null)}
            >
              <ChevronLeft size={20} />
              <span>一覧に戻る</span>
            </button>

            <span className="detail-modal-top-title">
              届出 {selectedCandidate.id} {selectedCandidate.name}
            </span>

            <button 
              type="button"
              className="detail-modal-close-icon"
              onClick={() => setSelectedCandidate(null)}
              title="閉じる"
            >
              <X size={18} />
            </button>
          </div>

          {/* スクロール領域（底面にゆとりを持った余白） */}
          <div className="detail-modal-body">
            {/* 候補者ヘッダーカード */}
            <div className="detail-profile-hero">
              <div className="detail-profile-badges">
                <span className="row-id-badge">届出 {selectedCandidate.id}</span>
                <span className={`cud-badge ${
                  selectedCandidate.status === '現' ? 'gen' : selectedCandidate.status === '元' ? 'moto' : 'shin'
                }`}>
                  {selectedCandidate.status === '現' ? '現職' : selectedCandidate.status === '元' ? '元職' : '新人'}
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--soka-primary)', marginLeft: 'auto' }}>
                  {selectedCandidate.party}
                </span>
              </div>
              <div className="row-kana">{selectedCandidate.kana}</div>
              <h2 className="detail-profile-name">{selectedCandidate.name}</h2>

              {/* 基本情報テーブル */}
              <table className="detail-meta-table">
                <tbody>
                  <tr>
                    <td className="detail-meta-label">年齢・性</td>
                    <td className="detail-meta-val">{selectedCandidate.age}歳（{selectedCandidate.gender}）</td>
                  </tr>
                  <tr>
                    <td className="detail-meta-label">職業</td>
                    <td className="detail-meta-val">{selectedCandidate.job}</td>
                  </tr>
                  <tr>
                    <td className="detail-meta-label">住所</td>
                    <td className="detail-meta-val">{selectedCandidate.address}</td>
                  </tr>
                  {selectedCandidate.note && (
                    <tr>
                      <td className="detail-meta-label">備考</td>
                      <td className="detail-meta-val">{selectedCandidate.note}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* 公式Web / SNS */}
              {selectedCandidate.website && (
                <a 
                  href={selectedCandidate.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="archive-jump-btn"
                  style={{ background: '#f8fafc', color: '#2563eb', border: '1px solid #cbd5e1', marginTop: '0.5rem' }}
                >
                  <ExternalLink size={14} />
                  <span>公式Webサイト・SNSを開く</span>
                </a>
              )}
            </div>

            {/* 現職の議会実績サマリー & アーカイブリンク */}
            {selectedCandidate.existingCouncilorName && (() => {
              const norm = selectedCandidate.name.replace(/\s+/g, '');
              const councilorObj = councilorMap.get(norm);
              if (!councilorObj) return null;
              return (
                <div className="council-activity-box">
                  <div className="activity-title">
                    <BookOpen size={14} />
                    市議会での一般質問実績
                  </div>
                  <div className="activity-stat-text">
                    今期 {councilorObj.currentTermCount}回 ／ 累計 {councilorObj.totalCount}回
                  </div>
                  <button 
                    type="button"
                    className="archive-jump-btn"
                    onClick={() => navigate(`/councilor/${encodeURIComponent(councilorObj.councilor)}`)}
                  >
                    <span>過去の質問内容・公報アーカイブを見る</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              );
            })()}

            {/* 選挙公報セクション */}
            <div className="poster-preview-section">
              <div className="poster-section-header">
                <span className="poster-section-title">📄 令和8年 選挙公報</span>
                <span className="poster-zoom-hint">タップで拡大・ズーム</span>
              </div>
              {selectedCandidate.hasPoster ? (
                <div 
                  className="poster-thumbnail-wrapper"
                  onClick={() => setLightboxImg({
                    url: selectedCandidate.posterUrl,
                    title: `選挙公報: ${selectedCandidate.name}`
                  })}
                  title="タップして全画面拡大"
                >
                  <img 
                    src={selectedCandidate.posterUrl} 
                    alt={`選挙公報: ${selectedCandidate.name}`} 
                    className="poster-thumbnail-img"
                    loading="lazy" 
                  />
                  <div className="poster-overlay-tap-label">
                    <ZoomIn size={13} />
                    <span>拡大表示</span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '1.5rem', background: '#f1f5f9', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
                  公報画像は準備中です
                </div>
              )}
            </div>

            {/* 最下部の閉じるボタン */}
            <button
              type="button"
              className="detail-bottom-close-btn"
              onClick={() => setSelectedCandidate(null)}
            >
              <X size={16} />
              <span>一覧に戻る</span>
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          ピンチズーム対応 公報Lightbox (全画面モーダル)
         ==================================================================== */}
      {lightboxImg && (
        <div 
          className="lightbox-modal"
          onTouchStart={handleLightboxTouchStart}
          onTouchMove={handleLightboxTouchMove}
          onTouchEnd={handleLightboxTouchEnd}
        >
          {/* 上部バー */}
          <div className="lightbox-top-bar">
            <h3 className="lightbox-title">{lightboxImg.title}</h3>
            <div className="lightbox-actions">
              {zoomScale > 1 && (
                <button 
                  className="lightbox-btn"
                  onClick={() => { setZoomScale(1); setPanPos({ x: 0, y: 0 }); }}
                >
                  <RotateCcw size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  等倍
                </button>
              )}
              <button 
                className="lightbox-close-icon"
                onClick={() => { setLightboxImg(null); setZoomScale(1); setPanPos({ x: 0, y: 0 }); }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* ビューポート */}
          <div className="lightbox-viewport">
            <img 
              src={lightboxImg.url} 
              alt={lightboxImg.title}
              className="lightbox-img"
              style={{
                transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomScale})`,
                cursor: zoomScale > 1 ? 'grab' : 'zoom-in'
              }}
            />
          </div>

          <div className="lightbox-footer-help">
            ※2本指でピンチイン/アウト、またはダブルタップで拡大・縮小できます
          </div>
        </div>
      )}
    </div>
  );
}
