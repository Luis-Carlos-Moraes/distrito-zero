import React, { useEffect, useMemo, useState } from 'react';
import { GameState, Incident } from '@distrito-zero/shared-types';
import { createInitialGameState, executeCommand, GameSimulation } from '@distrito-zero/game-core';
import { HeaderHUD } from './components/HeaderHUD.js';
import { DistrictMetricsCard } from './components/DistrictMetricsCard.js';
import { StationStatusCard } from './components/StationStatusCard.js';
import { IncidentsFeed } from './components/IncidentsFeed.js';
import { DispatchModal } from './components/DispatchModal.js';
import { BottomNavigationDock } from './components/BottomNavigationDock.js';
import { MinimapRadar } from './components/MinimapRadar.js';
import { IsometricViewport3D } from './renderer/IsometricViewport3D.js';

export const App: React.FC = () => {
  const simulation = useMemo(() => new GameSimulation(1337), []);
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(1337));
  const [selectedIncidentForDispatch, setSelectedIncidentForDispatch] = useState<Incident | null>(null);
  const [activeTab, setActiveTab] = useState<string>('map');
  const [showPanels, setShowPanels] = useState<boolean>(true);

  // Loop principal de simulação determinística do Game Core
  useEffect(() => {
    if (gameState.clock.paused) return;

    const intervalMs = 1000 / gameState.clock.gameSpeed;

    const timer = setInterval(() => {
      setGameState((prev) => {
        const { state: nextState } = simulation.tick(prev);
        return nextState;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [simulation, gameState.clock.paused, gameState.clock.gameSpeed]);

  // Controles de Pausa e Velocidade
  const handleTogglePause = () => {
    setGameState((prev) => ({
      ...prev,
      clock: { ...prev.clock, paused: !prev.clock.paused }
    }));
  };

  const handleChangeSpeed = (speed: 1 | 2 | 5) => {
    setGameState((prev) => ({
      ...prev,
      clock: { ...prev.clock, gameSpeed: speed }
    }));
  };

  // Despacho de Viatura
  const handleConfirmDispatch = (incidentId: string, vehicleId: string) => {
    setGameState((prev) => {
      const result = executeCommand(prev, {
        type: 'DISPATCH_UNIT',
        incidentId,
        vehicleId
      });

      if (!result.success) {
        alert(result.error || 'Não foi possível despachar');
        return prev;
      }

      return result.state;
    });

    setSelectedIncidentForDispatch(null);
  };

  const activeDistrict = gameState.districts[gameState.activeDistrictId];
  const parkedVehicles = Object.values(gameState.vehicles).filter((v) => v.status === 'parked');
  const activeIncidentsList = Object.values(gameState.incidents).filter(
    (i) => i.status !== 'resolved' && i.status !== 'failed'
  );

  return (
    <div className="game-root">
      {/* Mapa 3D em tela cheia (fica atrás de todo o HUD) */}
      <main className="game-viewport-container">
        <IsometricViewport3D
          state={gameState}
          onSelectIncident={(id) => {
            const inc = gameState.incidents[id];
            if (inc && inc.status === 'reported') setSelectedIncidentForDispatch(inc);
          }}
        />
      </main>

      {/* Barra Superior flutuante */}
      <HeaderHUD
        state={gameState}
        onTogglePause={handleTogglePause}
        onChangeSpeed={handleChangeSpeed}
      />

      {/* Painéis do Bairro e Delegacia (Esquerda, recolhíveis) */}
      <aside className={`ui-overlay-left ${showPanels ? '' : 'collapsed'}`}>
        <button
          id="toggle-side-panels"
          className="panel-toggle"
          onClick={() => setShowPanels((v) => !v)}
          title={showPanels ? 'Recolher painéis' : 'Mostrar painéis'}
        >
          {showPanels ? '◀' : '📊'}
        </button>
        {showPanels && (
          <>
            {activeDistrict && <DistrictMetricsCard district={activeDistrict} />}
            <StationStatusCard state={gameState} />
          </>
        )}
      </aside>

      {/* Ocorrências (Direita) — só aparece quando há chamadas abertas */}
      {activeIncidentsList.length > 0 && (
        <aside className="ui-overlay-right">
          <IncidentsFeed
            incidents={gameState.incidents}
            onSelectDispatch={(inc) => setSelectedIncidentForDispatch(inc)}
          />
        </aside>
      )}

      {/* Minimapa de Criminalidade (Canto Inferior Direito) */}
      <MinimapRadar
        district={activeDistrict}
        incidentsCount={activeIncidentsList.length}
      />

      {/* Dock Inferior flutuante */}
      <BottomNavigationDock
        activeTab={activeTab}
        onSelectTab={(id) => setActiveTab(id)}
        incidentsCount={activeIncidentsList.length}
      />

      {/* Modal de Despacho */}
      {selectedIncidentForDispatch && (
        <DispatchModal
          incident={selectedIncidentForDispatch}
          availableVehicles={parkedVehicles}
          onConfirmDispatch={handleConfirmDispatch}
          onClose={() => setSelectedIncidentForDispatch(null)}
        />
      )}
    </div>
  );
};
