import { NavLink, useLocation } from "react-router";
import { VALID_ROUTES } from "../shared/ValidRoutes.js";
import CategoryFilter from "./CategoryFilter.jsx";

function getNavClass({ isActive }) {
  return ["app-nav__link", isActive ? "app-nav__link--active" : ""]
    .filter(Boolean)
    .join(" ");
}

export default function AppNav({ category, onSelectCategory }) {
  const location = useLocation();
  const showCategoryFilter = location.pathname === VALID_ROUTES.ITEMS;

  return (
    <nav className="app-nav" aria-label="Primary">
      <ul className="app-nav__list">
        <li>
          <NavLink to={VALID_ROUTES.HOME} end className={getNavClass}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to={VALID_ROUTES.ITEMS} className={getNavClass}>
            Items
          </NavLink>
        </li>
        <li>
          <NavLink to={VALID_ROUTES.ADD_ITEM} className={getNavClass}>
            Add Item
          </NavLink>
        </li>
      </ul>

      {showCategoryFilter ? (
        <CategoryFilter category={category} onSelectCategory={onSelectCategory} />
      ) : null}
    </nav>
  );
}