import { CheckCircle2, Circle, Lock, Star, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { levels, achievements, type Achievement, type Difficulty } from "@shared/schema";

interface ProgressTrackerProps {
  completedLevels: number[];
  completedDifficulties: Record<number, Difficulty[]>;
  playerAchievements: string[];
  totalScore: number;
}

export function ProgressTracker({
  completedLevels,
  completedDifficulties,
  playerAchievements,
  totalScore
}: ProgressTrackerProps) {
  const progressPercent = (completedLevels.length / levels.length) * 100;
  const totalPossibleCompletions = levels.length * 3;
  const totalCompletions = Object.values(completedDifficulties)
    .reduce((sum, diffs) => sum + diffs.length, 0);
  const completionPercent = (totalCompletions / totalPossibleCompletions) * 100;

  return (
    <div className="space-y-6">
      <Card className="border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="font-mono text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              ПРОГРЕС
            </CardTitle>
            <Badge variant="outline" className="font-mono">
              {completedLevels.length}/{levels.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Рівні пройдено</span>
              <span className="font-mono text-primary">{progressPercent.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Повне проходження</span>
              <span className="font-mono text-accent">{completionPercent.toFixed(0)}%</span>
            </div>
            <Progress value={completionPercent} className="h-2 [&>div]:bg-accent" />
          </div>

          <div className="grid grid-cols-5 gap-2 pt-2">
            {levels.map((level) => {
              const isCompleted = completedLevels.includes(level.id);
              const diffs = completedDifficulties[level.id] || [];
              const isFullyCompleted = diffs.length === 3;
              
              return (
                <div
                  key={level.id}
                  className={cn(
                    "aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-mono transition-all",
                    isFullyCompleted 
                      ? "border-yellow-500 bg-yellow-500/20 text-yellow-500" 
                      : isCompleted 
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-muted bg-muted/20 text-muted-foreground"
                  )}
                  title={level.nameUa}
                >
                  {isFullyCompleted ? (
                    <Star className="h-4 w-4" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    level.id
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent/30">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            ДОСЯГНЕННЯ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {achievements.slice(0, 8).map((achievement) => {
              const isUnlocked = playerAchievements.includes(achievement.id);
              
              return (
                <TooltipProvider key={achievement.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "p-3 rounded-lg border-2 text-center transition-all cursor-pointer hover-elevate",
                          isUnlocked
                            ? "border-accent bg-accent/10"
                            : "border-muted bg-muted/10 opacity-50"
                        )}
                      >
                        <div className={cn(
                          "text-2xl mb-1",
                          isUnlocked ? "grayscale-0" : "grayscale"
                        )}>
                          {getAchievementIcon(achievement.icon)}
                        </div>
                        <p className="text-xs font-mono truncate">
                          {achievement.nameUa}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="font-mono text-sm">{achievement.nameUa}</p>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.descriptionUa}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Загальний рахунок</p>
              <p className="text-3xl font-mono font-bold text-primary">
                {totalScore.toLocaleString()}
              </p>
            </div>
            <Trophy className="h-12 w-12 text-yellow-500/50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getAchievementIcon(iconName: string): string {
  const icons: Record<string, string> = {
    "Sword": "⚔️",
    "Terminal": "💻",
    "Shield": "🛡️",
    "Zap": "⚡",
    "Brain": "🧠",
    "Trophy": "🏆",
    "Database": "🗄️",
    "Key": "🔑",
  };
  return icons[iconName] || "🎯";
}
