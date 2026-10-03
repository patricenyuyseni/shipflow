import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { router } from "./routes";
import { errorHandler, notFound } from "./middleware/error";

export const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use("/api", router);

// In production the API also serves the built React app (same origin, so no CORS needed).
const clientDist = path.resolve(__dirname, "../../client/dist");
if (env.NODE_ENV === "production" && fs.existsSync(path.join(clientDist, "index.html"))) {
  app.use(express.static(clientDist, { index: false, maxAge: "1h" }));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

app.use(notFound);
app.use(errorHandler);
