import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MASTER_PROMPT_REAL_ESTATE = `You are an elite real estate social media copywriter trained in high-performing property marketing.

CORE INSTRUCTIONS:
Match the tone precisely to the selected Writing Style.

Structure the content specifically for the selected Platform:
- LinkedIn: Professional, insight-driven, credibility-focused.
- Instagram: Hook-driven, lifestyle-led, strong captions, optional emoji but minimal.
- Facebook: Community-focused, slightly conversational.
- TikTok: Script format, short hook, engaging spoken tone.
- YouTube: Short-form script intro with strong hook and retention pull.
- Twitter: Concise, high-impact, scroll-stopping.

Adapt structure to the Goal Type:
- New Listing: Highlight uniqueness, value, emotional trigger.
- Just Sold: Outcome-driven, social proof, subtle authority.
- Educational: Clear takeaway, build trust.
- Testimonial: Client-focused storytelling.
- Behind the Scenes: Human, authentic.
- Open Home: Time-sensitive, compelling reason to attend.
- Price Reduction: Opportunity framing.
- Market Update: Insight-led, confidence-building.
- Aspirational: Lifestyle-first narrative.

STYLE REQUIREMENTS:
- Modern and confident.
- Inspired by top-performing real estate creators.
- Not corporate.
- No generic real estate cliches.
- No em dashes.
- No phrases like "in today's market," "dream home awaits," or obvious AI filler.
- No robotic transitions.
- Avoid overly salesy hype.
- Natural rhythm and varied sentence length.
- Strong opening hook.
- Clear but subtle CTA.
- Keep it authentic and human.
- Do not sound like a script written by a brokerage marketing department.
`;

const MASTER_PROMPT_BUSINESS_BROKER = `You are an expert business brokerage marketing copywriter specializing in deal flow, exit strategy positioning, and buyer attraction.

CORE INSTRUCTIONS:
Align tone precisely with the selected Writing Style.

Structure per Platform:
- LinkedIn: Authority-led, strategic insight.
- Instagram: Clear hook, simplified business angle, strong clarity.
- Facebook: Conversational but credible.
- TikTok: Short authority-driven script.
- YouTube: Strong hook focused on opportunity or learning.
- Twitter: Sharp and deal-focused.

Adapt to Goal Type:
- New Business: Position opportunity and upside.
- Sold: Highlight result, process strength.
- Education: Explain valuation, exits, buyers, or deal myths.
- Testimonial: Credibility through outcome.
- Behind the Scenes: Deal complexity insight.
- Price Adjustment: Strategic entry point framing.
- Market Insight: Data-backed authority.
- Exit Planning: Future-focused positioning.

STYLE REQUIREMENTS:
- Intelligent and commercially sharp.
- Modern, entrepreneurial voice.
- No corporate finance jargon overload.
- No fluff.
- No em dashes.
- Avoid obvious AI phrasing.
- Avoid buzzwords like "synergy," "leverage opportunity," or "robust pipeline."
- Confident but not arrogant.
- Clear logic flow.
- Strong hook.
- Clean CTA.
- Feels written by someone who closes deals, not someone who writes blog posts.
`;

