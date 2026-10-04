import React, { useEffect, useMemo, useState } from 'react';
import { GameState, Incident } from '@distrito-zero/shared-types';
import { createInitialGameState, executeCommand, GameSimulation } from '@distrito-zero/game-core';
import { HeaderHUD } from './components/HeaderHUD.js';
import { DistrictMetricsCard } from './components/DistrictMetricsCard.js';
import { StationStatusCard } from './components/StationStatusCard.js';
import { IncidentsFeed } from './components/IncidentsFeed.js';
import { DispatchModal } from './components/DispatchModal.js';
import { IsometricViewport } from './renderer/IsometricViewport.js';

export const App: React.FC = () => {
  const simulation = useMemo(() => new GameSimulation(1337), []);
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(1337));
  const [selectedIncidentForDispatch, setSelectedIncidentForDispatch] = useState<Incident | null>(null);

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

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <HeaderHUD
        state={gameState}
        onTogglePause={handleTogglePause}
        onChangeSpeed={handleChangeSpeed}
      />

      <main className="game-viewport-container">
        {/* Renderizador Isométrico de Baixo Nível (LOD, Grid, Prédios, Viaturas) */}
        <IsometricViewport state={gameState} />

        {/* Camada React de Gestão Territorial & Delegacia */}
        <aside className="ui-overlay-left">
          {activeDistrict && <DistrictMetricsCard district={activeDistrict} />}
          <StationStatusCard state={gameState} />
        </aside>

        {/* Camada React de Despacho & Ocorrências */}
        <aside className="ui-overlay-right">
          <IncidentsFeed
            incidents={gameState.incidents}
            onSelectDispatch={(inc) => setSelectedIncidentForDispatch(inc)}
          />
        </aside>
      </main>

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
