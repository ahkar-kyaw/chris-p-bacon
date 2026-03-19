import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
// const STATIC_DIR = getEnvVar("STATIC_DIR", false) || "../frontend/dist";
const STATIC_DIR = getEnvVar("STATIC_DIR") || "public";
const app = express();

app.use(express.static(STATIC_DIR));

app.get(Object.values(VALID_ROUTES), (req, res) => {
  res.sendFile("index.html", { root: STATIC_DIR });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}. CTRL+C to stop.`);
});