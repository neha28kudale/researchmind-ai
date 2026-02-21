import { Search, BarChart3, Brain, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkflowStep = "idle" | "searching" | "ranking" | "analyzing" | "generating" | "complete";

const steps = [
  { key: "searching" as const, label: "Searching Papers", icon: Search },
  { key: "ranking" as const, label: "Ranking Relevance", icon: BarChart3 },
  { key: "analyzing" as const, label: "Analyzing Papers", icon: Brain },
  { key: "generating" as const, label: "Generating Report", icon: FileText },
];

const stepOrder: WorkflowStep[] = ["searching", "ranking", "analyzing", "generating", "complete"];

function getStepStatus(stepKey: string, currentStep: WorkflowStep) {
  if (currentStep === "idle") return "pending";
  if (currentStep === "complete") return "done";
  const currentIdx = stepOrder.indexOf(currentStep);
  const stepIdx = stepOrder.indexOf(stepKey as WorkflowStep);
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

interface WorkflowStepperProps {
  currentStep: WorkflowStep;
}

export function WorkflowStepper({ currentStep }: WorkflowStepperProps) {
  if (currentStep === "idle") return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-2 rounded-xl border bg-card p-4">
      {steps.map((step, i) => {
        const status = getStepStatus(step.key, currentStep);
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                  status === "done" && "bg-success text-success-foreground",
                  status === "active" && "bg-primary text-primary-foreground",
                  status === "pending" && "bg-muted text-muted-foreground"
                )}
              >
                {status === "done" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : status === "active" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center whitespace-nowrap",
                  status === "active" ? "text-primary" : status === "done" ? "text-success" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mb-5 h-0.5 flex-1",
                  status === "done" ? "bg-success" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
