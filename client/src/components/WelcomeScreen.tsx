import { useState } from "react";
import { Shield, Terminal, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WelcomeScreenProps {
  onStart: (nickname: string) => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim().length < 2) {
      setError("Нікнейм повинен містити мінімум 2 символи");
      return;
    }
    if (nickname.trim().length > 20) {
      setError("Нікнейм не може бути довшим за 20 символів");
      return;
    }
    onStart(nickname.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-2 border-primary/30 bg-card/80 backdrop-blur-md relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="h-20 w-20 text-primary" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full animate-pulse flex items-center justify-center">
                <Zap className="h-4 w-4 text-accent-foreground" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-mono tracking-wider">
            OWASP<span className="text-primary">_</span>CHALLENGE
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Інтерактивна гра для навчання кібербезпеці
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="font-mono">
              <Terminal className="h-3 w-3 mr-1" />
              10 рівнів
            </Badge>
            <Badge variant="outline" className="font-mono">
              <Shield className="h-3 w-3 mr-1" />
              OWASP Top 10
            </Badge>
            <Badge variant="outline" className="font-mono">
              <Zap className="h-3 w-3 mr-1" />
              3 складності
            </Badge>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground">
            <p className="text-center">
              Навчайтеся знаходити та експлуатувати вразливості у безпечному середовищі. 
              Кожен рівень демонструє реальну загрозу з OWASP Top 10 2025.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-mono text-muted-foreground">
                ВВЕДІТЬ НІКНЕЙМ
              </label>
              <Input
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError("");
                }}
                placeholder="hacker_pro"
                className="font-mono text-center text-lg h-12 border-primary/30 focus:border-primary"
                maxLength={20}
                data-testid="input-nickname"
              />
              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 font-mono text-lg"
              disabled={!nickname.trim()}
              data-testid="button-start-game"
            >
              ПОЧАТИ ГРУ
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            Ваш прогрес буде збережено локально
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
