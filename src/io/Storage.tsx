import { Airport } from "../util/Types";

export const getRecents = () : Airport[] => {
    const result = localStorage.getItem('recents');
    if (result) return JSON.parse(result)
    else return []
}

export const addToRecents = (airport: Airport) => {
    const recents = getRecents();
    let indexToRemove = -1;

    for (let index = 0; index < recents.length; index++) {
        const element = recents[index];
        if(airport.icao === element.icao) {
            indexToRemove = index
            break;
        }
    }

    if(indexToRemove !== -1) {
        recents.splice(indexToRemove, 1)
    }
    
    recents.push(airport)
    localStorage.setItem('recents', JSON.stringify(recents))
}

export const hasRecents = () => {
    return getRecents().length > 0;
}