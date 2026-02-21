import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  url: string;
  source: "arxiv" | "semantic_scholar";
  relevance_score?: number;
}

interface PaperCardProps {
  paper: Paper;
  rank?: number;
  highlighted?: boolean;
}

export function PaperCard({ paper, rank, highlighted }: PaperCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md", highlighted && "ring-2 ring-primary")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {rank != null && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {rank}
              </span>
            )}
            <CardTitle className="text-sm leading-snug">{paper.title}</CardTitle>
          </div>
          <a href={paper.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-foreground">
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">{paper.authors.slice(0, 3).join(", ")}{paper.authors.length > 3 ? " et al." : ""} · {paper.year}</p>
        <p className="line-clamp-3 text-sm text-muted-foreground">{paper.abstract}</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{paper.source === "arxiv" ? "arXiv" : "Semantic Scholar"}</Badge>
          {paper.relevance_score != null && (
            <Badge className="bg-accent text-accent-foreground text-xs">
              {Math.round(paper.relevance_score * 100)}% relevant
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
