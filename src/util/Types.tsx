export type Airport = {
    city: string,
    faa: string,
    iata: string,
    icao: string,
    airport: string,
    role: string,
    enplanements: string
}

export type Data = {
    times: (string | null)[],
    humidities: (number | null)[],
    temperatures: (number | null)[],
    pressures: (number | null)[],
    pressuresInHg: (number | null)[],
    rainfalls: (number | null)[],
    feelsLikes: (number | null)[],
    winds: WindData[]
    current: CurrentWeatherData
}

export type CurrentWeatherData = {
    temperature: number | null,
    humidity: number | null,
    pressure: number | null,
    pressureInHg: number | null,
    rainfall: number | null,
    feelsLike: number | null,
    condition: string | null,
    time: string | null,
    wind: WindData | null
}

export type SearchOption = {
    data: Airport,
    label: string
}

export type WindData = {
    wind: number | null,
    gust: number | null,
    direction: string | null
}