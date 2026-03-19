import express from "express";
import { getEnvVar } from "./getEnvVar.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const app = express();

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.  CTRL+C to stop.`);
});
