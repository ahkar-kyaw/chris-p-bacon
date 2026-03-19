import { useId } from "react";
import { Link } from "react-router";

export default function AppHeader({
  query,
  onQueryChange,
  theme,
  onToggleTheme,
}) {
  const searchId = useId();
  const nextThemeLabel = theme === "dark" ? "Light mode" : "Dark mode";

  return (
    <header className="app-header">
      <Link to="/" className="app-logo" aria-label="Go to home">
        <span className="app-logo__mark" aria-hidden="true">
          ▦
        </span>
        <span className="app-logo__text">Genos</span>
      </Link>

      <form className="app-search" onSubmit={(e) => e.preventDefault()} role="search">
        <label className="sr-only" htmlFor={searchId}>
          Search inventory
        </label>
        <input
          id={searchId}
          name="q"
          type="search"
          placeholder="Search items, SKUs, categories…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          autoComplete="off"
        />
      </form>

      <div className="app-actions">
        <button
          type="button"
          className="button"
          onClick={onToggleTheme}
          aria-pressed={theme !== "dark"}
          title={nextThemeLabel}
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>

        <button type="button" className="button" onClick={() => alert("Demo only")}>
          Settings
        </button>
      </div>
    </header>
  );
}