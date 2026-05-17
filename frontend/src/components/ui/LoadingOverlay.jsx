export default function LoadingOverlay({ label }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-lg">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
        <p className="text-sm font-medium text-gray-700">{label}</p>
      </div>
    </div>
  );
}
