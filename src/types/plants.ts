
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
  updateAt: Date;
  createAt: Date;
  type: number;
  masterId: number;
  share: boolean;
  plantPermission: string[];
  existCamera: boolean;
}

export interface PlantPayload {
  pageSize: number;
  pageNumber: number;
  total: number;
  infos: PlantInfo[];
}

