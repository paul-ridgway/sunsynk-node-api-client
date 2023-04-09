export interface EventCountPayload {
  warning: number,
  fault: number,
  updateAt: string;
}

export interface InverterCountPayload {
  warning: number,
  fault: number,
  updateAt: string,
  total: number,
  normal: number,
  offline: number;
}

