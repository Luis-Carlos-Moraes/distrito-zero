import { Incident } from './incident.js';

export type GameEvent =
  | {
      type: 'INCIDENT_CREATED';
      tick: number;
      incident: Incident;
    }
  | {
      type: 'UNIT_DISPATCHED';
      tick: number;
      incidentId: string;
      vehicleId: string;
    }
  | {
      type: 'UNIT_ARRIVED_ON_SCENE';
      tick: number;
      incidentId: string;
      vehicleId: string;
    }
  | {
      type: 'INCIDENT_RESOLVED';
      tick: number;
      incidentId: string;
      reward: { budget: number; xp: number; reputation: number };
      arrestsMade: number;
    }
  | {
      type: 'INCIDENT_EXPIRED';
      tick: number;
      incidentId: string;
    }
  | {
      type: 'UNIT_RETURNED_TO_STATION';
      tick: number;
      vehicleId: string;
    }
  | {
      type: 'DISTRICT_METRICS_UPDATED';
      tick: number;
      districtId: string;
      changes: Record<string, number>;
    }
  | {
      type: 'BUILDING_STAGE_CHANGED';
      tick: number;
      buildingId: string;
      newStage: string;
    }
  | {
      type: 'OFFICER_HIRED';
      tick: number;
      officerId: string;
      stationId: string;
    }
  | {
      type: 'VEHICLE_PURCHASED';
      tick: number;
      vehicleId: string;
      stationId: string;
    };
