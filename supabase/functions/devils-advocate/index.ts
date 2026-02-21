import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, report } = await req.json();
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
            content: "You are a rigorous academic devil's advocate. Your job is to critically challenge research claims, identify weaknesses in methodology, question assumptions, and suggest improvements. Be constructive but thorough. Write in Markdown.",
          },
          {
            role: "user",
            content: `Topic: "${topic}"\n\nHere is the research report to challenge:\n\n${report}\n\nProvide:\n1. **Methodological Concerns** - Issues with how claims are supported\n2. **Alternative Interpretations** - Other ways to read the evidence\n3. **Missing Perspectives** - Viewpoints or evidence not considered\n4. **Suggested Revisions** - Specific improvements to strengthen the report`,
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
    const challenges = data.choices?.[0]?.message?.content || "No challenges generated.";

    return new Response(JSON.stringify({ challenges }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("devils-advocate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
