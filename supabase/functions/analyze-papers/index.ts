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

    const paperDetails = papers.map((p: any, i: number) =>
      `Paper ${i + 1}: "${p.title}" (${p.year})\nAuthors: ${p.authors?.join(", ")}\nAbstract: ${p.abstract}`
    ).join("\n\n---\n\n");

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
            content: `You are an expert research analyst. Analyze the given papers on the topic and extract: key claims with confidence scores, contradictions between papers, and research gaps. Return ONLY valid JSON.`,
          },
          {
            role: "user",
            content: `Topic: "${topic}"\n\n${paperDetails}\n\nReturn JSON with this exact structure:
{
  "summary": "2-3 sentence summary of the overall findings",
  "claims": [{"text": "claim text", "confidence": 0.0-1.0, "supporting_papers": ["Paper 1 title"]}],
  "contradictions": [{"description": "what contradicts", "papers": ["Paper 1 title", "Paper 2 title"]}],
  "gaps": ["gap description 1", "gap description 2"]
}`,
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
    const content = data.choices?.[0]?.message?.content || "{}";

    let analysis: any;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(jsonStr);
    } catch {
      analysis = { summary: "Analysis could not be parsed.", claims: [], contradictions: [], gaps: [] };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-papers error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
