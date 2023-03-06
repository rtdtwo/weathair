import { useEffect, useState } from 'react';
import { Badge, Card, Col, Container, Row } from 'react-bootstrap';
import Chart from './components/Chart';
import Search from './components/Search';
import { searchAirport } from './data/Data';
import { getWeatherData } from './io/Scraper';
import { addToRecents, getRecents, hasRecents } from './io/Storage';
import { Airport, Data, SearchOption } from './util/Types';
import { getBackgroundColor } from './util/UiUtils';

const App = () => {
	const [selectedAirport, setSelectedAirport] = useState<Airport>()
	const [selectedData, setSelectedData] = useState<Data | undefined>()

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
				.then(data => setSelectedData(data))
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
		if (selectedData?.current.pressure) {
			return <Badge pill className='mx-1' bg='secondary'>{selectedData?.current.pressure + ' mb'}</Badge>
		} else if (selectedData?.current.pressureInHg) {
			return <Badge pill className='mx-1' bg='secondary'>{selectedData?.current.pressureInHg + ' inHg'}</Badge>
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

	const getChartForData = (x: any[] | undefined, y: any[] | undefined, type: string, maxValue?: number, minValue?: number) => {
		if (x && y) {
			return <Chart keys={x} values={y} type={type} max={maxValue} min={minValue} />
		}
		return null
	}

	return <div className='page'>
		<Container fluid>
			<Row className='m-0 mx-md-3 mx-lg-5 mb-3'>
				<Col xs={12} md={6} lg={4} className='mt-3'>
					<img className='logo m-auto m-md-0' src='/weathair/logo.png' alt='Logo of WeathAir' />
				</Col>
				<Col xs={12} md={6} lg={{ span: 4, offset: 4 }} className='mt-3'>
					<Search onChange={(selectedItems: SearchOption[]) => {
						if (selectedItems[0]) {
							setSelectedAirport(selectedItems[0].data)
							addToRecents(selectedItems[0].data)
						}
					}} />
				</Col>
			</Row>
			<Row className='d-none d-md-block recents'>
				<Col>
					{generateRecents()}
				</Col>
			</Row>
			<Row>
				<Col xs={12} className={'p-5 mb-4 ' + getBackgroundColor(selectedData?.current.condition)}>
					<div>
						<h1 className='city-name'>{selectedAirport?.city}</h1>
						<p className='airport-name mt-2'>{`${selectedAirport?.airport} (${selectedAirport?.icao})`} </p>
						<h1 className='current-temp mt-2'>{selectedData?.current.temperature}°</h1>
						<p className='current-condition'>{selectedData?.current.condition}</p>
						<p className='feels-like mt-3'>Feels like {selectedData?.current.feelsLike}°</p>
						<div className='current-params mt-3'>
							{getWindParams()}
							{getGustParams()}
							<Badge bg='secondary' pill className='mx-1'>RH {selectedData?.current.humidity}%</Badge>{' '}
							{getAvailablePressure()}
						</div>
					</div>
				</Col>
				<Col xs={12} className={'px-4'}>
					<Card className='pe-4 pt-4 pb-2 ps-0 mb-3'>
						<h6 className='ms-4 mb-3'>Temperature</h6>
						{getChartForData(selectedData?.times, selectedData?.temperatures, 'line')}
					</Card>

					<Card className='pe-4 pt-4 pb-2 ps-0 mb-3'>
						<h6 className='ms-4 mb-3'>Relative Humidity</h6>
						{getChartForData(selectedData?.times, selectedData?.humidities, 'line', 100, 0)}
					</Card>

					<Card className='pe-4 pt-4 pb-2 ps-0 mb-3'>
						<h6 className='ms-4 mb-3'>Precipitation</h6>
						{getChartForData(selectedData?.times, selectedData?.rainfalls, 'bar')}
					</Card>

					<Card className='pe-4 pt-4 pb-2 ps-0 mb-3'>
						<h6 className='ms-4 mb-3'>Pressure</h6>
						{getChartForData(selectedData?.times, selectedData?.pressures, 'line')}
					</Card>
				</Col>
			</Row>
			<Row>
				<Col className='p-4'>
					<small><small>
						<p className='text-center'>Developed by <a href='https://rishabh.blog' target='_blank'>Rishabh Tatiraju</a>, an <a href='https://github.com/rtdtwo/weathair' target='_blank'>open source</a> project. This is a visualization of public domain weather data provided by the NWS and NOAA. No data is modified by the creator of this website, except for unit conversions wherever necessary. As such, this data should not be taken as weather advice during emergencies. No guarantees of data accuracy are made. To report any problems with the website, <a href="https://github.com/rtdtwo/weathair/issues" target='_blank'>raise an issue on GitHub</a>, or email me at <a href="mailto:tatiraju.rishabh@gmail.com" target='_blank'>tatiraju.rishabh@gmail.com.</a></p>
					</small></small>
				</Col>
			</Row>
			<Row className='p-5'>
				<Col>
					<h4 className='mb-4'>Some FAQs (or just Qs that nobody asked)</h4>

					<h5>I already have XYZ weather app, why should I use this?</h5>
					<p className='text-justify'>Don't. I don't care. I built this because I asked myself, instead of me using Python to scrape the NOAA website, can I do that in client-side JS, and hence not worry about server hosting and security? Turns out, the answer was yes, and behold this website. WeathAir wasn't for a specific use anyway, but it is helpful - most of those XYZ weather apps don't provide past weather data. I'm that kind of a person who thinks, "Oh it's chilly today, I wonder what the wind chill is..." while randomly walking on the street. This website serves that purpose.</p>

					<h5>I don't see my city here, why?</h5>
					<p className='text-justify'>Go to this <a href='https://w1.weather.gov/data/obhistory/KGNV.html' target='_blank'>website</a>. Search for your city. If NOAA shows the weather data, then <a href="https://github.com/rtdtwo/weathair/issues" target='_blank'>raise an issue on GitHub</a> saying "Please add this city".</p>
				</Col>
			</Row>
		</Container>
	</div>
}

export default App;
