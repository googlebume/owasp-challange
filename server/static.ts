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
  // On Vercel and in production, look for static files in dist/
  // The build process puts everything in dist/public, but we also check dist root
  let distPath: string;
  
  const publicPath = path.resolve(process.cwd(), "dist", "public");
  const distRootPath = path.resolve(process.cwd(), "dist");
  
  logStatic(`CWD: ${process.cwd()}`);
  logStatic(`Public path exists: ${fs.existsSync(publicPath)}`);
  logStatic(`Dist root path exists: ${fs.existsSync(distRootPath)}`);
  
  if (fs.existsSync(publicPath) && fs.existsSync(path.join(publicPath, "index.html"))) {
    distPath = publicPath;
    logStatic(`✓ Using public path: ${publicPath}`);
  } else if (fs.existsSync(distRootPath) && fs.existsSync(path.join(distRootPath, "index.html"))) {
    distPath = distRootPath;
    logStatic(`✓ Using dist root path: ${distRootPath}`);
  } else {
    distPath = publicPath; // fallback
    logStatic(`⚠ Using fallback path: ${distPath}`);
  }
  
  if (!fs.existsSync(distPath)) {
    const errorMsg = `✗ Static directory not found: ${distPath}`;
    logStatic(errorMsg);
    throw new Error(errorMsg);
  }

  // List files in dist/public for debugging
  const files = fs.readdirSync(distPath);
  logStatic(`✓ Files in ${distPath}: ${files.join(", ")}`);
  
  // Check if index.html exists
  const indexPath = path.join(distPath, "index.html");
  logStatic(`✓ Index.html exists: ${fs.existsSync(indexPath)}`);

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
      logStatic(`✓ Serving SPA: ${_req.path}`);
      res.type("text/html").sendFile(indexPath);
    } else {
      logStatic(`✗ index.html not found: ${indexPath}`);
      res.status(404).type("text/html").send(`<h1>404 - Not Found</h1><p>index.html not found at ${indexPath}</p>`);
    }
  });
}
