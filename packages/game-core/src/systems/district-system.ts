import { BuildingVisualStage, GameEvent, GameState } from '@distrito-zero/shared-types';

export function processDistrictSystem(
  state: GameState,
  events: GameEvent[]
): GameState {
  const currentTick = state.clock.tick;
  const nextDistricts = { ...state.districts };
  const currentDistrict = nextDistricts[state.activeDistrictId];

  if (!currentDistrict) return state;

  let securityDelta = 0;
  let trustDelta = 0;
  let crimeDelta = 0;
  let economyDelta = 0;

  // Analisar eventos recentes que afetam o bairro
  for (const event of events) {
    if (event.type === 'INCIDENT_RESOLVED') {
      securityDelta += 3;
      trustDelta += 2;
      crimeDelta -= 4;
      economyDelta += 1;
    } else if (event.type === 'INCIDENT_EXPIRED') {
      securityDelta -= 2;
      trustDelta -= 3;
      crimeDelta += 3;
    }
  }

  // Se houver mudanças, aplicar às métricas do distrito
  if (securityDelta !== 0 || trustDelta !== 0 || crimeDelta !== 0 || economyDelta !== 0) {
    const metrics = currentDistrict.metrics;
    metrics.security = Math.max(0, Math.min(100, metrics.security + securityDelta));
    metrics.trust = Math.max(0, Math.min(100, metrics.trust + trustDelta));
    metrics.criminalInfluence = Math.max(0, Math.min(100, metrics.criminalInfluence + crimeDelta));
    metrics.economy = Math.max(0, Math.min(100, metrics.economy + economyDelta));

    events.push({
      type: 'DISTRICT_METRICS_UPDATED',
      tick: currentTick,
      districtId: currentDistrict.id,
      changes: {
        security: metrics.security,
        trust: metrics.trust,
        criminalInfluence: metrics.criminalInfluence,
        economy: metrics.economy
      }
    });

    // Reação visual dos prédios da cidade conforme o bairro é recuperado
    for (const building of currentDistrict.buildings) {
      if (building.type === 'station') continue; // delegacia evolui via upgrades

      let newStage: BuildingVisualStage | null = null;

      if (metrics.security >= 35 && metrics.trust >= 25 && building.stage === 'abandoned') {
        newStage = 'under_renovation';
      } else if (metrics.security >= 50 && building.stage === 'under_renovation') {
        newStage = 'recovered';
      } else if (metrics.security >= 75 && metrics.economy >= 60 && building.stage === 'recovered') {
        newStage = 'expanded';
      }

      if (newStage && newStage !== building.stage) {
        building.stage = newStage;
        events.push({
          type: 'BUILDING_STAGE_CHANGED',
          tick: currentTick,
          buildingId: building.id,
          newStage
        });
      }
    }
  }

  return {
    ...state,
    districts: nextDistricts
  };
}
