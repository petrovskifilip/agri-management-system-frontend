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
  // Parcel information
  parcelId: number;
  parcelName: string;
  latitude: number;
  longitude: number;

  // Current conditions
  weatherCondition: string;        // e.g., "Rain", "Clear", "Clouds"
  weatherDescription: string;      // e.g., "light rain", "clear sky"
  weatherIcon: string;             // Icon code from API

  // Temperature (in Celsius)
  temperature: number;
  feelsLike: number;

  // Atmospheric conditions
  humidity: number;                // Percentage
  pressure: number;                // hPa

  // Wind
  windSpeed: number;               // m/s

  // Rain
  rainExpectedInOneHour: number;   // mm expected in next hour (0 if no rain expected)

  // Cloud coverage
  cloudiness: number;              // Percentage

  // Visibility
  visibility: number;              // Meters

  // Location name from weather API
  locationName: string;
  country: string;
}



