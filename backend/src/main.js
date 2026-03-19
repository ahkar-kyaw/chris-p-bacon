import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";
import { connectMongo } from "./connectMongo.js";
import { ItemProvider } from "./ItemProvider.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
// const STATIC_DIR = getEnvVar("STATIC_DIR", false) || "../frontend/dist";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== "object") return null;

  const sku = String(raw.sku ?? "").trim();
  const id = String(raw.id ?? sku).trim();
  const name = String(raw.name ?? "").trim();
  const details = String(raw.details ?? "").trim();
  const category = String(raw.category ?? "").trim();
  const qty = Number(raw.qty ?? 0);

  if (!id || !name || !sku || !Number.isFinite(qty)) return null;

  return {
    id,
    name,
    details,
    sku,
    category,
    qty: Math.max(0, qty),
  };
}

async function startServer() {
  const mongoClient = connectMongo();
  await mongoClient.connect();
  console.log("Mongo connected");

  const itemProvider = new ItemProvider(mongoClient);
  await itemProvider.ensureIndexes();

  const app = express();
  app.use(express.json());

  app.get("/api/items", async (req, res) => {
    try {
      await wait(1000);
      const items = await itemProvider.getAllItems();
      res.json(items);
    } catch (err) {
      console.error("GET /api/items failed", err);
      res.status(500).json({ error: "Could not load items" });
    }
  });

  app.post("/api/items", async (req, res) => {
    const nextItem = normalizeItem(req.body);

    if (!nextItem) {
      res.status(400).json({ error: "Missing or invalid item fields" });
      return;
    }

    try {
      const { item, created } = await itemProvider.saveItem(nextItem);
      res.status(created ? 201 : 200).json(item);
    } catch (err) {
      console.error("POST /api/items failed", err);
      res.status(500).json({ error: "Could not save item" });
    }
  });

  app.patch("/api/items/:itemId/qty", async (req, res) => {
    const delta = Number(req.body?.delta);

    if (!Number.isFinite(delta)) {
      res.status(400).json({ error: "delta must be a number" });
      return;
    }

    try {
      const updatedItem = await itemProvider.adjustQty(req.params.itemId, delta);

      if (!updatedItem) {
        res.sendStatus(404);
        return;
      }

      res.json(updatedItem);
    } catch (err) {
      console.error("PATCH /api/items/:itemId/qty failed", err);
      res.status(500).json({ error: "Could not update quantity" });
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
    } catch (err) {
      console.error("DELETE /api/items/:itemId failed", err);
      res.status(500).json({ error: "Could not delete item" });
    }
  });

  app.use(express.static(STATIC_DIR));

  app.get(Object.values(VALID_ROUTES), (req, res) => {
    res.sendFile("index.html", { root: STATIC_DIR });
  });

  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.`);
    console.log("CTRL+C to stop.");
  });

  process.on("SIGINT", async () => {
    console.log("Shutting down...");
    server.close();
    await mongoClient.close();
    process.exit(0);
  });
}

startServer().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});