import axios, { AxiosInstance, AxiosRequestHeaders } from "axios";
import crypto from "crypto";
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
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/json',
      },
    });

    this._client.interceptors.request.use(async (config) => {
      config.headers = (config.headers || {}) as AxiosRequestHeaders;

      if (!config.url?.includes('oauth/token') && 
          !config.url?.includes('oauth/token/new') && 
          !config.url?.includes('anonymous/publicKey')) {
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
        console.error("API Error", error.message, error.response?.status, JSON.stringify(error.response?.data, null, 2));
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


  private async getPublicKey(): Promise<string> {
    const baseUrl = this._baseUrl.endsWith('/') ? this._baseUrl.slice(0, -1) : this._baseUrl;
    const nonce = Date.now();
    const source = 'sunsynk';
    
    // Sign algorithm from SPA JS: MD5(`nonce=${nonce}&source=${source}POWER_VIEW`)
    // The constant "POWER_VIEW" is appended to the query string
    const signString = `nonce=${nonce}&source=${source}POWER_VIEW`;
    const sign = crypto.createHash('md5').update(signString).digest('hex');
    
    const response = await axios.get<{ data: string }>(`${baseUrl}/anonymous/publicKey`, {
      params: {
        source: source,
        nonce: nonce,
        sign: sign,
      },
    });
    
    return response.data.data;
  }

  private encryptPassword(publicKey: string, password: string): string {
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
    const buffer = Buffer.from(password, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    );
    return encrypted.toString('base64');
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

    // Fetch public key for password encryption
    const publicKey = await this.getPublicKey();
    const encryptedPassword = this.encryptPassword(publicKey, this._password);

    try {
      // Generate nonce for token request
      const nonce = Date.now();
      const source = 'sunsynk';
      
      // Sign algorithm from SPA JS reverse-engineering:
      // sign = MD5(`nonce=${nonce}&source=${source}${first10charsOfPublicKey}`)
      const first10Chars = publicKey.substring(0, 10);
      const signString = `nonce=${nonce}&source=${source}${first10Chars}`;
      const sign = crypto.createHash('md5').update(signString).digest('hex');
      
      // Exact field order matching SPA captured request
      const requestBody = {
        sign: sign,
        nonce: nonce,
        username: this._username,
        password: encryptedPassword,
        grant_type: "password",
        client_id: "csp-web",
        source: "sunsynk",
      };
      
      const resp = await this._client.post<TokenApiResponse>('oauth/token/new', requestBody);

      if (!resp.data.success || resp.data.msg !== "Success") {
        throw new AuthenticationError(resp.data.msg || "Authentication failed", resp.data.code);
      }

      this._accessToken = resp.data.data.access_token;
      this._refreshTokenProvider.setRefreshToken(resp.data.data.refresh_token);
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        throw new AuthenticationError(
          errorData?.msg || error.message || "Authentication failed",
          errorData?.code || error.response.status
        );
      }
      throw error;
    }
  }

  private async getTokenWithRefreshToken(): Promise<void> {
    const resp = await this._client.post<TokenApiResponse>('oauth/token', {
      grant_type: "refresh_token",
      refresh_token: this._refreshTokenProvider.getRefreshToken(),
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!resp.data.success) {
      throw new AuthenticationError(resp.data.msg, resp.data.code);
    }

    this._accessToken = resp.data.data.access_token;
    this._refreshTokenProvider.setRefreshToken(resp.data.data.refresh_token);
  }
}