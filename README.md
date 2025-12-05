# OWASP Challenge 🎮🔐

An interactive educational platform for learning web security vulnerabilities through gamified challenges inspired by OWASP Top 10. Built with React, Express, TypeScript, and modern web technologies.

## 🎯 Overview

OWASP Challenge is a cyberpunk-themed hacker training platform that makes learning security vulnerabilities engaging and fun. Players progress through 10 levels covering critical web security concepts, each with multiple difficulty settings and AI-generated challenges.

**Key Features:**
- 🎮 **Gamified Learning**: Progress through 10 security challenge levels
- 📊 **Three Difficulty Modes**: Easy, Medium, Hard with different multipliers and time constraints
- 💡 **Smart Hint System**: Progressive hints that unlock based on time delays
- 🤖 **AI-Generated Challenges**: OpenAI integration for dynamic, personalized security scenarios
- 🌙 **Dark/Light Theme**: Cyberpunk aesthetic with full theme support
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🌐 **Bilingual**: Full English and Ukrainian language support
- 🏆 **Achievement System**: Track progress with achievements and certificates
- ⏱️ **Time Tracking**: Monitor time spent on each level

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL 16+ (for production database)
- OpenAI API key (for AI-generated challenges)

### Installation

```bash
# Clone the repository
git clone https://github.com/googlebume/owasp-challange.git
cd owasp-challange

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://user:password@localhost:5432/owasp_db
NODE_ENV=development
PORT=5000
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Run in browser
# Open http://localhost:5000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
owasp-challange/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   │   ├── ui/          # Radix UI library components
│   │   │   ├── GamePlay.tsx # Main game interface
│   │   │   ├── Home.tsx     # Landing page
│   │   │   └── ...
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities & game data
│   │   └── pages/           # Page components
│   └── index.html
├── server/                   # Express backend
│   ├── index.ts            # Entry point, middleware setup
│   ├── routes.ts           # API endpoints
│   ├── openai.ts           # OpenAI integration
│   ├── static.ts           # Static file serving
│   └── storage.ts          # Database interactions
├── shared/                 # Shared types & schemas
│   └── schema.ts           # Zod validation schemas
├── script/                 # Build scripts
│   └── build.ts            # Build automation
├── vite.config.ts          # Vite configuration (frontend)
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── components.json         # shadcn/ui components config
├── drizzle.config.ts       # Database migrations
└── package.json            # Dependencies & scripts
```

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React with TypeScript
- **Build Tool**: Vite 5.4.20
- **Styling**: TailwindCSS 3 + PostCSS
- **UI Components**: Radix UI (headless component library)
- **State Management**: TanStack Query (data fetching)
- **Forms**: React Hook Form + Zod validation
- **Animations**: CSS transitions & React states

### Backend (Express + TypeScript)
- **Framework**: Express.js 4.21.2
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas
- **AI Integration**: OpenAI API (GPT-4 Turbo)
- **Session Management**: express-session + connect-pg-simple

### Security Features
- 🔒 Input validation with Zod
- 🛡️ SQL injection prevention (Drizzle ORM)
- 🔐 Secure session handling
- ✅ CORS configuration
- 📝 Rate limiting (configurable)

## 📊 Game Mechanics

### Difficulty Levels

| Difficulty | Hint Delay | Time Limit | Point Multiplier |
|-----------|-----------|-----------|------------------|
| **Easy** | 30s | None | 1x |
| **Medium** | 60s | None | 2x |
| **Hard** | 120s | 60s | 3x |

### Scoring System
```
Base Points = Vulnerability Base Score
Bonus = 1 - (Time Spent / Time Limit)
Hints Penalty = Hints Used × 10%
Final Score = Base Points × Difficulty Multiplier × (1 - Hints Penalty) × Bonus
```

### Achievements
- Complete levels on different difficulties
- Solve without using hints
- Speed run challenges
- Complete all levels in a difficulty tier

## 🔄 API Endpoints

### Player Management
- `POST /api/players` - Create new player
- `GET /api/players/:id` - Get player profile
- `PUT /api/players/:id` - Update player progress

