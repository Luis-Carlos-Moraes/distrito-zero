import { GameState } from '@distrito-zero/shared-types';
import {
  INITIAL_DISTRICT,
  INITIAL_DISTRICT_ID,
  INITIAL_OFFICERS,
  INITIAL_STATION,
  INITIAL_STATION_ID,
  INITIAL_VEHICLES
} from '@distrito-zero/game-data';

export function createInitialGameState(seed: number = 42): GameState {
  return {
    version: '0.1.0',
    seed,
    clock: {
      tick: 0,
      timeOfDayMinutes: 480, // 08:00 da manhã
      day: 1,
      paused: false,
      gameSpeed: 1
    },
    wallet: {
      budget: 1500,        // Orçamento inicial limitado
      reputation: 25,      // Baixa confiança inicial
      cityLevel: 1,
      xp: 0
    },
    districts: {
      [INITIAL_DISTRICT_ID]: { ...INITIAL_DISTRICT }
    },
    stations: {
      [INITIAL_STATION_ID]: { ...INITIAL_STATION }
    },
    officers: { ...INITIAL_OFFICERS },
    vehicles: { ...INITIAL_VEHICLES },
    incidents: {},
    activeDistrictId: INITIAL_DISTRICT_ID
  };
}
