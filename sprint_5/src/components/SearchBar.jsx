/**
 * SearchBar - a controlled input for filtering tasks in real time.
 * Lifts its value up to App.jsx via onSearchChange.
 * (Unchanged behavior — only the icon markup was swapped from an emoji
 * to an inline SVG for a more premium look.)
 */
function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="search-bar">
      <svg
        className="search-bar__icon"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        className="search-bar__input"
        placeholder="Search tasks across all columns..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {searchTerm && (
        <button
          className="search-bar__clear"
          onClick={() => onSearchChange('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
