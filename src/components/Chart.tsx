import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

type ChartProps = {
    keys: any[]
    values: any[]
    type: string
}

const Chart = ({ keys, values, type }: ChartProps) => {

    const data: any[] = [];

    for (let i = 0; i < keys.length; i++) {
        data.push({ key: keys[i], value: values[i] });
    }

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    return <ResponsiveContainer height={250} width='100%'>
        {
            type === 'line' ?
                <LineChart data={data}>
                    <CartesianGrid stroke="#efefef" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="value" stroke="#74b9ff" />
                    <XAxis dataKey="key" />
                    <YAxis type='number' domain={[Math.floor(minValue - 5), Math.floor(maxValue + 5)]} />
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