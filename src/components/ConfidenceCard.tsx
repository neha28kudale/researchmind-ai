import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";
import type { Paper } from "@/components/PaperCard";
import type { AnalysisResult } from "@/components/AnalysisPanel";

interface ConfidenceCardProps {
  papers: Paper[];
  analysis: AnalysisResult;
}

function computeScores(papers: Paper[], analysis: AnalysisResult) {
  const currentYear = new Date().getFullYear();
  const years = papers.map((p) => p.year ?? currentYear - 10);
  const recency =
    years.length > 0
      ? Math.round(
          (years.reduce((s, y) => s + Math.max(0, 1 - (currentYear - y) / 20), 0) /
            years.length) *
            100
        )
      : 0;

  const relevance =
    papers.length > 0
      ? Math.round(
          (papers.reduce((s, p) => s + (p.relevance_score ?? 0.5), 0) / papers.length) * 100
        )
      : 0;

  const claims = analysis.claims ?? [];
  const agreement =
    claims.length > 0
      ? Math.round((claims.reduce((s, c) => s + c.confidence, 0) / claims.length) * 100)
      : 0;

  const overall = Math.round(recency * 0.15 + relevance * 0.35 + agreement * 0.5);

  return { recency, relevance, agreement, overall };
}

function barColor(value: number) {
  if (value >= 80) return "bg-success";
  if (value >= 50) return "bg-warning";
  return "bg-destructive";
}

export function ConfidenceCard({ papers, analysis }: ConfidenceCardProps) {
  const { recency, relevance, agreement, overall } = computeScores(papers, analysis);

  const rows = [
    { label: "Recency", value: recency },
    { label: "Relevance", value: relevance },
    { label: "Agreement", value: agreement },
    { label: "Overall", value: overall },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" /> Confidence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-success">{overall}%</span>
          <div>
            <p className="text-sm font-medium">Confidence Score</p>
            <p className="text-xs text-muted-foreground">Based on {papers.length} papers</p>
          </div>
        </div>

        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{r.label}</span>
                <span className="text-muted-foreground">{r.value}%</span>
              </div>
              <Progress
                value={r.value}
                className="h-2.5"
                indicatorClassName={barColor(r.value)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
