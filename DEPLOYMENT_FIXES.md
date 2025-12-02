# OWASP Challenge - Fixed for Vercel Deployment

## Issues Fixed

### 1. **ESM Compatibility Issue in `server/static.ts`**
   - **Problem**: Used `__dirname` which is not available in ESM modules
   - **Solution**: Replaced with `fileURLToPath(import.meta.url)` for proper path resolution
   - **Impact**: Critical for Vercel deployment which uses ESM

### 2. **Invalid GPT Model Names in `server/openai.ts`**
   - **Problem**: Referenced `gpt-5` model which doesn't exist
   - **Solution**: Changed all instances to `gpt-4-turbo` (a valid, cost-effective model)
   - **Locations Fixed**:
     - Hint generation
     - AI challenge generation
     - Answer verification
   - **Impact**: Prevents API failures when generating hints and challenges

### 3. **Async/Await in Vite Config**
   - **Problem**: `vite.config.ts` used `await` inside `defineConfig` which is not async
   - **Solution**: Removed dynamic plugin loading for production environments
   - **Impact**: Fixes build failures on Vercel

### 4. **Missing Environment Variable Handling**
   - **Problem**: No validation or graceful fallback for missing `OPENAI_API_KEY`
   - **Solution**: 
     - Added environment variable validation in server startup
     - Added API key checks in `/api/hints` and `/api/ai-challenge/*` endpoints
     - Returns graceful fallbacks when API key is missing
   - **Impact**: App won't crash if OpenAI key is not configured

### 5. **Missing Vercel Configuration**
   - **Added**: `vercel.json` - Configure routing and build settings
   - **Added**: `.vercelignore` - Exclude unnecessary files from deployment
   - **Impact**: Proper deployment configuration for Vercel

## Installation & Setup

### Local Development

1. **Install dependencies**:
```bash
npm install
```

2. **Create `.env` file** (copy from `.env.example`):
```bash
cp .env.example .env
```

3. **Add your OpenAI API Key**:
```
OPENAI_API_KEY=your_key_here
```

4. **Run development server**:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

### Building for Production

```bash
npm run build
```

This creates optimized builds in the `dist/` directory:
- `dist/public/` - Frontend static files
- `dist/index.cjs` - Backend server bundle

### Running Production Build Locally

```bash
npm start
```

## Deployment to Vercel

### Via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Via Git (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `NODE_ENV` - Set to `production`

### Environment Variables Required in Vercel

Add these in your Vercel project settings:

| Variable | Required | Value |
|----------|----------|-------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `NODE_ENV` | Yes | `production` |
| `PORT` | No | Default: 5000 |
| `DATABASE_URL` | Optional | Only if using database |

## Features After Fixes

✅ **Hint Generation** - Uses GPT-4 Turbo (works offline if API key missing)  
✅ **AI Security Challenges** - Dynamic challenge generation (graceful fallback)  
✅ **Answer Verification** - AI-powered answer checking  
✅ **Leaderboard** - Player rankings and scores  
✅ **Level Management** - 12 security challenges across OWASP categories  
✅ **Progress Tracking** - Save player progress  

## Technology Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Express.js + TypeScript
- **AI**: OpenAI API (GPT-4 Turbo)
- **Build**: esbuild + Vite
- **Deployment**: Vercel

## Troubleshooting

### "OPENAI_API_KEY not set" Warning
- The app will still work, but AI features (hints, challenges) will use fallbacks
- Add your API key to fix

### Build Fails with "Cannot find module"
- Run: `npm install`
- Run: `npm run check` to verify TypeScript

### Static Files Not Serving
- Ensure `npm run build` completes successfully
- Check that `dist/public/` exists and contains `index.html`

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process: `lsof -ti:5000 | xargs kill -9` (Linux/Mac) or `netstat -ano | findstr :5000` (Windows)

## Project Structure

```
project/
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities
│   └── public/          # Static assets
├── server/              # Express backend
│   ├── index.ts         # Server entry
│   ├── routes.ts        # API routes
│   ├── openai.ts        # OpenAI integration
│   ├── storage.ts       # Data management
│   └── static.ts        # Static file serving
├── shared/              # Shared types & schemas
├── script/              # Build scripts
└── dist/                # Production build output
```

## Key Differences from Development

In production (Vercel):
- `NODE_ENV=production`
- No hot-reloading
- Replit-specific plugins are disabled
- Static files served from `dist/public/`
- Single-pass build (no watch mode)

## Support

For issues or questions, check:
1. `.env` configuration
2. OpenAI API key validity
3. Build logs: `npm run check`
4. Server logs after `npm start`
