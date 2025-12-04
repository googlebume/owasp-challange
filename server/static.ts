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
  // On Vercel, __dirname points to /var/task/dist when bundled
  // We need to look for static files relative to that location
  let distPath: string;
  
  // Try multiple possible paths
  const possiblePaths = [
    // Local development
    path.resolve(process.cwd(), "dist", "public"),
    // Vercel - bundled as CJS, __dirname is dist/
    path.resolve(__dirname, "public"),
    // Vercel - alternative path
    path.join(__dirname, "..", "dist", "public"),
    // Fallback
    path.resolve(process.cwd(), "dist", "public"),
  ];
  
  logStatic(`CWD: ${process.cwd()}`);
  logStatic(`__dirname: ${__dirname}`);
  
  let foundPath: string | null = null;
  for (const p of possiblePaths) {
    logStatic(`Checking: ${p}`);
    if (fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) {
      foundPath = p;
      logStatic(`✓ Found index.html at: ${p}`);
      break;
    }
  }
  
  if (!foundPath) {
    logStatic(`✗ index.html not found in any path`);
    for (const p of possiblePaths) {
      logStatic(`  - ${p} exists: ${fs.existsSync(p)}`);
    }
    throw new Error(`Could not find index.html`);
  }
  
  distPath = foundPath;

  // List files in distPath for debugging
  const files = fs.readdirSync(distPath);
  logStatic(`✓ Files in distPath: ${files.join(", ")}`);

  // Serve static files with proper caching
  app.use(
    express.static(distPath, {
      maxAge: "1h",
      etag: false,
    })
  );

  // Serve index.html for all non-file routes (SPA fallback)
  app.use("*", (_req: Request, res: Response) => {
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      logStatic(`✓ Serving SPA: ${_req.path}`);
      res.type("text/html").sendFile(indexPath);
    } else {
      logStatic(`✗ index.html not found: ${indexPath}`);
      res.status(404).type("text/html").send(`<h1>404 - Not Found</h1><p>index.html not found</p>`);
    }
  });
}
