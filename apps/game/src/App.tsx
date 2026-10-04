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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Barra Superior de Status em Cápsulas */}
      <HeaderHUD
        state={gameState}
        onTogglePause={handleTogglePause}
        onChangeSpeed={handleChangeSpeed}
      />

      {/* Área Central: Viewport 3D + Painéis Flutuantes */}
      <main className="game-viewport-container">
        {/* Renderizador Three.js 3D Low Poly Isométrico */}
        <IsometricViewport3D state={gameState} />

        {/* Camada React de Gestão Territorial & Delegacia (Esquerda) */}
        <aside className="ui-overlay-left">
          {activeDistrict && <DistrictMetricsCard district={activeDistrict} />}
          <StationStatusCard state={gameState} />
        </aside>

        {/* Camada React de Despacho & Ocorrências (Direita) */}
        <aside className="ui-overlay-right">
          <IncidentsFeed
            incidents={gameState.incidents}
            onSelectDispatch={(inc) => setSelectedIncidentForDispatch(inc)}
          />
        </aside>

        {/* Minimapa Radar com Heatmap de Criminalidade (Canto Inferior Direito) */}
        <MinimapRadar
          district={activeDistrict}
          incidentsCount={activeIncidentsList.length}
        />
      </main>

      {/* Dock Inferior de Navegação e Strip de Cômodos da Delegacia */}
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
