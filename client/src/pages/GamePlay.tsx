import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { levels, type Difficulty, difficultyConfig } from "@shared/schema";
import { getLevel, calculateScore, formatTime } from "@/lib/gameData";
import { Header } from "@/components/Header";
import { Timer } from "@/components/Timer";
import { DifficultySelector } from "@/components/DifficultySelector";
import { VulnerabilitySimulator } from "@/components/VulnerabilitySimulator";
import { HintPanel } from "@/components/HintPanel";
import { EducationalModal } from "@/components/EducationalModal";
import { useGameState } from "@/hooks/useGameState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Lightbulb, Pause, Play, RotateCcw, 
  Target, Clock, AlertTriangle 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GamePlay() {
  const params = useParams<{ levelId: string; difficulty: string }>();
  const [, setLocation] = useLocation();
  const levelId = parseInt(params.levelId || "1");
  const initialDifficulty = (params.difficulty || "easy") as Difficulty;
  
  const level = getLevel(levelId);
  const {
    gameState,
    player,
    startLevel,
    pauseGame,
    updateInput,
    revealHint,
    attemptExploit,
    resetLevel,
    exitLevel,
    isLevelCompleted,
    getLevelScore
  } = useGameState();

  const [showHints, setShowHints] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [timeSpentAtCompletion, setTimeSpentAtCompletion] = useState(0);
  const [playerAttempts, setPlayerAttempts] = useState<string[]>([]);

  useEffect(() => {
    if (level && !gameState.isPlaying && !showSuccess) {
      startLevel(levelId, initialDifficulty);
    }
  }, [levelId, initialDifficulty]);

  useEffect(() => {
    if (gameState.timeRemaining === 0 && gameState.difficulty === "hard") {
      exitLevel();
      setLocation("/");
    }
  }, [gameState.timeRemaining]);

  const handleSubmit = useCallback(() => {
    if (!level || !gameState.playerInput.trim()) return;
    
    setPlayerAttempts(prev => [...prev, gameState.playerInput]);
    const success = attemptExploit(gameState.playerInput);
    
    if (success) {
      const config = difficultyConfig[gameState.difficulty];
      const timeSpent = config.timeLimit 
        ? config.timeLimit - (gameState.timeRemaining || 0)
        : Math.floor((Date.now() - performance.now()) / 1000);
      
      setTimeSpentAtCompletion(timeSpent);
      const score = calculateScore(
        level.basePoints, 
        gameState.difficulty, 
        timeSpent, 
        gameState.hintsRevealed
      );
      setFinalScore(score);
      setShowSuccess(true);
    }
  }, [level, gameState, attemptExploit]);

  const handleNextLevel = () => {
    setShowSuccess(false);
    setPlayerAttempts([]);
    if (levelId < levels.length) {
      setLocation(`/play/${levelId + 1}/${gameState.difficulty}`);
      startLevel(levelId + 1, gameState.difficulty);
    } else {
      setLocation("/");
    }
  };

  const handleBackToLevels = () => {
    setShowSuccess(false);
    exitLevel();
    setLocation("/");
  };

  const handleReset = () => {
    setPlayerAttempts([]);
    resetLevel();
  };

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Рівень не знайдено</h1>
          <Button onClick={() => setLocation("/")} variant="outline">
            Повернутися на головну
          </Button>
        </div>
      </div>
    );
  }

  if (!player) {
    setLocation("/");
    return null;
  }

  const config = difficultyConfig[gameState.difficulty];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        playerName={player.nickname}
        totalScore={player.totalScore}
        levelsCompleted={player.levelsCompleted}
        totalLevels={levels.length}
      />

      <main className="flex-1 container mx-auto px-4 py-4 flex flex-col lg:flex-row gap-4">
        <aside className="lg:w-72 space-y-4">
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="font-mono">
                  LVL {level.id}
                </Badge>
                <Badge 
                  className={cn(
                    "font-mono",
                    gameState.difficulty === "easy" && "bg-green-500/20 text-green-400 border-green-500/50",
                    gameState.difficulty === "medium" && "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
                    gameState.difficulty === "hard" && "bg-red-500/20 text-red-400 border-red-500/50"
                  )}
                >
                  x{config.multiplier}
                </Badge>
              </div>
              <CardTitle className="text-lg font-mono mt-2">
                {level.nameUa}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/30 border border-muted">
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {level.objectiveUa}
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                {gameState.timeRemaining !== null ? (
                  <Timer
                    timeRemaining={gameState.timeRemaining}
                    totalTime={config.timeLimit || 300}
                    label="ЧАС"
                    size="md"
                  />
                ) : (
                  <Timer
                    timeRemaining={gameState.hintTimeRemaining}
                    totalTime={config.hintDelay}
                    label="ПІДКАЗКА"
                    size="md"
                  />
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pauseGame}
                  className="flex-1 font-mono"
                  data-testid="button-pause"
                >
                  {gameState.isPaused ? (
                    <><Play className="h-4 w-4 mr-1" /> ПРОДОВЖ.</>
                  ) : (
                    <><Pause className="h-4 w-4 mr-1" /> ПАУЗА</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex-1 font-mono"
                  data-testid="button-reset"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  СКИНУТИ
                </Button>
              </div>

              <Button
                variant={gameState.hintTimeRemaining === 0 ? "default" : "secondary"}
                onClick={() => setShowHints(true)}
                className="w-full font-mono"
                data-testid="button-open-hints"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                ПІДКАЗКИ ({3 - gameState.hintsRevealed})
                {gameState.hintTimeRemaining > 0 && (
                  <span className="ml-2 text-xs opacity-70">
                    {gameState.hintTimeRemaining}s
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={handleBackToLevels}
                className="w-full font-mono"
                data-testid="button-exit-level"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                ВИЙТИ
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Базові бали:</span>
                  <span className="text-foreground">{level.basePoints}</span>
                </div>
                <div className="flex justify-between">
                  <span>Множник:</span>
                  <span className="text-primary">x{config.multiplier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Підказки:</span>
                  <span className="text-yellow-400">-25 кожна</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="flex-1 min-h-[500px]">
          {gameState.isPaused ? (
            <Card className="h-full flex items-center justify-center border-primary/30">
              <CardContent className="text-center">
                <Pause className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold font-mono mb-2">ПАУЗА</h2>
                <p className="text-muted-foreground mb-4">
                  Гру призупинено. Натисніть "Продовжити", щоб відновити.
                </p>
                <Button onClick={pauseGame} className="font-mono">
                  <Play className="h-4 w-4 mr-2" />
                  ПРОДОВЖИТИ
                </Button>
              </CardContent>
            </Card>
          ) : (
            <VulnerabilitySimulator
              level={level}
              playerInput={gameState.playerInput}
              onInputChange={updateInput}
              onSubmit={handleSubmit}
              exploitAttempted={gameState.exploitAttempted}
              exploitSuccess={gameState.exploitSuccess}
            />
          )}
        </div>
      </main>

      <HintPanel
        levelId={levelId}
        difficulty={gameState.difficulty}
        hintsRevealed={gameState.hintsRevealed}
        hintTimeRemaining={gameState.hintTimeRemaining}
        onRevealHint={revealHint}
        isOpen={showHints}
        onClose={() => setShowHints(false)}
        playerAttempts={playerAttempts}
      />

      {showSuccess && (
        <EducationalModal
          level={level}
          difficulty={gameState.difficulty}
          score={finalScore}
          timeSpent={timeSpentAtCompletion}
          hintsUsed={gameState.hintsRevealed}
          onNextLevel={handleNextLevel}
          onBackToLevels={handleBackToLevels}
          isLastLevel={levelId >= levels.length}
        />
      )}
    </div>
  );
}
