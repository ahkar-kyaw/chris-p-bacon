function matchesQuery(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [item.name, item.details, item.sku, item.category, String(item.qty ?? "")]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export default function Items({ items, query, category, onDelete, onAdjustQty }) {
  const filtered = items.filter((it) => {
    if (category && it.category !== category) return false;
    return matchesQuery(it, query);
  });

  return (
    <>
      <h1>Items</h1>

      <section className="panel">
        <h2 className="panel__title">Filters</h2>
        <p>
          Category: <strong>{category || "All"}</strong> • Search:{" "}
          <strong>{query.trim() ? query : "None"}</strong>
        </p>
      </section>

      {filtered.length === 0 ? (
        <section className="panel">
          <h2 className="panel__title">No results</h2>
          <p>Try clearing your search or choosing a different category.</p>
        </section>
      ) : (
        filtered.map((item) => (
          <section className="panel" key={item.id}>
            <div className="item-header">
              <h2 className="panel__title">{item.name}</h2>
              <button
                type="button"
                className="button button--danger"
                onClick={() => onDelete(item.id)}
                aria-label={`Delete ${item.name}`}
              >
                Delete
              </button>
            </div>

            <p className="muted">{item.details}</p>

            <dl className="item-meta">
              <div>
                <dt>SKU</dt>
                <dd>{item.sku}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{item.category || "Uncategorized"}</dd>
              </div>
              <div>
                <dt>Quantity</dt>
                <dd>
                  <div className="qty">
                    <button
                      type="button"
                      className="button button--small"
                      onClick={() => onAdjustQty(item.id, -1)}
                      aria-label={`Decrease quantity for ${item.name}`}
                    >
                      −
                    </button>
                    <span className={Number(item.qty) === 0 ? "qty__zero" : ""}>{item.qty}</span>
                    <button
                      type="button"
                      className="button button--small"
                      onClick={() => onAdjustQty(item.id, +1)}
                      aria-label={`Increase quantity for ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                </dd>
              </div>
            </dl>
          </section>
        ))
      )}
    </>
  );
}