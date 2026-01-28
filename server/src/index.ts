import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deeplTranslate } from "./deepl.js";
import { createSession, getSession } from "./sessions.js";
import { getRandomGermanWordTitle } from "./wiktionary.js";

type NextResponse = {
  id: string;
  german: string;
  english: string; // used as optional hint
};

type AnswerRequestBody = {
  id?: unknown;
  answerBg?: unknown;
};

type AnswerResponse =
  | {
      correct: true;
      german: string;
      english: string;
      bulgarian: string;
    }
  | {
      correct: false;
      message: string;
    };

function normalizeBg(s: string): string {
  return s.trim().toLowerCase();
}

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/next", async (_req, res) => {
    const authKey = process.env.DEEPL_AUTH_KEY ?? "";
    if (!authKey.trim()) {
      return res.status(500).json({
        error: "Missing DEEPL_AUTH_KEY. Create server/.env with your DeepL key (see server/.env.example)."
      });
    }

    try {
      const german = await getRandomGermanWordTitle();
      const [english, bulgarian] = await Promise.all([
        deeplTranslate({ authKey, text: german, sourceLang: "DE", targetLang: "EN" }),
        deeplTranslate({ authKey, text: german, sourceLang: "DE", targetLang: "BG" })
      ]);

      const id = crypto.randomUUID();
      createSession({ id, german, english, bulgarian });

      const payload: NextResponse = { id, german, english };
      return res.json(payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch/translate word.";
      return res.status(502).json({ error: msg });
    }
  });

  app.post("/api/answer", (req, res) => {
    const body: AnswerRequestBody = req.body ?? {};

    const id = typeof body.id === "string" ? body.id : "";
    const answerBg = typeof body.answerBg === "string" ? body.answerBg : "";

    if (!id) {
      const payload: AnswerResponse = { correct: false, message: "Missing word id. Please get a new word." };
      return res.status(400).json(payload);
    }

    if (!answerBg.trim()) {
      const payload: AnswerResponse = { correct: false, message: "Please type a Bulgarian translation." };
      return res.status(400).json(payload);
    }

    const session = getSession(id);
    if (!session) {
      const payload: AnswerResponse = { correct: false, message: "Unknown/expired word id. Please get a new word." };
      return res.status(400).json(payload);
    }

    const ok = normalizeBg(answerBg) === normalizeBg(session.bulgarian);
    if (ok) {
      const payload: AnswerResponse = {
        correct: true,
        german: session.german,
        english: session.english,
        bulgarian: session.bulgarian
      };
      return res.json(payload);
    }

    const payload: AnswerResponse = { correct: false, message: "Not quite — try again." };
    return res.status(200).json(payload);
  });

  return app;
}

async function attachViteIfDev(app: express.Express) {
  if (process.env.NODE_ENV === "production") return;

  // Single-process dev server (Express + Vite middleware) to avoid port/proxy issues.
  const { createServer: createViteServer } = await import("vite");
  const react = (await import("@vitejs/plugin-react")).default;

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientRoot = path.resolve(__dirname, "../../client");

  const vite = await createViteServer({
    root: clientRoot,
    appType: "spa",
    // Some environments have very constrained ports; disabling HMR avoids websocket port conflicts.
    server: { middlewareMode: true, hmr: false },
    plugins: [react()]
  });

  app.use(vite.middlewares);

  // Serve index.html for everything else (SPA).
  app.use("*", async (req, res, next) => {
    try {
      if (req.originalUrl.startsWith("/api")) return next();

      const url = req.originalUrl;
      const indexPath = path.join(clientRoot, "index.html");
      let html = fs.readFileSync(indexPath, "utf-8");
      html = await vite.transformIndexHtml(url, html);

      res.status(200).setHeader("Content-Type", "text/html").end(html);
    } catch (e) {
      if (e instanceof Error) vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

function attachStaticIfProd(app: express.Express) {
  if (process.env.NODE_ENV !== "production") return;

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = path.resolve(__dirname, "../../client/dist");

  if (!fs.existsSync(clientDist)) return;

  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

async function main() {
  const app = createApp();
  attachStaticIfProd(app);
  await attachViteIfDev(app);

  async function listenOn(port: number): Promise<number> {
    return await new Promise<number>((resolve, reject) => {
      const server = app.listen(port);
      server.once("listening", () => {
        const addr = server.address();
        const actualPort = typeof addr === "object" && addr ? addr.port : port;
        resolve(actualPort);
      });
      server.once("error", (err) => {
        reject(err);
      });
    });
  }

  const requestedPort = process.env.PORT ? Number(process.env.PORT) : 0;
  try {
    const port = await listenOn(Number.isFinite(requestedPort) ? requestedPort : 0);
    // eslint-disable-next-line no-console
    console.log(`Dev server running at http://localhost:${port}`);
  } catch {
    const port = await listenOn(0);
    // eslint-disable-next-line no-console
    console.log(`Dev server running at http://localhost:${port}`);
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

