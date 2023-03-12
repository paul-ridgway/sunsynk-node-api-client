
  export interface Permission {
      id: number;
      name: string;
      permission: string;
      type: number;
      children?: Permission[];
  }

  export interface PermissionsPayload {
      id: number;
      name: string;
      permission: string;
      type: number;
      children: Permission[];
  }

