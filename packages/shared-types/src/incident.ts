import { Point2D } from './common.js';
import { DistrictId } from './district.js';

export type CrimeCategory =
  | 'theft'            // furto
  | 'robbery'          // roubo / assalto
  | 'vandalism'        // vandalismo
  | 'drug_trafficking' // tráfico
  | 'corruption'       // desvio / corrupção
  | 'homicide';        // homicídio

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus =
  | 'reported'      // denunciado / na fila da central
  | 'dispatched'    // viatura a caminho
  | 'on_scene'      // policiais no local resolvendo
  | 'resolved'      // resolvido com sucesso
  | 'failed'        // criminoso fugiu / tempo expirou
  | 'investigating';// requer investigação aprofundada

export interface Incident {
  id: string;
  districtId: DistrictId;
  crimeType: CrimeCategory;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: Point2D;
  createdAtTick: number;
  expiresAtTick: number; // tempo limite para responder
  assignedUnitId?: string;
  resolutionProgress: number; // 0 a 100%
  requiredResolutionTime: number; // em segundos / ticks
  reward: {
    budget: number;
    xp: number;
    reputation: number;
  };
}
