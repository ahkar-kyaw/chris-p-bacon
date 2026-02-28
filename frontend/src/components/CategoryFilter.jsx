const CATEGORIES = [
  "Abrading & Polishing",
  "Building & Grounds",
  "Electrical & Lighting",
  "Fabricating",
  "Fastening & Joining",
  "Filtering",
  "Flow & Level Control",
  "Furniture & Storage",
  "Hand Tools",
  "Hardware",
  "Heating & Cooling",
  "Lubricating",
  "Material Handling",
  "Measuring & Inspecting",
  "Office Supplies & Signs",
  "Pipe, Tubing, Hose & Fittings",
  "Plumbing & Janitorial",
  "Power Transmission",
  "Pressure & Temperature Control",
  "Pulling & Lifting",
  "Raw Materials",
  "Safety Supplies",
  "Sawing & Cutting",
  "Sealing",
  "Shipping",
  "Suspending",
];

export default function CategoryFilter({ category, onSelectCategory }) {
  const current = category || "All";

  return (
    <details className="category-filter">
      <summary className="category-filter__summary">Category</summary>
      <ul className="category-filter__list" role="listbox" aria-label="Filter by category">
        <li>
          <button
            className={["category-filter__item", current === "All" ? "is-selected" : ""]
              .filter(Boolean)
              .join(" ")}
            type="button"
            onClick={() => onSelectCategory("")}
            aria-pressed={current === "All"}
          >
            All categories
          </button>
        </li>

        {CATEGORIES.map((label) => (
          <li key={label}>
            <button
              className={["category-filter__item", current === label ? "is-selected" : ""]
                .filter(Boolean)
                .join(" ")}
              type="button"
              onClick={() => onSelectCategory(label)}
              aria-pressed={current === label}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}