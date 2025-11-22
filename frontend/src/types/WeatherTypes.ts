export interface WeatherResponse {
    latitude: number;
    longitude: number;
    elevation: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    hourly?: HourlyData;
    daily?: DailyData;
    current_weather?: CurrentWeather;
}

export interface HourlyData {
    time: string[];
    temperature_2m?: number[];
    precipitation?: number[];
    windspeed_10m?: number[];
    cloudcover?: number[];
    weathercode?: number[];
}

export interface DailyData {
    time: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    windspeed_10m_max?: number[];
}

export interface CurrentWeather {
    time: string;
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
}
