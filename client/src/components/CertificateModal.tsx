import { useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Download, X, Shield } from "lucide-react";

interface CertificateModalProps {
  playerName: string;
  totalScore: number;
  onClose: () => void;
}

export function CertificateModal({ playerName, totalScore, onClose }: CertificateModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCertificate = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, width, height, "F");

      doc.setFillColor(30, 41, 59);
      doc.rect(10, 10, width - 20, height - 20, "F");

      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(2);
      doc.rect(15, 15, width - 30, height - 30, "S");

      doc.setDrawColor(147, 51, 234);
      doc.setLineWidth(1);
      doc.rect(18, 18, width - 36, height - 36, "S");

      doc.setTextColor(59, 130, 246);
      doc.setFontSize(14);
      doc.text("OWASP_CHALLENGE", width / 2, 35, { align: "center" });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(36);
      doc.text("СЕРТИФІКАТ", width / 2, 55, { align: "center" });

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(14);
      doc.text("Цей сертифікат підтверджує, що", width / 2, 75, { align: "center" });

      doc.setTextColor(59, 130, 246);
      doc.setFontSize(28);
      doc.text(playerName, width / 2, 95, { align: "center" });

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(14);
      doc.text("успішно пройшов(-ла) всі 12 рівнів", width / 2, 115, { align: "center" });
      doc.text("інтерактивного курсу з кібербезпеки", width / 2, 125, { align: "center" });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("OWASP Top 10 - 2025", width / 2, 140, { align: "center" });

      doc.setTextColor(234, 179, 8);
      doc.setFontSize(20);
      doc.text(`Загальний рахунок: ${totalScore.toLocaleString()}`, width / 2, 160, { align: "center" });

      const date = new Date().toLocaleDateString("uk-UA", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(12);
      doc.text(`Дата видачі: ${date}`, width / 2, 180, { align: "center" });

      doc.save(`OWASP_Certificate_${playerName.replace(/\s+/g, "_")}.pdf`);
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
