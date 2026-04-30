import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

export default function PublicationTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6b7280' }} />
        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(value) => [value, 'Publications']}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#003366"
          strokeWidth={2}
          dot={{ fill: '#C5A059', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#C5A059' }}
        >
          <LabelList dataKey="count" position="top" style={{ fontSize: 10, fill: '#6b7280' }} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}
