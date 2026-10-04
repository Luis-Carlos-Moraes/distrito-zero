export type GameCommand =
  | {
      type: 'DISPATCH_UNIT';
      incidentId: string;
      vehicleId: string;
    }
  | {
      type: 'ASSIGN_OFFICER_TO_VEHICLE';
      officerId: string;
      vehicleId: string;
    }
  | {
      type: 'REMOVE_OFFICER_FROM_VEHICLE';
      officerId: string;
      vehicleId: string;
    }
  | {
      type: 'HIRE_OFFICER';
      stationId: string;
      officerName?: string;
    }
  | {
      type: 'PURCHASE_VEHICLE';
      stationId: string;
      model: 'patrol_car' | 'suv' | 'tactical_van' | 'motorcycle';
    }
  | {
      type: 'UPGRADE_STATION_MODULE';
      stationId: string;
      moduleType: string;
    };
