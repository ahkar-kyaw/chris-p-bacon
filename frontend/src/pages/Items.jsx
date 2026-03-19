import { useEffect, useState } from "react";

function matchesQuery(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    item.name,
    item.details,
    item.sku,
    item.category,
    String(item.qty ?? ""),
    item.pdfName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export default function Items({ items, query, category, onDelete, onUpdateQty }) {
  const [draftQtyById, setDraftQtyById] = useState({});

  useEffect(() => {
    setDraftQtyById((prev) => {
      const next = {};

      for (const item of items) {
        next[item.id] = Object.prototype.hasOwnProperty.call(prev, item.id)
          ? prev[item.id]
          : String(item.qty ?? 0);
      }

      return next;
    });
  }, [items]);

  function setDraftQty(itemId, value) {
    setDraftQtyById((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  }

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
          Category: {category || "All"} • Search: {query.trim() ? query : "None"}
        </p>
      </section>

      {filtered.length === 0 ? (
        <section className="panel">
          <h2 className="panel__title">No results</h2>
          <p>Try clearing your search or choosing a different category.</p>
        </section>
      ) : (
        filtered.map((item) => {
          const draftValue = draftQtyById[item.id] ?? String(item.qty ?? 0);
          const parsedQty = Number(draftValue);
          const normalizedQty = Number.isFinite(parsedQty)
            ? Math.max(0, Math.trunc(parsedQty))
            : 0;
          const isValidQty = draftValue.trim() !== "" && Number.isFinite(parsedQty);
          const isChanged = isValidQty && normalizedQty !== Number(item.qty ?? 0);

          return (
            <section className="panel item-card" key={item.id}>
              <div className="item-card__layout">
                <div className="item-media">
                  {item.imageSrc ? (
                    <img className="item-media__image" src={item.imageSrc} alt={item.name} />
                  ) : (
                    <div className="item-media__placeholder">No image</div>
                  )}
                </div>

                <div className="item-card__content">
                  <div className="item-row">
                    <h2>{item.name}</h2>

                    <div className="item-actions">
                      <button
                        type="button"
                        className="danger"
                        onClick={() => onDelete(item.id)}
                        aria-label={`Delete ${item.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p>{item.details || "No details provided."}</p>

                  <div className="item-meta">
                    <p>
                      <strong>SKU</strong> {item.sku}
                    </p>
                    <p>
                      <strong>Category</strong> {item.category || "Uncategorized"}
                    </p>
                    <p>
                      <strong>Stored quantity</strong> {item.qty}
                    </p>
                  </div>

                  <div className="item-row">
                    <label className="field qty-editor">
                      <span>New quantity</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={draftValue}
                        onChange={(e) => setDraftQty(item.id, e.target.value)}
                      />
                    </label>

                    <div className="item-actions">
                      <button
                        type="button"
                        disabled={!isChanged}
                        onClick={() => onUpdateQty(item.id, normalizedQty)}
                      >
                        Update
                      </button>

                      {item.pdfSrc ? (
                        <a className="button-link" href={item.pdfSrc} download={item.pdfName || true}>
                          Download PDF
                        </a>
                      ) : (
                        <span className="muted">No PDF uploaded</span>
                      )}
                    </div>
                  </div>

                  {!isValidQty ? <p className="muted">Enter a valid whole number.</p> : null}
                </div>
              </div>
            </section>
          );
        })
      )}
    </>
  );
}