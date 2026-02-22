import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { WorkflowStepper, type WorkflowStep } from "@/components/WorkflowStepper";
import { PaperCard, type Paper } from "@/components/PaperCard";
import { AnalysisPanel, type AnalysisResult } from "@/components/AnalysisPanel";
import { ReportViewer } from "@/components/ReportViewer";
import { DevilsAdvocatePanel } from "@/components/DevilsAdvocatePanel";
import { ConfidenceCard } from "@/components/ConfidenceCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const [topic, setTopic] = useState("");
  const [step, setStep] = useState<WorkflowStep>("idle");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [rankedPapers, setRankedPapers] = useState<Paper[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [report, setReport] = useState("");
  const [challenges, setChallenges] = useState("");
  const [challengeLoading, setChallengeLoading] = useState(false);
  const { toast } = useToast();

  const runPipeline = async () => {
    if (!topic.trim()) return;
    setPapers([]);
    setRankedPapers([]);
    setAnalysis(null);
    setReport("");
    setChallenges("");

    try {
      // Step 1: Fetch papers
      setStep("searching");
      const { data: fetchData, error: fetchErr } = await supabase.functions.invoke("fetch-papers", {
        body: { topic },
      });
      if (fetchErr) throw fetchErr;
      const fetchedPapers: Paper[] = fetchData.papers;
      setPapers(fetchedPapers);

      // Step 2: Rank papers
      setStep("ranking");
      const { data: rankData, error: rankErr } = await supabase.functions.invoke("rank-papers", {
        body: { topic, papers: fetchedPapers },
      });
      if (rankErr) throw rankErr;
      const ranked: Paper[] = rankData.ranked_papers;
      setRankedPapers(ranked);

      // Step 3: Analyze top papers
      setStep("analyzing");
      const top5 = ranked.slice(0, 5);
      const { data: analyzeData, error: analyzeErr } = await supabase.functions.invoke("analyze-papers", {
        body: { topic, papers: top5 },
      });
      if (analyzeErr) throw analyzeErr;
      setAnalysis(analyzeData.analysis);

      // Step 4: Generate report
      setStep("generating");
      const { data: reportData, error: reportErr } = await supabase.functions.invoke("generate-report", {
        body: { topic, papers: top5, analysis: analyzeData.analysis },
      });
      if (reportErr) throw reportErr;
      setReport(reportData.report);

      setStep("complete");
      toast({ title: "Report generated!", description: "Your research report is ready." });
    } catch (err: any) {
      console.error("Pipeline error:", err);
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
      setStep("idle");
    }
  };

  const handleChallenge = async () => {
    setChallengeLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("devils-advocate", {
        body: { topic, report },
      });
      if (error) throw error;
      setChallenges(data.challenges);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Challenge failed", variant: "destructive" });
    } finally {
      setChallengeLoading(false);
    }
  };

  const isRunning = step !== "idle" && step !== "complete";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-5xl py-8 space-y-8">
        {/* Hero / Input */}
        <section className="space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI Research Assistant
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Enter a research topic and get an autonomous analysis of academic papers with
            contradictions, gaps, and confidence scores.
          </p>
          <div className="mx-auto flex max-w-lg gap-2">
            <Input
              placeholder="e.g. Transformer architectures for protein folding"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isRunning && runPipeline()}
              disabled={isRunning}
              className="h-12 text-base"
            />
            <Button onClick={runPipeline} disabled={isRunning || !topic.trim()} size="lg" className="shrink-0 gap-2">
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Generate
            </Button>
          </div>
        </section>

        {/* Workflow Stepper */}
        <WorkflowStepper currentStep={step} />

        {/* Retrieved Papers */}
        {papers.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-lg font-semibold">Retrieved Papers ({papers.length})</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {papers.map((p) => (
                <PaperCard key={p.id} paper={p} />
              ))}
            </div>
          </section>
        )}

        {/* Ranked Papers */}
        {rankedPapers.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-lg font-semibold">Top Ranked Papers</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {rankedPapers.slice(0, 5).map((p, i) => (
                <PaperCard key={p.id} paper={p} rank={i + 1} highlighted />
              ))}
            </div>
          </section>
        )}

        {/* Analysis */}
        {analysis && (
          <section className="space-y-3">
            <h3 className="text-lg font-semibold">AI Analysis</h3>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AnalysisPanel analysis={analysis} />
              </div>
              <ConfidenceCard papers={rankedPapers.length > 0 ? rankedPapers : papers} analysis={analysis} />
            </div>
          </section>
        )}

        {/* Report */}
        {report && (
          <section className="space-y-3">
            <ReportViewer markdown={report} onChallenge={handleChallenge} challengeLoading={challengeLoading} />
          </section>
        )}

        {/* Devil's Advocate */}
        {challenges && (
          <section className="space-y-3">
            <DevilsAdvocatePanel challenges={challenges} />
          </section>
        )}
      </main>
    </div>
  );
}
