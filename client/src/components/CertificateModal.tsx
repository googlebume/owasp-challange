import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Download, X, Shield } from "lucide-react";
import beginnerPdfUrl from "@assets/Початківець_1764615904508.pdf";
import advancedPdfUrl from "@assets/Просунутий_1764615904509.pdf";
import expertPdfUrl from "@assets/Експерт_1764615904510.pdf";

interface CertificateModalProps {
  playerName: string;
  totalScore: number;
  onClose: () => void;
  difficulty?: "easy" | "medium" | "hard";
}

export function CertificateModal({ playerName, totalScore, onClose, difficulty }: CertificateModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const diplomaMap: Record<string, string> = {
    easy: beginnerPdfUrl,
    medium: advancedPdfUrl,
    hard: expertPdfUrl
  };

  const generateCertificate = async () => {
    setIsGenerating(true);
    
    try {
      // Fetch diploma PDF
      const diplomaPath = difficulty ? diplomaMap[difficulty] : null;
      if (!diplomaPath) {
        throw new Error("No diploma PDF found");
      }

      const response = await fetch(diplomaPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      // Load the PDF
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const firstPage = pdfDoc.getPage(0);
      const { width, height } = firstPage.getSize();

      // Position text 352px from bottom
      // Convert 352px to points: 352 * 0.75 = 264 points (1px = 0.75pt)
      const textFromBottom = 264;
      const yPosition = textFromBottom;

      // Add player name centered
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontSize = 32;
      const textWidth = font.widthOfTextAtSize(playerName, fontSize);
      const xPosition = (width - textWidth) / 2;

      firstPage.drawText(playerName, {
        x: xPosition,
        y: yPosition,
        size: fontSize,
        font: font,
        color: rgb(1, 1, 1) // White text
      });

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const diffSuffix = difficulty ? `_${difficulty}` : "";
      link.href = url;
      link.download = `OWASP_Диплом_${playerName.replace(/\s+/g, "_")}${diffSuffix}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate diploma:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
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
