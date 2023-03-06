import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

type ChartProps = {
    keys: any[]
    values: any[]
    type: string
    max?: number
    min?: number
}

const Chart = ({ keys, values, type, max, min }: ChartProps) => {

    const data: any[] = [];

    for (let i = 0; i < keys.length; i++) {
        data.push({ key: keys[i], value: values[i] });
    }

    const minValue = max !== undefined ? max : (Math.min(...values) - 5);
    const maxValue = min !== undefined ? min : (Math.max(...values) + 5);

    return <ResponsiveContainer height={250} width='100%'>
        {
            type === 'line' ?
                <LineChart data={data}>
                    <CartesianGrid stroke="#efefef" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="value" stroke="#74b9ff" />
                    <XAxis dataKey="key" />
                    <YAxis type='number' domain={[Math.floor(minValue), Math.floor(maxValue)]} />
                    <Tooltip />
                </LineChart> :
                <BarChart data={data}>
                    <CartesianGrid stroke="#efefef" strokeDasharray="5 5" />
                    <Bar dataKey="value" fill="#74b9ff" />
                    <XAxis dataKey="key" />
                    <YAxis type='number' />
                    <Tooltip />
                </BarChart>
        }
    </ResponsiveContainer>

}

export default Chart;