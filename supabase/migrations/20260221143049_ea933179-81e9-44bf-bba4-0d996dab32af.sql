
-- Create topics table
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create papers table
CREATE TABLE public.papers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL DEFAULT '{}',
  year INTEGER,
  abstract TEXT,
  url TEXT,
  source TEXT NOT NULL CHECK (source IN ('arxiv', 'semantic_scholar')),
  relevance_score DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analysis_results table
CREATE TABLE public.analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  claims JSONB NOT NULL DEFAULT '[]',
  contradictions JSONB NOT NULL DEFAULT '[]',
  gaps JSONB NOT NULL DEFAULT '[]',
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  markdown TEXT NOT NULL,
  challenges TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (public access since no auth required)
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth for this app)
CREATE POLICY "Public access" ON public.topics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.papers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.analysis_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.reports FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_papers_topic_id ON public.papers(topic_id);
CREATE INDEX idx_analysis_topic_id ON public.analysis_results(topic_id);
CREATE INDEX idx_reports_topic_id ON public.reports(topic_id);
