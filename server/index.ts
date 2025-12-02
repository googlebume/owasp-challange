import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: Buffer | null;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf ?? null;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// ---------------------------------------------------------------
// REQUEST LOGGER — SAFE VERSION
// ---------------------------------------------------------------
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  let capturedJsonResponse: any = null;

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    capturedJsonResponse = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    if (!path.startsWith("/api")) return;

    const duration = Date.now() - start;

    let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

    try {
      if (capturedJsonResponse !== null) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
    } catch {
      logLine += " :: [unserializable JSON]";
    }

    log(logLine);
  });

  next();
});

// ---------------------------------------------------------------
// STARTUP
// ---------------------------------------------------------------
(async () => {
  await registerRoutes(httpServer, app);

  // -------------------------------------------------------------
  // ERROR HANDLER — SAFE (NO THROW!)
  // -------------------------------------------------------------
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    log(`${status} ERROR: ${message}`, "error");
    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // -------------------------------------------------------------
  // FIXED PORT CONFIG (NO reusePort!)
  // -------------------------------------------------------------
  const port = parseInt(process.env.PORT || "5000", 10);

  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      // Windows ENOTSUP fix
      // reusePort: true,  <-- REMOVE THIS
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
