# OWASP Challenge - Cybersecurity Training Game

## Overview

OWASP Challenge is an interactive web-based educational game designed to teach cybersecurity concepts through gamified learning. Players progress through 10 levels, each focused on a different OWASP Top 10 vulnerability, with three difficulty settings per level. The application features a cyberpunk hacker aesthetic inspired by Hacknet and Cyberpunk 2077, combining immersive terminal simulations with educational content.

The game tracks player progress, scores, and achievements while providing AI-generated hints to guide learning. Players complete levels by successfully exploiting simulated vulnerabilities in a safe, controlled environment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing with two main routes:
- `/` - Home page with level selection and progress tracking
- `/play/:levelId/:difficulty` - Gameplay interface for individual levels

**State Management**: Custom React hooks (`useGameState`) manage game state locally with localStorage persistence for player data. No global state management library is used; state is lifted and passed through props where needed.

**UI Component Library**: Radix UI primitives with custom styled wrappers (shadcn/ui pattern), providing accessible, unstyled components that are then customized with Tailwind CSS. Components are located in `client/src/components/ui/`.

**Styling**: Tailwind CSS with custom theme configuration supporting light/dark modes. Design follows a cyberpunk aesthetic with monospace fonts (JetBrains Mono, Fira Code) and neon accent colors. CSS variables enable theme switching.

**Data Fetching**: TanStack Query (React Query) v5 for server state management, with custom query client configuration in `client/src/lib/queryClient.ts`. Configured for minimal refetching and infinite stale time.

### Backend Architecture

**Runtime**: Node.js with Express.js framework, built with esbuild for production deployment.

**API Design**: RESTful API with endpoints for:
- Player management (`POST /api/players`, `GET /api/players/:id`)
- Exploit submission validation
- Hint generation requests

**Storage Strategy**: Currently uses in-memory storage (`MemStorage` class in `server/storage.ts`) implementing the `IStorage` interface. This design allows easy migration to persistent database storage (e.g., PostgreSQL with Drizzle ORM) by implementing the same interface.

**Session Management**: No authentication system currently implemented; players are identified by locally stored IDs. The architecture supports adding session-based auth with express-session and connect-pg-simple (dependencies already included).

**Development vs Production**: Development mode uses Vite middleware for HMR; production serves static files from `dist/public`. The split is managed in `server/index.ts` and `server/vite.ts`.

### Core Game Logic

**Level System**: Static level definitions in `shared/schema.ts` containing vulnerability information, objectives, solutions, and educational explanations in both English and Ukrainian. 10 levels map to OWASP Top 10 vulnerabilities.

**Difficulty Mechanics**: Three difficulties (easy, medium, hard) with different multipliers, hint delays, and time limits defined in `difficultyConfig`. Scoring combines base points, time bonuses, hint penalties, and difficulty multipliers.

**Progress Tracking**: Player progress stored as a map of `levelId-difficulty` keys to `PlayerProgress` objects, tracking completion status, score, time spent, and hints used per difficulty per level.

**Game State**: Managed through `useGameState` hook with timers for countdown and hint cooldowns, pause/resume functionality, and exploit validation.

### External Dependencies

**AI Integration**: OpenAI GPT-5 API for dynamic hint generation based on:
- Current level and difficulty
- Number of hints already revealed (progressive difficulty)
- Player's previous attempts
- Integration point: `server/openai.ts`

**Database**: Configured for PostgreSQL via Neon serverless driver (`@neondatabase/serverless`) with Drizzle ORM, though currently using in-memory storage. Database schema defined in `shared/schema.ts` with migrations in `drizzle.config.ts`.

**Fonts**: Google Fonts CDN for typography:
- JetBrains Mono (monospace, terminal text)
- Rajdhani (headings, UI labels)
- Inter (body text)
- Fira Code (code blocks)

**Third-Party UI Libraries**: Extensive use of Radix UI primitives for accessible components (accordion, dialog, dropdown, popover, etc.) wrapped with custom styling.

**Build Tools**:
- Vite for frontend development and bundling
- esbuild for backend compilation
- TypeScript for type safety across the stack
- Tailwind CSS with PostCSS for styling

**Development Tooling**: Replit-specific plugins for runtime error overlay, cartographer, and dev banner when running in Replit environment.