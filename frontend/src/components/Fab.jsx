export default function Fab({ onClick }) {
  return (
    <button className="fab" type="button" onClick={onClick} aria-label="Add item">
      <svg className="fab__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11 5h2v14h-2zM5 11h14v2H5z"></path>
      </svg>
    </button>
  );
}