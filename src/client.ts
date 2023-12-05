import axios, { AxiosInstance, AxiosRequestHeaders } from "axios";
import { AuthenticationError } from "./errors";
import { CheckDeviceApiResponse, DayEnergyApiResponse, EventCountApiResponse, FlowApiResponse, GenerationUseApiResponse, InverterCountApiResponse, InvertersApiResponse, MessagesCountApiResponse, NoticesApiResponse, PermissionsApiResponse, PlantApiResponse, PlantsApiResponse, RealtimeDataApiResponse, TokenApiResponse, UserApiResponse, WeatherApiResponse, WeatherStationProductApiResponse } from "./types";
import { DefaultRefreshTokenProvider, RefreshTokenProvider } from "./RefreshTokenProvider";

export class Client {

  private readonly _lan: string = 'en';
  private readonly _client: AxiosInstance;
  private _accessToken: string | undefined;
  private _username: string | undefined;
  private _password: string | undefined;
  private _refreshTokenProvider: RefreshTokenProvider;

  constructor(username?: string, password?: string, refreshTokenProvider: RefreshTokenProvider = new DefaultRefreshTokenProvider(),
    private readonly _baseUrl: string = 'https://api.sunsynk.net/', private readonly _clientId: string = "api") {

    this._username = username;
    this._password = password;
    this._refreshTokenProvider = refreshTokenProvider;

    this._client = axios.create({
      baseURL: this._baseUrl,
    });

    this._client.interceptors.request.use(async (config) => {
      config.headers = (config.headers || {}) as AxiosRequestHeaders;

      if (!config.url?.includes('oauth/token')) {
        if (!this._accessToken) {
          await this.updateTokens();
        }
        config.headers['Authorization'] = `Bearer ${this._accessToken}`;
      }
      return config;
    });

    // TODO: Handle success = false here?
    this._client.interceptors.response.use(async (response) => response, async (error) => {
      if (error) {
        console.error("API Error", error.message, error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
          await this.updateTokens();
          return await this._client(error.config);
        }
      }
      return Promise.reject(error);
    });
  }

  setRefreshTokenProvider(refreshTokenProvider: RefreshTokenProvider) {
    this._refreshTokenProvider = refreshTokenProvider;
  }

  setCredentials(username: string, password: string) {
    this._username = username;
    this._password = password;
  }

  async getUser() {
    return (await this._client.get<UserApiResponse>(`/api/v1/user?lan=${this._lan}`)).data.data;
  }

  async getPlants(page: number = 1, limit: number = 10) {
    return (await this._client.get<PlantsApiResponse>(`/api/v1/plants?page=${page}&limit=${limit}`)).data.data;
  }

  async getFlow(plantId: number, date: Date) {
    return (await this._client.get<FlowApiResponse>(`/api/v1/plant/energy/${plantId}/flow?date=${date.toISOString().split('T')[0]}`)).data.data;
  }

  async getDetailedFlow(inverterId: number) {
    return (await this._client.get<FlowApiResponse>(`/api/v1/inverter/${inverterId}/flow`)).data.data;
  }

  async getPermissions() {
    return (await this._client.get<PermissionsApiResponse>(`/api/v1/permission?lan=${this._lan}`)).data.data;
  }

  async getEventCount(plantId: number) {
    return (await this._client.get<EventCountApiResponse>(`/api/v1/plant/${plantId}/eventCount`)).data.data;
  }

  async getInverterCount(plantId: number) {
    return (await this._client.get<InverterCountApiResponse>(`/api/v1/plant/${plantId}/inverterCount`)).data.data;
  }

  async getInverters(plantId: number, page: number = 1, limit: number = 10, status: number = -1, sn: string = '', type: number = -2) {
    return (await this._client.get<InvertersApiResponse>(`/api/v1/plant/${plantId}/inverters?page=${page}&limit=${limit}&status=${status}&sn=${sn}&id=${plantId}&type=${type}`)).data.data;
  }

  async getWeatherStationProduct(plantId: number) {
    return (await this._client.get<WeatherStationProductApiResponse>(`/api/v1/getWeatherStationProduct?stationId=${plantId}`)).data.data;
  }

  async getMessagesCount() {
    return (await this._client.get<MessagesCountApiResponse>(`/api/v1/message/count`)).data.data;
  }

  async getCheckDevice(plantId: number) {
    return (await this._client.get<CheckDeviceApiResponse>(`/api/v1/plant/${plantId}/check/device?stationId=${plantId}`)).data.data;
  }

  async getRealtimeData(plantId: number) {
    return (await this._client.get<RealtimeDataApiResponse>(`/api/v1/plant/${plantId}/realtime?id=${plantId}`)).data.data;
  }

  async getPlant(plantId: number) {
    return (await this._client.get<PlantApiResponse>(`/api/v1/plant/${plantId}?lan=${this._lan}&id=${plantId}`)).data.data;
  }

  async getGenerationUse(plantId: number) {
    return (await this._client.get<GenerationUseApiResponse>(`/api/v1/plant/energy/${plantId}/generation/use`)).data.data;
  }

  async getWeather(date: Date, lat: number, lon: number) {
    return (await this._client.get<WeatherApiResponse>(`/api/v1/weather?lan=${this._lan}&date=${date.toISOString().split('T')[0]}&lonLat=${lat},${lon}`)).data.data;
  }

  async getNotices(date: Date, scope: number) {
    return (await this._client.get<NoticesApiResponse>(`/api/v1/ss/notices/view?date=${date.toISOString().split('T')[0]}&scope=${scope}`)).data.data;
  }

  async getEnergyByDay(plantId: number, date: Date) {
    return (await this._client.get<DayEnergyApiResponse>(`/api/v1/plant/energy/${plantId}/day?lan=${this._lan}&date=${date.toISOString().split('T')[0]}&id=${plantId}`)).data.data;
  }


  private async updateTokens(): Promise<void> {
    if (this._refreshTokenProvider.getRefreshToken()) {
      return await this.getTokenWithRefreshToken();
    }
    return await this.getTokenWithCredentials();
  }

  private async getTokenWithCredentials(): Promise<void> {
    if (!this._username || !this._password) {
      throw new AuthenticationError("No credentials set");
    }

    const resp = await axios.post<TokenApiResponse>('oauth/token', {
      "username": this._username,
      "password": this._password,
      "grant_type": "password",
      "client_id": this._clientId,
    }, { baseURL: this._baseUrl });

    if (!resp.data.success) {
      throw new AuthenticationError(resp.data.msg, resp.data.code);
    }

    this._accessToken = resp.data.data.access_token;
    this._refreshTokenProvider.setRefreshToken(resp.data.data.refresh_token);

  }

  private async getTokenWithRefreshToken(): Promise<void> {
    const resp = await this._client.post<TokenApiResponse>('oauth/token', {
      grant_type: "refresh_token",
      refresh_token: this._refreshTokenProvider.getRefreshToken(),
    });

    if (!resp.data.success) {
      throw new AuthenticationError(resp.data.msg, resp.data.code);
    }

    this._accessToken = resp.data.data.access_token;
    this._refreshTokenProvider.setRefreshToken(resp.data.data.refresh_token);
  }
}