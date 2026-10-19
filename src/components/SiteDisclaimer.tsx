import React from 'react';
import { ShieldAlert, ExternalLink } from 'lucide-react';
import './SiteDisclaimer.css';

export const SiteDisclaimer: React.FC = () => {
  return (
    <footer className="site-disclaimer-wrapper">
      <div className="site-disclaimer-card">
        <div className="disclaimer-header">
          <ShieldAlert size={18} className="disclaimer-shield-icon" />
          <h3 className="disclaimer-heading">サイトに関する重要なお知らせ・免責事項</h3>
        </div>
        
        <p className="disclaimer-lead">
          本サイトは、草加市政および選挙に関心を持つ市民有志が、草加市選挙管理委員会および草加市議会が公表した一次資料（選挙公報、開票確定結果速報、議会公式記録等）に基づき独自に作成・運営している<strong>【非公式の民間データアーカイブ】</strong>です。
        </p>

        <ul className="disclaimer-points">
          <li><strong>非公式・独立性:</strong> 草加市役所、草加市選挙管理委員会、および特定の政党・政治団体・候補者とは一切関係ありません。</li>
          <li><strong>目的:</strong> 市民有志による公開情報の可視化・有権者の利便性向上を目的としており、選挙への不当な干渉や特定候補者への投票誘導を目的としたものではありません。</li>
          <li><strong>一次情報の確認:</strong> 正式な選挙結果および公報原文については、必ず草加市選挙管理委員会の公式発表をご確認ください。</li>
        </ul>

        <div className="disclaimer-official-links">
          <span className="links-label">公式情報リンク:</span>
          <a 
            href="https://www.city.soka.saitama.jp/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="official-external-link"
          >
            草加市公式サイト <ExternalLink size={12} />
          </a>
          <span className="link-divider">|</span>
          <a 
            href="https://www.city.soka.saitama.jp/shigikai/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="official-external-link"
          >
            草加市議会公式サイト <ExternalLink size={12} />
          </a>
        </div>

        <div className="disclaimer-copyright">
          © 2026 草加市政データ有志アーカイブ（非公式・民間プロジェクト）
        </div>
      </div>
    </footer>
  );
};

export default SiteDisclaimer;
