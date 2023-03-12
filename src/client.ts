import axios, { AxiosInstance, AxiosRequestHeaders } from "axios";
import { FlowApiResponse, PlantApiResponse, TokenApiResponse, UserApiResponse } from "./types";

export class Client {

  private readonly _baseUrl: string = 'https://pv.inteless.com/';
  private readonly _client: AxiosInstance;
  private _accessToken: string | undefined;
  private _refreshToken: string | undefined;

  constructor(private readonly _username: string, private readonly _password: string) {
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

  async getUser() {
    return (await this._client.get<UserApiResponse>('/api/v1/user?lan=en')).data;
  }

  async getPlants(page: number = 1, limit: number = 10) {
    return (await this._client.get<PlantApiResponse>(`/api/v1/plants?page=${page}&limit=${limit}`)).data;
  }

  async getFlow(plantId: number, date: Date) {
    return (await this._client.get<FlowApiResponse>(`/api/v1/plant/energy/${plantId}/flow?date=${date.toDateString()}`)).data;
  }

  private async updateTokens(): Promise<void> {
    if (this._refreshToken) {
      console.log("Getting new token with refresh token");
      // TODO: Handle failure
      return await this.getTokenWithRefreshToken();
    }

    console.log("No refresh token, getting new token with credentials");
    return await this.getTokenWithCredentials();
  }

  private async getTokenWithCredentials(): Promise<void> {
    const resp = await axios.post<TokenApiResponse>('oauth/token', {
      "username": this._username,
      "password": this._password,
      "grant_type": "password",
      "client_id": "api"
    }, { baseURL: this._baseUrl });
    console.log("Token response:", resp.data.data.access_token);
    if (resp.data.success) {
      this._accessToken = resp.data.data.access_token;
      this._refreshToken = resp.data.data.refresh_token;
    }
    // TODO: Check succcess?
  }

  private async getTokenWithRefreshToken(): Promise<void> {
    const resp = await this._client.post<TokenApiResponse>('oauth/token', {
      grant_type: "refresh_token",
      refresh_token: this._refreshToken
    });

    if (resp.data.success) {
      this._accessToken = resp.data.data.access_token;
      this._refreshToken = resp.data.data.refresh_token;
    }
    // TODO: Check succcess?
  }
}