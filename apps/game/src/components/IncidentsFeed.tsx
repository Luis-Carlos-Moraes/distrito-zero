import React from 'react';
import { Incident } from '@distrito-zero/shared-types';

interface IncidentsFeedProps {
  incidents: Record<string, Incident>;
  onSelectDispatch: (incident: Incident) => void;
}

export const IncidentsFeed: React.FC<IncidentsFeedProps> = ({
  incidents,
  onSelectDispatch
}) => {
  const activeIncidents = Object.values(incidents)
    .filter((i) => i.status !== 'resolved' && i.status !== 'failed')
    .sort((a, b) => b.createdAtTick - a.createdAtTick);

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <span>🚨 Ocorrências em Aberto ({activeIncidents.length})</span>
      </div>

      <div className="card-body" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 380px)' }}>
        {activeIncidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.8rem' }}>
            Nenhuma chamada de emergência ativa no momento. Patrulhamento contínuo.
          </div>
        ) : (
          activeIncidents.map((incident) => {
            const isDispatched = incident.status === 'dispatched';
            const isOnScene = incident.status === 'on_scene';

            return (
              <div
                key={incident.id}
                className={`incident-item ${incident.severity}`}
              >
                <div className="incident-top">
                  <span className="incident-title">{incident.title}</span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background:
                        isOnScene
                          ? 'rgba(16, 185, 129, 0.2)'
                          : isDispatched
                          ? 'rgba(37, 99, 235, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                      color:
                        isOnScene ? '#34d399' : isDispatched ? '#60a5fa' : '#f87171'
                    }}
                  >
                    {isOnScene
                      ? 'EM ANDAMENTO'
                      : isDispatched
                      ? 'VIATURA A CAMINHO'
                      : 'AGUARDANDO DESPACHO'}
                  </span>
                </div>

                <p className="incident-desc">{incident.description}</p>

                {isOnScene && (
                  <div style={{ marginTop: '4px' }}>
                    <div className="metric-header" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>
                      <span>Resolvendo ocorrência...</span>
                      <span>{Math.round(incident.resolutionProgress)}%</span>
                    </div>
                    <div className="metric-bar-bg">
                      <div
                        className="metric-bar-fill"
                        style={{
                          width: `${incident.resolutionProgress}%`,
                          background: '#10b981'
                        }}
                      />
                    </div>
                  </div>
                )}

                {incident.status === 'reported' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                      className="btn-dispatch"
                      onClick={() => onSelectDispatch(incident)}
                    >
                      🚓 Despachar Viatura
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
