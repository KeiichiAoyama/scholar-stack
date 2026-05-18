import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileCheck2, Link2, Search, UploadCloud } from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import QuartileBadge from '../components/ui/QuartileBadge';
import PublicationTrendChart from '../components/charts/PublicationTrendChart';
import Button from '../components/ui/Button';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { Input, Select } from '../components/ui/FormField';
import { useAuth } from '../context/AuthContext';
import { usePagination } from '../hooks/usePagination';
import { getArticles } from '../services/articleService';
import {
  getArticleDocument,
  getDashboard,
  getGrants,
  getResearches,
  getServices,
  saveArticleDocument,
  synchronizeLecturer,
  uploadArticleDocumentFile,
} from '../services/dataService';

const SOURCES = [
  { key: 'scopus', label: 'Scopus' },
  { key: 'googlescholar', label: 'Google Scholar' },
];

const QUARTILE_OPTIONS = ['Q1', 'Q2', 'Q3', 'Q4', 'none'];
const SEARCH_PARAMETERS = [
  { key: 'all', label: 'All key parameters' },
  { key: 'title', label: 'Title' },
  { key: 'journalName', label: 'Journal' },
  { key: 'year', label: 'Year' },
  { key: 'creatorName', label: 'Creator' },
  { key: 'authorOrder', label: 'Author order' },
  { key: 'quartile', label: 'Quartile' },
];
const PUBLICATION_LABELS = [
  { key: 'skripsi mahasiswa', label: 'Skripsi Mahasiswa' },
  { key: 'hibah mandiri', label: 'Hibah Mandiri' },
  { key: 'hibah nasional', label: 'Hibah Nasional' },
  { key: 'hibah internasional', label: 'Hibah Internasional' },
  { key: 'community service', label: 'Community Service' },
];

function matchesSearch(article, query, parameter) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return true;

  const values = parameter === 'all'
    ? SEARCH_PARAMETERS.filter((item) => item.key !== 'all').map((item) => article[item.key])
    : [article[parameter]];

  return values.some((value) => String(value ?? '').toLowerCase().includes(keyword));
}

