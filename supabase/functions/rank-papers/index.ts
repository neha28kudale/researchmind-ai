import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, papers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const paperList = papers.map((p: any, i: number) =>
      `[${i + 1}] "${p.title}" (${p.year}) - ${p.abstract?.slice(0, 200)}...`
    ).join("\n\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are an academic research relevance ranker. Given a research topic and a list of papers, score each paper's relevance from 0.0 to 1.0. Return ONLY valid JSON.",
          },
          {
            role: "user",
            content: `Topic: "${topic}"\n\nPapers:\n${paperList}\n\nReturn a JSON array of objects with "index" (1-based) and "score" (0.0-1.0) and "reason" (one sentence). Sort by score descending. Example: [{"index":1,"score":0.95,"reason":"Directly addresses the topic"}]`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Parse JSON from response (handle markdown code blocks)
    let rankings: any[];
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      rankings = JSON.parse(jsonStr);
    } catch {
      rankings = papers.map((_: any, i: number) => ({ index: i + 1, score: 0.5, reason: "Default score" }));
    }

    // Apply scores and sort
    const rankedPapers = papers.map((p: any, i: number) => {
      const rank = rankings.find((r: any) => r.index === i + 1);
      return { ...p, relevance_score: rank?.score || 0.5 };
    });

    rankedPapers.sort((a: any, b: any) => (b.relevance_score || 0) - (a.relevance_score || 0));

    return new Response(JSON.stringify({ ranked_papers: rankedPapers }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("rank-papers error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
