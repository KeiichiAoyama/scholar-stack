import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BarChart3, BookOpen, Check, Download, FileText, GraduationCap, Link2, MapPin, UserRound } from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import PublicationTrendChart from '../components/charts/PublicationTrendChart';
import QuartileBadge from '../components/ui/QuartileBadge';
import { useAuth } from '../context/AuthContext';
import { getArticles } from '../services/articleService';
import { downloadArticleDocumentFile, getArticleDocument, getDashboard, getResearches, getServices } from '../services/dataService';
import { getProfile } from '../services/profileService';

const PROFILE_KEYWORDS = [
  'Blockchain technology',
  'Information system',
  'Architecture enterprise',
  'Adoption Technology',
  'Embedded',
];

const CONTENT_TABS = ['Articles', 'Researches', 'Community Services'];
const SOURCE_TABS = [
  { key: 'scopus', label: 'Scopus' },
  { key: 'googlescholar', label: 'Google Scholar' },
];

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function cleanName(name) {
  return name.replace(/^(Dr\.|Prof\.)\s*/i, '').split(',')[0].toUpperCase();
}

export default function LecturerExplorePage() {
  const { lecturerId } = useParams();
  const { user } = useAuth();
  const [activeContentTab, setActiveContentTab] = useState('Articles');
  const [activeSource, setActiveSource] = useState('scopus');
  const [lecturer, setLecturer] = useState(null);
  const [publications, setPublications] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [researches, setResearches] = useState([]);
  const [services, setServices] = useState([]);
  const [documentsByArticleId, setDocumentsByArticleId] = useState({});
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    getProfile(lecturerId).then(setLecturer).catch(() => setLecturer(false));
    getArticles(lecturerId, activeSource).then(async (items) => {
      setPublications(items);
      const documents = await Promise.all(items.map((article) => getArticleDocument(article.id)));
      setDocumentsByArticleId(Object.fromEntries(documents.map((document) => [document.articleId, document])));
    });
    getDashboard(lecturerId).then(setDashboard);
    getResearches(lecturerId).then(setResearches);
    getServices(lecturerId).then(setServices);
  }, [lecturerId, activeSource]);

  if (lecturer === false) {
    return <Navigate to="/explore" replace />;
  }
  if (!lecturer) return null;

  const department = lecturer.departmentUnit;
  const sourcePublications = publications.filter((article) => article.source === activeSource);
  const metrics = {
    overall: dashboard?.metrics?.sintaScoreOverall || 0,
    threeYear: dashboard?.metrics?.sintaScore3yr || 0,
    affiliation: dashboard?.metrics?.affilScore || 0,
    affiliationThreeYear: dashboard?.metrics?.affilScore3yr || 0,
  };
  function getArticleDetails(article) {
    const document = documentsByArticleId[article.id];
    const relatedItem = document?.relatedType === 'research'
      ? researches.find((research) => research.id === document.relatedId)
      : document?.relatedType === 'service'
        ? services.find((service) => service.id === document.relatedId)
        : null;
    return {
      document,
      related: relatedItem
        ? {
            type: document.relatedType === 'research' ? 'Research' : 'Community Service',
            title: relatedItem.title,
            meta: document.relatedType === 'research'
              ? `${relatedItem.fundingSource} - ${relatedItem.scheme} - ${relatedItem.year}`
              : `${relatedItem.program} - ${relatedItem.year}`,
          }
        : {
            type: 'Work',
            title: 'No relation recorded',
            meta: '',
          },
    };
  }
  async function downloadDocument(article) {
    const details = getArticleDetails(article);
    if (!details.document?.fileName) return;
    const blob = await downloadArticleDocumentFile(article.id);
    const url = window.URL.createObjectURL(blob);
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = details.document.fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          Back to Explore
        </Link>
      </div>

      <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-6 flex flex-col lg:flex-row gap-6">
          <div className="w-32 h-40 rounded-lg bg-primary text-white flex items-center justify-center text-3xl font-bold border-4 border-primary/10 flex-shrink-0">
            {getInitials(lecturer.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-bold text-primary tracking-normal">{cleanName(lecturer.name)}</h2>
              <span className="w-8 h-8 rounded-full bg-green-500 text-white inline-flex items-center justify-center">
                <Check size={20} />
              </span>
            </div>

            <div className="mt-4 space-y-2 text-gray-500">
              <p className="flex items-center gap-2">
                <MapPin size={18} />
                Universitas Multimedia Nusantara Jakarta
              </p>
              <p className="flex items-center gap-2">
                <GraduationCap size={18} />
                {department}
              </p>
              <p className="flex items-center gap-2">
                <UserRound size={18} />
                SINTA ID : {lecturer.sintaId || '-'}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {PROFILE_KEYWORDS.map((keyword) => (
                <span key={keyword} className="rounded-full bg-primary/5 text-primary px-3 py-1 text-xs">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50/80 p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="SINTA Score Overall" value={metrics.overall.toLocaleString('id-ID')} icon={UserRound} />
          <MetricCard title="SINTA Score 3Yr" value={metrics.threeYear.toLocaleString('id-ID')} icon={GraduationCap} />
          <MetricCard title="Affil Score" value={metrics.affiliation.toLocaleString('id-ID')} icon={BookOpen} />
          <MetricCard title="Affil Score 3Yr" value={metrics.affiliationThreeYear.toLocaleString('id-ID')} icon={BarChart3} />
        </div>

        <div className="border-t border-gray-100 px-5 flex overflow-x-auto">
          {CONTENT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveContentTab(tab)}
              className={`px-5 py-4 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeContentTab === tab
                  ? 'border-secondary text-secondary'
                  : 'border-transparent text-primary hover:text-primary/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 text-center mb-3">Latest number of publications</h3>
          <PublicationTrendChart data={dashboard?.publicationTrend || []} />
        </div>
      </section>

      {activeContentTab === 'Articles' && (
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-5 pt-5 flex flex-wrap gap-8 border-b border-gray-100">
            {SOURCE_TABS.map((source) => (
              <button
                key={source.key}
                onClick={() => setActiveSource(source.key)}
                className={`pb-4 text-lg font-medium border-b-2 -mb-px transition-colors ${
                  activeSource === source.key
                    ? 'border-secondary text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-primary'
                }`}
              >
                {source.label}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-4">
            {sourcePublications.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">
                No {SOURCE_TABS.find((source) => source.key === activeSource)?.label} publications available.
              </div>
            ) : (
              sourcePublications.map((article) => (
                <article key={article.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex gap-4">
                    <QuartileBadge quartile={article.quartile} />
                    <div className="min-w-0 flex-1">
                      <a href={article.link} className="text-primary text-base font-medium hover:underline">
                        {article.title}
                      </a>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>{article.journalName}</span>
                        <span>Author Order: {article.authorOrder} of 5</span>
                        <span>Creator: {article.creatorName}</span>
                        <span>{article.year}</span>
                        <span>{article.citations} cited</span>
                      </div>
                      <div className="mt-4 grid grid-cols-1 xl:grid-cols-[1fr_0.8fr] gap-3">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Link2 size={15} className="text-primary" />
                            Related {getArticleDetails(article).related.type}
                          </div>
                          <p className="mt-2 text-sm text-primary line-clamp-2">{getArticleDetails(article).related.title}</p>
                          <p className="mt-1 text-xs text-gray-500">{getArticleDetails(article).related.meta}</p>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white px-3 py-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FileText size={15} className="text-primary" />
                            Uploaded File
                          </div>
                          {isAdmin ? (
                            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              {getArticleDetails(article).document?.fileName ? (
                                <>
                                  <div className="min-w-0">
                                    <p className="text-sm text-gray-700 truncate">{getArticleDetails(article).document.fileName}</p>
                                    <p className="text-xs text-gray-400">{getArticleDetails(article).document.filePath}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => downloadDocument(article)}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                                  >
                                    <Download size={14} />
                                    Download
                                  </button>
                                </>
                              ) : (
                                <p className="text-sm text-gray-400">No file uploaded.</p>
                              )}
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-gray-400">Restricted to admin.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      {activeContentTab === 'Researches' && (
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-3">
          {researches.slice(0, 4).map((research) => (
            <div key={research.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
              <p className="text-sm font-medium text-primary">{research.title}</p>
              <p className="text-xs text-gray-500 mt-1">{research.fundingSource} - {research.scheme} - {research.year}</p>
            </div>
          ))}
        </section>
      )}

      {activeContentTab === 'Community Services' && (
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-3">
          {services.slice(0, 4).map((service) => (
            <div key={service.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
              <p className="text-sm font-medium text-primary">{service.title}</p>
              <p className="text-xs text-gray-500 mt-1">{service.location} - {service.program} - {service.year}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
