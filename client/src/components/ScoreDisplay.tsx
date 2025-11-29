import { useEffect, useState } from "react";
import { Trophy, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Difficulty } from "@shared/schema";

interface ScoreDisplayProps {
  basePoints: number;
  difficulty: Difficulty;
  timeBonus: number;
  hintPenalty: number;
  totalScore: number;
  animate?: boolean;
}

export function ScoreDisplay({
  basePoints,
  difficulty,
  timeBonus,
  hintPenalty,
  totalScore,
  animate = true
}: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : totalScore);
  const [showBreakdown, setShowBreakdown] = useState(!animate);
  
  const multiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;

  useEffect(() => {
    if (!animate) return;

    const timer = setTimeout(() => setShowBreakdown(true), 300);
    
    let current = 0;
    const step = totalScore / 50;
    const interval = setInterval(() => {
      current += step;
      if (current >= totalScore) {
        setDisplayScore(totalScore);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, 20);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [totalScore, animate]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className={cn(
          "text-6xl sm:text-7xl font-mono font-bold text-primary",
          animate && "animate-pulse"
        )}>
          {displayScore.toLocaleString()}
        </div>
        <Trophy className="absolute -top-4 -right-8 h-8 w-8 text-yellow-500 animate-bounce" />
      </div>

      {showBreakdown && (
        <div className="w-full max-w-xs space-y-3 font-mono text-sm">
          <div className="flex items-center justify-between p-2 rounded bg-card border border-card-border">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Базові бали</span>
            </div>
            <span className="font-bold">+{basePoints}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-card border border-card-border">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">Бонус часу</span>
            </div>
            <span className="font-bold text-green-400">+{timeBonus}</span>
          </div>

          {hintPenalty > 0 && (
            <div className="flex items-center justify-between p-2 rounded bg-card border border-card-border">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 text-center text-red-400">?</span>
                <span className="text-muted-foreground">Штраф підказок</span>
              </div>
              <span className="font-bold text-red-400">-{hintPenalty}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-bold",
                difficulty === "easy" && "bg-green-500/20 text-green-400",
                difficulty === "medium" && "bg-yellow-500/20 text-yellow-400",
                difficulty === "hard" && "bg-red-500/20 text-red-400"
              )}>
                x{multiplier}
              </span>
              <span className="text-muted-foreground">Множник</span>
            </div>
            <span className="font-bold text-primary">
              = {totalScore}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