export default function ArticleListingPage() {
  const { source } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParameter, setSearchParameter] = useState('all');
  const [quartileQuery, setQuartileQuery] = useState('');
  const [documents, setDocuments] = useState({});
  const [articles, setArticles] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [researches, setResearches] = useState([]);
  const [services, setServices] = useState([]);
  const [grants, setGrants] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  useEffect(() => {
    if (!user?.id) return;
    async function loadPageData() {
      const nextArticles = await getArticles(user.id, source);
      setArticles(nextArticles);
      const nextDocuments = await Promise.all(
        nextArticles.map(async (article) => {
          const document = await getArticleDocument(article.id);
          const relatedWork = document.relatedType && document.relatedId
            ? `${document.relatedType}-${document.relatedId}`
            : '';
          return [
            article.id,
            {
              label: document.label || '',
              grantName: document.grantName || '',
              grantOther: '',
              file: null,
              fileName: document.fileName || '',
              filePath: document.filePath || '',
              relatedWork,
              saving: false,
              saveMessage: '',
              completed: Boolean(document.label && document.fileName && relatedWork),
            },
          ];
        }),
      );
      setDocuments(Object.fromEntries(nextDocuments));
    }
    loadPageData();
    getDashboard(user.id).then(setDashboard);
    getResearches(user.id).then(setResearches);
    getServices(user.id).then(setServices);
    getGrants().then(setGrants);
  }, [source, user?.id]);
  const RELATED_WORK_OPTIONS = useMemo(() => [
    ...researches.map((research) => ({ key: `research-${research.id}`, label: `Research - ${research.title}` })),
    ...services.map((service) => ({ key: `service-${service.id}`, label: `Comm. Service - ${service.title}` })),
  ], [researches, services]);
  const NATIONAL_GRANTS = grants
    .filter((grant) => grant.type === 'nasional' && grant.status === 'Active')
    .map((grant) => grant.name);
  const INTERNATIONAL_GRANTS = grants
    .filter((grant) => grant.type === 'internasional' && grant.status === 'Active')
    .map((grant) => grant.name);

  function updateDocument(articleId, key, value) {
    setDocuments((prev) => ({
      ...prev,
      [articleId]: {
        label: '',
        grantName: '',
        grantOther: '',
        file: null,
        fileName: '',
        filePath: '',
        relatedWork: '',
        saving: false,
        saveMessage: '',
        ...prev[articleId],
        [key]: value,
        completed: false,
      },
    }));
  }

  function updateDroppedFile(articleId, files) {
    const file = files?.[0];
    if (!file) return;
    setDocuments((prev) => ({
      ...prev,
      [articleId]: {
        label: '',
        grantName: '',
        grantOther: '',
        file: null,
        fileName: '',
        filePath: '',
        relatedWork: '',
        saving: false,
        saveMessage: '',
        ...prev[articleId],
        file,
        fileName: file.name,
        filePath: '',
        completed: false,
      },
    }));
  }

  async function completeDocument(articleId) {
    const current = documents[articleId];
    const [relatedType, relatedId] = (current.relatedWork || '').split('-');
    setDocuments((prev) => ({
      ...prev,
      [articleId]: {
        ...prev[articleId],
        saving: true,
        saveMessage: '',
      },
    }));
    try {
      const uploadedDocument = current.file
        ? await uploadArticleDocumentFile(articleId, current.file)
        : current;
      await saveArticleDocument(articleId, {
        label: current.label,
        grantName: current.grantName,
        fileName: uploadedDocument.fileName || current.fileName,
        filePath: uploadedDocument.filePath || current.filePath,
        relatedType,
        relatedId: Number(relatedId),
      });
      setDocuments((prev) => ({
        ...prev,
        [articleId]: {
          ...prev[articleId],
          file: null,
          filePath: uploadedDocument.filePath || current.filePath,
          completed: true,
          saving: false,
          saveMessage: 'Document saved.',
        },
      }));
    } catch (error) {
      setDocuments((prev) => ({
        ...prev,
        [articleId]: {
          ...prev[articleId],
          saving: false,
          saveMessage: error.response?.data?.message || 'Unable to save document.',
        },
      }));
    }
  }

  async function synchronize() {
    if (!user?.id) return;
    setSyncing(true);
    setSyncMessage('');
    try {
      const result = await synchronizeLecturer(user.id, source);
      const [nextArticles, nextDashboard, nextResearches, nextServices, nextGrants] = await Promise.all([
        getArticles(user.id, source),
        getDashboard(user.id),
        getResearches(user.id),
        getServices(user.id),
        getGrants(),
      ]);
      setArticles(nextArticles);
      setDashboard(nextDashboard);
      setResearches(nextResearches);
      setServices(nextServices);
      setGrants(nextGrants);
      const nextDocuments = await Promise.all(
        nextArticles.map(async (article) => {
          const document = await getArticleDocument(article.id);
          const relatedWork = document.relatedType && document.relatedId
            ? `${document.relatedType}-${document.relatedId}`
            : '';
          return [
            article.id,
            {
              label: document.label || '',
              grantName: document.grantName || '',
              grantOther: '',
              file: null,
              fileName: document.fileName || '',
              filePath: document.filePath || '',
              relatedWork,
              saving: false,
              saveMessage: '',
              completed: Boolean(document.label && document.fileName && relatedWork),
            },
          ];
        }),
      );
      setDocuments(Object.fromEntries(nextDocuments));
      setSyncMessage(result.warnings?.length ? result.warnings.join(' ') : 'Synchronization completed.');
    } catch (error) {
      setSyncMessage(error.response?.data?.message || 'Synchronization failed.');
    } finally {
      setSyncing(false);
    }
  }

  const filtered = articles
    .filter((a) => matchesSearch(a, searchQuery, searchParameter))
    .filter((a) => {
      const keyword = quartileQuery.trim().toLowerCase();
      if (!keyword) return true;
      const quartileLabel = a.quartile === 'none' ? 'no quartile' : `quartile ${a.quartile.slice(1)}`;
      return a.quartile.toLowerCase().includes(keyword) || quartileLabel.includes(keyword);
    });

  const { currentPage, totalPages, paginatedItems, goToPage, totalItems } = usePagination(filtered, 10);
  const isLecturer = user?.role === 'Lecturer';

  return (
    <div className="space-y-4">
        {syncing && <LoadingOverlay label={`Synchronizing ${source === 'scopus' ? 'Scopus' : 'Google Scholar'}...`} />}
        {/* Source Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex border-b border-gray-200 px-2 pt-2">
            {SOURCES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setSearchQuery('');
                  setQuartileQuery('');
                  setSearchParameter('all');
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

          <div className="px-4 pt-4 grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto] gap-3 items-end">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search title, journal, year, creator..."
                className="pl-9"
                aria-label="General publication search"
              />
            </div>
            <Select
              value={searchParameter}
              onChange={(event) => setSearchParameter(event.target.value)}
              aria-label="Search key parameter"
            >
              {SEARCH_PARAMETERS.map((parameter) => (
                <option key={parameter.key} value={parameter.key}>{parameter.label}</option>
              ))}
            </Select>
            <Input
              list="publication-quartiles"
              value={quartileQuery}
              onChange={(event) => setQuartileQuery(event.target.value)}
              placeholder="Search quartile"
              aria-label="Search quartile"
            />
            <datalist id="publication-quartiles">
              {QUARTILE_OPTIONS.map((q) => (
                <option key={q} value={q === 'none' ? 'No Quartile' : q} />
              ))}
            </datalist>
            <Button
              variant="outline"
              size="md"
              className="justify-center"
              onClick={() => {
                setSearchQuery('');
                setQuartileQuery('');
                setSearchParameter('all');
              }}
            >
              Reset
            </Button>
          </div>

          {/* Metric Cards */}
          <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard title="SINTA Score Overall" value={dashboard?.metrics?.sintaScoreOverall || 0} />
            <MetricCard title="SINTA Score 3Yr" value={dashboard?.metrics?.sintaScore3yr || 0} />
            <MetricCard title="Affil Score" value={dashboard?.metrics?.affilScore || 0} />
            <MetricCard title="Affil Score 3Yr" value={dashboard?.metrics?.affilScore3yr || 0} />
          </div>
        </div>

        {/* Publication Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Latest number of publications</h3>
          <PublicationTrendChart data={dashboard?.publicationTrend || []} />
        </div>

        {/* Actions + Pagination info */}
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

        {/* Article List */}
        <div className="space-y-3">
          {paginatedItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm shadow-sm">
              No articles found for the current search.
            </div>
          ) : (
            paginatedItems.map((article) => (
              (() => {
                const currentDocument = documents[article.id];
                const needsGrantPicker = ['hibah nasional', 'hibah internasional'].includes(currentDocument?.label);
                const missingRequiredGrant = needsGrantPicker && !currentDocument?.grantName;
                const documentGridClass = needsGrantPicker
                    ? 'xl:grid-cols-[minmax(12rem,0.9fr)_minmax(12rem,0.9fr)_minmax(18rem,1.4fr)_auto]'
                    : 'xl:grid-cols-[minmax(12rem,0.9fr)_minmax(18rem,1.4fr)_auto]';

                return (
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
                      <span>Author Order: {article.authorOrder ?? 'N/A'}</span>
                      <span>Creator: {article.creatorName || 'N/A'}</span>
                      <span>{article.year}</span>
                      <span>{article.citations} cited</span>
                    </div>
                  </div>
                </div>

                {isLecturer && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileCheck2 size={16} className="text-primary" />
                      <h4 className="text-sm font-semibold text-gray-700">Complete Document</h4>
                      {documents[article.id]?.completed && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Completed</span>
                      )}
                    </div>
                    <div className={`grid grid-cols-1 gap-3 items-end ${documentGridClass}`}>
                      <Select
                        className="min-w-0"
                        value={currentDocument?.label || ''}
                        onChange={(event) => updateDocument(article.id, 'label', event.target.value)}
                        aria-label="Publication label"
                      >
                        <option value="">Pick publication label</option>
                        {PUBLICATION_LABELS.map((label) => (
                          <option key={label.key} value={label.key}>{label.label}</option>
                        ))}
                      </Select>

                      {currentDocument?.label === 'hibah nasional' && (
                        <Select
                          className="min-w-0"
                          value={currentDocument?.grantName || ''}
                          onChange={(event) => updateDocument(article.id, 'grantName', event.target.value)}
                          aria-label="National grant name"
                        >
                          <option value="">Select grant name</option>
                          {NATIONAL_GRANTS.map((grant) => (
                            <option key={grant} value={grant}>{grant}</option>
                          ))}
                        </Select>
                      )}

                      {currentDocument?.label === 'hibah internasional' && (
                        <Select
                          className="min-w-0"
                          value={currentDocument?.grantName || ''}
                          onChange={(event) => updateDocument(article.id, 'grantName', event.target.value)}
                          aria-label="International grant name"
                        >
                          <option value="">Select grant name</option>
                          {INTERNATIONAL_GRANTS.map((grant) => (
                            <option key={grant} value={grant}>{grant}</option>
                          ))}
                        </Select>
                      )}

                      <Select
                        className="min-w-0"
                        value={currentDocument?.relatedWork || ''}
                        onChange={(event) => updateDocument(article.id, 'relatedWork', event.target.value)}
                        aria-label="Link publication to research or community service"
                      >
                        <option value="">Link to research or comm. service</option>
                        {RELATED_WORK_OPTIONS.map((option) => (
                          <option key={option.key} value={option.key}>{option.label}</option>
                        ))}
                      </Select>

                      <Button
                        variant="primary"
                        size="sm"
                        className="justify-center"
                        disabled={!currentDocument?.label || !currentDocument?.fileName || !currentDocument?.relatedWork || missingRequiredGrant || currentDocument?.saving}
                        onClick={() => completeDocument(article.id)}
                      >
                        {currentDocument?.saving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                    {currentDocument?.saveMessage && (
                      <p className={`mt-2 text-xs ${currentDocument.completed ? 'text-green-600' : 'text-red-600'}`}>
                        {currentDocument.saveMessage}
                      </p>
                    )}
                    <div className="mt-3 grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-3 items-stretch">
                      <div
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          updateDroppedFile(article.id, event.dataTransfer.files);
                        }}
                        className="relative flex min-h-24 items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center text-sm text-gray-500 transition-colors hover:border-primary hover:bg-primary/5"
                      >
                        <UploadCloud size={20} className="text-primary" />
                        <span className="min-w-0">
                          <span className="block font-medium text-gray-700">
                            {documents[article.id]?.fileName || 'Drop document here'}
                          </span>
                          <span className="block text-xs text-gray-400">PDF, DOC, DOCX, or ZIP</span>
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.zip"
                          className="absolute inset-0 cursor-pointer opacity-0"
                          aria-label="Upload publication document"
                          onChange={(event) => updateDroppedFile(article.id, event.target.files)}
                        />
                      </div>
                      {currentDocument?.relatedWork && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-3 text-xs text-gray-500">
                          <Link2 size={15} className="text-primary" />
                          <span className="line-clamp-2">
                            {RELATED_WORK_OPTIONS.find((option) => option.key === currentDocument?.relatedWork)?.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
                );
              })()
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
  );
}
