

# Autonomous Research-to-Report Agent

## Overview
A full-stack AI-powered research assistant that autonomously retrieves academic papers, ranks them by relevance, analyzes findings, detects contradictions, identifies research gaps, and generates comprehensive reports with citations and confidence scores.

---

## Phase 1: Foundation & UI Shell

### Dark/Light Mode Dashboard Layout
- Top navigation bar with app title, theme toggle (light/dark), and branding
- Main content area with a step-based workflow layout
- Responsive design that works on desktop and mobile

### Home Page
- Clean hero section with a large input field for entering a research topic
- "Generate Report" button to kick off the autonomous pipeline
- History section showing previously generated reports (from database)

---

## Phase 2: Backend Setup (Lovable Cloud + Supabase)

### Database Tables
- **topics** — stores research topics with status tracking (pending, processing, completed)
- **papers** — stores retrieved papers (title, authors, year, abstract, URL, source, relevance score)
- **analysis_results** — stores AI analysis (key claims, contradictions, gaps, confidence scores)
- **reports** — stores generated markdown reports and metadata

### Edge Functions
1. **fetch-papers** — Calls arXiv and Semantic Scholar public APIs to retrieve 15–20 papers for a given topic
2. **rank-papers** — Uses Lovable AI (Gemini) to compute semantic relevance scores and select Top 5
3. **analyze-papers** — Uses Lovable AI to extract claims, detect contradictions, identify gaps, and assign confidence scores
4. **generate-report** — Uses Lovable AI to produce the structured markdown report
5. **devils-advocate** — Uses Lovable AI to challenge the report's claims and suggest revisions

---

## Phase 3: Paper Retrieval Panel

### Paper Search & Display
- Call the `fetch-papers` edge function which queries arXiv API and Semantic Scholar API
- Display results as cards showing: title, authors, year, abstract snippet, and external link
- Visual indicator of which API each paper came from (arXiv vs Semantic Scholar)

---

## Phase 4: Relevance Ranking

### Ranking View
- After retrieval, the `rank-papers` edge function uses AI to score each paper's relevance to the topic
- Display all papers sorted by relevance score with a visual score indicator
- Top 5 papers are highlighted and automatically selected for deeper analysis
- Users can see why each paper was ranked as it was

---

## Phase 5: AI Analysis Panel

### Deep Analysis of Top 5 Papers
- The `analyze-papers` edge function processes the top 5 papers through Gemini to:
  - Extract key claims from each paper
  - Summarize core findings
  - Detect contradictions across papers
  - Identify research gaps
  - Assign confidence scores (based on how many papers support each claim)
- Display results in organized cards/sections for claims, contradictions, and gaps

---

## Phase 6: Report Generator

### Structured Report
- The `generate-report` edge function creates a markdown report with sections:
  - Executive Summary
  - Key Findings
  - Contradictions
  - Research Gaps
  - Confidence Scores
  - References (with proper citations)
- Report viewer with rendered markdown display
- Download options: Markdown file and PDF export

---

## Phase 7: Devil's Advocate Agent

### Challenge & Revise
- After report generation, a "Challenge Report" button triggers the `devils-advocate` edge function
- A second AI prompt critically examines the report's claims
- Displays challenges and suggested revisions in a side panel or separate section
- User can accept/reject suggestions

---

## Phase 8: Workflow Progress & Polish

### Step-by-Step Progress Indicator
- Visual stepper/progress bar showing the current pipeline stage:
  1. 🔍 Searching papers
  2. 📊 Ranking relevance
  3. 🧠 Analyzing papers
  4. 📝 Generating report
- Each step updates in real-time as the backend processes

### Final Polish
- Smooth transitions between workflow steps
- Error handling with retry options at each stage
- Toast notifications for status updates
- Loading skeletons while data is being fetched

