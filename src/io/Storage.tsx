import { Airport, SettingsValues } from "../util/Types";

export const getRecents = (): Airport[] => {
    const result = localStorage.getItem('recents');
    if (result) return JSON.parse(result)
    else return []
}

export const addToRecents = (airport: Airport) => {
    const recents = getRecents();
    let indexToRemove = -1;

    for (let index = 0; index < recents.length; index++) {
        const element = recents[index];
        if (airport.icao === element.icao) {
            indexToRemove = index
            break;
        }
    }

    if (indexToRemove !== -1) {
        recents.splice(indexToRemove, 1)
    }

    recents.push(airport)
    localStorage.setItem('recents', JSON.stringify(recents))
}

export const hasRecents = () => {
    return getRecents().length > 0;
}

export const getSettingsValues = (): SettingsValues => {
    const settingsJson = localStorage.getItem('settings')
    if (settingsJson) return JSON.parse(settingsJson)
    else return { useMetric: false, homeOnStartup: false, alwaysShowFavorites: false }
}

export const putSettingsValues = (settingsValues: SettingsValues) => {
    localStorage.setItem('settings', JSON.stringify(settingsValues))
}