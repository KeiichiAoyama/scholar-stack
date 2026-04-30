import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/ui/MetricCard';
import PublicationTrendChart from '../components/charts/PublicationTrendChart';
import QuartileBadge from '../components/ui/QuartileBadge';
import { mockMetrics, mockPublicationTrend, mockArticles, mockUsers } from '../data/mock';

const recentArticles = mockArticles.filter((a) => a.source === 'scopus').slice(0, 5);
const lecturerCount = mockUsers.filter((u) => u.role === 'Lecturer').length;

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const adminMetrics = {
    sintaScoreOverall: mockMetrics.sintaScoreOverall * lecturerCount,
    sintaScore3yr: mockMetrics.sintaScore3yr * lecturerCount,
    affilScore: mockMetrics.affilScore * lecturerCount,
    affilScore3yr: mockMetrics.affilScore3yr * lecturerCount,
  };
  const visibleMetrics = isAdmin ? adminMetrics : mockMetrics;
  const visibleTrend = isAdmin
    ? mockPublicationTrend.map((item) => ({ ...item, count: item.count * lecturerCount }))
    : mockPublicationTrend;
  const visibleArticles = isAdmin ? mockArticles.slice(0, 8) : recentArticles;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ').slice(0, 2).join(' ')}</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {isAdmin
            ? `Here's the overall research activity from ${lecturerCount} lecturers.`
            : "Here's an overview of your research activity."}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title={isAdmin ? 'Total SINTA Score' : 'SINTA Score Overall'} value={visibleMetrics.sintaScoreOverall} />
        <MetricCard title={isAdmin ? 'Total SINTA Score 3Yr' : 'SINTA Score 3Yr'} value={visibleMetrics.sintaScore3yr} />
        <MetricCard title={isAdmin ? 'Total Affil Score' : 'Affil Score'} value={visibleMetrics.affilScore} />
        <MetricCard title={isAdmin ? 'Total Affil Score 3Yr' : 'Affil Score 3Yr'} value={visibleMetrics.affilScore3yr} />
      </div>

      {/* Publication Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          {isAdmin ? 'Overall Publication Trend' : 'Publication Trend'}
        </h3>
        <PublicationTrendChart data={visibleTrend} />
      </div>

      {/* Recent Publications */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">
            {isAdmin ? 'Recent Publications Across Lecturers' : 'Recent Scopus Publications'}
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Year</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Quartile</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Citations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibleArticles.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-gray-800 max-w-xs">
                  <p className="line-clamp-2">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.journalName}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{a.year}</td>
                <td className="px-4 py-3">
                  <QuartileBadge quartile={a.quartile} />
                </td>
                <td className="px-4 py-3 text-gray-600">{a.citations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
