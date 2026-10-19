import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  ArrowLeft, 
  Users, 
  Calendar, 
  Award, 
  Info, 
  Building2, 
  CheckCircle2, 
  UserCheck, 
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { 
  ELECTED_COUNCILORS, 
  FACTION_STATS, 
  PARTY_STATS, 
  GENDER_COMPARISON, 
  AGE_DISTRIBUTION, 
  BASIC_ANALYTICS_METRICS
} from '../data/electionAnalyticsData';
import './ElectionAnalytics.css';

export default function ElectionAnalytics() {
  const navigate = useNavigate();

  // ページタイトル設定
  useEffect(() => {
    document.title = '草加市議会 選挙結果データ分析（新旧比較・構成変化） | 2026年草加市選挙';
  }, []);

  // テーブルソート状態
  const [sortBy, setSortBy] = useState<'rank' | 'age_asc' | 'age_desc' | 'term_desc'>('rank');
  // テーブルフィルター状態
  const [genderFilter, setGenderFilter] = useState<'all' | '女' | '男'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | '新人当選' | '現職再選'>('all');
  const [partyFilter, setPartyFilter] = useState<string>('all');
  const [factionFilter, setFactionFilter] = useState<string>('all');

  // 政党リスト（当選者内）
  const partyList = useMemo(() => {
    const set = new Set<string>();
    ELECTED_COUNCILORS.forEach(c => set.add(c.party));
    return Array.from(set);
  }, []);

  // 改選前所属会派リスト
  const factionList = useMemo(() => {
    const set = new Set<string>();
    ELECTED_COUNCILORS.forEach(c => set.add(c.prevFaction));
    return Array.from(set);
  }, []);

  // テーブルデータのソート & フィルタリング
  const filteredCouncilors = useMemo(() => {
    let list = [...ELECTED_COUNCILORS];

    if (genderFilter !== 'all') {
      list = list.filter(c => c.gender === genderFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter(c => c.status === statusFilter);
    }
    if (partyFilter !== 'all') {
      list = list.filter(c => c.party === partyFilter);
    }
    if (factionFilter !== 'all') {
      list = list.filter(c => c.prevFaction === factionFilter);
    }

    if (sortBy === 'rank') {
      list.sort((a, b) => a.rank - b.rank);
    } else if (sortBy === 'age_asc') {
      list.sort((a, b) => a.age - b.age);
    } else if (sortBy === 'age_desc') {
      list.sort((a, b) => b.age - a.age);
    } else if (sortBy === 'term_desc') {
      list.sort((a, b) => b.termCount - a.termCount || a.rank - b.rank);
    }

    return list;
  }, [genderFilter, statusFilter, partyFilter, factionFilter, sortBy]);

  return (
    <div className="analytics-page">
      {/* ====================================================================
          固定ヘッダー
         ==================================================================== */}
      <header className="analytics-header">
        <div className="analytics-header-top">
          <button 
            type="button" 
            className="analytics-back-btn"
            onClick={() => navigate('/election?tab=council')}
          >
            <ArrowLeft size={18} />
            <span>選挙結果一覧に戻る</span>
          </button>
          <span className="analytics-badge">
            <CheckCircle2 size={13} style={{ marginRight: 3 }} />
            2026年10月19日 確定データ
          </span>
        </div>

        <h1 className="analytics-title">
          <BarChart3 size={22} color="var(--soka-primary)" />
          草加市議会 選挙結果データ分析
        </h1>
        <p className="analytics-subtitle">
          2026年（令和8年）一般選挙結果に基づく議会構成・属性の客観的比較データ
        </p>

        {/* ナビゲーションタブ（選挙一覧との行き来） */}
        <div className="analytics-nav-tabs">
          <button 
            type="button" 
            className="nav-tab-btn"
            onClick={() => navigate('/election?tab=council')}
          >
            市議選結果（37名）
          </button>
          <button 
            type="button" 
            className="nav-tab-btn"
            onClick={() => navigate('/election?tab=mayor')}
          >
            市長選結果（3名）
          </button>
          <button 
            type="button" 
            className="nav-tab-btn active"
          >
            📊 選挙結果データ分析
          </button>
        </div>
      </header>

      {/* ====================================================================
          【PM要件2】会派と党派の厳密な区別の注記（目立つ配置）
         ==================================================================== */}
      <div className="analytics-disclaimer-box">
        <Info size={18} className="disclaimer-icon" />
        <div className="disclaimer-content">
          <strong>会派と政党（党派）の定義について:</strong>
          <p>
            本データは<strong>「立候補時の政党（党派）」</strong>および<strong>「改選前の所属会派」</strong>に基づいています。新議会における正式な会派構成は、初議会招集後に各議員の届出によって決定されます。
          </p>
        </div>
      </div>

      {/* ====================================================================
          セクション1: インフォグラフィック・ハイライトカード
         ==================================================================== */}
      <section className="analytics-section">
        <h2 className="section-title">
          <Award size={18} />
          基本指標サマリー（ファクトデータ）
        </h2>

        <div className="metrics-grid">
          {/* 女性議員比率 */}
          <div className="metric-card">
            <div className="metric-label">女性議員比率</div>
            <div className="metric-value-row">
              <span className="metric-main-val">{GENDER_COMPARISON.current.femaleRatio}</span>
              <span className="metric-diff-badge diff-positive">
                +{GENDER_COMPARISON.diff.femaleDiffRatio}（{GENDER_COMPARISON.diff.femaleDiffCount}）
              </span>
            </div>
            <div className="metric-sub-text">
              改選前 {GENDER_COMPARISON.previous.female}名（{GENDER_COMPARISON.previous.femaleRatio}） → 新議会 {GENDER_COMPARISON.current.female}名（{GENDER_COMPARISON.current.femaleRatio}）
            </div>
          </div>

          {/* 平均年齢 */}
          <div className="metric-card">
            <div className="metric-label">新議会（28名）の平均年齢</div>
            <div className="metric-value-row">
              <span className="metric-main-val">{BASIC_ANALYTICS_METRICS.averageAge}</span>
              <span className="metric-age-range">30歳 〜 88歳</span>
            </div>
            <div className="metric-sub-text">
              最年少: 30歳（現職・ひらやま氏） / 最長老: 88歳（吉沢氏・14期目）
            </div>
          </div>

          {/* 【PM要件3】議員の入れ替わり（構成変化） */}
          <div className="metric-card">
            <div className="metric-label">現新の内訳（構成変化）</div>
            <div className="metric-value-row">
              <span className="metric-main-val">新人 {BASIC_ANALYTICS_METRICS.newElectedCount}名</span>
              <span className="metric-sub-val">現職再選 {BASIC_ANALYTICS_METRICS.reElectedCount}名</span>
            </div>
            <div className="metric-sub-text">
              改選前現職27名の内訳: 再選 21名 / 落選 2名 / 勇退不出馬 4名
            </div>
          </div>

          {/* 得票上位の特徴 */}
          <div className="metric-card">
            <div className="metric-label">得票数 上位2名</div>
            <div className="metric-value-row">
              <span className="metric-main-val" style={{ fontSize: '1.25rem' }}>女性新人が獲得</span>
            </div>
            <div className="metric-sub-text">
              第1位: かわぐち みほ（5,469票） / 第2位: 中村 りか（4,905票）
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          セクション2: 改選前 所属会派別の当落状況
         ==================================================================== */}
      <section className="analytics-section">
        <h2 className="section-title">
          <Building2 size={18} />
          改選前 所属会派別の当落状況（定数28に対する動向）
        </h2>
        <p className="section-lead">
          改選前の各会派に所属していた現職議員（計27名）の選挙結果内訳です。
        </p>

        <div className="faction-cards-grid">
          {FACTION_STATS.map(f => (
            <div key={f.name} className="faction-card">
              <div className="faction-card-header">
                <span className="faction-name">{f.name}</span>
                <span className="faction-total-badge">改選前 {f.prevCount}名</span>
              </div>

              <div className="faction-stats-row">
                <div className="faction-stat-item stat-re-elected">
                  <span className="stat-label">再選</span>
                  <span className="stat-num">{f.reElectedCount}名</span>
                </div>
                <div className="faction-stat-item stat-fallen">
                  <span className="stat-label">落選</span>
                  <span className="stat-num">{f.fallenCount}名</span>
                </div>
                <div className="faction-stat-item stat-retired">
                  <span className="stat-label">勇退・不出馬</span>
                  <span className="stat-num">{f.retiredCount}名</span>
                </div>
              </div>

              {/* 議員名リスト */}
              <div className="faction-members-detail">
                {f.reElectedMembers.length > 0 && (
                  <div className="member-sub-group">
                    <span className="member-group-label label-re-elected">再選:</span>
                    <span className="member-names">{f.reElectedMembers.join('、')}</span>
                  </div>
                )}
                {f.fallenMembers.length > 0 && (
                  <div className="member-sub-group">
                    <span className="member-group-label label-fallen">落選:</span>
                    <span className="member-names">{f.fallenMembers.join('、')}</span>
                  </div>
                )}
                {f.retiredMembers.length > 0 && (
                  <div className="member-sub-group">
                    <span className="member-group-label label-retired">勇退:</span>
                    <span className="member-names">{f.retiredMembers.join('、')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================================
          セクション3: 立候補時 政党（党派）別の獲得議席
         ==================================================================== */}
      <section className="analytics-section">
        <h2 className="section-title">
          <Users size={18} />
          立候補時 政党（党派）別の獲得議席
        </h2>
        <p className="section-lead">
          届出時の政党公認・推薦別における立候補者数と当選者数の一覧です。
        </p>

        <div className="party-table-wrapper">
          <table className="analytics-data-table">
            <thead>
              <tr>
                <th>政党（党派）</th>
                <th>獲得議席数</th>
                <th>立候補者数</th>
                <th>当選率</th>
                <th>当選者の現新内訳</th>
              </tr>
            </thead>
            <tbody>
              {PARTY_STATS.map(p => (
                <tr key={p.party}>
                  <td className="party-name-cell">
                    <strong>{p.party}</strong>
                  </td>
                  <td className="elected-num-cell">
                    <span className="elected-pill">{p.electedCount} 議席</span>
                  </td>
                  <td>{p.candidatesCount} 名</td>
                  <td>{p.electedRatio}</td>
                  <td className="breakdown-cell">{p.breakdown}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ====================================================================
          セクション4: 【PM要件4】男女比・年代別分布（CUD配慮配色）
         ==================================================================== */}
      <section className="analytics-section">
        <h2 className="section-title">
          <Calendar size={18} />
          男女比および年代別分布（CUD配慮）
        </h2>
        <p className="section-lead">
          色覚の多様性に配慮し、高明度差とテキストの直接配置による視覚化を行っています。
        </p>

        <div className="demographics-grid">
          {/* 男女比比較 */}
          <div className="demo-box">
            <h3 className="demo-box-title">男女比の比較（改選前 vs 新議会）</h3>
            
            <div className="gender-bar-wrapper">
              <div className="gender-bar-label-line">
                <span>新議会（28名）</span>
                <span>女性比率 25.0%</span>
              </div>
              <div className="cud-stacked-bar">
                <div 
                  className="bar-segment cud-female" 
                  style={{ width: GENDER_COMPARISON.current.femaleRatio }}
                >
                  女性 25.0%（7名）
                </div>
                <div 
                  className="bar-segment cud-male" 
                  style={{ width: GENDER_COMPARISON.current.maleRatio }}
                >
                  男性 75.0%（21名）
                </div>
              </div>
            </div>

            <div className="gender-bar-wrapper" style={{ marginTop: '1rem' }}>
              <div className="gender-bar-label-line">
                <span>改選前（27名）</span>
                <span>女性比率 18.5%</span>
              </div>
              <div className="cud-stacked-bar">
                <div 
                  className="bar-segment cud-female" 
                  style={{ width: GENDER_COMPARISON.previous.femaleRatio }}
                >
                  女性 18.5%（5名）
                </div>
                <div 
                  className="bar-segment cud-male" 
                  style={{ width: GENDER_COMPARISON.previous.maleRatio }}
                >
                  男性 81.5%（22名）
                </div>
              </div>
            </div>

            <div className="cud-legend">
              <span className="legend-item">
                <span className="legend-color-box cud-female" />
                女性（高明度オレンジ #ea580c）
              </span>
              <span className="legend-item">
                <span className="legend-color-box cud-male" />
                男性（濃色ネイビー #1e3a8a）
              </span>
            </div>
          </div>

          {/* 年代別分布 */}
          <div className="demo-box">
            <h3 className="demo-box-title">新議会（28名）の年代別分布</h3>
            <div className="age-bars-container">
              {AGE_DISTRIBUTION.map(item => (
                <div key={item.group} className="age-row">
                  <div className="age-label-cell">
                    <span className="age-group-name">{item.group}</span>
                    <span className="age-count-tag">{item.count}名（{item.ratio}）</span>
                  </div>
                  <div className="age-bar-track">
                    <div 
                      className="age-bar-fill" 
                      style={{ width: `${(item.count / 10) * 100}%` }}
                    />
                  </div>
                  <div className="age-note-text">{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          セクション5: 新議会28名 データテーブル（ソート＆フィルター対応）
         ==================================================================== */}
      <section className="analytics-section">
        <h2 className="section-title">
          <UserCheck size={18} />
          新議会 当選議員28名 データ一覧
        </h2>
        <p className="section-lead">
          得票順位、期数、改選前所属会派、立候補時政党の客観的一覧テーブルです。
        </p>

        {/* フィルター＆ソート コントロール */}
        <div className="table-controls-bar">
          <div className="control-group">
            <span className="control-label">
              <Filter size={13} /> 絞り込み:
            </span>
            <select 
              className="control-select"
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value as any)}
            >
              <option value="all">性別: すべて</option>
              <option value="女">女性のみ (7名)</option>
              <option value="男">男性のみ (21名)</option>
            </select>

            <select 
              className="control-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
            >
              <option value="all">現新: すべて</option>
              <option value="新人当選">新人当選のみ (7名)</option>
              <option value="現職再選">現職再選のみ (21名)</option>
            </select>

            <select 
              className="control-select"
              value={partyFilter}
              onChange={e => setPartyFilter(e.target.value)}
            >
              <option value="all">政党: すべて</option>
              {partyList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select 
              className="control-select"
              value={factionFilter}
              onChange={e => setFactionFilter(e.target.value)}
            >
              <option value="all">改選前会派: すべて</option>
              {factionList.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="control-group" style={{ marginLeft: 'auto' }}>
            <span className="control-label">
              <ArrowUpDown size={13} /> 並び替え:
            </span>
            <select 
              className="control-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
            >
              <option value="rank">得票順（1位〜28位）</option>
              <option value="term_desc">通算期数が多い順</option>
              <option value="age_asc">年齢が若い順</option>
              <option value="age_desc">年齢が高い順</option>
            </select>
          </div>
        </div>

        {/* 該当件数 */}
        <div className="table-summary-line">
          表示中: <strong>{filteredCouncilors.length}名</strong> / 28名
        </div>

        {/* データテーブル */}
        <div className="councilors-table-wrapper">
          <table className="analytics-data-table full-table">
            <thead>
              <tr>
                <th style={{ width: '48px', textAlign: 'center' }}>順位</th>
                <th>氏名（ふりがな）</th>
                <th style={{ textAlign: 'center' }}>性別</th>
                <th style={{ textAlign: 'center' }}>年齢</th>
                <th>立候補時 政党（党派）</th>
                <th>改選前 所属会派</th>
                <th style={{ textAlign: 'center' }}>現新</th>
                <th style={{ textAlign: 'center' }}>通算期数</th>
                <th style={{ textAlign: 'right' }}>得票数</th>
              </tr>
            </thead>
            <tbody>
              {filteredCouncilors.map(c => (
                <tr key={c.rank} className={c.gender === '女' ? 'row-highlight-female' : ''}>
                  <td style={{ textAlign: 'center', fontWeight: 800 }}>
                    {c.rank}位
                  </td>
                  <td>
                    <div className="table-name-box">
                      <span className="table-kana">{c.kana}</span>
                      <strong className="table-name">{c.name}</strong>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`gender-tag ${c.gender === '女' ? 'tag-female' : 'tag-male'}`}>
                      {c.gender}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{c.age}歳</td>
                  <td>{c.party}</td>
                  <td className="prev-faction-cell">{c.prevFaction}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`status-tag ${c.status === '新人当選' ? 'tag-new' : 'tag-incumbent'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                    {c.termCount}期
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800 }}>
                    {c.votes} 票
                    {c.hasFraction && <span className="table-fraction-tag">※按分</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
