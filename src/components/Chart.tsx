import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';

type ChartProps = {
    dates: Date[]
    values: any[]
    type: string
    max?: number
    min?: number
}

const Chart = ({ dates, values, type, max, min }: ChartProps) => {

    const getDayMonthHourMinFromDate = (date: Date) : {day: string, month: string, hour: string, minute: string} => {
        return {
            day: date.getDate().toString().padStart(2, '0'),
            month: date.toLocaleString('default', { month: 'short' }),
            hour: date.getHours().toString().padStart(2, '0'),
            minute: date.getMinutes().toString().padStart(2, '0')
        }
    }

    const datesLabels = dates.map(d => {
        const dateFmt = getDayMonthHourMinFromDate(d)
        return `${dateFmt.day} ${dateFmt.month} ${dateFmt.hour}:${dateFmt.minute}`
    })

    const customTickFormatter = (value: string, index: number) => {
        return value.substring(7, 12)
    }

    const data: any[] = [];

    for (let i = 0; i < datesLabels.length; i++) {
        data.push({ key: datesLabels[i], value: values[i] });
    }

    const generateDateReferenceLines = () =>  {
        const referenceDates = new Array<string>()
        for (let i = 0; i < datesLabels.length; i++) {
          const dateLabel = datesLabels[i];
          const prevDateLabel = i === 0 ? null : datesLabels[i - 1]

          if (prevDateLabel && dateLabel.substring(0, 6) !== prevDateLabel.substring(0, 6)) {
            referenceDates.push(dateLabel)
          }
        }

        return referenceDates.map(rd => <ReferenceLine key={rd.substring(0, 6)} x={rd} stroke="pink" strokeDasharray="3 3" label={rd.substring(0, 6)}  ifOverflow='visible' />)
    }

    const minValue = max !== undefined ? max : (Math.min(...values) - 5);
    const maxValue = min !== undefined ? min : (Math.max(...values) + 5);

    return <ResponsiveContainer height={250} width='100%'>
        {
            type === 'line' ?
                <LineChart data={data}>
                    <CartesianGrid stroke="#efefef" strokeDasharray="5 5" vertical={false}/>
                    <Line type="monotone" dataKey="value" stroke="#74b9ff" />
                    <XAxis dataKey="key" tickFormatter={customTickFormatter} />
                    <YAxis type='number' domain={[Math.floor(minValue), Math.floor(maxValue)]} />
                    {generateDateReferenceLines()}
                    <Tooltip />
                </LineChart> :
                <BarChart data={data}>
                    <CartesianGrid stroke="#efefef" strokeDasharray="5 5" vertical={false}/>
                    <Bar dataKey="value" fill="#74b9ff" />
                    <XAxis dataKey="key" tickFormatter={customTickFormatter} />
                    <YAxis type='number' />
                    {generateDateReferenceLines()}
                    <Tooltip />
                </BarChart>
        }
    </ResponsiveContainer>

}

export default Chart;