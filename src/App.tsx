import { useEffect, useState } from 'react';
import { Badge, ButtonGroup, Card, Col, Container, Row, ToggleButton } from 'react-bootstrap';
import Chart from './components/Chart';
import Search from './components/Search';
import { searchAirport } from './data/Data';
import { getWeatherData } from './io/Scraper';
import { addToRecents, getRecents, hasRecents } from './io/Storage';
import { Airport, WeatherData, SearchOption, Observation, ReferenceData } from './util/Types';
import { getBackgroundColor } from './util/UiUtils';
import NavBar from './components/NavBar';
import Settings from './components/Settings';

const App = () => {
	const [selectedAirport, setSelectedAirport] = useState<Airport>()
	const [selectedData, setSelectedData] = useState<WeatherData | undefined>()

	const [showSettings, setShowSettings] = useState<boolean>(false)

	useEffect(() => {
		if (hasRecents()) {
			const r = getRecents();
			setSelectedAirport(r.reverse()[0])
		} else {
			setSelectedAirport(searchAirport('KDCA'))
		}
	}, [])

	useEffect(() => {
		if (selectedAirport) {
			getWeatherData(selectedAirport.icao)
				.then(data => setSelectedData({
					...data,
					observations: data.observations.reverse()
				}))
				.catch(reason => console.warn(reason))
		}
	}, [selectedAirport])

	const generateRecents = () => {
		const recents: Airport[] = getRecents();
		if (recents.length > 0) {
			return recents.reverse().map(airport => {
				return <Badge
					key={airport.icao}
					onClick={() => {
						setSelectedAirport(airport)
					}}
					pill
					bg="secondary"
					className='mx-1'>
					{airport.city + ' (' + airport.icao + ')'}
				</Badge>
			})
		} else {
			return null
		}
	}

	const getAvailablePressure = () => {
		if (selectedData?.current.mslp) {
			return <Badge pill className='mx-1' bg='secondary'>{selectedData?.current.mslp + ' mb'}</Badge>
		} else {
			return null
		}
	}

	const getWindParams = () => {
		if (selectedData?.current.wind) {
			const windData = selectedData.current.wind
			return <Badge pill bg='secondary' className='mx-1'>
				{(!windData.wind || windData.wind === 0) ? 'Calm' : windData.direction + ' ' + windData.wind + ' mph'}
			</Badge>
		} else {
			return null
		}
	}

	const getGustParams = () => {
		if (selectedData?.current.wind) {
			const windData = selectedData.current.wind
			if (windData.gust && windData.gust !== 0) {
				return <Badge pill bg='secondary' className='mx-1'>
					Gust {windData.gust} mph
				</Badge>
			}
		} else {
			return null
		}
	}

	const getChartForData = (x: Date[] | undefined, y: any[] | undefined, type: string, maxValue?: number, minValue?: number) => {
		if (x && y) {
			return <Chart dates={x} values={y} type={type} max={maxValue} min={minValue} />
		}
		return null
	}

	const getAllTime = (observations: Array<Observation>): Array<Date> => {
		return observations.map(obs => obs.timestamp)
	}


	const getAllTemperature = (observations: Array<Observation>): Array<number | null> => {
		return observations.map(obs => obs.temperature)
	}


	const getAllHumidity = (observations: Array<Observation>): Array<number | null> => {
		return observations.map(obs => obs.humidity)
	}


	const getAllMSLP = (observations: Array<Observation>): Array<number | null> => {
		return observations.map(obs => obs.mslp)
	}

	const getAllRainfall = (observations: Array<Observation>): Array<number | null> => {
		return observations.map(obs => obs.rainfall1H)
	}

	const formatDateToDDMMM = (date: Date): string => {
		const day = date.getDate().toString().padStart(2, '0'); // Ensures 2-digit day
		const month = date.toLocaleString('default', { month: 'short' }); // Gets the abbreviated month (e.g., Jan, Feb, Mar)
		return `${day} ${month}`;
	}

	const onOptionsItemSelected = (optionItem: string) => {
		switch (optionItem) {
			case 'settings':
				setShowSettings(true)
				break
			default:
				break
		}
	}

	return <div className='page'>
		<Container fluid>
			<Settings
				show={showSettings}
				onClose={() => {
					setShowSettings(false)
					window.location.reload()
				}} />

			<NavBar
				onSearchItemSelected={(selectedAirport: SearchOption) => {
					setSelectedAirport(selectedAirport.data)
					addToRecents(selectedAirport.data)
				}}
				onOptionsItemSelected={onOptionsItemSelected}
			/>
			{
				hasRecents() ? <Row className='d-none d-md-block recents-container'><Col>{generateRecents()}</Col></Row> : null
			}
			<Row>
				<Col xs={12} className={'p-5 mb-4 ' + getBackgroundColor(selectedData?.current.condition)}>
					<div>
						<h1 className='city-name'>{selectedAirport?.city}</h1>
						<p className='airport-name mt-2'>{`${selectedAirport?.airport} (${selectedAirport?.icao})`} </p>
						<h1 className='current-temp mt-2'>{selectedData?.current.temperature}°</h1>
						<p className='current-condition'>{selectedData?.current.condition}</p>
						{selectedData?.current.feelsLike ? <p className='feels-like mt-3'>Feels like {selectedData?.current.feelsLike}°</p> : null}
						<div className='current-params mt-3'>
							{getWindParams()}
							{getGustParams()}
							<Badge bg='secondary' pill className='mx-1'>RH {selectedData?.current.humidity}%</Badge>{' '}
							{getAvailablePressure()}
						</div>
					</div>
				</Col>
				<Col xs={12} className={'px-4'}>
					{selectedData?.observations ?
						<>
							<Card className='pe-4 pt-4 pb-2 ps-0 mb-3'>
								<h6 className='ms-4 mb-3'>Temperature ({selectedData.metricUnits ? 'C' : 'F'})</h6>
								{
									getChartForData(
										getAllTime(selectedData?.observations),
										getAllTemperature(selectedData?.observations), 'line'
									)
								}
							</Card>
							<Card className='pe-4 pt-4 pb-2 ps-0 mb-3'>
								<h6 className='ms-4 mb-3'>Relative Humidity (%)</h6>
								{getChartForData(
									getAllTime(selectedData?.observations),
									getAllHumidity(selectedData?.observations),
									'line', 100, 0)}
							</Card>
							<Card className='pe-4 pt-4 pb-2 ps-0 mb-3'>
								<h6 className='ms-4 mb-3'>Precipitation ({selectedData.metricUnits ? 'cm' : 'in'})</h6>
								{getChartForData(
									getAllTime(selectedData?.observations),
									getAllRainfall(selectedData?.observations),
									'bar'
								)}
							</Card>
							<Card className='pe-4 pt-4 pb-2 ps-0 mb-3'>
								<h6 className='ms-4 mb-3'>Pressure (mb)</h6>
								{getChartForData(
									getAllTime(selectedData?.observations),
									getAllMSLP(selectedData?.observations),
									'line'
								)}
							</Card>
						</>
						: null
					}

				</Col>
			</Row>
			<Row>
				<Col className='p-4'>
					<p className='text-justify'>Developed by <a href='https://rishabh.blog' target='_blank'>Rishabh Tatiraju</a>, an <a href='https://github.com/rtdtwo/weathair' target='_blank'>open source</a> project. This is a visualization of public domain weather data provided by the NWS and NOAA. No data is modified by the creator of this website, except for unit conversions wherever necessary. As such, this data should not be taken as weather advice during emergencies. No guarantees of data accuracy are made. To report any problems with the website, <a href="https://github.com/rtdtwo/weathair/issues" target='_blank'>raise an issue on GitHub</a>.</p>
					<p className='text-justify'><b>City not listed?</b> Go to this <a href='https://w1.weather.gov/data/obhistory/KGNV.html' target='_blank'>website</a>. Search for your city. If NOAA shows the weather data, then <a href="https://github.com/rtdtwo/weathair/issues" target='_blank'>raise an issue on GitHub</a> requesting the addition of the city.</p>
				</Col>
			</Row>
		</Container>
	</div>
}

export default App;
