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
  const { wallet, clock } = state;

  const hours = Math.floor(clock.timeOfDayMinutes / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (clock.timeOfDayMinutes % 60).toString().padStart(2, '0');

  return (
    <header className="hud-header">
      <div className="brand-title">
        <span>Distrito Zero</span>
        <span className="brand-badge">ALPHA v0.1</span>
      </div>

      <div className="hud-stat-group">
        <div className="stat-item">
          <span className="stat-label">Orçamento</span>
          <span className="stat-value budget">
            R$ {wallet.budget.toLocaleString('pt-BR')}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Confiança Pública</span>
          <span className="stat-value reputation">{wallet.reputation}%</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Horário / Dia</span>
          <span className="stat-value time">
            {hours}:{minutes} • Dia {clock.day}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={onTogglePause}
            className="btn-ghost"
            style={{ fontWeight: 600, color: clock.paused ? '#f87171' : '#34d399' }}
          >
            {clock.paused ? '▶ CONTINUAR' : '⏸ PAUSAR'}
          </button>

          <button
            onClick={() => onChangeSpeed(1)}
            className="btn-ghost"
            style={{
              background: clock.gameSpeed === 1 ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            1x
          </button>
          <button
            onClick={() => onChangeSpeed(2)}
            className="btn-ghost"
            style={{
              background: clock.gameSpeed === 2 ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            2x
          </button>
          <button
            onClick={() => onChangeSpeed(5)}
            className="btn-ghost"
            style={{
              background: clock.gameSpeed === 5 ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            5x
          </button>
        </div>
      </div>
    </header>
  );
};
