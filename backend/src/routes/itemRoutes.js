import { handleItemFileErrors, itemUploadMiddlewareFactory } from "./itemUploadMiddleware.js";

function waitDuration(numMs) {
  return new Promise((resolve) => setTimeout(resolve, numMs));
}

function normalizeItem(body, files) {
  const sku = String(body?.sku ?? "").trim();
  const id = String(body?.id ?? sku).trim();
  const name = String(body?.name ?? "").trim();
  const details = String(body?.details ?? "").trim();
  const category = String(body?.category ?? "").trim();
  const qty = Number(body?.qty ?? 0);

  if (!id || !name || !sku || !Number.isFinite(qty)) {
    return null;
  }

  const imageFile = files?.image?.[0] ?? null;
  const pdfFile = files?.pdf?.[0] ?? null;

  return {
    id,
    name,
    details,
    sku,
    category,
    qty: Math.max(0, Math.trunc(qty)),
    imageSrc: imageFile ? `/uploads/${imageFile.filename}` : "",
    imageName: imageFile?.originalname ?? "",
    pdfSrc: pdfFile ? `/uploads/${pdfFile.filename}` : "",
    pdfName: pdfFile?.originalname ?? "",
  };
}

export function registerItemRoutes(app, itemProvider) {
  app.get("/api/items", async (req, res) => {
    try {
      await waitDuration(1000);
      const items = await itemProvider.getAllItems();
      res.json(items);
      return;
    } catch (err) {
      console.error("GET /api/items failed", err);
      res.status(500).json({ error: "Could not load items" });
      return;
    }
  });

  app.post(
    "/api/items",
    itemUploadMiddlewareFactory.fields([
      { name: "image", maxCount: 1 },
      { name: "pdf", maxCount: 1 },
    ]),
    handleItemFileErrors,
    async (req, res) => {
      const nextItem = normalizeItem(req.body, req.files);

      if (!nextItem) {
        res.status(400).json({ error: "Missing or invalid item fields" });
        return;
      }

      try {
        const { item, created } = await itemProvider.saveItem(nextItem);
        res.status(created ? 201 : 200).json(item);
        return;
      } catch (err) {
        console.error("POST /api/items failed", err);
        res.status(500).json({ error: "Could not save item" });
        return;
      }
    },
  );

  app.patch("/api/items/:itemId", async (req, res) => {
    const nextQty = Number(req.body?.qty);

    if (!Number.isFinite(nextQty)) {
      res.status(400).json({ error: "qty must be a number" });
      return;
    }

    try {
      const updatedItem = await itemProvider.updateQty(
        req.params.itemId,
        Math.max(0, Math.trunc(nextQty)),
      );

      if (!updatedItem) {
        res.sendStatus(404);
        return;
      }

      res.json(updatedItem);
      return;
    } catch (err) {
      console.error("PATCH /api/items/:itemId failed", err);
      res.status(500).json({ error: "Could not update item" });
      return;
    }
  });

  app.delete("/api/items/:itemId", async (req, res) => {
    try {
      const deleted = await itemProvider.deleteItem(req.params.itemId);

      if (!deleted) {
        res.sendStatus(404);
        return;
      }

      res.sendStatus(204);
      return;
    } catch (err) {
      console.error("DELETE /api/items/:itemId failed", err);
      res.status(500).json({ error: "Could not delete item" });
      return;
    }
  });
}