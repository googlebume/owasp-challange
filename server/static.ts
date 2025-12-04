import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // In production (CommonJS bundle), __dirname is available
  // In development (ESM), we derive it from current file location
  // But here, we use a relative path from the dist directory
  const distPath = path.resolve(process.cwd(), "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files with proper caching
  app.use(
    express.static(distPath, {
      maxAge: "1h",
      etag: false,
    })
  );

  // Serve index.html for all non-file routes (SPA fallback)
  app.use("*", (_req: Request, res: Response) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.type("text/html").sendFile(indexPath);
    } else {
      res.status(404).type("text/html").send("<h1>404 - Not Found</h1><p>index.html not found</p>");
    }
  });
}
