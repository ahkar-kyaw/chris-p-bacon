import CategoryFilter from "./CategoryFilter.jsx";

function NavItem({ active, onClick, children }) {
  const className = ["app-nav__link", active ? "app-nav__link--active" : ""].filter(Boolean).join(" ");

  return (
    <li>
      <button type="button" className={className} onClick={onClick}>
        {children}
      </button>
    </li>
  );
}

export default function AppNav({ currentPage, onGo, category, onSelectCategory }) {
  return (
    <nav className="app-nav" aria-label="Primary">
      <ul className="app-nav__list">
        <NavItem active={currentPage === "home"} onClick={() => onGo("home")}>
          Home
        </NavItem>
        <NavItem active={currentPage === "items"} onClick={() => onGo("items")}>
          Items
        </NavItem>
        <NavItem active={currentPage === "add-item"} onClick={() => onGo("add-item")}>
          Add Item
        </NavItem>
      </ul>

      <CategoryFilter category={category} onSelectCategory={onSelectCategory} />
    </nav>
  );
}