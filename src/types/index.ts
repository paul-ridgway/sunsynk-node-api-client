import { FlowPayload } from "./flow";
import { PlantPayload } from "./plants";
import { TokenResponsePayload } from "./tokens";
import { UserPayload } from "./user";

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  success: boolean;
}

export type TokenApiResponse = ApiResponse<TokenResponsePayload>;
export type PlantApiResponse = ApiResponse<PlantPayload>;
export type UserApiResponse = ApiResponse<UserPayload>;
export type FlowApiResponse = ApiResponse<FlowPayload>;