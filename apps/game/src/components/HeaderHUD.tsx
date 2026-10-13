import React from 'react';
import { GameState } from '@distrito-zero/shared-types';

interface HeaderHUDProps {
  state: GameState;
  onTogglePause: () => void;
  onChangeSpeed: (speed: 1 | 2 | 5) => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  state,
  onTogglePause,
  onChangeSpeed
}) => {
  const { wallet, clock, officers, vehicles } = state;

  const totalOfficers = Object.keys(officers).length;
  const availableOfficers = Object.values(officers).filter(
    (o) => o.status === 'idle' || o.status === 'assigned_patrol'
  ).length;

  const totalVehicles = Object.keys(vehicles).length;
  const availableVehicles = Object.values(vehicles).filter(
    (v) => v.status === 'parked'
  ).length;

  const hours = Math.floor(clock.timeOfDayMinutes / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (clock.timeOfDayMinutes % 60).toString().padStart(2, '0');

  const isNight = clock.timeOfDayMinutes < 360 || clock.timeOfDayMinutes >= 1140;

  return (
    <header className="hud-header">
      {/* Nível da Delegacia (com badge de estrela) */}
      <div className="hud-pill level-pill">
        <div className="level-star">⭐</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', color: '#94a3b8' }}>
            NÍVEL DA DELEGACIA {wallet.cityLevel}
          </div>
          <div className="level-progress-bg">
            <div
              className="level-progress-fill"
              style={{ width: `${Math.min(100, (wallet.xp / 500) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cápsulas de Status Centrais (Tycoon Style) */}
      <div className="hud-capsules-group">
        {/* Orçamento */}
        <div className="hud-pill budget-pill">
          <span style={{ fontSize: '1.1rem' }}>💵</span>
          <span className="pill-value budget">
            R$ {wallet.budget.toLocaleString('pt-BR')}
          </span>
        </div>

        {/* Policiais */}
        <div className="hud-pill">
          <span style={{ fontSize: '1.05rem' }}>👮</span>
          <span className="pill-value">
            {availableOfficers}/{totalOfficers}
          </span>
        </div>

        {/* Viaturas */}
        <div className="hud-pill">
          <span style={{ fontSize: '1.05rem' }}>🚓</span>
          <span className="pill-value">
            {availableVehicles}/{totalVehicles}
          </span>
        </div>

        {/* Reputação */}
        <div className="hud-pill">
          <span style={{ fontSize: '1.05rem' }}>🛡️</span>
          <span className="pill-value" style={{ color: '#60a5fa' }}>
            {wallet.reputation}
          </span>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>
            Reputação
          </span>
        </div>

        {/* Relógio e Clima */}
        <div className="hud-pill">
          <span style={{ fontSize: '1.1rem' }}>{isNight ? '🌙' : '☀️'}</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="pill-value" style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
              {hours}:{minutes}
            </span>
            <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>
              Dia {clock.day}
            </span>
          </div>
        </div>
      </div>

      {/* Controles de Tempo */}
      <div className="hud-pill hud-time-controls">
        <button
          id="hud-toggle-pause"
          onClick={onTogglePause}
          className="btn-ghost"
          style={{
            fontWeight: 700,
            fontSize: '0.75rem',
            padding: '5px 10px',
            color: clock.paused ? '#f87171' : '#34d399',
            borderColor: clock.paused ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'
          }}
        >
          {clock.paused ? '▶ RETOMAR' : '⏸ PAUSAR'}
        </button>

        <div style={{ display: 'flex', borderRadius: '6px', padding: '2px' }}>
          <button
            onClick={() => onChangeSpeed(1)}
            className={`btn-speed ${clock.gameSpeed === 1 ? 'active' : ''}`}
          >
            1x
          </button>
          <button
            onClick={() => onChangeSpeed(2)}
            className={`btn-speed ${clock.gameSpeed === 2 ? 'active' : ''}`}
          >
            2x
          </button>
          <button
            onClick={() => onChangeSpeed(5)}
            className={`btn-speed ${clock.gameSpeed === 5 ? 'active' : ''}`}
          >
            5x
          </button>
        </div>
      </div>
    </header>
  );
};
