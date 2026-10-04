import { GameEvent, GameState, TickResult } from '@distrito-zero/shared-types';
import { DeterministicRNG } from './rng.js';
import { processIncidentSystem } from './systems/incident-system.js';
import { processPoliceSystem } from './systems/police-system.js';
import { processDistrictSystem } from './systems/district-system.js';

export class GameSimulation {
  private rng: DeterministicRNG;

  constructor(seed: number = 42) {
    this.rng = new DeterministicRNG(seed);
  }

  tick(state: GameState): TickResult {
    if (state.clock.paused) {
      return { state, events: [] };
    }

    const events: GameEvent[] = [];
    const nextTick = state.clock.tick + 1;

    // Atualiza relógio do jogo
    let nextMinutes = state.clock.timeOfDayMinutes + 1;
    let nextDay = state.clock.day;
    if (nextMinutes >= 1440) {
      nextMinutes = 0;
      nextDay += 1;
    }

    let currentState: GameState = {
      ...state,
      clock: {
        ...state.clock,
        tick: nextTick,
        timeOfDayMinutes: nextMinutes,
        day: nextDay
      }
    };

    // Executa os sistemas em ordem determinística
    currentState = processIncidentSystem(currentState, this.rng, events);
    currentState = processPoliceSystem(currentState, events);
    currentState = processDistrictSystem(currentState, events);

    return {
      state: currentState,
      events
    };
  }
}
