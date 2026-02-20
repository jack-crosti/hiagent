const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http')) formattedUrl = `https://${formattedUrl}`;

    console.log('Extracting brand colors from:', formattedUrl);

    // Step 1: Fetch HTML and extract colors
    let html = '';
    try {
      const resp = await fetch(formattedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HiAgent/1.0)' },
        redirect: 'follow',
      });
      html = await resp.text();
    } catch (e) {
      console.error('Failed to fetch URL:', e);
    }

    const colors: string[] = [];

    // Extract meta theme-color
    const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    if (themeColorMatch?.[1]) colors.push(themeColorMatch[1]);

    // Extract msapplication-TileColor
    const tileMatch = html.match(/<meta[^>]*name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i);
    if (tileMatch?.[1]) colors.push(tileMatch[1]);

    // Extract hex colors from inline styles and CSS
    const hexMatches = html.match(/#[0-9a-fA-F]{6}\b/g) || [];
    const uniqueHex = [...new Set(hexMatches)].filter(c => {
      // Filter out common non-brand colors
      const lower = c.toLowerCase();
      return lower !== '#000000' && lower !== '#ffffff' && lower !== '#333333' && lower !== '#666666' && lower !== '#999999' && lower !== '#cccccc';
    });
    colors.push(...uniqueHex.slice(0, 10));

    // Extract CSS custom property colors
    const cssVarMatches = html.match(/--(?:primary|brand|accent|main|theme)[^:]*:\s*([^;]+)/gi) || [];
    for (const m of cssVarMatches) {
      const val = m.split(':')[1]?.trim();
      if (val && (val.startsWith('#') || val.startsWith('rgb'))) colors.push(val);
    }

    console.log('Found colors from HTML:', colors.length);

    // If we have enough colors from HTML parsing, return them
    if (colors.length >= 3) {
      const unique = [...new Set(colors.map(c => c.trim()))];
      return new Response(JSON.stringify({
        primary: unique[0],
        secondary: unique[1] || unique[0],
        accent: unique[2] || unique[1] || unique[0],
        source: 'html',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Step 2: Fall back to AI analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      // Return whatever we found
      return new Response(JSON.stringify({
        primary: colors[0] || '#2A9D8F',
        secondary: colors[1] || '#E9C46A',
        accent: colors[2] || '#E76F51',
        source: 'fallback',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const prompt = `Analyze this website HTML and extract the 3 main brand colors (primary, secondary, accent) as hex values. Website URL: ${formattedUrl}

Here's a snippet of the HTML (first 3000 chars):
${html.slice(0, 3000)}

${colors.length > 0 ? `Colors already found in the page: ${colors.join(', ')}` : ''}

Return ONLY a JSON object with exactly these keys: primary, secondary, accent. Each value should be a hex color string like "#2A9D8F".`;

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a brand color extraction expert. Return ONLY valid JSON, no markdown.' },
          { role: 'user', content: prompt },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'extract_colors',
            description: 'Return the 3 brand colors',
            parameters: {
              type: 'object',
              properties: {
                primary: { type: 'string', description: 'Primary brand color as hex' },
                secondary: { type: 'string', description: 'Secondary brand color as hex' },
                accent: { type: 'string', description: 'Accent brand color as hex' },
              },
              required: ['primary', 'secondary', 'accent'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'extract_colors' } },
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error('AI gateway error:', aiResp.status, errText);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited, please try again later.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({
        primary: colors[0] || '#2A9D8F',
        secondary: colors[1] || '#E9C46A',
        accent: colors[2] || '#E76F51',
        source: 'fallback',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ ...parsed, source: 'ai' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      primary: colors[0] || '#2A9D8F',
      secondary: colors[1] || '#E9C46A',
      accent: colors[2] || '#E76F51',
      source: 'fallback',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('extract-brand-colors error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
