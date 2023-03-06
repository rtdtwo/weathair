import { CurrentWeatherData, Data, WindData } from "../util/Types";

const getTableData = (url: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                const tableRows = Array.from(new DOMParser().parseFromString(html, 'text/html').querySelectorAll('table tr'));
                const tableData = tableRows.map(row => Array.from(row.querySelectorAll('td')).map(td => td?.textContent?.trim()));
                resolve(tableData)
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
        } else {
            if (windData.trim() === 'Calm') {
                wind = 0;
            } else {
                const splitData = splitWindAndDirection(windData);
                wind = splitData.wind;
                direction = splitData.direction;
            }
        }
    }

    return {
        wind: wind,
        gust: gust,
        direction: direction
    }
}

const splitWindAndDirection = (windData: string) => {
    const splitData = windData.trim().split(' ');
    const wind = parseInt(splitData[1])
    
    return { wind: parseInt(splitData[1]), direction: splitData[0] }
}

const parseIntSafely = (data: string | null | undefined): number | null => {
    if (data && data.trim() !== '' && data.trim() !== 'NA') {
        return parseInt(data)
    }
    return null
}

const parseFloatSafely = (data: string | null | undefined): number | null => {
    if (data && data.trim() !== '' && data.trim() !== 'NA') {
        return parseFloat(data)
    }
    return null
}

const getFeelsLike = (windChill: string, heatIndex: string, temperature: string): number | null => {
    let data = parseIntSafely(windChill)
    if (data) return data
    data = parseIntSafely(heatIndex)
    if (data) return data
    data = parseIntSafely(temperature)
    if (data) return data
    return null
}


export const getWeatherData = (icao: string): Promise<Data> => {
    return new Promise((resolve, reject) => {
        getTableData(`https://w1.weather.gov/data/obhistory/${icao}.html`)
            .then(tableData => {
                if (tableData.length === 0) {
                    reject('Empty response')
                } else {
                    const times: (string | null)[] = []
                    const humidities: (number | null)[] = []
                    const temperatures: (number | null)[] = []
                    const pressures: (number | null)[] = []
                    const pressuresInHg: (number | null)[] = []
                    const rainfalls: (number | null)[] = []
                    const feelsLikes: (number | null)[] = []
                    const winds: WindData[] = []

                    const current: CurrentWeatherData = {
                        temperature: null,
                        humidity: null,
                        pressure: null,
                        pressureInHg: null,
                        rainfall: null,
                        feelsLike: null,
                        condition: null,
                        time: null,
                        wind: null
                    }

                    const dataToConsider: any[] = []
                    tableData.forEach(row => {
                        if(row.length === 18) {
                            dataToConsider.push(row)
                        }
                    })

                    const mostRecent = dataToConsider[0]
                    current.time = mostRecent[1]
                    current.temperature = parseIntSafely(mostRecent[6])
                    current.humidity = parseIntSafely(mostRecent[10].replace('%', ''))
                    current.condition = mostRecent[4]
                    current.feelsLike = getFeelsLike(mostRecent[11], mostRecent[12], mostRecent[6])
                    current.pressure = parseIntSafely(mostRecent[14])
                    current.pressureInHg = parseFloatSafely(mostRecent[13])
                    current.rainfall = parseFloatSafely(mostRecent[15])
                    current.wind = getWindAndGust(mostRecent[2])

                    dataToConsider.forEach(row => {
                        times.push(row[1])
                        winds.push(getWindAndGust(row[2]))
                        humidities.push(parseIntSafely(row[10].replace('%', '')))
                        temperatures.push(parseIntSafely(row[6]))
                        pressuresInHg.push(parseFloatSafely(row[13]))
                        pressures.push(parseIntSafely(row[14]))
                        rainfalls.push(parseFloatSafely(row[15]))
                        feelsLikes.push(getFeelsLike(row[11], row[12], row[6]))
                    })

                    resolve({
                        times: times.reverse(),
                        humidities: humidities.reverse(),
                        temperatures: temperatures.reverse(),
                        pressures: pressures.reverse(),
                        pressuresInHg: pressuresInHg.reverse(),
                        rainfalls: rainfalls.reverse(),
                        feelsLikes: feelsLikes.reverse(),
                        winds: winds.reverse(),
                        current: current
                    })
                }
            })
    })
}

