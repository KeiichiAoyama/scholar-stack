import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import QuartileBadge from '../components/ui/QuartileBadge';
import PublicationTrendChart from '../components/charts/PublicationTrendChart';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormField';
import { useAuth } from '../context/AuthContext';
import { usePagination } from '../hooks/usePagination';
import { mockArticles, mockMetrics, mockPublicationTrend } from '../data/mock';

const SOURCES = [
  { key: 'scopus', label: 'Scopus' },
  { key: 'googlescholar', label: 'Google Scholar' },
];

const QUARTILE_OPTIONS = ['Q1', 'Q2', 'Q3', 'Q4', 'none'];
const PUBLICATION_LABELS = [
  { key: 'skripsi mahasiswa', label: 'Skripsi Mahasiswa' },
  { key: 'hibah mandiri', label: 'Hibah Mandiri' },
  { key: 'hibah nasional', label: 'Hibah Nasional' },
  { key: 'hibah internasional', label: 'Hibah Internasional' },
  { key: 'community service', label: 'Community Service' },
];
const NATIONAL_GRANTS = ['BIMA Penelitian Fundamental', 'BIMA Penelitian Terapan', 'Kedaireka', 'Other'];
const INTERNATIONAL_GRANTS = ['Erasmus+', 'ASEAN IVO', 'Newton Fund', 'Other'];

export default function ArticleListingPage() {
  const { source } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedQuartiles, setSelectedQuartiles] = useState([]);
  const [pendingQuartiles, setPendingQuartiles] = useState([]);
  const [documents, setDocuments] = useState({});

  function togglePending(q) {
    setPendingQuartiles((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
    );
  }

  function applyFilter() {
    setSelectedQuartiles([...pendingQuartiles]);
  }

  function resetFilter() {
    setPendingQuartiles([]);
    setSelectedQuartiles([]);
  }

  function updateDocument(articleId, key, value) {
    setDocuments((prev) => ({
      ...prev,
      [articleId]: {
        label: '',
        grantName: '',
        grantOther: '',
        fileName: '',
        ...prev[articleId],
        [key]: value,
        completed: false,
      },
    }));
  }

  function completeDocument(articleId) {
    setDocuments((prev) => ({
      ...prev,
      [articleId]: {
        ...prev[articleId],
        completed: true,
      },
    }));
  }

  const filtered = mockArticles
    .filter((a) => a.source === source)
    .filter((a) => selectedQuartiles.length === 0 || selectedQuartiles.includes(a.quartile));

  const { currentPage, totalPages, paginatedItems, goToPage, totalItems } = usePagination(filtered, 10);
  const isLecturer = user?.role === 'Lecturer';

  return (
    <div className="flex gap-5">
      {/* Sidebar Filter */}
      <aside className="w-48 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sticky top-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter Quartile</h3>
          <div className="space-y-2">
            {QUARTILE_OPTIONS.map((q) => (
              <label key={q} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pendingQuartiles.includes(q)}
                  onChange={() => togglePending(q)}
                  className="rounded border-gray-300 text-primary focus:ring-primary/30"
                />
                {q === 'none' ? 'No Quartile' : `Quartile ${q.slice(1)}`}
              </label>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <Button variant="primary" size="sm" className="w-full justify-center" onClick={applyFilter}>Filter</Button>
            <Button variant="outline" size="sm" className="w-full justify-center" onClick={resetFilter}>Reset</Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Source Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex border-b border-gray-200 px-2 pt-2">
            {SOURCES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedQuartiles([]);
                  setPendingQuartiles([]);
                  navigate(`/articles/${key}`);
                }}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  source === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Metric Cards */}
          <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard title="SINTA Score Overall" value={mockMetrics.sintaScoreOverall} />
            <MetricCard title="SINTA Score 3Yr" value={mockMetrics.sintaScore3yr} />
            <MetricCard title="Affil Score" value={mockMetrics.affilScore} />
            <MetricCard title="Affil Score 3Yr" value={mockMetrics.affilScore3yr} />
          </div>
        </div>

        {/* Publication Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Latest number of publications</h3>
          <PublicationTrendChart data={mockPublicationTrend} />
        </div>

        {/* Actions + Pagination info */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="danger" size="sm">Reset Document</Button>
            <Button variant="primary" size="sm">Req. Synchronization</Button>
          </div>
          <p className="text-xs text-gray-500">
            Page {currentPage} of {totalPages || 1} | Total Records: {totalItems}
          </p>
        </div>

        {/* Article List */}
        <div className="space-y-3">
          {paginatedItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm shadow-sm">
              No articles found for the selected filters.
            </div>
          ) : (
            paginatedItems.map((article) => (
              <div key={article.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <QuartileBadge quartile={article.quartile} />
                  <div className="flex-1 min-w-0">
                    <a
                      href={article.link}
                      className="text-primary font-medium text-sm hover:underline line-clamp-2 block"
                    >
                      {article.title}
                    </a>
                    <p className="text-xs text-gray-500 mt-1">{article.journalName}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                      <span>Author Order: {article.authorOrder}</span>
                      <span>Creator: {article.creatorName}</span>
                      <span>{article.year}</span>
                      <span>{article.citations} cited</span>
                    </div>
                  </div>
                </div>

                {isLecturer && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <UploadCloud size={16} className="text-primary" />
                      <h4 className="text-sm font-semibold text-gray-700">Complete Document</h4>
                      {documents[article.id]?.completed && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Completed</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                      <Select
                        value={documents[article.id]?.label || ''}
                        onChange={(event) => updateDocument(article.id, 'label', event.target.value)}
                        aria-label="Publication label"
                      >
                        <option value="">Pick publication label</option>
                        {PUBLICATION_LABELS.map((label) => (
                          <option key={label.key} value={label.key}>{label.label}</option>
                        ))}
                      </Select>

                      {documents[article.id]?.label === 'hibah nasional' && (
                        <Select
                          value={documents[article.id]?.grantName || ''}
                          onChange={(event) => updateDocument(article.id, 'grantName', event.target.value)}
                          aria-label="National grant name"
                        >
                          <option value="">Select grant name</option>
                          {NATIONAL_GRANTS.map((grant) => (
                            <option key={grant} value={grant}>{grant}</option>
                          ))}
                        </Select>
                      )}

                      {documents[article.id]?.label === 'hibah internasional' && (
                        <Select
                          value={documents[article.id]?.grantName || ''}
                          onChange={(event) => updateDocument(article.id, 'grantName', event.target.value)}
                          aria-label="International grant name"
                        >
                          <option value="">Select grant name</option>
                          {INTERNATIONAL_GRANTS.map((grant) => (
                            <option key={grant} value={grant}>{grant}</option>
                          ))}
                        </Select>
                      )}

                      {['hibah nasional', 'hibah internasional'].includes(documents[article.id]?.label) && documents[article.id]?.grantName === 'Other' && (
                        <Input
                          value={documents[article.id]?.grantOther || ''}
                          onChange={(event) => updateDocument(article.id, 'grantOther', event.target.value)}
                          placeholder="Type grant name"
                          aria-label="Custom grant name"
                        />
                      )}

                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.zip"
                        onChange={(event) => updateDocument(article.id, 'fileName', event.target.files?.[0]?.name || '')}
                        aria-label="Upload research file"
                      />

                      <Button
                        variant="primary"
                        size="sm"
                        className="justify-center"
                        disabled={!documents[article.id]?.label || !documents[article.id]?.fileName}
                        onClick={() => completeDocument(article.id)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                    currentPage === page ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
