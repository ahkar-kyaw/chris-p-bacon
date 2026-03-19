import { NavLink } from "react-router";
import CategoryFilter from "./CategoryFilter.jsx";

function getNavClass({ isActive }) {
  return ["app-nav__link", isActive ? "app-nav__link--active" : ""]
    .filter(Boolean)
    .join(" ");
}

export default function AppNav({ category, onSelectCategory }) {
  return (
    <nav className="app-nav" aria-label="Primary">
      <ul className="app-nav__list">
        <li>
          <NavLink to="/" end className={getNavClass}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/items" className={getNavClass}>
            Items
          </NavLink>
        </li>
        <li>
          <NavLink to="/add-item" className={getNavClass}>
            Add Item
          </NavLink>
        </li>
      </ul>

      <CategoryFilter category={category} onSelectCategory={onSelectCategory} />
    </nav>
  );
}