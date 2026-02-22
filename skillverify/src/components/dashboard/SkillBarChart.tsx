import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface BarData {
    name: string
    score: number
}

interface SkillBarChartProps {
    data: BarData[]
    height?: number
}

const getBarColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#3b82f6'
    if (score >= 40) return '#f59e0b'
    return '#ef4444'
}

export default function SkillBarChart({ data, height = 250 }: SkillBarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px' }}
                    labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
                    itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {data.map((entry, index) => (
                        <Cell key={index} fill={getBarColor(entry.score)} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
