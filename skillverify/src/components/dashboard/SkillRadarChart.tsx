import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { RadarDataPoint } from '../../types/skill'

interface SkillRadarChartProps {
    data: RadarDataPoint[]
    height?: number
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) => {
    if (active && payload?.length) {
        return (
            <div className="glass-dark border border-blue-500/30 rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-white">{payload[0]?.name}</p>
                <p className="text-xl font-bold gradient-text-blue">{payload[0]?.value}</p>
                <p className="text-xs text-slate-500">out of 100</p>
            </div>
        )
    }
    return null
}

export default function SkillRadarChart({ data, height = 350 }: SkillRadarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Inter' }}
                />
                <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#475569', fontSize: 10 }}
                    axisLine={false}
                />
                <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="url(#radarGradient)"
                    fillOpacity={0.35}
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }}
                />
                <defs>
                    <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    </linearGradient>
                </defs>
                <Tooltip content={<CustomTooltip />} />
            </RadarChart>
        </ResponsiveContainer>
    )
}
