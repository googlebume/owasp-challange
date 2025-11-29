import { levels, achievements, type Level, type Achievement, type Difficulty, type GameState, type PlayerProgress, difficultyConfig } from "@shared/schema";

export { levels, achievements, difficultyConfig };
export type { Level, Achievement, Difficulty, GameState, PlayerProgress };

export const getLevel = (id: number): Level | undefined => {
  return levels.find(l => l.id === id);
};

export const getDifficultyConfig = (difficulty: Difficulty) => {
  return difficultyConfig[difficulty];
};

export const calculateScore = (basePoints: number, difficulty: Difficulty, timeSpent: number, hintsUsed: number): number => {
  const multiplier = difficultyConfig[difficulty].multiplier;
  const timeBonus = Math.max(0, 100 - Math.floor(timeSpent / 10));
  const hintPenalty = hintsUsed * 25;
  return Math.max(10, Math.floor((basePoints + timeBonus - hintPenalty) * multiplier));
};

export const getLevelIcon = (vulnerability: string): string => {
  const icons: Record<string, string> = {
    "BAC": "Shield",
    "Crypto": "Key",
    "Supply Chain": "Package",
    "SQL Injection": "Database",
    "Misconfiguration": "Settings",
    "Outdated": "Clock",
    "Auth Bypass": "Lock",
    "Secrets Exposure": "Eye",
    "Log Analysis": "FileText",
    "Error Handling": "AlertTriangle",
  };
  return icons[vulnerability] || "Bug";
};

export const getDifficultyColor = (difficulty: Difficulty): string => {
  const colors: Record<Difficulty, string> = {
    easy: "text-green-400",
    medium: "text-yellow-400", 
    hard: "text-red-400",
  };
  return colors[difficulty];
};

export const getDifficultyBgColor = (difficulty: Difficulty): string => {
  const colors: Record<Difficulty, string> = {
    easy: "bg-green-500/20 border-green-500/50",
    medium: "bg-yellow-500/20 border-yellow-500/50",
    hard: "bg-red-500/20 border-red-500/50",
  };
  return colors[difficulty];
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getInitialGameState = (): GameState => ({
  currentLevel: null,
  difficulty: "easy",
  timeRemaining: null,
  hintTimeRemaining: 30,
  hintsRevealed: 0,
  isPlaying: false,
  isPaused: false,
  playerInput: "",
  exploitAttempted: false,
  exploitSuccess: false,
});
