import { CurrentWeather, Observation, WindData, WeatherData } from "../util/Types"

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


/**
 * Get feels like temperature
 * @param windChill Wind chill value
 * @param heatIndex Heat Index value
 * @returns Feels like temperature, or null
 */
const getFeelsLikeTemp = (windChill: number | null, heatIndex: number | null) => {
    if (!windChill && !heatIndex) {
        return null
    } else {
        if (windChill) return windChill
        else return heatIndex
    }
}

/**
 * Extracts the observation history table data 
 * @param url 
 * @returns The table as a parsed javascript object
 */
const getTableData = (url: string): Promise<Array<Observation>> => {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                const table = new DOMParser().parseFromString(html, 'text/html').querySelector('.obs-history')

                if (!table) {
                    resolve([])
                } else {
                    const rows = Array.from(table.querySelectorAll('tbody tr'))

                    const data: Array<Observation | null> = rows.map(row => {
                        const cells = Array.from(row.querySelectorAll('td'))

                        const date = toNumberOrNull(cells[0].textContent?.trim())
                        const time = cells[1].textContent?.trim()
                        const condition = cells[4].textContent?.trim()

                        if (!date || !time) {
                            return null
                        } else {
                            return {
                                timestamp: parseDayTimeToDate(`${date} ${time}`),
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
                    })

                    const dropNaData = data.filter((item): item is Observation => item !== null)
                    resolve(dropNaData)
                }

            })
    })
}

const parseDayTimeToDate = (dayTimeStr: string): Date => {
    const [dayStr, timeStr] = dayTimeStr.split(' ')
    const [hours, minutes] = timeStr.split(':').map(Number)
    let day = parseInt(dayStr, 10)
  
    const now = new Date()
    const year = now.getFullYear()
    let month = now.getMonth()
  
    const lastDayOfCurrentMonth = new Date(year, month + 1, 0).getDate()
  
    if (day > now.getDate()) {
      // If reported day is larger than the current day, move to the previous month
      month = now.getMonth() - 1
  
      // Handle year transition (e.g., moving from January to December)
      if (month < 0) {
        month = 11 // December
      }
    }
  
    // Ensure the reported day does not exceed the last valid day of the month
    if (day > lastDayOfCurrentMonth) {
      // Adjust to the last day of the current month
      day = lastDayOfCurrentMonth
    }
  
    return new Date(year, month, day, hours, minutes)
  }

/**
 * Parses the wind data string to exract the direction, windspeed and gust values.
 * @param windData the raw string data.
 * @returns A WindData object having direction, windspeed and gust.
 */
const getWindAndGust = (windData: string | null | undefined): WindData => {
    let wind: number | null = null
    let direction: string | null = null
    let gust: number | null = null

    if (windData && windData.trim() !== '' && windData.trim() !== 'NA') {
        if (windData.includes('G')) {
            const splitData = windData.split('G')
            const windDir = splitWindAndDirection(splitData[0])
            wind = windDir.wind
            direction = windDir.direction
            gust = parseInt(splitData[1].trim())
        } else if (windData.trim() === 'Calm') {
            wind = 0
        } else {
            const splitData = splitWindAndDirection(windData)
            wind = splitData.wind
            direction = splitData.direction
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
    const splitData = cleaned.trim().split(' ')
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
                        timestamp: new Date(),
                        wind: null
                    }

                    const mostRecent = tableData[0]
                    current.timestamp = mostRecent.timestamp
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

