import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Shield, Loader2 } from "lucide-react";

interface ReportViewerProps {
  markdown: string;
  onChallenge: () => void;
  challengeLoading?: boolean;
}

export function ReportViewer({ markdown, onChallenge, challengeLoading }: ReportViewerProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setPdfLoading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      // Clone the element to apply print-friendly styles
      const clone = reportRef.current.cloneNode(true) as HTMLElement;
      clone.style.color = "#111";
      clone.style.background = "#fff";
      clone.style.padding = "20px";
      clone.style.fontSize = "12px";
      clone.style.lineHeight = "1.6";
      clone.style.maxWidth = "none";
      clone.style.width = "100%";

      // Style all headings and links for print
      clone.querySelectorAll("h1,h2,h3,h4").forEach((el) => {
        (el as HTMLElement).style.color = "#111";
        (el as HTMLElement).style.marginTop = "16px";
        (el as HTMLElement).style.marginBottom = "8px";
        (el as HTMLElement).style.pageBreakAfter = "avoid";
      });
      clone.querySelectorAll("a").forEach((el) => {
        (el as HTMLElement).style.color = "#2563eb";
      });
      clone.querySelectorAll("ul,ol").forEach((el) => {
        (el as HTMLElement).style.paddingLeft = "20px";
      });

      document.body.appendChild(clone);

      await html2pdf()
        .set({
          margin: [15, 15, 15, 15],
          filename: "research-report.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(clone)
        .save();

      document.body.removeChild(clone);
    } catch (e) {
      console.error("PDF export failed:", e);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Research Report</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadMarkdown}>
            <Download className="mr-1.5 h-4 w-4" /> Markdown
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPdf} disabled={pdfLoading}>
            {pdfLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <FileText className="mr-1.5 h-4 w-4" />}
            PDF
          </Button>
          <Button size="sm" onClick={onChallenge} disabled={challengeLoading}>
            <Shield className="mr-1.5 h-4 w-4" /> Challenge Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={reportRef} className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
