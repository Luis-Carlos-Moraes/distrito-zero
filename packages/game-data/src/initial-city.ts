import {
  DistrictState,
  Officer,
  PoliceStation,
  PoliceVehicle
} from '@distrito-zero/shared-types';

export const INITIAL_DISTRICT_ID = 'district-0';
export const INITIAL_STATION_ID = 'station-0';

export const INITIAL_DISTRICT: DistrictState = {
  id: INITIAL_DISTRICT_ID,
  name: 'Distrito Baixo (Distrito Zero)',
  unlocked: true,
  metrics: {
    security: 22,          // Segurança crítica
    trust: 18,             // População desconfiada
    economy: 25,           // Comércio abatido
    infrastructure: 30,    // Postes quebrados, asfalto precário
    qualityOfLife: 20,
    criminalInfluence: 78  // Alta criminalidade
  },
  buildings: [
    {
      id: 'bldg-station',
      districtId: INITIAL_DISTRICT_ID,
      name: 'Delegacia Distrito Zero',
      type: 'station',
      position: { x: 4, y: 4 },
      stage: 'degraded',
      condition: 40
    },
    {
      id: 'bldg-com-1',
      districtId: INITIAL_DISTRICT_ID,
      name: 'Mercearia do Zé',
      type: 'commercial',
      position: { x: 7, y: 3 },
      stage: 'abandoned',
      condition: 20
    },
    {
      id: 'bldg-com-2',
      districtId: INITIAL_DISTRICT_ID,
      name: 'Oficina Central (Desativada)',
      type: 'commercial',
      position: { x: 2, y: 6 },
      stage: 'degraded',
      condition: 35
    },
    {
      id: 'bldg-res-1',
      districtId: INITIAL_DISTRICT_ID,
      name: 'Bloco Residencial Sul',
      type: 'residential',
      position: { x: 8, y: 7 },
      stage: 'degraded',
      condition: 30
    },
    {
      id: 'bldg-res-2',
      districtId: INITIAL_DISTRICT_ID,
      name: 'Vila Esperança',
      type: 'residential',
      position: { x: 3, y: 1 },
      stage: 'abandoned',
      condition: 15
    }
  ]
};

export const INITIAL_STATION: PoliceStation = {
  id: INITIAL_STATION_ID,
  name: '1º Distrito Policial',
  districtId: INITIAL_DISTRICT_ID,
  position: { x: 4, y: 4 },
  jailCapacity: 4,
  currentPrisoners: 0,
  officerIds: ['off-1', 'off-2', 'off-3', 'off-4'],
  vehicleIds: ['veh-1'],
  modules: [
    {
      id: 'mod-reception',
      type: 'reception',
      level: 1,
      operational: true,
      capacity: 2,
      currentLoad: 1
    },
    {
      id: 'mod-cells',
      type: 'holding_cells',
      level: 1,
      operational: true,
      capacity: 4,
      currentLoad: 0
    },
    {
      id: 'mod-garage',
      type: 'garage',
      level: 1,
      operational: true,
      capacity: 2,
      currentLoad: 1
    }
  ]
};

export const INITIAL_OFFICERS: Record<string, Officer> = {
  'off-1': {
    id: 'off-1',
    name: 'Sgt. Marcos Ramos',
    badgeNumber: 'DZ-101',
    rank: 'sergeant',
    status: 'assigned_patrol',
    assignedVehicleId: 'veh-1',
    currentStationId: INITIAL_STATION_ID,
    experience: 240,
    attributes: {
      discipline: 65,
      investigation: 50,
      accuracy: 70,
      leadership: 75,
      integrity: 80
    }
  },
  'off-2': {
    id: 'off-2',
    name: 'Sd. Clara Nunes',
    badgeNumber: 'DZ-102',
    rank: 'officer',
    status: 'assigned_patrol',
    assignedVehicleId: 'veh-1',
    currentStationId: INITIAL_STATION_ID,
    experience: 120,
    attributes: {
      discipline: 80,
      investigation: 60,
      accuracy: 65,
      leadership: 40,
      integrity: 90
    }
  },
  'off-3': {
    id: 'off-3',
    name: 'Sd. Tiago Lima',
    badgeNumber: 'DZ-103',
    rank: 'recruit',
    status: 'idle',
    currentStationId: INITIAL_STATION_ID,
    experience: 40,
    attributes: {
      discipline: 55,
      investigation: 40,
      accuracy: 50,
      leadership: 30,
      integrity: 60 // Suspeita sutil
    }
  },
  'off-4': {
    id: 'off-4',
    name: 'Det. Luísa Prado',
    badgeNumber: 'DZ-104',
    rank: 'detective',
    status: 'idle',
    currentStationId: INITIAL_STATION_ID,
    experience: 310,
    attributes: {
      discipline: 70,
      investigation: 85,
      accuracy: 60,
      leadership: 55,
      integrity: 85
    }
  }
};

export const INITIAL_VEHICLES: Record<string, PoliceVehicle> = {
  'veh-1': {
    id: 'veh-1',
    name: 'Viatura 01 (Sedan)',
    model: 'patrol_car',
    plate: 'DZ-001',
    status: 'parked',
    health: 75,
    speed: 1.8,
    position: { x: 4, y: 4 },
    assignedOfficerIds: ['off-1', 'off-2']
  }
};
