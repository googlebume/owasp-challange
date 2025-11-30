import { Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-sm text-muted-foreground font-mono">
              OWASP_CHALLENGE 2025
            </div>
            <div className="text-xs text-muted-foreground/70 font-mono">
              © 2025 Digital Phoenix. Усі права захищені.
            </div>
          </div>
          
          <Button
            variant="outline"
            asChild
            className="font-mono gap-2 hover:bg-primary/10 hover:border-primary/50"
            data-testid="button-donate"
          >
            <a 
              href="https://send.monobank.ua/jar/3DzefYmGSK" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Heart className="h-4 w-4 text-red-500" />
              Подякуй нам
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}
