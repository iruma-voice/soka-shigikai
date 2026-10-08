import React, { useState } from 'react';
import { useSearchSort } from '../context/SearchSortContext';
import { X } from 'lucide-react';
import councilorData from '../data.json';
import './Posters.css';

export default function Posters() {
  const { sortOption } = useSearchSort();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  let sortedData = [...councilorData];
  switch (sortOption) {
    case 'current_desc':
      sortedData.sort((a, b) => b.questions_current - a.questions_current);
      break;
    case 'current_asc':
      sortedData.sort((a, b) => a.questions_current - b.questions_current);
      break;
    case 'total_desc':
      sortedData.sort((a, b) => b.questions_total - a.questions_total);
      break;
    case 'faction_order':
      sortedData.sort((a, b) => a.faction.localeCompare(b.faction, 'ja'));
      break;
    default:
      // 'default' or any other value defaults to pre-sorted data (あいうえお順)
      break;
  }

  return (
    <div className="posters-page pb-24">
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

      <header className="page-header">
        <h1>選挙公報</h1>
      </header>
      <div className="posters-grid">
        {sortedData.map(councilor => {
          const imageName = councilor.councilor.replace(/\s+/g, '_').replace('　', '_') + '.png';
          const imagePath = `/posters/${imageName}`;
          return (
            <div key={councilor.councilor} className="poster-card" onClick={() => setSelectedImage(imagePath)}>
              <h2 className="poster-name">{councilor.councilor} <span className="faction-badge">{councilor.faction}</span></h2>
              <div className="poster-image-wrapper">
                <img src={imagePath} alt={`${councilor.councilor}の選挙公報`} loading="lazy" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
