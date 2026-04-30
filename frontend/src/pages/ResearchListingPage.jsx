import MetricCard from '../components/ui/MetricCard';
import PublicationTrendChart from '../components/charts/PublicationTrendChart';
import Button from '../components/ui/Button';
import { usePagination } from '../hooks/usePagination';
import { mockResearches, mockMetrics, mockPublicationTrend } from '../data/mock';

const STATUS_COLORS = {
  Active: 'bg-green-100 text-green-700',
  Completed: 'bg-gray-100 text-gray-600',
};

export default function ResearchListingPage() {
  const { currentPage, totalPages, paginatedItems, goToPage, totalItems } = usePagination(mockResearches, 10);

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="SINTA Score Overall" value={mockMetrics.sintaScoreOverall} />
        <MetricCard title="SINTA Score 3Yr" value={mockMetrics.sintaScore3yr} />
        <MetricCard title="Affil Score" value={mockMetrics.affilScore} />
        <MetricCard title="Affil Score 3Yr" value={mockMetrics.affilScore3yr} />
      </div>

      {/* Publication Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Research Activity Trend</h3>
        <PublicationTrendChart data={mockPublicationTrend} />
      </div>

      {/* Actions + info */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="danger" size="sm">Reset Document</Button>
          <Button variant="primary" size="sm">Req. Synchronization</Button>
        </div>
        <p className="text-xs text-gray-500">
          Page {currentPage} of {totalPages || 1} | Total Records: {totalItems}
        </p>
      </div>

      {/* Research list */}
      <div className="space-y-3">
        {paginatedItems.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary">{r.title}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                  <span>Funding: {r.fundingSource}</span>
                  <span>Scheme: {r.scheme}</span>
                  <span>Year: {r.year}</span>
                  <span>Members: {r.members}</span>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}>
                {r.status}
              </span>
            </div>
          </div>
        ))}
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
