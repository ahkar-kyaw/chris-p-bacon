import { useId, useMemo, useState } from "react";

const CATEGORY_OPTIONS = [
  "Fastening & Joining",
  "Hardware",
  "Electrical & Lighting",
  "Hand Tools",
  "Raw Materials",
  "Safety Supplies",
  "Office Supplies & Signs",
];

function makeIdFromSku(sku) {
  const clean = sku.trim();
  if (clean) return clean;
  return `tmp-${Math.random().toString(16).slice(2)}`;
}

export default function AddItem({ onAddItem, onDone }) {
  const nameId = useId();
  const detailsId = useId();
  const skuId = useId();
  const categoryId = useId();
  const qtyId = useId();

  const [values, setValues] = useState({
    name: "",
    details: "",
    sku: "",
    category: CATEGORY_OPTIONS[0],
    qty: "1",
  });

  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return values.name.trim().length > 0 && values.sku.trim().length > 0;
  }, [values.name, values.sku]);

  function update(key, next) {
    setValues((prev) => ({ ...prev, [key]: next }));
  }

  function reset() {
    setValues({
      name: "",
      details: "",
      sku: "",
      category: CATEGORY_OPTIONS[0],
      qty: "1",
    });
    setSubmitError("");
  }

  return (
    <>
      <h1>Add Item</h1>

      <section className="panel">
        <h2 className="panel__title">Item details</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();

            if (!canSubmit || isSubmitting) return;

            setSubmitError("");
            setIsSubmitting(true);

            try {
              await onAddItem({
                id: makeIdFromSku(values.sku),
                name: values.name.trim(),
                details: values.details.trim(),
                sku: values.sku.trim(),
                category: values.category,
                qty: Math.max(0, Number(values.qty || 0)),
              });

              reset();
              onDone?.();
            } catch (err) {
              setSubmitError(String(err?.message ?? err));
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <div className="form-grid">
            <label className="field" htmlFor={nameId}>
              <span>Item name</span>
              <input
                id={nameId}
                type="text"
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Example: Clamp, screw, cable…"
                required
              />
            </label>

            <label className="field" htmlFor={detailsId}>
              <span>Details</span>
              <input
                id={detailsId}
                type="text"
                value={values.details}
                onChange={(e) => update("details", e.target.value)}
                placeholder='Example: 1/4-20 thread, 3/8" length…'
              />
            </label>

            <label className="field" htmlFor={skuId}>
              <span>SKU</span>
              <input
                id={skuId}
                type="text"
                value={values.sku}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="Example: 91251A051"
                required
              />
            </label>

            <label className="field" htmlFor={categoryId}>
              <span>Category</span>
              <select
                id={categoryId}
                value={values.category}
                onChange={(e) => update("category", e.target.value)}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option value={c} key={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="field" htmlFor={qtyId}>
              <span>Quantity</span>
              <input
                id={qtyId}
                type="number"
                min="0"
                value={values.qty}
                onChange={(e) => update("qty", e.target.value)}
              />
            </label>

            <div className="form-actions">
              <button type="submit" className="button" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </button>
              <button type="button" className="button" onClick={reset} disabled={isSubmitting}>
                Reset
              </button>
            </div>
          </div>

          {submitError !== "" ? (
            <p className="muted form-hint">{submitError}</p>
          ) : !canSubmit ? (
            <p className="muted form-hint">Name and SKU are required.</p>
          ) : null}
        </form>
      </section>
    </>
  );
}