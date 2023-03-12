export interface EventCountPayload {
  warning: number,
  fault: number,
  updateAt: Date;
}

export interface InverterCountPayload {
  warning: number,
  fault: number,
  updateAt: Date,
  total: number,
  normal: number,
  offline: number;
}