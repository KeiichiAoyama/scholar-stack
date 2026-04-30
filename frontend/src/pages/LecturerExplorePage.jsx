import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BarChart3, BookOpen, Check, GraduationCap, MapPin, UserRound } from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import PublicationTrendChart from '../components/charts/PublicationTrendChart';
import QuartileBadge from '../components/ui/QuartileBadge';
import { mockArticles, mockCommunityServices, mockMetrics, mockPublicationTrend, mockResearches, mockUsers } from '../data/mock';

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

function assignLecturerArticles(lecturerId) {
  const offset = Number(lecturerId) % 5;
  return mockArticles.filter((_, index) => index % 5 === offset || index < 3);
}

export default function LecturerExplorePage() {
  const { lecturerId } = useParams();
  const [activeContentTab, setActiveContentTab] = useState('Articles');
  const [activeSource, setActiveSource] = useState('scopus');
  const lecturer = mockUsers.find((user) => String(user.id) === String(lecturerId) && user.role === 'Lecturer');

  const publications = useMemo(() => assignLecturerArticles(lecturerId), [lecturerId]);

  if (!lecturer) {
    return <Navigate to="/explore" replace />;
  }

  const department = Number(lecturerId) % 2 === 0 ? 'S1 - Informatika' : 'S1 - Sistem Informasi';
  const sourcePublications = publications.filter((article) => article.source === activeSource);
  const scoreOffset = Number(lecturerId) * 93;
  const metrics = {
    overall: Math.max(400, mockMetrics.sintaScoreOverall - scoreOffset),
    threeYear: Math.max(100, mockMetrics.sintaScore3yr - Number(lecturerId) * 21),
    affiliation: Math.max(400, mockMetrics.affilScore - scoreOffset),
    affiliationThreeYear: Math.max(100, mockMetrics.affilScore3yr - Number(lecturerId) * 21),
  };

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
                SINTA ID : {lecturer.id === 1 ? '207171' : `20${lecturer.nidn.slice(-4)}`}
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
          <PublicationTrendChart data={mockPublicationTrend} />
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
          {mockResearches.slice(0, 4).map((research) => (
            <div key={research.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
              <p className="text-sm font-medium text-primary">{research.title}</p>
              <p className="text-xs text-gray-500 mt-1">{research.fundingSource} - {research.scheme} - {research.year}</p>
            </div>
          ))}
        </section>
      )}

      {activeContentTab === 'Community Services' && (
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-3">
          {mockCommunityServices.slice(0, 4).map((service) => (
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
