function countLowStock(items, threshold = 3) {
  return items.filter((it) => Number(it.qty) > 0 && Number(it.qty) <= threshold).length;
}

function countOutOfStock(items) {
  return items.filter((it) => Number(it.qty) === 0).length;
}

export default function Home({ items, onGoItems, onGoAdd }) {
  const total = items.length;
  const low = countLowStock(items);
  const out = countOutOfStock(items);

  return (
    <>
      <h1>Home</h1>

      <section className="panel">
        <h2 className="panel__title">Overview</h2>
        <p>
          Total items: <strong>{total}</strong> • Low stock: <strong>{low}</strong> • Out of stock:{" "}
          <strong>{out}</strong>
        </p>
      </section>

      <section className="panel">
        <h2 className="panel__title">Quick actions</h2>
        <p>
          <button type="button" className="button" onClick={onGoItems}>
            View items
          </button>
        </p>
        <p>
          <button type="button" className="button" onClick={onGoAdd}>
            Add item
          </button>
        </p>
      </section>

      <section className="panel">
        <h2 className="panel__title">Recent activities</h2>
        <p>This is a demo note.</p>
      </section>
    </>
  );
}