async function fetchListingContent(listingUrl: string): Promise<string | null> {
  try {
    const pageRes = await fetch(listingUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });
    if (!pageRes.ok) {
      console.error("Listing fetch failed:", pageRes.status);
      return null;
    }
    const html = await pageRes.text();
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 4000);
    return textContent;
  } catch (e) {
    console.error("Failed to fetch listing URL:", e);
    return null;
  }
}

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

    const masterPrompt = params.userType === 'business_broker'
      ? MASTER_PROMPT_BUSINESS_BROKER
      : MASTER_PROMPT_REAL_ESTATE;

    let systemPrompt = "";
    let userPrompt = "";

    const styleAppend = params.styleInstructions
      ? `\n\nAdditional writing style instructions from the user: ${params.styleInstructions}`
      : "";

    if (action === "generate_post") {
      const { goal, style, cta, platforms, listingName, listingUrl, includeEmojis, tone } = params;
      const emojiInstruction = includeEmojis ? "Use relevant emojis throughout to make it engaging." : "Do NOT use any emojis at all. Keep it clean and professional.";
      const toneInstruction = tone === "casual" ? "Use a casual, friendly, conversational tone." : "Use a professional, credible, authoritative tone.";

      // Fetch listing page content if URL provided
      let listingContent = "";
      if (listingUrl) {
        const content = await fetchListingContent(listingUrl);
        if (content) {
          listingContent = `\n\nListing page content (use this for accurate property details including address, bedrooms, bathrooms, car parks, land size, floor area, price/sale method, and key features):\n${content}`;
        }
      }

      systemPrompt = `${masterPrompt}

${emojiInstruction} ${toneInstruction}

Return ONLY valid JSON. No markdown, no code fences, no extra text. Use this exact structure:
{"hook":"attention-grabbing opening line","body":"main copy 2-4 sentences","cta":"call to action line","hashtags":"5-8 relevant hashtags","imageIdea":"visual content suggestion","videoScript":"15-second video script if platform is TikTok/Instagram/YouTube, otherwise null","propertyDetails":"brief summary of key property details like bedrooms, bathrooms, car parks, land size, price/sale method - only if listing details are available, otherwise null"}${styleAppend}`;

      userPrompt = `Generate a ${style} social media post for ${platforms.join(", ")}.
Goal: ${goal}
${listingName ? `Listing: ${listingName}` : ""}
${listingUrl ? `Listing URL: ${listingUrl}` : ""}
CTA: ${cta}
Keep it concise and platform-appropriate.${listingContent}`;

    } else if (action === "generate_plan") {
      const { planType, platform, frequency, goals, includeEmojis, tone } = params;
      const emojiInstruction = includeEmojis ? "Include relevant emojis." : "No emojis.";
      const toneInstruction = tone === "casual" ? "Casual and friendly tone." : "Professional tone.";

      if (planType === "monthly") {
        systemPrompt = `${masterPrompt}

You are also a marketing strategist. ${emojiInstruction} ${toneInstruction}

Return ONLY valid JSON. No markdown, no code fences, no extra text. Use this exact structure:
{"title":"plan title","summary":"brief overview","weeks":[{"week":"Week 1","theme":"weekly theme","actions":[{"day":"day label","task":"specific action item","platform":"platform name","type":"content|outreach|networking|email","details":"extra context"}]},{"week":"Week 2","theme":"weekly theme","actions":[...]},{"week":"Week 3","theme":"weekly theme","actions":[...]},{"week":"Week 4","theme":"weekly theme","actions":[...]}]}${styleAppend}`;

        userPrompt = `Create a 4-week monthly marketing plan.
Platform focus: ${platform}
Posting frequency: ${frequency}
Goals: ${goals}
Structure as Week 1, Week 2, Week 3, Week 4. Each week should have a theme and actions matching the posting frequency of ${frequency}. Make each week's actions specific and actionable.`;
      } else {
        systemPrompt = `${masterPrompt}

You are also a marketing strategist. ${emojiInstruction} ${toneInstruction}

Return ONLY valid JSON. No markdown, no code fences, no extra text. Use this exact structure:
{"title":"plan title","summary":"brief overview","actions":[{"day":"day or week label","task":"specific action item","platform":"platform name","type":"content|outreach|networking|email","details":"extra context"}]}${styleAppend}`;

        userPrompt = `Create a weekly marketing plan.
Platform focus: ${platform}
Posting frequency: ${frequency}
Goals: ${goals}
Include 5-7 specific, actionable items.`;
      }

    } else if (action === "generate_content_ideas") {
      const { topics, customTopic, includeEmojis, tone } = params;
      const emojiInstruction = includeEmojis ? "Include emojis in titles." : "No emojis in output.";
      const toneInstruction = tone === "casual" ? "Casual tone." : "Professional tone.";

      systemPrompt = `${masterPrompt}

You are also a content strategist. ${emojiInstruction} ${toneInstruction}

Return ONLY valid JSON. No markdown, no code fences, no extra text. Use this exact structure:
{"ideas":[{"title":"content title","description":"2-3 sentence description","platforms":["platform1","platform2"],"format":"blog|video|carousel|infographic|story","difficulty":"easy|medium|advanced"}]}${styleAppend}`;

      userPrompt = `Generate 6 content ideas based on these topics: ${topics.join(", ")}${customTopic ? `, ${customTopic}` : ""}.
Make them specific, actionable, and relevant to the NZ market.`;

    } else if (action === "expand_content_idea") {
      const { idea } = params;

      systemPrompt = `${masterPrompt}

You are a content execution planner. Given a content idea, create a detailed, actionable execution plan.

Return ONLY valid JSON. No markdown, no code fences, no extra text. Use this exact structure:
{"title":"idea title","executionSteps":["step 1","step 2","step 3","step 4","step 5"],"copyOutline":"draft copy or script outline","schedule":"recommended posting schedule","formatTips":"how to create this content format effectively","estimatedTime":"estimated time to create e.g. 2 hours","platforms":["platform1","platform2"]}${styleAppend}`;

      userPrompt = `Create a detailed execution plan for this content idea:
Title: ${idea.title}
Description: ${idea.description}
Format: ${idea.format}
Platforms: ${(idea.platforms || []).join(", ")}`;

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
