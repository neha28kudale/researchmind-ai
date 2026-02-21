import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, papers, analysis } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
            content: "You are an expert academic report writer. Generate a comprehensive, well-structured research report in Markdown format.",
          },
          {
            role: "user",
            content: `Generate a research report on: "${topic}"

Based on analysis of ${papers.length} papers:
${papers.map((p: any) => `- "${p.title}" (${p.year}) by ${p.authors?.slice(0, 3).join(", ")}`).join("\n")}

Analysis findings:
- Summary: ${analysis.summary}
- ${analysis.claims?.length || 0} key claims identified
- ${analysis.contradictions?.length || 0} contradictions found
- ${analysis.gaps?.length || 0} research gaps identified

Claims: ${JSON.stringify(analysis.claims?.slice(0, 10))}
Contradictions: ${JSON.stringify(analysis.contradictions)}
Gaps: ${JSON.stringify(analysis.gaps)}

Write the report with these sections:
# Executive Summary
# Key Findings
# Contradictions
# Research Gaps
# Confidence Scores
# References

Use proper academic citations. Include confidence percentages for claims.`,
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
    const report = data.choices?.[0]?.message?.content || "# Report\n\nCould not generate report.";

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
