import { useMemo, useState } from 'react';
import CategoryChart from './CategoryChart';
import InsightList from './InsightList';
import FeedbackTable from './FeedbackTable';

export default function AdminDashboard({ feedback, onStatusChange }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = useMemo(
    () => ['All', ...new Set(feedback.map((f) => f.category))],
    [feedback]
  );

  const stats = useMemo(() => {
    const total = feedback.length;
    const avg = total ? feedback.reduce((s, f) => s + f.rating, 0) / total : 0;
    const counts = {};
    feedback.forEach((f) => (counts[f.category] = (counts[f.category] || 0) + 1));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const open = feedback.filter((f) => f.status === 'Open').length;
    return { total, avg, top: top ? top[0] : '—', open };
  }, [feedback]);

  const rows = feedback.filter((f) => activeFilter === 'All' || f.category === activeFilter);

  return (
    <section className="view">
      <h1>Feedback overview</h1>
      <p className="lede">What customers are telling you, sorted, scored, and ready to act on.</p>

      <div className="stat-strip">
        <div className="stat">
          <div className="stat-val">{stats.total}</div>
          <div className="stat-label">Total responses</div>
        </div>
        <div className="stat">
          <div className="stat-val">{stats.avg.toFixed(1)}</div>
          <div className="stat-label">Average rating</div>
        </div>
        <div className="stat">
          <div className="stat-val">{stats.top}</div>
          <div className="stat-label">Top category</div>
        </div>
        <div className="stat">
          <div className="stat-val">{stats.open}</div>
          <div className="stat-label">Awaiting review</div>
        </div>
      </div>

      <div className="panels">
        <div>
          <p className="panel-title">Feedback by category</p>
          <CategoryChart feedback={feedback} />
        </div>
        <div>
          <p className="panel-title">Insights</p>
          <InsightList feedback={feedback} />
        </div>
      </div>

      <p className="panel-title">All feedback</p>
      <div className="filter-row">
        {categories.map((c) => (
          <button
            key={c}
            className={'filter-chip' + (c === activeFilter ? ' active' : '')}
            onClick={() => setActiveFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <FeedbackTable rows={rows} onStatusChange={onStatusChange} />
    </section>
  );
}
