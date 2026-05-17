import { useEffect, useState } from 'react';
import { Handshake, Search, X } from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import PublicationTrendChart from '../components/charts/PublicationTrendChart';
import Button from '../components/ui/Button';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { Input, Select } from '../components/ui/FormField';
import { useAuth } from '../context/AuthContext';
import { usePagination } from '../hooks/usePagination';
import { getArticles } from '../services/articleService';
import { getDashboard, getServices, synchronizeLecturer } from '../services/dataService';

const SEARCH_PARAMETERS = [
  { key: 'all', label: 'All key parameters' },
  { key: 'title', label: 'Title' },
  { key: 'location', label: 'Location' },
  { key: 'year', label: 'Year' },
  { key: 'program', label: 'Program' },
  { key: 'community', label: 'Community' },
];

function matchesSearch(item, query, parameter) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return true;

  const values = parameter === 'all'
    ? SEARCH_PARAMETERS.filter((entry) => entry.key !== 'all').map((entry) => item[entry.key])
    : [item[parameter]];

  return values.some((value) => String(value ?? '').toLowerCase().includes(keyword));
}

export default function CommunityServicePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParameter, setSearchParameter] = useState('all');
  const [selectedPublications, setSelectedPublications] = useState({});
  const [services, setServices] = useState([]);
  const [publicationOptions, setPublicationOptions] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const isLecturer = user?.role === 'Lecturer';

  useEffect(() => {
    if (!user?.id) return;
    getServices(user.id).then(setServices);
    Promise.all([getArticles(user.id, 'scopus'), getArticles(user.id, 'googlescholar')]).then(([a, b]) => setPublicationOptions([...a, ...b]));
    getDashboard(user.id).then(setDashboard);
  }, [user?.id]);
  const filtered = services.filter((service) => matchesSearch(service, searchQuery, searchParameter));
  const { currentPage, totalPages, paginatedItems, goToPage, totalItems } = usePagination(filtered, 10);

  function addRelatedPublication(serviceId, articleId) {
    if (!articleId) return;
    setSelectedPublications((prev) => {
      const current = prev[serviceId] || [];
      if (current.includes(Number(articleId))) return prev;
      return { ...prev, [serviceId]: [...current, Number(articleId)] };
    });
  }

  function removeRelatedPublication(serviceId, articleId) {
    setSelectedPublications((prev) => ({
      ...prev,
      [serviceId]: (prev[serviceId] || []).filter((id) => id !== articleId),
    }));
  }

  async function synchronize() {
    if (!user?.id) return;
    setSyncing(true);
    setSyncMessage('');
    try {
      const result = await synchronizeLecturer(user.id, 'services');
      const [nextServices, scopusArticles, scholarArticles, nextDashboard] = await Promise.all([
        getServices(user.id),
        getArticles(user.id, 'scopus'),
        getArticles(user.id, 'googlescholar'),
        getDashboard(user.id),
      ]);
      setServices(nextServices);
      setPublicationOptions([...scopusArticles, ...scholarArticles]);
      setDashboard(nextDashboard);
      setSyncMessage(result.warnings?.length ? result.warnings.join(' ') : 'Synchronization completed.');
    } catch (error) {
      setSyncMessage(error.response?.data?.message || 'Synchronization failed.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-4">
      {syncing && <LoadingOverlay label="Synchronizing SINTA community services..." />}
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="SINTA Score Overall" value={dashboard?.metrics?.sintaScoreOverall || 0} />
        <MetricCard title="SINTA Score 3Yr" value={dashboard?.metrics?.sintaScore3yr || 0} />
        <MetricCard title="Affil Score" value={dashboard?.metrics?.affilScore || 0} />
        <MetricCard title="Affil Score 3Yr" value={dashboard?.metrics?.affilScore3yr || 0} />
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Community Service Activity Trend</h3>
        <PublicationTrendChart data={dashboard?.publicationTrend || []} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.8fr_auto] gap-3 items-end">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search service title, location, program, community..."
              className="pl-9"
              aria-label="General community service search"
            />
          </div>
          <Select
            value={searchParameter}
            onChange={(event) => setSearchParameter(event.target.value)}
            aria-label="Search community service key parameter"
          >
            {SEARCH_PARAMETERS.map((parameter) => (
              <option key={parameter.key} value={parameter.key}>{parameter.label}</option>
            ))}
          </Select>
          <Button
            variant="outline"
            size="md"
            className="justify-center"
            onClick={() => {
              setSearchQuery('');
              setSearchParameter('all');
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Actions + info */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="danger" size="sm">Reset Document</Button>
          <Button variant="primary" size="sm" onClick={synchronize} disabled={syncing}>
            {syncing ? 'Synchronizing...' : 'Req. Synchronization'}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Page {currentPage} of {totalPages || 1} | Total Records: {totalItems}
        </p>
      </div>
      {syncMessage && <p className="text-xs text-gray-500">{syncMessage}</p>}

      {/* List */}
      <div className="space-y-3">
        {paginatedItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm shadow-sm">
            No community service found for the current search.
          </div>
        ) : (
          paginatedItems.map((s) => {
            const relatedArticles = (selectedPublications[s.id] || [])
              .map((id) => publicationOptions.find((article) => Number(article.id) === id))
              .filter(Boolean);

            return (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-primary">{s.title}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                  <span>Location: {s.location}</span>
                  <span>Year: {s.year}</span>
                  <span>Program: {s.program}</span>
                  <span>Community: {s.community}</span>
                </div>

                {isLecturer && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Handshake size={16} className="text-primary" />
                      <h4 className="text-sm font-semibold text-gray-700">Related Publications</h4>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
                      <Select
                        value=""
                        onChange={(event) => addRelatedPublication(s.id, event.target.value)}
                        aria-label="Add related publication"
                      >
                        <option value="">Add publication from Scopus or Google Scholar</option>
                        {publicationOptions.map((article) => (
                          <option key={article.id} value={article.id}>
                            {article.year} - {article.title}
                          </option>
                        ))}
                      </Select>
                      <Button variant="outline" size="sm" className="justify-center" disabled>
                        {relatedArticles.length} linked
                      </Button>
                    </div>
                    {relatedArticles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {relatedArticles.map((article) => (
                          <span key={article.id} className="inline-flex items-center gap-2 max-w-full rounded-lg bg-gray-50 border border-gray-200 px-2.5 py-1 text-xs text-gray-600">
                            <span className="truncate max-w-[18rem]">{article.title}</span>
                            <button
                              type="button"
                              onClick={() => removeRelatedPublication(s.id, article.id)}
                              className="text-gray-400 hover:text-red-600"
                              aria-label={`Remove ${article.title}`}
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
}
