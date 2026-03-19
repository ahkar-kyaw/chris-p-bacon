import { useId, useMemo, useRef, useState } from "react";

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

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });
}

export default function AddItem({ onAddItem, onDone }) {
  const nameId = useId();
  const detailsId = useId();
  const skuId = useId();
  const categoryId = useId();
  const qtyId = useId();
  const imageId = useId();
  const pdfId = useId();

  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const [values, setValues] = useState({
    name: "",
    details: "",
    sku: "",
    category: CATEGORY_OPTIONS[0],
    qty: "1",
  });

  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
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
    setImageFile(null);
    setPdfFile(null);
    setPreviewUrl("");
    setSubmitError("");

    if (imageInputRef.current) imageInputRef.current.value = "";
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  }

  async function handleImageChanged(e) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);

    if (!file) {
      setPreviewUrl("");
      return;
    }

    try {
      const url = await readAsDataURL(file);
      setPreviewUrl(url);
    } catch {
      setPreviewUrl("");
    }
  }

  function handlePdfChanged(e) {
    const file = e.target.files?.[0] ?? null;
    setPdfFile(file);
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
              const formData = new FormData();
              formData.set("id", makeIdFromSku(values.sku));
              formData.set("name", values.name.trim());
              formData.set("details", values.details.trim());
              formData.set("sku", values.sku.trim());
              formData.set("category", values.category);
              formData.set("qty", String(Math.max(0, Number(values.qty || 0))));

              if (imageFile) formData.set("image", imageFile);
              if (pdfFile) formData.set("pdf", pdfFile);

              await onAddItem(formData);

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
                step="1"
                value={values.qty}
                onChange={(e) => update("qty", e.target.value)}
              />
            </label>

            <div className="upload-grid">
              <label className="field" htmlFor={imageId}>
                <span>Image upload optional</span>
                <input
                  id={imageId}
                  ref={imageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageChanged}
                />
              </label>

              <label className="field" htmlFor={pdfId}>
                <span>PDF upload optional</span>
                <input
                  id={pdfId}
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChanged}
                />
              </label>
            </div>

            {previewUrl !== "" ? (
              <div className="preview-wrap">
                <p className="muted">Image preview</p>
                <img className="preview-image" src={previewUrl} alt="Selected item preview" />
              </div>
            ) : null}

            {pdfFile ? <p className="muted">PDF ready to upload — {pdfFile.name}</p> : null}

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