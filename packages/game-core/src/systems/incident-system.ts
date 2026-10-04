import { CrimeCategory, GameEvent, GameState, Incident } from '@distrito-zero/shared-types';
import { CRIME_DEFINITIONS } from '@distrito-zero/game-data';
import { DeterministicRNG } from '../rng.js';

export function processIncidentSystem(
  state: GameState,
  rng: DeterministicRNG,
  events: GameEvent[]
): GameState {
  const currentTick = state.clock.tick;
  const nextIncidents = { ...state.incidents };
  const currentDistrict = state.districts[state.activeDistrictId];

  if (!currentDistrict) return state;

  // 1. Spawning de novas ocorrências (a cada ~15-25 ticks se houver espaço na fila)
  const activeCount = Object.values(nextIncidents).filter(
    (inc) => inc.status !== 'resolved' && inc.status !== 'failed'
  ).length;

  if (activeCount < 3 && currentTick % 20 === 0) {
    // Chance de spawn proporcional à influência criminosa do distrito
    const spawnChance = currentDistrict.metrics.criminalInfluence / 100;
    if (rng.next() <= spawnChance) {
      // Filtrar crimes permitidos pela criminalidade atual
      const availableCategories = (Object.keys(CRIME_DEFINITIONS) as CrimeCategory[]).filter(
        (cat) => CRIME_DEFINITIONS[cat].criminalInfluenceMin <= currentDistrict.metrics.criminalInfluence
      );

      const chosenCategory: CrimeCategory = rng.pick(availableCategories) || 'theft';
      const crimeDef = CRIME_DEFINITIONS[chosenCategory];
      const descTemplate: string = rng.pick(crimeDef.descriptionTemplates) || crimeDef.title;

      // Localização próxima a algum prédio do distrito
      const targetBuilding = rng.pick(currentDistrict.buildings);
      const location = targetBuilding
        ? { x: targetBuilding.position.x + (rng.next() > 0.5 ? 1 : -1), y: targetBuilding.position.y }
        : { x: rng.nextInt(1, 10), y: rng.nextInt(1, 10) };

      const incidentId = `inc-${currentTick}-${rng.nextInt(100, 999)}`;
      const newIncident: Incident = {
        id: incidentId,
        districtId: currentDistrict.id,
        crimeType: chosenCategory,
        title: crimeDef.title,
        description: descTemplate,
        severity: crimeDef.baseSeverity,
        status: 'reported',
        location,
        createdAtTick: currentTick,
        expiresAtTick: currentTick + crimeDef.timeToLiveSeconds,
        resolutionProgress: 0,
        requiredResolutionTime: crimeDef.resolutionTimeSeconds,
        reward: {
          budget: crimeDef.rewardBudget,
          xp: crimeDef.rewardXp,
          reputation: crimeDef.rewardReputation
        }
      };

      nextIncidents[incidentId] = newIncident;
      events.push({
        type: 'INCIDENT_CREATED',
        tick: currentTick,
        incident: newIncident
      });
    }
  }

  // 2. Verificar expiração de ocorrências não atendidas
  for (const inc of Object.values(nextIncidents)) {
    if (inc.status === 'reported' && currentTick >= inc.expiresAtTick) {
      inc.status = 'failed';
      events.push({
        type: 'INCIDENT_EXPIRED',
        tick: currentTick,
        incidentId: inc.id
      });
    }
  }

  return {
    ...state,
    incidents: nextIncidents
  };
}
