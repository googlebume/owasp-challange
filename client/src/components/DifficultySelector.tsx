import { Zap, Clock, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type Difficulty, difficultyConfig } from "@shared/schema";
import { cn } from "@/lib/utils";

interface DifficultySelectorProps {
  selected: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
  completedDifficulties?: Difficulty[];
  disabled?: boolean;
  compact?: boolean;
}

const difficultyData: { id: Difficulty; label: string; labelUa: string; icon: typeof Zap }[] = [
  { id: "easy", label: "EASY", labelUa: "ЛЕГКИЙ", icon: Zap },
  { id: "medium", label: "MEDIUM", labelUa: "СЕРЕДНІЙ", icon: Clock },
  { id: "hard", label: "HARD", labelUa: "ВАЖКИЙ", icon: Skull },
];

export function DifficultySelector({ 
  selected, 
  onSelect, 
  completedDifficulties = [],
  disabled = false,
  compact = false
}: DifficultySelectorProps) {
  return (
    <div className={cn(
      "flex gap-2",
      compact ? "flex-row" : "flex-col sm:flex-row"
    )}>
      {difficultyData.map(({ id, label, labelUa, icon: Icon }) => {
        const config = difficultyConfig[id];
        const isSelected = selected === id;
        const isCompleted = completedDifficulties.includes(id);
        
        const colorClasses = {
          easy: isSelected 
            ? "bg-green-500/20 border-green-500 text-green-400 shadow-green-500/20 shadow-lg" 
            : "border-green-500/30 text-green-400/70 hover:border-green-500/60",
          medium: isSelected 
            ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-yellow-500/20 shadow-lg" 
            : "border-yellow-500/30 text-yellow-400/70 hover:border-yellow-500/60",
          hard: isSelected 
            ? "bg-red-500/20 border-red-500 text-red-400 shadow-red-500/20 shadow-lg" 
            : "border-red-500/30 text-red-400/70 hover:border-red-500/60",
        };

        const button = (
          <Button
            key={id}
            variant="outline"
            onClick={() => onSelect(id)}
            disabled={disabled}
            data-testid={`button-difficulty-${id}`}
            className={cn(
              "relative flex-1 border-2 transition-all duration-300 font-mono",
              colorClasses[id],
              compact ? "px-3 py-2" : "px-4 py-6",
              isCompleted && "ring-2 ring-primary/50"
            )}
          >
            <div className={cn(
              "flex items-center gap-2",
              compact ? "flex-row" : "flex-col"
            )}>
              <Icon className={cn("transition-transform", isSelected && "scale-110", compact ? "h-4 w-4" : "h-5 w-5")} />
              <div className={cn("flex flex-col", compact ? "hidden sm:flex" : "hidden md:flex")}>
                <span className={cn("font-bold tracking-wider", compact ? "text-xs" : "text-sm")}>{labelUa}</span>
                {!compact && (
                  <span className="text-xs opacity-70">
                    {config.hintDelay}s • x{config.multiplier}
                    {config.timeLimit && ` • ${config.timeLimit / 60}m`}
                  </span>
                )}
              </div>
              {isCompleted && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
              )}
            </div>
          </Button>
        );

        return (
          <TooltipProvider key={id}>
            <Tooltip>
              <TooltipTrigger asChild>
                {button}
              </TooltipTrigger>
              <TooltipContent side="top" className="hidden md:block font-mono">
                <p>{labelUa}</p>
                <p className="text-xs opacity-80">{config.hintDelay}s • x{config.multiplier}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
