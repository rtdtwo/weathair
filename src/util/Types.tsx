
export type SettingsProps = {
    show: boolean,
    onClose: any,
}

export type SettingsItemProps = {
    className: string|undefined,
    id: string,
    headline: string,
    text: string | null,
    checked: any,
    onChange: any
}

export type SettingsValues = {
    useMetric: boolean,
    homeOnStartup: boolean,
    alwaysShowFavorites: boolean
}

export type Airport = {
    city: string,
    faa: string,
    iata: string,
    icao: string,
    airport: string,
    role: string,
    enplanements: string
}

export type WeatherData = {
    current: CurrentWeather,
    observations: Array<Observation>,
    metricUnits: boolean
}

export type ReferenceData = {
    date: string | null,
    timestamp: Date
}

export type Observation = {
    timestamp: Date,
    humidity: number | null,
    temperature: number | null,
    dewPoint: number | null,
    condition: string | null,
    feelsLike: number | null,
    mslp: number | null,
    visibility: number | null,
    rainfall1H: number | null,
    wind: WindData | null
}

export type CurrentWeather = {
    temperature: number | null,
    humidity: number | null,
    mslp: number | null,
    feelsLike: number | null,
    condition: string | null,
    timestamp: Date,
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