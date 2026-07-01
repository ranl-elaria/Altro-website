// Shared chart primitives with consistent theming.
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell, Legend, AreaChart, Area, PieChart, Pie } from 'recharts'

const ACCENT = '#3C6E71'
const GRID = 'rgba(255,255,255,0.06)'
const AXIS = 'rgba(255,255,255,0.4)'

const tooltipStyle = { background: '#1a1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 12 }

export function TrendLine({ data, xKey = 'date', yKey = 'count', color = ACCENT, height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey={xKey} stroke={AXIS} fontSize={11} />
        <YAxis stroke={AXIS} fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={{ r: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function AreaTrend({ data, xKey = 'date', yKey = 'usd', color = ACCENT, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey={xKey} stroke={AXIS} fontSize={11} />
        <YAxis stroke={AXIS} fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fill="url(#areaGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function HorizontalBars({ data, xKey = 'count', yKey = 'stage', color = ACCENT, height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis type="number" stroke={AXIS} fontSize={11} />
        <YAxis dataKey={yKey} type="category" stroke={AXIS} fontSize={11} width={110} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={xKey} fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function StackedBars({ data, xKey, series, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey={xKey} stroke={AXIS} fontSize={11} />
        <YAxis stroke={AXIS} fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {series.map(s => <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={s.color} />)}
      </BarChart>
    </ResponsiveContainer>
  )
}

const PIE_COLORS = ['#3C6E71', '#4ade80', '#fbbf24', '#f87171', '#a78bfa', '#60a5fa', '#f97316']
export function DonutChart({ data, dataKey = 'usd', nameKey = 'source', height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={60} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
