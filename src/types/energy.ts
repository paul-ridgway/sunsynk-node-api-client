export interface DayEnergyPayload {
  infos: Info[];

}

interface Record {
  time: string;
  value: string;
  updateTime?: any;
}

interface Info {
  unit: string;
  records: Record[];
  id?: any;
  label: string;
  groupCode?: any;
  name?: any;
}

