import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Shield } from "lucide-react";

interface ReportViewerProps {
  markdown: string;
  onChallenge: () => void;
  challengeLoading?: boolean;
}

export function ReportViewer({ markdown, onChallenge, challengeLoading }: ReportViewerProps) {
  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Research Report</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadMarkdown}>
            <Download className="mr-1.5 h-4 w-4" /> Markdown
          </Button>
          <Button size="sm" onClick={onChallenge} disabled={challengeLoading}>
            <Shield className="mr-1.5 h-4 w-4" /> Challenge Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
