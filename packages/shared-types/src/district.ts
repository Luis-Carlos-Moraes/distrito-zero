import { Point2D } from './common.js';

export type DistrictId = string;

export interface DistrictMetrics {
  security: number;          // 0 a 100
  trust: number;             // 0 a 100 (confiança na polícia)
  economy: number;           // 0 a 100 (atividade econômica)
  infrastructure: number;    // 0 a 100 (iluminação, ruas)
  qualityOfLife: number;     // 0 a 100
  criminalInfluence: number; // 0 a 100
}

export type BuildingVisualStage =
  | 'abandoned'
  | 'degraded'
  | 'under_renovation'
  | 'recovered'
  | 'expanded';

export interface CityBuilding {
  id: string;
  districtId: DistrictId;
  name: string;
  type: 'residential' | 'commercial' | 'public' | 'station';
  position: Point2D;
  stage: BuildingVisualStage;
  condition: number; // 0 a 100
}

export interface DistrictState {
  id: DistrictId;
  name: string;
  metrics: DistrictMetrics;
  buildings: CityBuilding[];
  unlocked: boolean;
}
