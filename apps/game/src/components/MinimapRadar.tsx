import React from 'react';
import { DistrictState } from '@distrito-zero/shared-types';

interface MinimapRadarProps {
  district?: DistrictState;
  incidentsCount: number;
}

export const MinimapRadar: React.FC<MinimapRadarProps> = ({ district, incidentsCount }) => {
  const criminalInfluence = district?.metrics.criminalInfluence || 50;

  return (
    <div className="minimap-radar-container glass-panel">
      <div className="minimap-header">
        <span>CRIMINALIDADE</span>
        <div className="criminality-bar-track">
          <div
            className="criminality-bar-fill"
            style={{ width: `${criminalInfluence}%` }}
          />
        </div>
      </div>

      <div className="minimap-canvas-box">
        {/* Grade do Radar */}
        <div className="radar-grid">
          <div className="radar-cell high-crime">🚨</div>
          <div className="radar-cell medium-crime" />
          <div className="radar-cell low-crime">🏢</div>
          <div className="radar-cell medium-crime" />
          <div className="radar-cell station-cell">🚓</div>
          <div className="radar-cell low-crime" />
          <div className="radar-cell low-crime" />
          <div className="radar-cell medium-crime" />
          <div className="radar-cell high-crime">{incidentsCount > 0 ? '⚠️' : ''}</div>
        </div>

        <div className="radar-sweep-effect" />
      </div>

      <div className="minimap-footer">
        <span>{district?.name || 'Setor Central'}</span>
        <span style={{ color: criminalInfluence > 60 ? '#ef4444' : '#10b981' }}>
          {criminalInfluence > 60 ? 'ALERTA VERMELHO' : 'ESTÁVEL'}
        </span>
      </div>
    </div>
  );
};
