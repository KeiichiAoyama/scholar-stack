export default function MetricCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-secondary p-5 flex flex-col gap-1 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="text-3xl font-bold text-primary">{value?.toLocaleString()}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}
