import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

function logStatic(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [static] ${message}`);
}

export function serveStatic(app: Express) {
  // In production (CommonJS bundle), __dirname is available
  // In development (ESM), we derive it from current file location
  // But here, we use a relative path from the dist directory
  const distPath = path.resolve(process.cwd(), "dist", "public");
  
  logStatic(`Static files path: ${distPath}`);
  logStatic(`Current working directory: ${process.cwd()}`);
  logStatic(`Path exists: ${fs.existsSync(distPath)}`);
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // List files in dist/public for debugging
  const files = fs.readdirSync(distPath);
  logStatic(`Files in ${distPath}: ${files.join(", ")}`);

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
    logStatic(`Serving SPA fallback for ${_req.originalUrl}, index.html exists: ${fs.existsSync(indexPath)}`);
    if (fs.existsSync(indexPath)) {
      res.type("text/html").sendFile(indexPath);
    } else {
      res.status(404).type("text/html").send("<h1>404 - Not Found</h1><p>index.html not found at " + indexPath + "</p>");
    }
  });
}
