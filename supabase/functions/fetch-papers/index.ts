import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic } = await req.json();
    if (!topic) throw new Error("Topic is required");

    // Fetch from arXiv
    const arxivUrl = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(topic)}&start=0&max_results=10&sortBy=relevance`;
    const arxivRes = await fetch(arxivUrl);
    const arxivXml = await arxivRes.text();

    const arxivPapers = parseArxivXml(arxivXml);

    // Fetch from Semantic Scholar
    const ssUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(topic)}&limit=10&fields=title,authors,year,abstract,url,externalIds`;
    const ssRes = await fetch(ssUrl);
    const ssData = await ssRes.json();

    const ssPapers = (ssData.data || []).map((p: any) => ({
      id: p.paperId || crypto.randomUUID(),
      title: p.title || "Untitled",
      authors: (p.authors || []).map((a: any) => a.name),
      year: p.year || 0,
      abstract: p.abstract || "",
      url: p.url || (p.externalIds?.ArXiv ? `https://arxiv.org/abs/${p.externalIds.ArXiv}` : ""),
      source: "semantic_scholar",
    }));

    const allPapers = [...arxivPapers, ...ssPapers];

    // Search YouTube for related videos
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " research paper explained")}`;
    
    // Add YouTube search links per paper title
    const papers = await Promise.all(
      allPapers.map(async (p: any) => {
        const ytQuery = encodeURIComponent(p.title);
        return {
          ...p,
          youtube_url: `https://www.youtube.com/results?search_query=${ytQuery}`,
        };
      })
    );

    return new Response(JSON.stringify({ papers }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-papers error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function parseArxivXml(xml: string) {
  const papers: any[] = [];
  const entries = xml.split("<entry>");
  for (let i = 1; i < entries.length; i++) {
    const entry = entries[i];
    const title = extractTag(entry, "title")?.replace(/\n/g, " ").trim();
    const abstract = extractTag(entry, "summary")?.replace(/\n/g, " ").trim();
    const published = extractTag(entry, "published");
    const year = published ? new Date(published).getFullYear() : 0;

    const authors: string[] = [];
    const authorMatches = entry.matchAll(/<author>\s*<name>([^<]+)<\/name>/g);
    for (const m of authorMatches) authors.push(m[1].trim());

    const linkMatch = entry.match(/<id>([^<]+)<\/id>/);
    const url = linkMatch ? linkMatch[1].trim() : "";

    papers.push({
      id: crypto.randomUUID(),
      title: title || "Untitled",
      authors,
      year,
      abstract: abstract || "",
      url,
      source: "arxiv",
    });
  }
  return papers;
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1] : null;
}
