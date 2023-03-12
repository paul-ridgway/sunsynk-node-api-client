export interface WeatherStationProductPayload {
  id: number;
  productName: string;
  icon: string;
  status?: any;
  apiKey?: any;
  appKey?: any;
}

export interface WeatherPayload {
  currWea: {
    desc: string;
    currTemp: string;
    windSpeed: string;
    windDirection: string;
    sunrise: string;
    sunset: string;
    iconUrl: string;
    tempMinC: string;
    tempMaxC: string;
  };
}