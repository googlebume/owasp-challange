# OWASP Challenge - Design Guidelines

## Design Approach

**Reference-Based Approach**: Cyberpunk hacker training aesthetic inspired by Hacknet, Cyberpunk 2077 UI, and modern educational gaming platforms like Duolingo's gamification mechanics.

**Core Principles**:
- Immersive hacker terminal aesthetic with tech-forward visual language
- Clear information hierarchy for educational content
- Engaging game mechanics with immediate visual feedback
- Progressive difficulty visualization
- Accessibility within a stylized interface

## Typography

**Font Families** (via Google Fonts CDN):
- Primary: 'JetBrains Mono' - monospace for code, terminal text, level numbers
- Secondary: 'Rajdhani' - clean sans-serif for headings, UI labels
- Body: 'Inter' - readable for educational explanations and longer text

**Hierarchy**:
- H1: 3xl-4xl, uppercase, letter-spacing wide for level titles
- H2: 2xl-3xl, medium weight for section headers
- H3: xl-2xl for vulnerability names
- Body: base-lg for explanations, descriptions
- Code/Terminal: sm-base monospace for simulated environments
- UI Labels: xs-sm, uppercase, tracked for buttons and status

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-20
- Grid gaps: gap-4 to gap-8
- Margins: m-2 to m-6 for tight spacing

**Grid Structure**:
- Main game area: 80% width centered with sidebars
- Level select: grid-cols-2 md:grid-cols-5 (2x5 grid for 10 levels)
- Difficulty badges: flex row with gap-4
- Score/progress: fixed top bar, full width
- Hint panel: slide-in from right, w-96

## Component Library

### Navigation & Header
- Fixed top bar with: Logo (left), Score/Timer (center), Profile/Settings (right)
- Progress indicator: Linear progress bar spanning full width below header
- Height: h-16 for main nav, h-2 for progress bar

### Level Selection Hub
- Grid of 10 level cards (2 columns mobile, 5 columns desktop)
- Each card: Locked/Unlocked state, Level number, Vulnerability name, Difficulty selector (3 pills), Best score
- Card dimensions: aspect-square with p-6
- Hover state: scale-105 transform with glow effect

### Game Interface
**Layout**: Three-panel design
- Left sidebar (w-64): Current objective, hints button, timer display
- Center (flex-1): Simulated vulnerable environment (iframe-like container)
- Right panel (slide-out, w-80): Educational content, explanations

**Vulnerable Environment Container**:
- Full height terminal-style interface
- min-h-96 with overflow-scroll
- Simulated browser/terminal window chrome
- Input fields styled as terminal prompts

### Difficulty Selector
- Three pills: "EASY", "MEDIUM", "HARD"
- Display timer thresholds: 30s, 60s, 120s
- Score multipliers: x1, x2, x3
- Active state: filled with glow, inactive: outlined

### Timer Component
- Circular progress ring for visual countdown
- Digital readout in center (monospace font)
- Warning state triggers at 25% remaining time
- Dimensions: w-24 h-24 for sidebar, w-16 h-16 for compact

### Hints System
- Slide-in panel from right (w-96)
- AI badge indicator showing GPT-generated content
- Hint reveals progressively (blur-to-clear animation)
- Close button (top-right): icon-only, rounded-full

### Score Display
- Large numbers (4xl) with small labels
- Animated counter on score changes
- Breakdown: Base points + Difficulty multiplier = Total
- Achievement badges (unlock animations)

### Educational Panels
**Post-Level Explanation**:
- Modal overlay: max-w-4xl centered
- Three sections: "What happened", "How to exploit", "How to defend"
- Code snippets: syntax-highlighted within cards
- "Next Level" CTA button (prominent, w-full at bottom)

### Interactive Elements
**Buttons**:
- Primary CTA: px-8 py-4, uppercase, tracking-wide
- Secondary: outlined variant, px-6 py-3
- Icon buttons: rounded-full, w-12 h-12
- Terminal submit: full-width, attached to input

**Input Fields**:
- Terminal style: transparent background, monospace, border-b-2
- Form inputs (settings): rounded-lg, px-4 py-3
- Focus states: outline with offset

**Cards**:
- Vulnerability cards: rounded-xl, p-6, border with glow effect
- Level cards: rounded-lg, p-8, hover elevation
- Info cards: rounded-md, p-4 for tips

### Status Indicators
- Badge system: rounded-full px-3 py-1, text-xs uppercase
- States: Locked, Available, Completed, Perfect Score
- Progress rings for overall completion
- Streak counter with flame icon

### Data Visualization
- Level completion: 10-segment linear progress
- Score leaderboard: Ranked list with avatars, w-full table
- Achievement grid: 3-4 columns of unlockable badges
- Stats dashboard: 2x2 grid of metric cards

## Animations

Use sparingly for maximum impact:
- Level unlock: Scale + fade-in (300ms)
- Score increment: Number count-up with slight scale pulse
- Hint reveal: Blur-to-clear transition (500ms)
- Success/Failure feedback: Screen flash + shake (brief, 200ms)
- Panel slide-ins: Smooth translate-x (300ms ease-out)
- Timer warning: Gentle pulse at <25% (1s interval)
- Achievement pop: Scale-up + confetti (optional, 500ms)

## Images

**Hero Section**: Full-width cyberpunk cityscape background (neon-lit, dark atmosphere)
- Dimensions: h-screen or min-h-96
- Overlay: semi-transparent gradient for text readability
- CTA buttons: blurred background (backdrop-blur-md)

**Level Thumbnails**: Abstract tech/circuit patterns representing each vulnerability type
- Dimensions: square, 200x200px minimum
- Placement: Background of level cards with overlay

**Achievement Badges**: Icon-based badges for milestones
- Source: Custom SVG via icon library (Heroicons or similar)
- Dimensions: w-16 h-16 for display, w-8 h-8 for inline

**Educational Diagrams**: Simple vector illustrations showing attack vectors
- Placement: Within post-level explanation modals
- Style: Line-art, simplified technical diagrams

## Accessibility

- High contrast terminal aesthetic ensures readability
- All interactive elements: min-h-12 touch targets
- Keyboard navigation: Tab order through all game elements
- Screen reader labels for score changes, timer, level completion
- Focus indicators: 2px offset outline on all interactive elements
- Text remains readable at 200% zoom
- Skip-to-main-content link for navigation bypass

## Responsive Breakpoints

- Mobile (base): Single column, stacked panels, level grid 1-2 columns
- Tablet (md:768px): 2-column level grid, compact sidebar
- Desktop (lg:1024px): Full three-panel layout, 5-column level grid
- Wide (xl:1280px): Spacious layout with expanded educational panels