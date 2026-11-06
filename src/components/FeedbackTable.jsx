const STATUSES = ['Open', 'Reviewed', 'Actioned'];

export default function FeedbackTable({ rows, onStatusChange }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Category</th>
            <th>Rating</th>
            <th>Message</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => (
            <tr key={f.id}>
              <td>{f.name}</td>
              <td>
                <span className="tag">{f.category}</span>
              </td>
              <td className="rating-cell">
                {'★'.repeat(f.rating)}
                <span style={{ opacity: 0.25 }}>{'★'.repeat(5 - f.rating)}</span>
              </td>
              <td className="msg-cell">{f.message}</td>
              <td>
                <select
                  className="status-sel"
                  value={f.status}
                  onChange={(e) => onStatusChange(f.id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
