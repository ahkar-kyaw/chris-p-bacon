import { mkdirSync } from "node:fs";
import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";
import { connectMongo } from "./connectMongo.js";
import { ItemProvider } from "./ItemProvider.js";
import { CredentialsProvider } from "./CredentialsProvider.js";
import { registerItemRoutes } from "./routes/itemRoutes.js";
import { registerAuthRoutes } from "./routes/authRoutes.js";
import { verifyAuthToken } from "./routes/verifyAuthToken.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR", false) || "../frontend/dist";
const UPLOAD_DIR = getEnvVar("UPLOAD_DIR", false) || "uploads";

async function startServer() {
  const mongoClient = connectMongo();
  await mongoClient.connect();
  console.log("Mongo connected");

  const itemProvider = new ItemProvider(mongoClient);
  await itemProvider.ensureIndexes();

  const credentialsProvider = new CredentialsProvider(mongoClient);
  await credentialsProvider.ensureIndexes();

  mkdirSync(UPLOAD_DIR, { recursive: true });

  const app = express();
  app.use(express.json());

  app.use("/uploads", express.static(UPLOAD_DIR));

  registerAuthRoutes(app, credentialsProvider);

  app.use("/api/items", verifyAuthToken);
  registerItemRoutes(app, itemProvider);

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