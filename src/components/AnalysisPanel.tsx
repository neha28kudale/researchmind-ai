import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";

export interface AnalysisResult {
  claims: { text: string; confidence: number; supporting_papers: string[] }[];
  contradictions: { description: string; papers: string[] }[];
  gaps: string[];
  summary: string;
}

interface AnalysisPanelProps {
  analysis: AnalysisResult;
}

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4 text-success" /> Key Claims
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.claims.map((claim, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
              <Badge className={claim.confidence >= 0.7 ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                {Math.round(claim.confidence * 100)}%
              </Badge>
              <div>
                <p className="text-sm">{claim.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">Supported by {claim.supporting_papers.length} paper(s)</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {analysis.contradictions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-warning" /> Contradictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.contradictions.map((c, i) => (
              <div key={i} className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                <p className="text-sm">{c.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">Between: {c.papers.join(", ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {analysis.gaps.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-accent" /> Research Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {gap}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
