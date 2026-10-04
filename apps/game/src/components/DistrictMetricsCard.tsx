import React from 'react';
import { DistrictState } from '@distrito-zero/shared-types';

interface DistrictMetricsCardProps {
  district: DistrictState;
}

export const DistrictMetricsCard: React.FC<DistrictMetricsCardProps> = ({ district }) => {
  const { metrics, name } = district;

  return (
    <div className="glass-panel">
      <div className="card-header">
        <span>📍 {name}</span>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ESTADO DO BAIRRO</span>
      </div>
      <div className="card-body">
        <div className="metric-row">
          <div className="metric-header">
            <span>Segurança Operacional</span>
            <span>{metrics.security}%</span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill security"
              style={{ width: `${metrics.security}%` }}
            />
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-header">
            <span>Confiança da População</span>
            <span>{metrics.trust}%</span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill trust"
              style={{ width: `${metrics.trust}%` }}
            />
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-header">
            <span>Influência Criminosa</span>
            <span>{metrics.criminalInfluence}%</span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill crime"
              style={{ width: `${metrics.criminalInfluence}%` }}
            />
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-header">
            <span>Atividade Econômica</span>
            <span>{metrics.economy}%</span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill economy"
              style={{ width: `${metrics.economy}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
