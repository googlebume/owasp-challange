import { Shield, Trophy, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { Progress } from "@/components/ui/progress";

interface HeaderProps {
  playerName?: string;
  totalScore: number;
  levelsCompleted: number;
  totalLevels: number;
  onMenuClick?: () => void;
}

export function Header({ 
  playerName, 
  totalScore, 
  levelsCompleted, 
  totalLevels,
  onMenuClick 
}: HeaderProps) {
  const progressPercent = (levelsCompleted / totalLevels) * 100;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMenuClick}
              className="md:hidden"
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Shield className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold font-mono tracking-wider text-foreground">
                OWASP<span className="text-primary">_</span>CHALLENGE
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-card-border">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="font-mono text-sm font-bold" data-testid="text-score">
              {totalScore.toLocaleString()}
            </span>
          </div>

          {playerName && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-card-border">
              <User className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm" data-testid="text-player-name">
                {playerName}
              </span>
            </div>
          )}

          <Badge variant="outline" className="hidden md:flex gap-1 font-mono">
            <span className="text-primary">{levelsCompleted}</span>
            <span className="text-muted-foreground">/</span>
            <span>{totalLevels}</span>
          </Badge>

          <ThemeToggle />
        </div>
      </div>
      
      <div className="h-1 w-full bg-muted/30">
        <div 
          className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
}
