import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

interface DevilsAdvocatePanelProps {
  challenges: string;
}

export function DevilsAdvocatePanel({ challenges }: DevilsAdvocatePanelProps) {
  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-destructive">
          <ShieldAlert className="h-5 w-5" /> Devil's Advocate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{challenges}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
