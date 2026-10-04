import {
  CommandResult,
  GameCommand,
  GameEvent,
  GameState
} from '@distrito-zero/shared-types';

export function executeCommand(
  state: GameState,
  command: GameCommand
): CommandResult {
  const events: GameEvent[] = [];
  const currentTick = state.clock.tick;

  switch (command.type) {
    case 'DISPATCH_UNIT': {
      const vehicle = state.vehicles[command.vehicleId];
      if (!vehicle) {
        return { success: false, error: 'Viatura não encontrada', state, events };
      }

      if (vehicle.status !== 'parked') {
        return {
          success: false,
          error: `Viatura indisponível para despacho (status atual: ${vehicle.status})`,
          state,
          events
        };
      }

      if (vehicle.assignedOfficerIds.length === 0) {
        return {
          success: false,
          error: 'Viatura não pode sair sem policiais designados',
          state,
          events
        };
      }

      const incident = state.incidents[command.incidentId];
      if (!incident) {
        return { success: false, error: 'Ocorrência não encontrada', state, events };
      }

      if (incident.status !== 'reported') {
        return {
          success: false,
          error: 'Ocorrência já atendida ou finalizada',
          state,
          events
        };
      }

      // Atualiza viatura
      const nextVehicles = {
        ...state.vehicles,
        [vehicle.id]: {
          ...vehicle,
          status: 'dispatched' as const,
          assignedIncidentId: incident.id,
          targetPosition: { ...incident.location }
        }
      };

      // Atualiza ocorrência
      const nextIncidents = {
        ...state.incidents,
        [incident.id]: {
          ...incident,
          status: 'dispatched' as const,
          assignedUnitId: vehicle.id
        }
      };

      events.push({
        type: 'UNIT_DISPATCHED',
        tick: currentTick,
        incidentId: incident.id,
        vehicleId: vehicle.id
      });

      return {
        success: true,
        state: {
          ...state,
          vehicles: nextVehicles,
          incidents: nextIncidents
        },
        events
      };
    }

    case 'HIRE_OFFICER': {
      const HIRE_COST = 500;
      if (state.wallet.budget < HIRE_COST) {
        return { success: false, error: 'Orçamento insuficiente para contratação', state, events };
      }

      const station = state.stations[command.stationId];
      if (!station) {
        return { success: false, error: 'Delegacia não encontrada', state, events };
      }

      const newId = `off-${Date.now() % 10000}`;
      const newOfficer = {
        id: newId,
        name: command.officerName || `Oficial ${newId}`,
        badgeNumber: `DZ-${Math.floor(100 + Math.random() * 899)}`,
        rank: 'recruit' as const,
        status: 'idle' as const,
        currentStationId: station.id,
        experience: 0,
        attributes: {
          discipline: 60,
          investigation: 50,
          accuracy: 55,
          leadership: 40,
          integrity: 80
        }
      };

      events.push({
        type: 'OFFICER_HIRED',
        tick: currentTick,
        officerId: newId,
        stationId: station.id
      });

      return {
        success: true,
        state: {
          ...state,
          wallet: {
            ...state.wallet,
            budget: state.wallet.budget - HIRE_COST
          },
          officers: {
            ...state.officers,
            [newId]: newOfficer
          },
          stations: {
            ...state.stations,
            [station.id]: {
              ...station,
              officerIds: [...station.officerIds, newId]
            }
          }
        },
        events
      };
    }

    default:
      return { success: false, error: 'Comando não implementado', state, events };
  }
}
