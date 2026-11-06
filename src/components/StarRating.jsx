export default function StarRating({ value, onChange }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={'star-btn' + (n <= value ? ' filled' : '')}
          onClick={() => onChange(n)}
          aria-label={n + ' star' + (n === 1 ? '' : 's')}
        >
          ★
        </button>
      ))}
    </div>
  );
}
