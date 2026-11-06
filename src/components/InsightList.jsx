export default function InsightList({ feedback }) {
  const byCat = {};
  feedback.forEach((f) => {
    byCat[f.category] = byCat[f.category] || { sum: 0, n: 0 };
    byCat[f.category].sum += f.rating;
    byCat[f.category].n += 1;
  });
  const cats = Object.entries(byCat).map(([cat, v]) => ({ cat, avg: v.sum / v.n }));
  const weakest = [...cats].sort((a, b) => a.avg - b.avg)[0];
  const strongest = [...cats].sort((a, b) => b.avg - a.avg)[0];
  const openCount = feedback.filter((f) => f.status === 'Open').length;
  const lowCount = feedback.filter((f) => f.rating <= 2).length;

  const items = [];
  if (weakest)
    items.push({
      color: 'var(--coral)',
      text: `${weakest.cat} has the lowest average rating (${weakest.avg.toFixed(1)}) — worth a closer look.`,
    });
  if (strongest)
    items.push({
      color: 'var(--sage)',
      text: `${strongest.cat} is your strongest area (${strongest.avg.toFixed(1)} average).`,
    });
  items.push({
    color: 'var(--amber)',
    text: `${openCount} response${openCount === 1 ? '' : 's'} still awaiting review.`,
  });
  if (lowCount > 0)
    items.push({
      color: 'var(--coral)',
      text: `${lowCount} low rating${lowCount === 1 ? '' : 's'} (2★ or below) may need direct follow-up.`,
    });

  return (
    <ul className="insight-list">
      {items.map((item, i) => (
        <li key={i} className="insight-item">
          <span className="insight-dot" style={{ background: item.color }} />
          {item.text}
        </li>
      ))}
    </ul>
  );
}
