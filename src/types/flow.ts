
  export interface FlowPayload {
      custCode: number;
      meterCode: number;
      pvPower: number;
      battPower: number;
      gridOrMeterPower: number;
      loadOrEpsPower: number;
      genPower: number;
      minPower: number;
      soc: number;
      pvTo: boolean;
      toLoad: boolean;
      toGrid: boolean;
      toBat: boolean;
      batTo: boolean;
      gridTo: boolean;
      genTo: boolean;
      minTo: boolean;
      existsGen: boolean;
      existsMin: boolean;
      genOn: boolean;
      microOn: boolean;
      existsMeter: boolean;
      bmsCommFaultFlag: boolean;
      pv?: {
        power: number,
        toInv: boolean
      }[];
      existThinkPower: boolean;
  }


