import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MetricCard from '../components/ui/MetricCard';
import PublicationTrendChart from '../components/charts/PublicationTrendChart';
import QuartileBadge from '../components/ui/QuartileBadge';
import { getDashboard, getLecturers, getResearches, getServices } from '../services/dataService';
const CHART_COLORS = ['#003366', '#C5A059', '#2E7D5B', '#8A4B2A', '#6B7280'];

function buildSourceBreakdown(articles) {
  return ['scopus', 'googlescholar'].map((source) => ({
    source: source === 'scopus' ? 'Scopus' : 'Google',
    count: articles.filter((article) => article.source === source).length,
  }));
}

function buildQuartileBreakdown(articles) {
  return ['Q1', 'Q2', 'Q3', 'Q4', 'none']
    .map((quartile) => ({
      name: quartile === 'none' ? 'No Quartile' : quartile,
      value: articles.filter((article) => article.quartile === quartile).length,
    }))
    .filter((item) => item.value > 0);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [dashboard, setDashboard] = useState(null);
  const [lecturerCount, setLecturerCount] = useState(0);
  const [adminDashboards, setAdminDashboards] = useState([]);
  const [researches, setResearches] = useState([]);
  const [services, setServices] = useState([]);
  useEffect(() => {
    if (!user?.id) return;
    if (isAdmin) {
      getLecturers().then(async (items) => {
        setLecturerCount(items.length);
        setAdminDashboards(await Promise.all(items.map((lecturer) => getDashboard(lecturer.id))));
      });
      return;
    }
    getDashboard(user.id).then(setDashboard);
    getResearches(user.id).then(setResearches);
    getServices(user.id).then(setServices);
    getLecturers().then((items) => setLecturerCount(items.length));
  }, [isAdmin, user?.id]);
  const lecturerArticles = dashboard?.recentArticles || [];
  const recentLecturerArticles = lecturerArticles.filter((a) => a.source === 'scopus').slice(0, 5);
  const lecturerResearches = researches;
  const lecturerServices = services;
  const personalSourceBreakdown = buildSourceBreakdown(lecturerArticles);
  const personalQuartileBreakdown = buildQuartileBreakdown(lecturerArticles);
  const personalTrend = dashboard?.publicationTrend || [];
  const activeResearch = lecturerResearches.filter((research) => research.status === 'Active').length;
  const completedResearch = lecturerResearches.filter((research) => research.status === 'Completed').length;
  const adminArticles = adminDashboards.flatMap((item) => item.recentArticles || []);
  const adminTrend = Object.values(adminDashboards
    .flatMap((item) => item.publicationTrend || [])
    .reduce((accumulator, item) => {
      accumulator[item.year] = {
        year: item.year,
        count: (accumulator[item.year]?.count || 0) + item.count,
      };
      return accumulator;
    }, {}))
    .sort((left, right) => left.year - right.year);
  const adminMetrics = adminDashboards.reduce((totals, item) => ({
    sintaScoreOverall: totals.sintaScoreOverall + (item.metrics?.sintaScoreOverall || 0),
    sintaScore3yr: totals.sintaScore3yr + (item.metrics?.sintaScore3yr || 0),
    affilScore: totals.affilScore + (item.metrics?.affilScore || 0),
    affilScore3yr: totals.affilScore3yr + (item.metrics?.affilScore3yr || 0),
  }), {
    sintaScoreOverall: 0,
    sintaScore3yr: 0,
    affilScore: 0,
    affilScore3yr: 0,
  });
  const visibleMetrics = isAdmin ? adminMetrics : (dashboard?.metrics || {});
  const visibleTrend = isAdmin ? adminTrend : personalTrend;
  const visibleArticles = isAdmin
    ? adminArticles
      .filter((article) => article.source === 'scopus')
      .sort((left, right) => (right.year || 0) - (left.year || 0))
      .slice(0, 5)
    : recentLecturerArticles;

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

      {!isAdmin && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="My Publications" value={lecturerArticles.length} />
            <MetricCard title="My Research" value={lecturerResearches.length} />
            <MetricCard title="Active Research" value={activeResearch} />
            <MetricCard title="Comm. Service" value={lecturerServices.length} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.9fr] gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-700">My Publication Sources</h3>
                <p className="text-xs text-gray-400">{lecturerArticles.length} total papers</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={personalSourceBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="source" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#003366" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-700">My Quartile Mix</h3>
                <p className="text-xs text-gray-400">Scopus and Google</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={personalQuartileBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {personalQuartileBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {personalQuartileBreakdown.map((item, index) => (
                  <span key={item.name} className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    {item.name}: {item.value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-xs text-gray-400">Research Progress</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeResearch}/{lecturerResearches.length}</p>
              <p className="text-sm text-gray-500 mt-1">active projects, {completedResearch} completed</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-xs text-gray-400">Community Reach</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{lecturerServices.length}</p>
              <p className="text-sm text-gray-500 mt-1">documented service activities</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-xs text-gray-400">Recent Citations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {lecturerArticles.reduce((sum, article) => sum + article.citations, 0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">citations across personal papers</p>
            </div>
          </div>
        </>
      )}

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
        <PublicationTrendChart data={isAdmin ? visibleTrend : personalTrend} />
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
