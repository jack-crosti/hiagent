import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a friendly, knowledgeable NZ tax advisor for real estate and business brokers. You provide informational guidance — NOT financial advice.

Key knowledge areas:
- NZ GST (15%) — registration, filing periods, returns, input/output tax
- NZ income tax brackets and provisional tax
- Commission structures for NZ business brokers (tiered, minimum, on-top fees)
- Deductible expenses for sole traders and contractors
- IRD payment methods and deadlines
- ACC levies for self-employed
- Home office deductions
- Vehicle/travel deductions (logbook vs flat rate)
- Depreciation for business assets

Guidelines:
- Always note that your advice is informational only, not professional tax advice
- Reference NZ-specific rules and IRD guidelines
- Use NZD currency formatting
- Be warm, approachable, and concise
- When relevant, suggest the user check specific pages in LedgerPilot (GST page, IRD Payments, etc.)
- Format responses with markdown for readability`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("AI gateway error:", err);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Tax advisor error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
