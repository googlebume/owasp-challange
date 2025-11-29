import { 
  ShieldAlert, KeyRound, Boxes, Database, Wrench, RefreshCcw, 
  LockKeyhole, ScanEye, ScrollText, Bug, CheckCircle2, Star, Bot, Workflow, Lock
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Level, type Difficulty } from "@shared/schema";
import { DifficultySelector } from "./DifficultySelector";
import { useState } from "react";

const iconMap: Record<string, typeof ShieldAlert> = {
  "ShieldAlert": ShieldAlert,
  "KeyRound": KeyRound,
  "Boxes": Boxes,
  "Database": Database,
  "Wrench": Wrench,
  "RefreshCcw": RefreshCcw,
  "LockKeyhole": LockKeyhole,
  "ScanEye": ScanEye,
  "ScrollText": ScrollText,
  "Bug": Bug,
  "Bot": Bot,
  "Workflow": Workflow,
};

interface LevelCardProps {
  level: Level;
  isUnlocked: boolean;
  completedDifficulties: Difficulty[];
  bestScore: number;
  onPlay: (difficulty: Difficulty) => void;
}

export function LevelCard({ 
  level, 
  isUnlocked, 
  completedDifficulties,
  bestScore,
  onPlay 
}: LevelCardProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("easy");
  
  const getIconForLevel = () => {
    if (level.isAIGenerated) {
      return level.requiredInputs === 2 ? Workflow : Bot;
    }
    switch (level.vulnerability) {
      case "BAC": return ShieldAlert;
      case "Crypto": return KeyRound;
      case "Supply Chain": return Boxes;
      case "SQL Injection": return Database;
      case "Misconfiguration": return Wrench;
      case "Outdated": return RefreshCcw;
      case "Auth Bypass": return LockKeyhole;
      case "Secrets Exposure": return ScanEye;
      case "Log Analysis": return ScrollText;
      case "Error Handling": return Bug;
      default: return Bug;
    }
  };
  
  const Icon = getIconForLevel();

  const isCompleted = completedDifficulties.length > 0;
  const isFullyCompleted = completedDifficulties.length === 3;

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        isUnlocked 
          ? "hover-elevate cursor-pointer border-primary/20 hover:border-primary/50" 
          : "opacity-50 cursor-not-allowed border-muted",
        isFullyCompleted && "ring-2 ring-primary/30"
      )}
      data-testid={`card-level-${level.id}`}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-10 transition-opacity",
        isUnlocked ? "from-primary/20 to-accent/20 group-hover:opacity-20" : "from-muted to-muted"
      )} />
      
      {isCompleted && (
        <div className="absolute top-2 right-2 z-10">
          <CheckCircle2 className={cn(
            "h-6 w-6",
            isFullyCompleted ? "text-yellow-500" : "text-primary"
          )} />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2.5 rounded-lg border transition-colors",
            isUnlocked 
              ? "bg-primary/10 border-primary/30 text-primary" 
              : "bg-muted border-muted text-muted-foreground"
          )}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono text-xs">
                LVL {level.id}
              </Badge>
              <Badge 
                variant="secondary" 
                className="font-mono text-xs truncate"
              >
                {level.vulnerability}
              </Badge>
            </div>
            <h3 className="font-bold text-sm leading-tight line-clamp-2">
              {level.nameUa}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-3">
          {level.descriptionUa}
        </p>

        {bestScore > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="font-mono text-yellow-500">{bestScore}</span>
            <span className="text-muted-foreground">найкращий результат</span>
          </div>
        )}

        {isUnlocked && (
          <>
            <DifficultySelector
              selected={selectedDifficulty}
              onSelect={setSelectedDifficulty}
              completedDifficulties={completedDifficulties}
              compact
            />
            
            <Button 
              onClick={() => onPlay(selectedDifficulty)}
              className="w-full font-mono"
              data-testid={`button-play-level-${level.id}`}
            >
              {isCompleted ? "ГРАТИ ЗНОВУ" : "ПОЧАТИ"}
            </Button>
          </>
        )}

        {!isUnlocked && (
          <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span className="text-xs font-mono">ЗАБЛОКОВАНО</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
