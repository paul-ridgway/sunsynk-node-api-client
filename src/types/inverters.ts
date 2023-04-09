export interface InvertersPayload {
  pageSize:   number;
  pageNumber: number;
  total:      number;
  infos:      InverterInfo[];
}

export interface InverterInfo {
  sn:                 string;
  alias:              string;
  gsn:                string;
  status:             number;
  type:               number;
  commTypeName:       string;
  custCode:           number;
  version:            Version;
  model:              string;
  equipMode:          null;
  pac:                number;
  etoday:             number;
  etotal:             number;
  updateAt:           Date;
  opened:             number;
  plant:              Plant;
  gatewayVO:          GatewayVO;
  sunsynkEquip:       boolean;
  protocolIdentifier: string;
  equipType:          number;
  ratePower:          number;
}

export interface GatewayVO {
  gsn:    string;
  status: number;
}

export interface Plant {
  id:        number;
  name:      string;
  type:      number;
  master:    null;
  installer: null;
  email:     null;
  phone:     null;
}

export interface Version {
  masterVer: string;
  softVer:   string;
  hardVer:   string;
  hmiVer:    string;
  bmsVer:    string;
}
