import { CurrentWeather, Observation, WindData, WeatherData } from "../util/Types";

/**
 * Convert a string to a number, or return null if invalid
 * @param str - The input string
 * @returns number or null
 */
const toNumberOrNull = (str: string | null | undefined): number | null => {
    if (!str) return null

    const num = Number(str)
    return isNaN(num) ? null : num
}

const getFeelsLikeTemp = (windChill: number | null, heatIndex: number | null) => {
    if (!windChill && !heatIndex) {
        return null
    } else {
        if (windChill) return windChill
        else return heatIndex
    }
}

const getTableData = (url: string): Promise<Array<Observation>> => {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                const table = new DOMParser().parseFromString(html, 'text/html').querySelector('.obs-history')

                if (!table) {
                    resolve([])
                } else {
                    const rows = Array.from(table.querySelectorAll('tbody tr'));

                    const data: Array<Observation | null> = rows.map(row => {
                        const cells = Array.from(row.querySelectorAll('td'));

                        const timestamp = cells[1].textContent?.trim()
                        const condition = cells[4].textContent?.trim()

                        if (!timestamp) {
                            return null
                        } else {
                            return {
                                time: timestamp,
                                temperature: toNumberOrNull(cells[6].textContent?.trim()),
                                dewPoint: toNumberOrNull(cells[7].textContent?.trim()),
                                humidity: toNumberOrNull(cells[10].textContent?.trim().replace('%', '')),
                                feelsLike: getFeelsLikeTemp(toNumberOrNull(cells[11].textContent?.trim()), toNumberOrNull(cells[12].textContent?.trim())),
                                wind: getWindAndGust(`${cells[2].textContent?.trim()}`),
                                visibility: toNumberOrNull(cells[3].textContent?.trim()),
                                condition: condition ? condition : null,
                                mslp: toNumberOrNull(cells[14].textContent?.trim()),
                                rainfall1H: toNumberOrNull(cells[15].textContent?.trim())
                            }
                        }
                    });

                    const dropNaData = data.filter((item): item is Observation => item !== null)
                    resolve(dropNaData)
                }

            });
    });
}


const getWindAndGust = (windData: string | null | undefined): WindData => {
    let wind: number | null = null
    let direction: string | null = null
    let gust: number | null = null

    if (windData && windData.trim() !== '' && windData.trim() !== 'NA') {
        if (windData.includes('G')) {
            const splitData = windData.split('G');
            const windDir = splitWindAndDirection(splitData[0]);
            wind = windDir.wind;
            direction = windDir.direction;
            gust = parseInt(splitData[1].trim());
        } else if (windData.trim() === 'Calm') {
            wind = 0;
        } else {
            const splitData = splitWindAndDirection(windData);
            wind = splitData.wind;
            direction = splitData.direction;
        }
    }

    return {
        wind: wind,
        gust: gust,
        direction: direction
    }
}

const splitWindAndDirection = (directionAndWind: string) => {
    const cleaned = directionAndWind.replace(/[\s\r\n]+/g, ' ')
    const splitData = cleaned.trim().split(' ');
    return { wind: parseInt(splitData[1]), direction: splitData[0] }
}

export const getWeatherData = (icao: string): Promise<WeatherData> => {
    return new Promise((resolve, reject) => {
        getTableData(`https://forecast.weather.gov/data/obhistory/${icao}.html`)
            .then(tableData => {
                if (tableData.length === 0) {
                    reject('Empty response')
                } else {
                    const current: CurrentWeather = {
                        temperature: null,
                        humidity: null,
                        mslp: null,
                        feelsLike: null,
                        condition: null,
                        time: null,
                        wind: null
                    }

                    const mostRecent = tableData[0]
                    current.time = mostRecent.time
                    current.temperature = mostRecent.temperature
                    current.humidity = mostRecent.humidity
                    current.condition = mostRecent.condition
                    current.feelsLike = mostRecent.feelsLike
                    current.mslp = mostRecent.mslp
                    current.wind = mostRecent.wind

                    resolve({
                        current: current,
                        observations: tableData
                    })
                }
            })
    })
}

