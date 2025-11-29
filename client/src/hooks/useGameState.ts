import { useState, useCallback, useEffect, useRef } from "react";
import { type GameState, type Difficulty, type PlayerProgress, difficultyConfig } from "@shared/schema";
import { getInitialGameState, calculateScore, getLevel } from "@/lib/gameData";

interface PlayerData {
  id: string;
  nickname: string;
  totalScore: number;
  levelsCompleted: number;
  achievements: string[];
  progress: Record<string, PlayerProgress>;
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState());
  const [player, setPlayer] = useState<PlayerData | null>(() => {
    const stored = localStorage.getItem("owasp-player");
    return stored ? JSON.parse(stored) : null;
  });
  const [startTime, setStartTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (player) {
      localStorage.setItem("owasp-player", JSON.stringify(player));
    }
  }, [player]);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      hintTimerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.hintTimeRemaining > 0) {
            return { ...prev, hintTimeRemaining: prev.hintTimeRemaining - 1 };
          }
          return prev;
        });
      }, 1000);

      if (gameState.timeRemaining !== null) {
        timerRef.current = setInterval(() => {
          setGameState(prev => {
            if (prev.timeRemaining !== null && prev.timeRemaining > 0) {
              return { ...prev, timeRemaining: prev.timeRemaining - 1 };
            } else if (prev.timeRemaining === 0) {
              return { ...prev, isPlaying: false };
            }
            return prev;
          });
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (hintTimerRef.current) clearInterval(hintTimerRef.current);
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.timeRemaining !== null]);

  const createPlayer = useCallback((nickname: string) => {
    const newPlayer: PlayerData = {
      id: crypto.randomUUID(),
      nickname,
      totalScore: 0,
      levelsCompleted: 0,
      achievements: [],
      progress: {},
    };
    setPlayer(newPlayer);
    return newPlayer;
  }, []);

  const startLevel = useCallback((levelId: number, difficulty: Difficulty) => {
    const config = difficultyConfig[difficulty];
    setStartTime(Date.now());
    setGameState({
      currentLevel: levelId,
      difficulty,
      timeRemaining: config.timeLimit,
      hintTimeRemaining: config.hintDelay,
      hintsRevealed: 0,
      isPlaying: true,
      isPaused: false,
      playerInput: "",
      exploitAttempted: false,
      exploitSuccess: false,
    });
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const updateInput = useCallback((input: string) => {
    setGameState(prev => ({ ...prev, playerInput: input }));
  }, []);

  const revealHint = useCallback(() => {
    setGameState(prev => {
      if (prev.hintsRevealed < 3 && prev.hintTimeRemaining === 0) {
        const config = difficultyConfig[prev.difficulty];
        return {
          ...prev,
          hintsRevealed: prev.hintsRevealed + 1,
          hintTimeRemaining: config.hintDelay,
        };
      }
      return prev;
    });
  }, []);

  const attemptExploit = useCallback((input: string): boolean => {
    const level = getLevel(gameState.currentLevel || 0);
    if (!level) return false;

    const isCorrect = input.toLowerCase().trim() === level.solution.toLowerCase().trim() ||
                      input.includes(level.solution);
    
    setGameState(prev => ({
      ...prev,
      exploitAttempted: true,
      exploitSuccess: isCorrect,
      isPlaying: !isCorrect,
    }));

    if (isCorrect && player && gameState.currentLevel) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const score = calculateScore(level.basePoints, gameState.difficulty, timeSpent, gameState.hintsRevealed);
      
      const progressKey = `${gameState.currentLevel}-${gameState.difficulty}`;
      const existingProgress = player.progress[progressKey];
      const isNewCompletion = !existingProgress?.completed;
      
      const newProgress: PlayerProgress = {
        odexId: progressKey,
        odevelId: gameState.currentLevel,
        difficulty: gameState.difficulty,
        completed: true,
        score: Math.max(score, existingProgress?.score || 0),
        timeSpent,
        hintsUsed: gameState.hintsRevealed,
        completedAt: new Date().toISOString(),
      };

      const completedLevels = new Set(
        Object.values(player.progress)
          .filter(p => p.completed)
          .map(p => p.odevelId)
      );
      if (isNewCompletion) {
        completedLevels.add(gameState.currentLevel);
      }

      const newAchievements = [...player.achievements];
      
      if (completedLevels.size >= 1 && !newAchievements.includes("first-blood")) {
        newAchievements.push("first-blood");
      }
      if (completedLevels.size >= 5 && !newAchievements.includes("hacker-rookie")) {
        newAchievements.push("hacker-rookie");
      }
      if (completedLevels.size >= 10 && !newAchievements.includes("cyber-warrior")) {
        newAchievements.push("cyber-warrior");
      }
      if (timeSpent < 30 && !newAchievements.includes("speed-demon")) {
        newAchievements.push("speed-demon");
      }
      if (gameState.hintsRevealed === 0 && !newAchievements.includes("no-hints")) {
        newAchievements.push("no-hints");
      }

      setPlayer(prev => {
        if (!prev) return prev;
        const scoreDiff = isNewCompletion ? score : Math.max(0, score - (existingProgress?.score || 0));
        return {
          ...prev,
          totalScore: prev.totalScore + scoreDiff,
          levelsCompleted: completedLevels.size,
          achievements: newAchievements,
          progress: {
            ...prev.progress,
            [progressKey]: newProgress,
          },
        };
      });
    }

    return isCorrect;
  }, [gameState, player, startTime]);

  const resetLevel = useCallback(() => {
    if (gameState.currentLevel !== null) {
      startLevel(gameState.currentLevel, gameState.difficulty);
    }
  }, [gameState.currentLevel, gameState.difficulty, startLevel]);

  const exitLevel = useCallback(() => {
    setGameState(getInitialGameState());
  }, []);

  const isLevelCompleted = useCallback((levelId: number, difficulty?: Difficulty): boolean => {
    if (!player) return false;
    if (difficulty) {
      const key = `${levelId}-${difficulty}`;
      return player.progress[key]?.completed || false;
    }
    return Object.values(player.progress).some(
      p => p.odevelId === levelId && p.completed
    );
  }, [player]);

  const getLevelScore = useCallback((levelId: number, difficulty: Difficulty): number => {
    if (!player) return 0;
    const key = `${levelId}-${difficulty}`;
    return player.progress[key]?.score || 0;
  }, [player]);

  return {
    gameState,
    player,
    createPlayer,
    startLevel,
    pauseGame,
    updateInput,
    revealHint,
    attemptExploit,
    resetLevel,
    exitLevel,
    isLevelCompleted,
    getLevelScore,
  };
}
