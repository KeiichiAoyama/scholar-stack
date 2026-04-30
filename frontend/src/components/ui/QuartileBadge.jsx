const COLORS = {
  Q1: 'bg-green-600 text-white',
  Q2: 'bg-blue-500 text-white',
  Q3: 'bg-yellow-500 text-white',
  Q4: 'bg-orange-500 text-white',
  none: 'bg-gray-400 text-white',
};

export default function QuartileBadge({ quartile }) {
  const label = quartile === 'none' ? 'N/A' : quartile;
  return (
    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold flex-shrink-0 ${COLORS[quartile] || COLORS.none}`}>
      {label}
    </span>
  );
}
