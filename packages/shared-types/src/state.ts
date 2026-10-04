import { DistrictState } from './district.js';
import { Incident } from './incident.js';
import { Officer, PoliceStation, PoliceVehicle } from './police.js';

export interface PlayerWallet {
  budget: number;       // Dinheiro para operações e melhorias
  reputation: number;   // 0 a 100
  cityLevel: number;    // Nível geral de progresso
  xp: number;           // Experiência acumulada
}

export interface GameClock {
  tick: number;             // Contador inteiro de ticks determinísticos
  timeOfDayMinutes: number; // 0 a 1439 (minutos do dia para ciclo dia/noite)
  day: number;              // Dia da campanha
  paused: boolean;
  gameSpeed: 1 | 2 | 5;     // Multiplicador de velocidade
}

export interface GameState {
  version: string;
  seed: number;
  clock: GameClock;
  wallet: PlayerWallet;
  districts: Record<string, DistrictState>;
  stations: Record<string, PoliceStation>;
  officers: Record<string, Officer>;
  vehicles: Record<string, PoliceVehicle>;
  incidents: Record<string, Incident>;
  activeDistrictId: string;
}

export interface CommandResult {
  success: boolean;
  error?: string;
  state: GameState;
  events: import('./events.js').GameEvent[];
}

export interface TickResult {
  state: GameState;
  events: import('./events.js').GameEvent[];
}

export interface SaveRepository {
  save(state: GameState): Promise<void>;
  load(): Promise<GameState | null>;
  hasSave(): Promise<boolean>;
  clear(): Promise<void>;
}
