import { AIRPORTS } from '../data/Data'
import { SearchOption } from '../util/Types';
import { Typeahead } from 'react-bootstrap-typeahead';

const getSearchOptions = (): SearchOption[] => {
    const result: SearchOption[] = []
    AIRPORTS.forEach(airport => {
        if (airport.icao.startsWith('K')) {
            result.push({
                data: airport,
                label: `${airport.city} - ${airport.airport}`,
            })
        }
    })

    result.sort((a, b) => {
        const nameA = a.label.toUpperCase();
        const nameB = b.label.toUpperCase();
        return nameA > nameB ? 1 : nameA < nameB ? -1 : 0
    });

    return result;
}

type SearchProps = {
    onChange: any
}

const Search: React.FunctionComponent<SearchProps> = ({ onChange }) => {
    return <Typeahead
        id="basic-typeahead-single"
        labelKey="label"
        onChange={onChange}
        options={getSearchOptions()}
        placeholder="Search"
    />
}

export default Search;