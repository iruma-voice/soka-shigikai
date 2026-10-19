import React, { useState, useMemo, useRef, useEffect, type TouchEvent } from 'react';
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
  List,
  Award,
  AlertCircle,
  TrendingUp,
  Info,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import electionData from '../data/election2026.json';
import councilorData from '../data.json';
import type { Councilor } from '../types';
import './Election2026.css';

interface CandidateResult {
  isElected: boolean;
  rank: number;
  votes: number;
  votesDisplay: string;
  voteShare: string;
  hasFraction: boolean;
  fractionNote: string | null;
}

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
  result?: CandidateResult;
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

  // 検索・並び替え・フィルター状態（★デフォルトは「開票結果 得票順」）
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'votes_desc' | 'id' | 'age_asc' | 'age_desc' | 'name' | 'questions'>('votes_desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'elected' | 'fallen' | '現' | '新'>('all');
  const [partyFilter, setPartyFilter] = useState<string>('all');

  // 詳細モーダル状態
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null);

  // 按分票ツールチップ表示候補者ID
  const [fractionTooltipId, setFractionTooltipId] = useState<number | null>(null);

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

    if (statusFilter === 'elected') {
      list = list.filter(c => c.result?.isElected === true);
    } else if (statusFilter === 'fallen') {
      list = list.filter(c => c.result?.isElected === false);
    } else if (statusFilter === '現' || statusFilter === '新') {
      list = list.filter(c => c.status === statusFilter);
    }

    if (partyFilter !== 'all') {
      list = list.filter(c => c.party === partyFilter);
    }

    // ソート処理（デフォルト: 得票順）
    if (sortBy === 'votes_desc') {
      list.sort((a, b) => (a.result?.rank || 999) - (b.result?.rank || 999));
    } else if (sortBy === 'id') {
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

  // 市長選候補者（検索適用 & 得票順）
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
    // 得票順に並べる
    list.sort((a, b) => (a.result?.rank || 999) - (b.result?.rank || 999));
    return list;
  }, [mayor.candidates, searchQuery]);

  // 政党リスト（市議選用）
  const partyList = useMemo(() => {
    const set = new Set<string>();
    (council.candidates as CandidateItem[]).forEach(c => set.add(c.party));
    return Array.from(set);
  }, [council.candidates]);

  // 党派別議席数集計（当選者28名）
  const partySeatsSummary = useMemo(() => {
    const summary: Record<string, { elected: number; total: number }> = {};
    (council.candidates as CandidateItem[]).forEach(c => {
      if (!summary[c.party]) {
        summary[c.party] = { elected: 0, total: 0 };
      }
      summary[c.party].total += 1;
      if (c.result?.isElected) {
        summary[c.party].elected += 1;
      }
    });
    // 当選議席数順にソート
    return Object.entries(summary).sort((a, b) => b[1].elected - a[1].elected || b[1].total - a[1].total);
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

  // ページタイトル設定
  useEffect(() => {
    document.title = '2026年 草加市選挙 開票結果・当選者一覧 | 新旧議会データ分析';
  }, []);

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

  // 当選ラインディバイダーを表示すべきかどうかの判定関数
  // 条件: ソートが「得票順（votes_desc）」で、ステータスフィルターが全候補者（all）で、検索クエリがない場合
  const shouldShowDivider = sortBy === 'votes_desc' && statusFilter === 'all' && !searchQuery.trim() && partyFilter === 'all';

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
          <span className="election-confirmed-pill">
            <CheckCircle2 size={13} style={{ marginRight: 3 }} />
            開票結果 確定
          </span>
        </div>

        {/* タブ切り替え */}
        <div className="tab-controls">
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'council' ? 'active' : ''}`}
            onClick={() => { setActiveTab('council'); setSearchQuery(''); }}
          >
            <span>市議選 ({council.candidatesCount}名)</span>
          </button>
          <button 
            type="button"
            className={`tab-btn ${activeTab === 'mayor' ? 'active' : ''}`}
            onClick={() => { setActiveTab('mayor'); setSearchQuery(''); }}
          >
            <span>市長選 ({mayor.candidatesCount}名)</span>
          </button>
          <button 
            type="button"
            className="tab-btn tab-btn-analytics"
            onClick={() => navigate('/election/analytics')}
          >
            <BarChart3 size={14} />
            <span>📊 データ分析</span>
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
              公報カード
            </button>
            <button 
              type="button"
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={13} />
              得票順リスト
            </button>
          </div>
          <span className="view-mode-hint">
            {viewMode === 'poster' ? '公報タップで即全画面拡大' : '全候補者の当落・得票数一覧'}
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
              className="sort-select-field sort-highlight"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
            >
              <option value="votes_desc">🏆 開票結果（得票順）</option>
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
              すべて (37)
            </button>
            <button 
              type="button"
              className={`chip chip-elected ${statusFilter === 'elected' ? 'active' : ''}`}
              onClick={() => setStatusFilter('elected')}
            >
              ㊗️ 当選者のみ (28)
            </button>
            <button 
              type="button"
              className={`chip ${statusFilter === 'fallen' ? 'active' : ''}`}
              onClick={() => setStatusFilter('fallen')}
            >
              落選 (9)
            </button>
            <span style={{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
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
          開票速報・結果 サマリーバナー
         ==================================================================== */}
      <div className="election-summary-card">
        <div className="summary-card-header">
          <div className="summary-status-badge">
            <Award size={16} />
            <span>開票確定（10月19日 午前2:10 確定）</span>
          </div>
          <span className="summary-turnout-tag">
            <TrendingUp size={14} style={{ marginRight: 3 }} />
            投票率 <strong>43.03%</strong>（前回比 +2.33pt）
          </span>
        </div>
        <div className="summary-meta-grid">
          <div className="summary-meta-item">
            <span className="summary-meta-label">当日有権者数</span>
            <span className="summary-meta-val">206,709人</span>
          </div>
          <div className="summary-meta-item">
            <span className="summary-meta-label">投票者数</span>
            <span className="summary-meta-val">88,944人</span>
          </div>
          <div className="summary-meta-item">
            <span className="summary-meta-label">市議選 定数 / 候補</span>
            <span className="summary-meta-val">28議席 / 37名（9名落選）</span>
          </div>
          <div className="summary-meta-item">
            <span className="summary-meta-label">市長選 定数 / 候補</span>
            <span className="summary-meta-val">1議席 / 3名（山川ゆりこ氏 再選）</span>
          </div>
        </div>

        {/* 市議選タブ表示時のみ: 党派別議席数サマリー */}
        {activeTab === 'council' && (
          <div className="party-seats-container">
            <div className="party-seats-title">
              <span>🏛️ 新議会 党派別獲得議席（定数28）</span>
              <span className="party-seats-note">※当選者数 / 立候補者数</span>
            </div>
            <div className="party-seats-badges">
              {partySeatsSummary.map(([party, stat]) => (
                <div 
                  key={party} 
                  className={`party-seat-badge ${stat.elected > 0 ? 'has-seats' : 'zero-seats'}`}
                >
                  <span className="party-name">{party}</span>
                  <span className="party-count">
                    <strong>{stat.elected}</strong>
                    <small>/{stat.total}</small>
                  </span>
                </div>
              ))}
            </div>

            {/* データ分析画面へのジャンプバナー */}
            <button 
              type="button" 
              className="analytics-jump-banner"
              onClick={() => navigate('/election/analytics')}
            >
              <BarChart3 size={15} />
              <span>【新旧比較】改選前所属会派の当落・男女比・年齢変化のデータ分析を見る</span>
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ====================================================================
          コンテンツエリア
         ==================================================================== */}
      <div className="content-area">
        {activeTab === 'mayor' ? (
          /* 市長選（3名）開票結果ブロック */
          <div>
            <div className="list-summary-stats">
              <span>草加市長選 開票確定結果（定数1 / 候補3名）</span>
              <span className="view-mode-hint">公報タップで即全画面拡大</span>
            </div>
            <div className="mayor-grid">
              {filteredMayor.map(c => {
                const isElected = c.result?.isElected;
                return (
                  <div 
                    key={c.id} 
                    className={`mayor-card ${isElected ? 'candidate-card-elected' : 'candidate-card-fallen'}`}
                  >
                    <div className="mayor-card-header">
                      {isElected ? (
                        <span className="elected-crown-badge">
                          <Award size={15} />
                          ㊗️ 当選（草加市長）
                        </span>
                      ) : (
                        <span className="fallen-badge">
                          落選（第{c.result?.rank}位）
                        </span>
                      )}
                      <span className="row-id-badge" style={{ marginLeft: 'auto' }}>届出 {c.id}</span>
                      <span className={`cud-badge ${c.status === '現' ? 'gen' : c.status === '元' ? 'moto' : 'shin'}`}>
                        {c.status === '現' ? '現職' : c.status === '元' ? '元職' : '新人'}
                      </span>
                    </div>

                    {/* 得票数ハイライトボックス */}
                    <div className={`votes-highlight-box ${isElected ? 'votes-box-elected' : 'votes-box-fallen'}`}>
                      <div className="votes-number-row">
                        <span className="votes-label">得票数:</span>
                        <span className="votes-value">{c.result?.votesDisplay}</span>
                        <span className="votes-unit">票</span>
                        <span className="votes-share-pill">得票率 {c.result?.voteShare}</span>
                      </div>
                      {/* 得票率プログレスバー */}
                      <div className="vote-share-bar-bg">
                        <div 
                          className={`vote-share-bar-fill ${isElected ? 'bar-elected' : 'bar-fallen'}`}
                          style={{ width: c.result?.voteShare }}
                        />
                      </div>
                    </div>

                    <div className="row-kana">{c.kana}</div>
                    <h2 className="mayor-name">{c.name}</h2>
                    <div className="mayor-meta-line">
                      {c.age}歳（{c.gender}）/ {c.party} / 経歴: {c.job}
                    </div>

                    {/* 市長選公報 */}
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
                          公報拡大
                        </button>
                      )}
                      <button
                        type="button"
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          fontSize: '0.82rem', 
                          color: isElected ? '#92400e' : '#475569', 
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
                );
              })}
            </div>
          </div>
        ) : (
          /* 市議選（37名）公報グリッド ⇔ 1行コンパクトリスト切り替え */
          <div>
            <div className="list-summary-stats">
              <span>
                表示中: <strong>{filteredCouncil.length}名</strong> / 定数 28 
                {statusFilter === 'all' && '（上位28名が当選）'}
              </span>
              <span>{viewMode === 'poster' ? '公報タップで即全画面拡大' : '行タップで詳細展開'}</span>
            </div>

            {viewMode === 'poster' ? (
              /* 公報2列グリッド（即時閲覧） */
              <div className="poster-grid">
                {filteredCouncil.map(c => {
                  const isElected = c.result?.isElected;
                  // 当選ラインディバイダーの挿入判定
                  const showBorderAfterThis = shouldShowDivider && c.result?.rank === 28;

                  return (
                    <React.Fragment key={c.id}>
                      <div className={`poster-grid-card ${isElected ? 'candidate-card-elected' : 'candidate-card-fallen'}`}>
                        {/* 当落バッジ ＆ 届出ID */}
                        <div className="poster-grid-header">
                          {isElected ? (
                            <span className="elected-badge-compact">
                              <Award size={12} />
                              ㊗️ 当選 {c.result?.rank}位
                            </span>
                          ) : (
                            <span className="fallen-badge-compact">
                              落選 {c.result?.rank}位
                            </span>
                          )}
                          <span className="row-id-badge">届出 {c.id}</span>
                          <span className={`cud-badge ${c.status === '現' ? 'gen' : 'shin'}`}>
                            {c.status === '現' ? '現' : '新'}
                          </span>
                        </div>

                        {/* 得票数バナー */}
                        <div className={`card-votes-strip ${isElected ? 'strip-elected' : 'strip-fallen'}`}>
                          <span className="strip-rank">{c.result?.rank}位</span>
                          <div className="strip-votes">
                            <strong>{c.result?.votesDisplay}</strong>
                            <small>票</small>
                            <span className="strip-share">({c.result?.voteShare})</span>
                          </div>
                          {c.result?.hasFraction && (
                            <span 
                              className="fraction-badge"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFractionTooltipId(fractionTooltipId === c.id ? null : c.id);
                              }}
                              title="按分票により小数点以下の票が発生しています"
                            >
                              ※按分
                            </span>
                          )}
                        </div>

                        {/* 按分票のインラインツールチップ */}
                        {fractionTooltipId === c.id && c.result?.hasFraction && (
                          <div className="fraction-tooltip-box">
                            <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span>※按分票（同姓・同名の候補者への按分計算）により小数点の票が発生しています</span>
                          </div>
                        )}

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
                          <div className="poster-grid-party">
                            {c.party} / {c.age}歳・{c.gender}
                          </div>
                        </div>

                        <div className="poster-grid-footer">
                          <button 
                            type="button" 
                            className="poster-grid-detail-btn"
                            onClick={() => setSelectedCandidate(c)}
                          >
                            <BookOpen size={12} />
                            <span>詳細・結果</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>

                      {/* ★要件2: 28位（最後の当選者）の直後に当選ラインディバイダーを挿入 */}
                      {showBorderAfterThis && (
                        <div className="election-line-divider grid-span-full">
                          <div className="divider-line" />
                          <div className="divider-pill">
                            <Award size={14} />
                            <span>ーーー 当選ライン（定数 28名） ーーー 次点・落選</span>
                          </div>
                          <div className="divider-line" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              /* 1行コンパクトリスト（得票順リストビュー） */
              <div className="compact-list">
                {filteredCouncil.map(c => {
                  const isElected = c.result?.isElected;
                  const showBorderAfterThis = shouldShowDivider && c.result?.rank === 28;

                  return (
                    <React.Fragment key={c.id}>
                      <button
                        type="button"
                        className={`candidate-row-btn ${isElected ? 'candidate-row-elected' : 'candidate-row-fallen'}`}
                        onClick={() => setSelectedCandidate(c)}
                      >
                        <div className="row-left-group">
                          {/* 順位 & 当落バッジ */}
                          <div className="row-rank-box">
                            <span className="row-rank-num">{c.result?.rank}位</span>
                            {isElected ? (
                              <span className="row-status-tag tag-elected">当選</span>
                            ) : (
                              <span className="row-status-tag tag-fallen">落選</span>
                            )}
                          </div>

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
                          {/* 得票数 */}
                          <div className="row-votes-cell">
                            <div className="row-votes-val-line">
                              <span className="row-votes-val">{c.result?.votesDisplay}</span>
                              <span className="row-votes-unit">票</span>
                            </div>
                            <div className="row-votes-sub">
                              <span>{c.result?.voteShare}</span>
                              {c.result?.hasFraction && (
                                <span 
                                  className="fraction-badge-small"
                                  title="按分票により小数点以下の票が発生しています"
                                >
                                  ※按分
                                </span>
                              )}
                            </div>
                          </div>

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

                      {/* ★要件2: 28位の直後に当選ラインディバイダーを挿入 */}
                      {showBorderAfterThis && (
                        <div className="election-line-divider">
                          <div className="divider-line" />
                          <div className="divider-pill">
                            <Award size={14} />
                            <span>ーーー 当選ライン（定数 28名） ーーー 次点・落選</span>
                          </div>
                          <div className="divider-line" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* 按分票についてのグローバル注釈 */}
            <div className="fraction-global-note">
              <AlertCircle size={15} className="fraction-note-icon" />
              <div>
                <strong>※按分票（あんぶんひょう）について:</strong>
                <p>
                  「佐藤」「たかし」など同姓または同名の候補者が複数立候補した場合、姓または名のみが書かれた投票用紙（曖昧票）は、各候補者の有効得票数に応じて比例配分（按分）されます。そのため、得票数に小数点以下の端数が生じます。
                </p>
              </div>
            </div>

            {filteredCouncil.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                条件に一致する候補者が見つかりませんでした。
              </div>
            )}
          </div>
        )}
      </div>

      {/* ====================================================================
          【詳細モーダル】選挙結果・開票データ反映
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
              {selectedCandidate.result?.isElected ? '㊗️ 当選' : '落選'} | 届出 {selectedCandidate.id} {selectedCandidate.name}
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

          {/* スクロール領域 */}
          <div className="detail-modal-body">
            {/* 候補者ヘッダーカード */}
            <div className={`detail-profile-hero ${selectedCandidate.result?.isElected ? 'hero-elected' : 'hero-fallen'}`}>
              <div className="detail-profile-badges">
                {selectedCandidate.result?.isElected ? (
                  <span className="modal-elected-badge">
                    <Award size={16} />
                    ㊗️ 当選（第 {selectedCandidate.result?.rank} 位）
                  </span>
                ) : (
                  <span className="modal-fallen-badge">
                    落選（第 {selectedCandidate.result?.rank} 位）
                  </span>
                )}
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

              {/* 開票結果ハイライトブロック */}
              <div className="modal-result-box">
                <div className="modal-result-title">開票確定結果</div>
                <div className="modal-result-main">
                  <div className="modal-result-votes">
                    <span className="modal-label">得票数</span>
                    <span className="modal-val">{selectedCandidate.result?.votesDisplay}</span>
                    <span className="modal-unit">票</span>
                  </div>
                  <div className="modal-result-rank">
                    <span className="modal-label">得票順位</span>
                    <span className="modal-val">{selectedCandidate.result?.rank}</span>
                    <span className="modal-unit">位</span>
                  </div>
                  <div className="modal-result-share">
                    <span className="modal-label">得票率</span>
                    <span className="modal-val">{selectedCandidate.result?.voteShare}</span>
                  </div>
                </div>
                {selectedCandidate.result?.hasFraction && (
                  <div className="modal-fraction-alert">
                    <Info size={14} style={{ flexShrink: 0 }} />
                    <span>{selectedCandidate.result?.fractionNote}</span>
                  </div>
                )}
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
