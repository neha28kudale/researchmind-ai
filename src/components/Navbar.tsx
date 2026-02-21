import { FlaskConical } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <FlaskConical className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight">ResearchAgent</h1>
            <p className="text-xs text-muted-foreground">Autonomous Research Reports</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
