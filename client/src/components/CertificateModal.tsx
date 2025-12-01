import { useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Download, X, Shield } from "lucide-react";

interface CertificateModalProps {
  playerName: string;
  totalScore: number;
  onClose: () => void;
  difficulty?: "easy" | "medium" | "hard";
}

export function CertificateModal({ playerName, totalScore, onClose, difficulty }: CertificateModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const diplomaMap: Record<string, string> = {
    easy: "/attached_assets/Початківець_1764615073620.jpg",
    medium: "/attached_assets/Просунутий_1764615073621.jpg",
    hard: "/attached_assets/Експерт_1764615073620.jpg"
  };

  const generateCertificate = async () => {
    setIsGenerating(true);
    
    try {
      // Fetch diploma image
      const diplomaPath = difficulty ? diplomaMap[difficulty] : null;
      if (!diplomaPath) {
        throw new Error("No diploma image found");
      }

      const response = await fetch(diplomaPath);
      const blob = await response.blob();
      const reader = new FileReader();
      
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      // Add diploma image as background
      doc.addImage(imageDataUrl, "JPEG", 0, 0, width, height);

      // Position text 352px from bottom
      // Convert 352px to mm: 352 * 0.264583 ≈ 93.07 mm
      const textFromBottom = 93.07;
      const yPosition = height - textFromBottom;

      // Set text color to white
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      
      // Center text horizontally
      doc.text(playerName, width / 2, yPosition, { align: "center" });

      const diffSuffix = difficulty ? `_${difficulty}` : "";
      doc.save(`OWASP_Диплом_${playerName.replace(/\s+/g, "_")}${diffSuffix}.pdf`);
    } catch (error) {
      console.error("Failed to generate certificate:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-lg border-2 border-primary/50 shadow-2xl shadow-primary/20">
        <CardHeader className="border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/50">
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <CardTitle className="font-mono text-xl">
                  ВІТАЄМО!
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Ви пройшли всі рівні!
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-24 h-24">
              <Shield className="w-24 h-24 text-primary" />
              <Award className="absolute bottom-0 right-0 w-8 h-8 text-yellow-500" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold font-mono text-primary">
                {playerName}
              </h3>
              <p className="text-muted-foreground mt-2">
                Ви успішно завершили всі 12 рівнів курсу з кібербезпеки OWASP Top 10 2025!
              </p>
            </div>

            <div className="p-4 rounded-lg bg-card border border-card-border">
              <div className="text-3xl font-mono font-bold text-yellow-500">
                {totalScore.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Загальний рахунок
              </div>
            </div>
          </div>

          <Button
            onClick={generateCertificate}
            disabled={isGenerating}
            className="w-full font-mono"
            data-testid="button-download-certificate"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Генерування..." : "Завантажити сертифікат (PDF)"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
