import React from 'react';
import { GameState } from '@distrito-zero/shared-types';

interface StationStatusCardProps {
  state: GameState;
}

export const StationStatusCard: React.FC<StationStatusCardProps> = ({ state }) => {
  const station = Object.values(state.stations)[0];
  const officers = Object.values(state.officers);
  const vehicles = Object.values(state.vehicles);

  const availableOfficers = officers.filter(
    (o) => o.status === 'idle' || o.status === 'assigned_patrol'
  ).length;

  const parkedVehicles = vehicles.filter((v) => v.status === 'parked').length;

  return (
    <div className="glass-panel">
      <div className="card-header">
        <span>🏢 {station?.name || 'Delegacia Principal'}</span>
        <span style={{ fontSize: '0.7rem', color: '#60a5fa' }}>EFETIVO & ESTRUTURA</span>
      </div>
      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>POLICIAIS</div>
            <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {availableOfficers} / {officers.length}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#34d399' }}>Prontos p/ serviço</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>VIATURAS</div>
            <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {parkedVehicles} / {vehicles.length}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#60a5fa' }}>No pátio</div>
          </div>
        </div>

        <div style={{ marginTop: '4px' }}>
          <div className="metric-header" style={{ marginBottom: '4px' }}>
            <span>Ocupação das Celas</span>
            <span>
              {station?.currentPrisoners || 0} / {station?.jailCapacity || 4} detentos
            </span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill"
              style={{
                width: `${Math.min(100, ((station?.currentPrisoners || 0) / (station?.jailCapacity || 4)) * 100)}%`,
                background: '#a855f7'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