### Levels & Challenges
- `GET /api/levels` - Get all levels
- `GET /api/levels/:id` - Get specific level
- `POST /api/exploit` - Submit exploit attempt
- `POST /api/hint` - Request hint (with delay management)

### AI Challenges
- `POST /api/ai-challenge` - Generate AI-based challenge
- `POST /api/ai-challenge/verify` - Verify AI challenge answer
- `POST /api/ai-challenge/next` - Get next step in multi-step challenge

## 🎨 Design System

### Color Scheme
- **Primary**: Neon cyan & purple (cyberpunk aesthetic)
- **Background**: Dark slate with subtle gradients
- **Accent**: Neon green for success states
- **Warning**: Neon orange for alerts

### Typography
- **Headings**: Rajdhani (clean sans-serif)
- **Body**: Inter (readable sans-serif)
- **Code/Terminal**: JetBrains Mono (monospace)

### Component Categories
- **UI Primitives**: Button, Input, Card, Dialog
- **Complex**: Accordion, Carousel, Navigation Menu
- **Game-Specific**: VulnerabilitySimulator, HintPanel, ScoreDisplay

## 🗄️ Database Schema

### Key Tables
- `players` - User accounts
- `player_progress` - Per-level completion tracking
- `challenges` - Security challenge definitions
- `achievements` - Achievement definitions
- `player_achievements` - Awarded achievements

Database managed with Drizzle ORM and migrations.

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Build and deploy
npm run build
git push origin main
# Automatic deployment via GitHub Actions
```

Configuration files:
- `vercel.json` - Deployment settings
- `.vercelignore` - Files to exclude

### Local/Self-Hosted
```bash
npm run build
npm start
# Server runs on PORT (default 5000)
```

## 🔧 Development Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check

# Database migrations
npm run db:push

# View database GUI
npx drizzle-kit studio
```

## 📚 Educational Content

### Vulnerability Categories
1. **SQL Injection** - Database attack vectors
2. **XSS (Cross-Site Scripting)** - Client-side injection
3. **CSRF (Cross-Site Request Forgery)** - Unauthorized actions
4. **Authentication Bypass** - Session & credential attacks
5. **Authorization Flaws** - Access control issues
6. **Sensitive Data Exposure** - Information disclosure
7. **XML External Entities** - XXE attacks
8. **Broken Access Control** - Privilege escalation
9. **Insecure Deserialization** - Object injection
10. **Using Components with Known Vulnerabilities** - Dependency risks

Each level includes:
- 📖 Detailed explanation (Ukrainian + English)
- 🎮 Interactive vulnerability simulation
- 💡 Progressive hint system
- 🤖 AI-generated scenarios (Medium/Hard)
- 📊 Real-world impact description

## 🤖 AI Integration

Powered by OpenAI GPT-4 Turbo:
- **Dynamic Challenges**: Generate context-aware security scenarios
- **Hint Generation**: Smart hints based on vulnerability type
- **Answer Verification**: Validate user responses against security concepts
- **Personalization**: Adapt difficulty based on performance

## 🌐 Internationalization

- **Languages**: English, Ukrainian
- **Features**:
  - Challenge descriptions in both languages
  - Explanations & solutions in both languages
  - UI fully localized
  - Date/time formatting per locale

## 🧪 Testing

```bash
# Run type checking
npm run check

# Lint code (optional setup)
npm run lint
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support & Issues

Found a bug? Have a feature request?
- Open an issue on GitHub
- Check existing issues first
- Include reproduction steps for bugs

## 🎓 Learning Resources

### OWASP Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)

### Web Security Courses
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [HackTheBox](https://www.hackthebox.com/)
- [TryHackMe](https://tryhackme.com/)

## 🙏 Acknowledgments

- Inspired by OWASP educational initiatives
- UI design inspired by Hacknet, Cyberpunk 2077
- Gamification mechanics from Duolingo
- Built with amazing open-source tools

---

**Happy hacking! 🔓 Learn security the fun way.** 🎮
