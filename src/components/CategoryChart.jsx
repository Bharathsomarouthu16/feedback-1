import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CategoryChart({ feedback }) {
  const counts = {};
  feedback.forEach((f) => {
    counts[f.category] = (counts[f.category] || 0) + 1;
  });
  const data = Object.entries(counts).map(([category, count]) => ({ category, count }));

  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="rgba(27,43,52,0.08)" />
          <XAxis
            dataKey="category"
            tick={{ fontFamily: 'IBM Plex Sans', fontSize: 10, fill: '#1B2B34' }}
            axisLine={{ stroke: 'rgba(27,43,52,0.14)' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontFamily: 'IBM Plex Sans', fontSize: 10, fill: '#1B2B34' }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="count" fill="#2F6F63" radius={[4, 4, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
