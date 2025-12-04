export interface Parcel {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  area?: number;
  lastIrrigatedAt?: string;
  lastFertilizedAt?: string;
  farmId: number;
  farmName?: string;
  cropId?: number;
  cropName?: string;
}

export interface ParcelRequest {
  name: string;
  latitude?: number;
  longitude?: number;
  area?: number;
  farmId: number;
  cropId?: number;
}

export interface ParcelWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  rain: boolean;
  rainAmount?: number;
}

