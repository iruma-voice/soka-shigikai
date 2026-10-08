import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Globe, X } from 'lucide-react';
import type { Councilor, QuestionItem } from '../types';
import councilorData from '../data.json';
import '../profile.css';
import './Posters.css'; // For modal styles

const typedData = councilorData as Councilor[];

export default function CouncilorDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const councilor = typedData.find(c => c.councilor === name);

  if (!councilor) {
    return (
      <div>
        <button className="back-button" onClick={() => navigate('/')}>
          ← トップへ戻る
        </button>
        <p>議員が見つかりませんでした。</p>
      </div>
    );
  }

  const currentTermQs = councilor.questions.filter(q => q.isCurrentTerm);
  const pastTermQs = councilor.questions.filter(q => !q.isCurrentTerm);

  const renderQuestions = (questions: QuestionItem[], isCurrent: boolean) => (
    <div className="timeline">
      {questions.map((q, idx) => (
        <div key={idx} className="timeline-item">
          <div className={`timeline-dot ${isCurrent ? 'current' : ''}`}></div>
          <div className="question-card">
            <div className="question-header">
              <div className="meeting-info">
                <div className="meeting-name">{q.meeting}</div>
                <div className="meeting-date">{q.date}</div>
              </div>
              <div className="question-type">{q.type}</div>
            </div>
            <ul className="question-details">
              {q.details.map((detail, dIdx) => {
                const isSubItem = /^[ア-ンa-zA-Z]、/.test(detail) || detail.startsWith('　');
                const cleanDetail = detail.replace(/^[ア-ンa-zA-Z]、/, '').trim();
                return (
                  <li key={dIdx} className={isSubItem ? 'sub-item' : 'main-item'}>
                    {cleanDetail}
                  </li>
                );
              })}
            </ul>
            
            {q.newsletter && (
              <div className="newsletter-summary">
                <div className="newsletter-title">
                  <span className="newsletter-icon">📖</span> {q.newsletter.title}
                </div>
                <div className="newsletter-qa-list">
                  {q.newsletter.qa.map((qaItem, idx) => (
                    <div key={idx} className={`qa-item ${qaItem.type === '質問' ? 'qa-q' : (qaItem.type === '答弁' ? 'qa-a' : 'qa-other')}`}>
                      <span className="qa-label">{qaItem.type}</span>
                      <span className="qa-text">{qaItem.text}</span>
                    </div>
                  ))}
                </div>
                <div className="newsletter-source">
                  出典: {q.newsletter.url ? (
                    <a href={q.newsletter.url} target="_blank" rel="noopener noreferrer" style={{color: 'inherit', textDecoration: 'underline'}}>
                      {q.newsletter.source}
                    </a>
                  ) : (
                    q.newsletter.source
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      {questions.length === 0 && (
        <p style={{ color: 'var(--text-secondary)', paddingLeft: '1rem' }}>
          質問の記録がありません。
        </p>
      )}
    </div>
  );

  return (
    <div style={{ paddingBottom: '80px' }}>
      <button className="back-button" onClick={() => navigate(-1)}>
        ← 一覧へ戻る
      </button>

      <div className="profile-header">
        {councilor.officialPhoto && (
          <div className="profile-photo-container">
            <img src={councilor.officialPhoto} alt="公式写真" className={`profile-photo ${councilor.electionPhoto ? 'photo-official' : ''}`} />
            {councilor.electionPhoto && (
              <img src={councilor.electionPhoto} alt="選挙写真" className="profile-photo photo-election" />
            )}
          </div>
        )}
        <h1 className="profile-name">{councilor.councilor} 議員</h1>
        <div style={{ marginBottom: '0.5rem' }}>
          <span className="councilor-faction">{councilor.faction}</span>
        </div>
        <div className="stats-row" style={{ alignItems: 'center' }}>
          <span className="stat-secondary">当選回数：{councilor.electedCount}回 （議員期間：約{councilor.tenureYears}年）</span>
        </div>
        
        {councilor.sns && Object.keys(councilor.sns).length > 0 && (
          <div className="sns-links">
            {councilor.sns.twitter && <a href={councilor.sns.twitter} target="_blank" rel="noreferrer" className="sns-link">𝕏 Twitter</a>}
            {councilor.sns.facebook && <a href={councilor.sns.facebook} target="_blank" rel="noreferrer" className="sns-link">📘 Facebook</a>}
            {councilor.sns.instagram && <a href={councilor.sns.instagram} target="_blank" rel="noreferrer" className="sns-link">📷 Instagram</a>}
            {councilor.sns.youtube && <a href={councilor.sns.youtube} target="_blank" rel="noreferrer" className="sns-link">📺 YouTube</a>}
            {councilor.sns.line && <a href={councilor.sns.line} target="_blank" rel="noreferrer" className="sns-link">💬 LINE</a>}
            {councilor.sns.website && <a href={councilor.sns.website} target="_blank" rel="noreferrer" className="sns-link"><Globe size={16} /> Web</a>}
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="poster-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="poster-modal-content" onClick={e => e.stopPropagation()}>
            <button className="poster-modal-close" onClick={() => setSelectedImage(null)}>
              <X size={24} />
            </button>
            <img src={selectedImage} alt="拡大された選挙公報" className="poster-modal-image" />
          </div>
        </div>
      )}

      {(() => {
        const imageName = councilor.councilor.replace(/\s+/g, '_').replace('　', '_') + '.png';
        const imagePath = `/posters/${imageName}`;
        return (
          <div className="councilor-poster-section" onClick={() => setSelectedImage(imagePath)}>
            <h2 className="section-title">選挙公報</h2>
            <div className="poster-image-wrapper">
              <img src={imagePath} alt={`${councilor.councilor}の選挙公報`} loading="lazy" />
            </div>
            <p className="poster-hint">タップで拡大表示</p>
          </div>
        );
      })()}

      <h2 className="section-title">今期の一般質問</h2>
      {renderQuestions(currentTermQs, true)}

      {pastTermQs.length > 0 && (
        <>
          <h2 className="section-title">過去の一般質問</h2>
          {renderQuestions(pastTermQs, false)}
        </>
      )}
    </div>
  );
}
