import { useGetFeedbackQuery, useUpdateStatusMutation } from '../store/apiSlice';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  const { data, isLoading, isError, error, refetch } = useGetFeedbackQuery();
  const [updateStatus] = useUpdateStatusMutation();

  if (isLoading) return <section className="view"><p className="lede">Loading feedback…</p></section>;

  if (isError) {
    return (
      <section className="view">
        <h1>Couldn't load feedback</h1>
        <p className="lede">
          {error?.status === 403
            ? 'Your account does not have admin access.'
            : error?.data?.message || 'The API is not reachable.'}
        </p>
        <button className="btn-primary" onClick={refetch}>Try again</button>
      </section>
    );
  }

  return (
    <AdminDashboard
      feedback={data ?? []}
      onStatusChange={(id, status) => updateStatus({ id, status })}
    />
  );
}
