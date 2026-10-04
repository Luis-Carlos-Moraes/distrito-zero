import { Point2D } from './common.js';

export type OfficerStatus =
  | 'idle'
  | 'assigned_patrol'
  | 'dispatched'
  | 'on_scene'
  | 'resting'
  | 'injured'
  | 'suspended';

export interface OfficerAttributes {
  discipline: number;   // 1 a 100
  investigation: number;// 1 a 100
  accuracy: number;     // 1 a 100
  leadership: number;   // 1 a 100
  integrity: number;    // atributo oculto/parcial 1 a 100
}

export interface Officer {
  id: string;
  name: string;
  badgeNumber: string;
  rank: 'recruit' | 'officer' | 'sergeant' | 'detective' | 'captain';
  status: OfficerStatus;
  attributes: OfficerAttributes;
  experience: number;
  assignedVehicleId?: string;
  currentStationId: string;
}

export type VehicleStatus =
  | 'parked'          // no pátio da delegacia
  | 'dispatched'      // em trânsito até ocorrência
  | 'on_scene'        // no local
  | 'returning'       // retornando à delegacia
  | 'damaged'         // aguardando oficina
  | 'under_repair';   // sendo consertada na oficina

export interface PoliceVehicle {
  id: string;
  name: string;
  model: 'patrol_car' | 'suv' | 'tactical_van' | 'motorcycle';
  plate: string;
  status: VehicleStatus;
  health: number; // 0 a 100%
  speed: number;  // tiles / coords por segundo
  position: Point2D;
  targetPosition?: Point2D;
  assignedIncidentId?: string;
  assignedOfficerIds: string[];
}

export type StationModuleType =
  | 'reception'
  | 'administration'
  | 'holding_cells'
  | 'garage'
  | 'workshop'
  | 'armory'
  | 'investigation';

export interface StationModule {
  id: string;
  type: StationModuleType;
  level: number;
  operational: boolean;
  capacity: number;
  currentLoad: number;
}

export interface PoliceStation {
  id: string;
  name: string;
  districtId: string;
  position: Point2D;
  modules: StationModule[];
  officerIds: string[];
  vehicleIds: string[];
  jailCapacity: number;
  currentPrisoners: number;
}
