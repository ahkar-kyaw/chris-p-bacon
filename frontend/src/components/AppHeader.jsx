import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { VALID_ROUTES } from "../shared/ValidRoutes.js";

export default function AppHeader({
  query,
  onQueryChange,
  theme,
  onToggleTheme,
  authToken,
  onLogout,
}) {
  const searchId = useId();
  const location = useLocation();
  const showSearch = location.pathname === VALID_ROUTES.ITEMS;
  const nextThemeLabel = theme === "dark" ? "Light mode" : "Dark mode";

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleWindowClick(event) {
      if (!userMenuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    }

    window.addEventListener("click", handleWindowClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("click", handleWindowClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="app-header">
      <Link to={VALID_ROUTES.HOME} className="app-logo" aria-label="Go to home">
        <span className="app-logo__mark" aria-hidden="true">
          ▦
        </span>
        <span className="app-logo__text">Genos</span>
      </Link>

      {showSearch ? (
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
      ) : (
        <div />
      )}

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

        {authToken ? (
          <div className="user-menu" ref={userMenuRef}>
            <button
              type="button"
              className="button"
              onClick={() => setIsUserMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
            >
              User
            </button>

            {isUserMenuOpen ? (
              <div className="user-menu__panel" role="menu">
                <button
                  type="button"
                  className="user-menu__item"
                  role="menuitem"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout?.();
                  }}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <Link to={VALID_ROUTES.LOGIN} className="button-link">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}