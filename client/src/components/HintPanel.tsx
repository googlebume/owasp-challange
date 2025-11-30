import { useState } from "react";
import { Lightbulb, Sparkles, X, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { type Difficulty } from "@shared/schema";

interface HintPanelProps {
  levelId: number;
  difficulty: Difficulty;
  hintsRevealed: number;
  hintTimeRemaining: number;
  onRevealHint: () => void;
  isOpen: boolean;
  onClose: () => void;
  playerAttempts?: string[];
  levelObjective?: string;
}

export function HintPanel({
  levelId,
  difficulty,
  hintsRevealed,
  hintTimeRemaining,
  onRevealHint,
  isOpen,
  onClose,
  playerAttempts = [],
  levelObjective
}: HintPanelProps) {
  const [loadingHint, setLoadingHint] = useState<number | null>(null);
  const [hints, setHints] = useState<string[]>([]);

  const canReveal = hintTimeRemaining === 0 && hintsRevealed < 3;

  const handleRevealHint = async () => {
    if (!canReveal) return;
    
    const nextHintNumber = hintsRevealed + 1;
    setLoadingHint(nextHintNumber);
    
    try {
      const response = await fetch('/api/hints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelId,
          difficulty,
          hintNumber: nextHintNumber,
          playerAttempts,
          levelObjective
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setHints(prev => [...prev, data.hint]);
        onRevealHint();
      }
    } catch (error) {
      console.error('Failed to get hint:', error);
    } finally {
      setLoadingHint(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 animate-in slide-in-from-right duration-300">
      <Card className="h-full rounded-none border-l-2 border-primary/50 bg-background/95 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <CardTitle className="font-mono text-lg">ПІДКАЗКИ</CardTitle>
            <Badge variant="outline" className="font-mono">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            data-testid="button-close-hints"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-4 space-y-4 overflow-y-auto h-[calc(100%-80px)]">
          {[1, 2, 3].map((hintNumber) => {
            const isRevealed = hintNumber <= hintsRevealed;
            const isLoading = loadingHint === hintNumber;
            const hintText = hints[hintNumber - 1];
            
            return (
              <div
                key={hintNumber}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-500",
                  isRevealed 
                    ? "border-primary/50 bg-primary/5" 
                    : "border-muted bg-muted/20"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    isRevealed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {hintNumber}
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">
                    ПІДКАЗКА {hintNumber}
                  </span>
                  {!isRevealed && (
                    <Lock className="h-4 w-4 text-muted-foreground ml-auto" />
                  )}
                </div>
                
                {isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Генерую підказку...</span>
                  </div>
                ) : isRevealed && hintText ? (
                  <p className="text-sm leading-relaxed animate-in fade-in duration-500">
                    {hintText}
                  </p>
                ) : (
                  <div className="h-12 flex items-center justify-center">
                    <span className="text-sm text-muted-foreground font-mono">
                      [LOCKED]
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="pt-4 border-t border-border">
            <Button
              onClick={handleRevealHint}
              disabled={!canReveal || loadingHint !== null}
              className="w-full font-mono"
              variant={canReveal ? "default" : "secondary"}
              data-testid="button-reveal-hint"
            >
              {loadingHint !== null ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Завантаження...
                </>
              ) : hintsRevealed >= 3 ? (
                "Всі підказки використано"
              ) : hintTimeRemaining > 0 ? (
                `Доступно через ${hintTimeRemaining}с`
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Отримати підказку ({3 - hintsRevealed} залишилось)
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center mt-2">
              Кожна підказка знижує бали на 25
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
