import { useState, useEffect } from "react";
import { levels, type Level, type Difficulty } from "@shared/schema";
import { Header } from "@/components/Header";
import { LevelCard } from "@/components/LevelCard";
import { ProgressTracker } from "@/components/ProgressTracker";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Footer } from "@/components/Footer";
import { useGameState } from "@/hooks/useGameState";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Shield, Sparkles, Terminal, Lock, Zap, BookOpen } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { player, createPlayer, isLevelCompleted, getLevelScore } = useGameState();
  const [showProgress, setShowProgress] = useState(false);

  if (!player) {
    return <WelcomeScreen onStart={createPlayer} />;
  }

  const completedLevelIds = Object.values(player.progress)
    .filter(p => p.completed)
    .map(p => p.levelId);
  
  const uniqueCompletedLevels = [...new Set(completedLevelIds)];
  
  const completedDifficultiesMap: Record<number, Difficulty[]> = {};
  Object.values(player.progress).forEach(p => {
    if (p.completed) {
      if (!completedDifficultiesMap[p.levelId]) {
        completedDifficultiesMap[p.levelId] = [];
      }
      if (!completedDifficultiesMap[p.levelId].includes(p.difficulty)) {
        completedDifficultiesMap[p.levelId].push(p.difficulty);
      }
    }
  });

  const handlePlayLevel = (level: Level, difficulty: Difficulty) => {
    setLocation(`/play/${level.id}/${difficulty}`);
  };

  const isLevelUnlocked = (levelId: number) => {
    if (levelId === 1) return true;
    return uniqueCompletedLevels.includes(levelId - 1);
  };

  const getBestScore = (levelId: number): number => {
    const difficulties: Difficulty[] = ["easy", "medium", "hard"];
    return Math.max(...difficulties.map(d => getLevelScore(levelId, d)), 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        playerName={player.nickname}
        totalScore={player.totalScore}
        levelsCompleted={player.levelsCompleted}
        totalLevels={levels.length}
        onMenuClick={() => setShowProgress(!showProgress)}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold font-mono mb-2 flex items-center justify-center lg:justify-start gap-3">
                <Terminal className="h-8 w-8 text-primary" />
                OWASP TOP 10 <span className="text-primary">2025</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Пройдіть 12 інтерактивних рівнів, щоб навчитися знаходити та експлуатувати найпоширеніші веб-вразливості.
                Кожен рівень симулює реальну атаку.
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-4">
                <Badge variant="outline" className="font-mono gap-1">
                  <Shield className="h-3 w-3" />
                  Безпечне середовище
                </Badge>
                <Badge variant="outline" className="font-mono gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI підказки
                </Badge>
                <Badge variant="outline" className="font-mono gap-1">
                  <BookOpen className="h-3 w-3" />
                  Навчальний контент
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {levels.map((level) => (
                <LevelCard
                  key={level.id}
                  level={level}
                  isUnlocked={isLevelUnlocked(level.id)}
                  completedDifficulties={completedDifficultiesMap[level.id] || []}
                  bestScore={getBestScore(level.id)}
                  onPlay={(difficulty) => handlePlayLevel(level, difficulty)}
                />
              ))}
            </div>

            <div className="mt-8 p-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="font-mono font-bold text-lg">ПОРАДИ ДЛЯ ПОЧАТКІВЦІВ</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 max-w-xl mx-auto">
                <li>• Уважно читайте опис рівня та мету завдання</li>
                <li>• Починайте з легкого рівня складності</li>
                <li>• Використовуйте підказки, якщо застрягли</li>
                <li>• Вивчайте пояснення після кожного рівня</li>
              </ul>
            </div>
          </div>

          <aside className={`
            lg:w-80 xl:w-96 lg:block
            ${showProgress ? 'fixed inset-0 z-40 bg-background p-4 overflow-auto lg:relative lg:p-0' : 'hidden'}
          `}>
            {showProgress && (
              <button 
                onClick={() => setShowProgress(false)}
                className="lg:hidden absolute top-4 right-4 p-2"
              >
                ✕
              </button>
            )}
            <ProgressTracker
              completedLevels={uniqueCompletedLevels}
              completedDifficulties={completedDifficultiesMap}
              playerAchievements={player.achievements}
              totalScore={player.totalScore}
            />
          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
