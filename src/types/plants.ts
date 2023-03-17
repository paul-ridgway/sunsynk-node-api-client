
export interface PlantInfo {
  id: number;
  name: string;
  thumbUrl: string;
  status: number;
  address: string;
  pac: number;
  efficiency: number;
  etoday: number;
  etotal: number;
  updateAt: string;
  createAt: Date;
  type: number;
  masterId: number;
  share: boolean;
  plantPermission: string[];
  existCamera: boolean;
}

export interface PlantsPayload {
  pageSize: number;
  pageNumber: number;
  total: number;
  infos: PlantInfo[];
}

export interface CheckDevicePayload {
  meter: boolean,
  battery: boolean,
  meteorological: boolean;
}

export interface RealtimeDataPayload {
  pac: number;
  etoday: number;
  emonth: number;
  eyear: number;
  etotal: number;
  income: number;
  efficiency: number;
  updateAt: string;
  currency: Currency;
  totalPower: number;
}


export interface Charge {
  id: number;
  startRange: string;
  endRange: string;
  price: number;
  type: number;
  stationId: number;
  createAt: Date;
}

export interface Master {
  id: number;
  nickname: string;
  mobile?: any;
}

export interface Currency {
  id: number;
  code: string;
  text: string;
}

export interface Timezone {
  id: number;
  code: string;
  text: string;
}

export interface PlantPayload {
  id: number;
  name: string;
  totalPower: number;
  thumbUrl: string;
  joinDate: Date;
  type: number;
  status: number;
  charges: Charge[];
  products?: any;
  lon: number;
  lat: number;
  address: string;
  master: Master;
  currency: Currency;
  timezone: Timezone;
  realtime: RealtimeDataPayload;
  createAt: Date;
  phone: string;
  email: string;
  installer: string;
  principal: string;
  plantPermission: string[];
  invest: number;
}

export interface GenerationUsePayload {
  load: number,
  pv: number,
  batteryCharge: number,
  gridSell: number;
}
