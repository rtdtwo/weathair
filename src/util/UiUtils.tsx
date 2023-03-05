export const getBackgroundColor = (condition: string | undefined | null): string => {
    switch(condition) {
        case 'Fair':
        case 'Clear':
        case 'Mainly Clear':
        case 'Fair and Breezy':
            return 'weather-fair';
        case 'A Few Clouds':
        case 'Partly Cloudy':
            return 'weather-partly-cloudy';
        case 'Mostly Cloudy':
        case 'Mostly Cloudy and Breezy':
        case 'Overcast':
        case 'Fog/Mist':
        case 'Fog':
        case 'Snow Fog':
            return 'weather-cloudy'
        default:
            return '';
    }
}