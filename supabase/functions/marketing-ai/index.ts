import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let systemPrompt = "";
    let userPrompt = "";

    const styleAppend = params.styleInstructions
      ? `\n\nAdditional writing style instructions from the user: ${params.styleInstructions}`
      : "";

    if (action === "generate_post") {
      const { goal, style, cta, platforms, listingName, includeEmojis, tone } = params;
      const emojiInstruction = includeEmojis ? "Use relevant emojis throughout to make it engaging." : "Do NOT use any emojis at all. Keep it clean and professional.";
      const toneInstruction = tone === "casual" ? "Use a casual, friendly, conversational tone." : "Use a professional, credible, authoritative tone.";

      systemPrompt = `You are an expert social media copywriter for real estate agents and business brokers in New Zealand. Generate engaging social media posts. ${emojiInstruction} ${toneInstruction}

Return ONLY valid JSON. No markdown, no code fences, no extra text. Use this exact structure:
{"hook":"attention-grabbing opening line","body":"main copy 2-4 sentences","cta":"call to action line","hashtags":"5-8 relevant hashtags","imageIdea":"visual content suggestion","videoScript":"15-second video script if platform is TikTok/Instagram/YouTube, otherwise null"}${styleAppend}`;

      userPrompt = `Generate a ${style} social media post for ${platforms.join(", ")}.
Goal: ${goal}
${listingName ? `Listing: ${listingName}` : ""}
CTA: ${cta}
Keep it concise and platform-appropriate.`;

    } else if (action === "generate_plan") {
      const { planType, platform, frequency, goals, includeEmojis, tone } = params;
      const emojiInstruction = includeEmojis ? "Include relevant emojis." : "No emojis.";
      const toneInstruction = tone === "casual" ? "Casual and friendly tone." : "Professional tone.";

      systemPrompt = `You are a marketing strategist for real estate agents and business brokers in NZ. ${emojiInstruction} ${toneInstruction}

Return ONLY valid JSON. No markdown, no code fences, no extra text. Use this exact structure:
{"title":"plan title","summary":"brief overview","actions":[{"day":"day or week label","task":"specific action item","platform":"platform name","type":"content|outreach|networking|email","details":"extra context"}]}${styleAppend}`;

      userPrompt = `Create a ${planType} marketing plan.
Platform focus: ${platform}
Posting frequency: ${frequency}
Goals: ${goals}
Include 5-7 specific, actionable items.`;

    } else if (action === "generate_content_ideas") {
      const { topics, customTopic, includeEmojis, tone } = params;
      const emojiInstruction = includeEmojis ? "Include emojis in titles." : "No emojis in output.";
      const toneInstruction = tone === "casual" ? "Casual tone." : "Professional tone.";

      systemPrompt = `You are a content strategist for real estate agents and business brokers in NZ. ${emojiInstruction} ${toneInstruction}

Return ONLY valid JSON. No markdown, no code fences, no extra text. Use this exact structure:
{"ideas":[{"title":"content title","description":"2-3 sentence description","platforms":["platform1","platform2"],"format":"blog|video|carousel|infographic|story","difficulty":"easy|medium|advanced"}]}${styleAppend}`;

      userPrompt = `Generate 6 content ideas based on these topics: ${topics.join(", ")}${customTopic ? `, ${customTopic}` : ""}.
Make them specific, actionable, and relevant to the NZ market.`;

    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    console.log("AI raw content:", content.substring(0, 500));

    let result = null;
    try {
      const cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("JSON parse failed:", e);
      // Try repair: strip trailing commas and control chars
      try {
        const repaired = content
          .replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim()
          .replace(/,\s*}/g, "}").replace(/,\s*]/g, "]")
          .replace(/[\x00-\x1F\x7F]/g, "");
        const jsonMatch2 = repaired.match(/\{[\s\S]*\}/);
        if (jsonMatch2) result = JSON.parse(jsonMatch2[0]);
      } catch {
        // give up
      }
    }

    if (!result) {
      return new Response(JSON.stringify({ error: `Failed to parse AI response. Raw: ${content.substring(0, 200)}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Marketing AI error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
