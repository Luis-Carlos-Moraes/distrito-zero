import { GameEvent, GameState, Incident, PoliceVehicle } from '@distrito-zero/shared-types';

export function processPoliceSystem(
  state: GameState,
  events: GameEvent[]
): GameState {
  const currentTick = state.clock.tick;
  const nextVehicles: Record<string, PoliceVehicle> = { ...state.vehicles };
  const nextIncidents: Record<string, Incident> = { ...state.incidents };
  const nextWallet = { ...state.wallet };
  const nextStations = { ...state.stations };

  for (const vehicle of Object.values(nextVehicles)) {
    // 1. Viatura a caminho da ocorrência
    if (vehicle.status === 'dispatched' && vehicle.assignedIncidentId) {
      const incident = nextIncidents[vehicle.assignedIncidentId];
      if (!incident || incident.status === 'failed') {
        // Ocorrência cancelada/expirada: retorna
        vehicle.status = 'returning';
        vehicle.assignedIncidentId = undefined;
        continue;
      }

      // Movimentação em direção ao destino (simplificada em ticks)
      const target = vehicle.targetPosition || incident.location;
      const dx = target.x - vehicle.position.x;
      const dy = target.y - vehicle.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 0.5) {
        // Chegou no local
        vehicle.position = { ...target };
        vehicle.status = 'on_scene';
        incident.status = 'on_scene';
        events.push({
          type: 'UNIT_ARRIVED_ON_SCENE',
          tick: currentTick,
          incidentId: incident.id,
          vehicleId: vehicle.id
        });
      } else {
        // Avança em linha reta proporcional à velocidade
        const step = Math.min(dist, 0.4 * vehicle.speed);
        vehicle.position.x += (dx / dist) * step;
        vehicle.position.y += (dy / dist) * step;
      }
    }

    // 2. Viatura no local resolvendo a ocorrência
    else if (vehicle.status === 'on_scene' && vehicle.assignedIncidentId) {
      const incident = nextIncidents[vehicle.assignedIncidentId];
      if (incident && incident.status === 'on_scene') {
        // Progresso proporcional ao tempo requerido
        const progressIncrement = 100 / Math.max(incident.requiredResolutionTime, 1);
        incident.resolutionProgress = Math.min(100, incident.resolutionProgress + progressIncrement);

        if (incident.resolutionProgress >= 100) {
          // Ocorrência 100% resolvida!
          incident.status = 'resolved';
          vehicle.status = 'returning';
          vehicle.assignedIncidentId = undefined;

          // Recompensas da delegacia
          nextWallet.budget += incident.reward.budget;
          nextWallet.xp += incident.reward.xp;
          nextWallet.reputation = Math.min(100, nextWallet.reputation + incident.reward.reputation);

          // Registra prisioneiro nas celas se houver vaga
          const station = Object.values(nextStations)[0];
          if (station && station.currentPrisoners < station.jailCapacity) {
            station.currentPrisoners += 1;
          }

          events.push({
            type: 'INCIDENT_RESOLVED',
            tick: currentTick,
            incidentId: incident.id,
            reward: incident.reward,
            arrestsMade: 1
          });
        }
      }
    }

    // 3. Viatura retornando à delegacia
    else if (vehicle.status === 'returning') {
      const station = Object.values(nextStations)[0];
      const stationPos = station ? station.position : { x: 4, y: 4 };

      const dx = stationPos.x - vehicle.position.x;
      const dy = stationPos.y - vehicle.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 0.5) {
        // Estacionou no pátio
        vehicle.position = { ...stationPos };
        vehicle.status = 'parked';
        events.push({
          type: 'UNIT_RETURNED_TO_STATION',
          tick: currentTick,
          vehicleId: vehicle.id
        });
      } else {
        const step = Math.min(dist, 0.4 * vehicle.speed);
        vehicle.position.x += (dx / dist) * step;
        vehicle.position.y += (dy / dist) * step;
      }
    }
  }

  return {
    ...state,
    vehicles: nextVehicles,
    incidents: nextIncidents,
    wallet: nextWallet,
    stations: nextStations
  };
}
