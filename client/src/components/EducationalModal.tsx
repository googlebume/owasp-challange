import { useState } from "react";
import { X, Shield, Zap, Lock, ExternalLink, ArrowRight, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreDisplay } from "./ScoreDisplay";
import { CertificateModal } from "./CertificateModal";
import { type Level, type Difficulty } from "@shared/schema";
import { cn } from "@/lib/utils";

interface EducationalModalProps {
  level: Level;
  difficulty: Difficulty;
  score: number;
  timeSpent: number;
  hintsUsed: number;
  onNextLevel: () => void;
  onBackToLevels: () => void;
  isLastLevel: boolean;
  playerName?: string;
  totalScore?: number;
}

export function EducationalModal({
  level,
  difficulty,
  score,
  timeSpent,
  hintsUsed,
  onNextLevel,
  onBackToLevels,
  isLastLevel,
  playerName,
  totalScore
}: EducationalModalProps) {
  const [showCertificate, setShowCertificate] = useState(false);
  const multiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
  const timeBonus = Math.max(0, 100 - Math.floor(timeSpent / 10));
  const hintPenalty = hintsUsed * 25;

  if (showCertificate && playerName && totalScore !== undefined) {
    return (
      <CertificateModal
        playerName={playerName}
        totalScore={totalScore + score}
        onClose={() => {
          setShowCertificate(false);
          onBackToLevels();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden border-2 border-primary/50 shadow-2xl shadow-primary/20">
        <CardHeader className="border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/50">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle className="font-mono text-xl">
                  РІВЕНЬ {level.id} ПРОЙДЕНО!
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {level.nameUa}
                </p>
              </div>
            </div>
            <Badge 
              className={cn(
                "font-mono text-sm px-3 py-1",
                difficulty === "easy" && "bg-green-500/20 text-green-400 border-green-500/50",
                difficulty === "medium" && "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
                difficulty === "hard" && "bg-red-500/20 text-red-400 border-red-500/50"
              )}
            >
              {difficulty.toUpperCase()} x{multiplier}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 border-b border-border bg-card/50 space-y-4">
            <ScoreDisplay
              basePoints={level.basePoints}
              difficulty={difficulty}
              timeBonus={timeBonus}
              hintPenalty={hintPenalty}
              totalScore={score}
            />
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-mono mb-1">ЗАГАЛЬНИЙ ЧАС</p>
                <p className="text-lg font-bold text-primary font-mono">{Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="what" className="w-full">
            <TabsList className="w-full rounded-none border-b border-border bg-transparent h-auto p-0">
              <TabsTrigger 
                value="what" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-mono"
              >
                <Shield className="h-4 w-4 mr-2" />
                ЩО ЦЕ?
              </TabsTrigger>
              <TabsTrigger 
                value="how" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-mono"
              >
                <Zap className="h-4 w-4 mr-2" />
                ЯК АТАКУВАТИ?
              </TabsTrigger>
              <TabsTrigger 
                value="defense" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-mono"
              >
                <Lock className="h-4 w-4 mr-2" />
                ЗАХИСТ
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="what" className="mt-0 space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h3 className="font-mono text-lg text-primary mb-3">
                    {level.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {level.explanation.whatUa}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="how" className="mt-0 space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h3 className="font-mono text-lg text-yellow-500 mb-3">
                    Метод експлуатації
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {level.explanation.howUa}
                  </p>
                  <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-muted font-mono text-sm">
                    <span className="text-muted-foreground">Відповідь: </span>
                    <span className="text-primary font-bold">{level.solution}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="defense" className="mt-0 space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h3 className="font-mono text-lg text-green-500 mb-3">
                    Як захиститися?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {level.explanation.defenseUa}
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>

        <div className="p-4 border-t border-border bg-card flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onBackToLevels}
            className="flex-1 font-mono"
            data-testid="button-back-to-levels"
          >
            До рівнів
          </Button>
          {!isLastLevel && (
            <Button
              onClick={onNextLevel}
              className="flex-1 font-mono"
              data-testid="button-next-level"
            >
              Наступний рівень
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          {isLastLevel && playerName && (
            <Button
              onClick={() => setShowCertificate(true)}
              className="flex-1 font-mono bg-gradient-to-r from-primary to-accent"
              data-testid="button-get-certificate"
            >
              <Award className="h-4 w-4 mr-2" />
              Отримати сертифікат!
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
