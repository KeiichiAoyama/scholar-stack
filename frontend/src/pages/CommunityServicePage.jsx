import MetricCard from '../components/ui/MetricCard';
import PublicationTrendChart from '../components/charts/PublicationTrendChart';
import Button from '../components/ui/Button';
import { usePagination } from '../hooks/usePagination';
import { mockCommunityServices, mockMetrics, mockPublicationTrend } from '../data/mock';

export default function CommunityServicePage() {
  const { currentPage, totalPages, paginatedItems, goToPage, totalItems } = usePagination(mockCommunityServices, 10);

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="SINTA Score Overall" value={mockMetrics.sintaScoreOverall} />
        <MetricCard title="SINTA Score 3Yr" value={mockMetrics.sintaScore3yr} />
        <MetricCard title="Affil Score" value={mockMetrics.affilScore} />
        <MetricCard title="Affil Score 3Yr" value={mockMetrics.affilScore3yr} />
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Community Service Activity Trend</h3>
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

      {/* List */}
      <div className="space-y-3">
        {paginatedItems.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-primary">{s.title}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
              <span>Location: {s.location}</span>
              <span>Year: {s.year}</span>
              <span>Program: {s.program}</span>
              <span>Community: {s.community}</span>
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
