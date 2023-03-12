import { EventCountPayload, InverterCountPayload } from "./counts";
import { DayEnergyPayload } from "./energy";
import { FlowPayload } from "./flow";
import { PermissionsPayload } from "./permissions";
import { CheckDevicePayload, GenerationUsePayload, PlantPayload, PlantsPayload, RealtimeDataPayload } from "./plants";
import { TokenResponsePayload } from "./tokens";
import { UserPayload } from "./user";
import { WeatherPayload, WeatherStationProductPayload } from "./weather";

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  success: boolean;
}

export type TokenApiResponse = ApiResponse<TokenResponsePayload>;
export type PlantsApiResponse = ApiResponse<PlantsPayload>;
export type UserApiResponse = ApiResponse<UserPayload>;
export type FlowApiResponse = ApiResponse<FlowPayload>;
export type PermissionsApiResponse = ApiResponse<PermissionsPayload>;
export type EventCountApiResponse = ApiResponse<EventCountPayload>;
export type InverterCountApiResponse = ApiResponse<InverterCountPayload>;
export type WeatherStationProductApiResponse = ApiResponse<WeatherStationProductPayload[]>;
export type MessagesCountApiResponse = ApiResponse<number>;
export type NoticesApiResponse = ApiResponse<any>; // No example of the response payload
export type CheckDeviceApiResponse = ApiResponse<CheckDevicePayload>;
export type RealtimeDataApiResponse = ApiResponse<RealtimeDataPayload>;
export type PlantApiResponse = ApiResponse<PlantPayload>;
export type GenerationUseApiResponse = ApiResponse<GenerationUsePayload>;
export type WeatherApiResponse = ApiResponse<WeatherPayload>;
export type DayEnergyApiResponse = ApiResponse<DayEnergyPayload>;