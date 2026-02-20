

# Fix Marketing Planner AI Features

## Problem

The AI edge function (`marketing-ai`) returns `{"result": {}}` for all three generators (Post Builder, Weekly Actions, Content Ideas). The root cause is that the `tools` / `tool_choice` parameter used to force structured JSON output is not producing populated results from the AI gateway. The model returns an empty `result` object in the tool call arguments.

## Solution

Replace the tool-calling approach with direct JSON generation in the message content, and add robust parsing with logging for debugging.

---

## Changes

### 1. Fix Edge Function (`supabase/functions/marketing-ai/index.ts`)

- **Remove** the `tools` and `tool_choice` parameters from the AI gateway request body
- **Add** explicit "Return valid JSON only, no markdown fencing" instruction to each system prompt
- **Parse** the JSON directly from `choices[0].message.content` using a robust extraction function that strips markdown code fences and handles edge cases
- **Add** `console.log` for the raw AI response content so future debugging is easier
- **Add** a specific model parameter (`google/gemini-3-flash-preview`) to ensure consistent behavior

### 2. Add Writing Style Instructions (`src/pages/Marketing.tsx`)

- Add a new **"Writing Style Instructions"** text area in the Global Preferences bar where users can type custom instructions (e.g., "Always mention our company name XYZ Realty", "Use short punchy sentences", "Reference NZ market trends")
- Pass these custom instructions to the edge function as a `styleInstructions` parameter
- The edge function appends these instructions to the system prompt for all three AI actions

### 3. Improve Error Feedback

- In the edge function, if JSON parsing fails, return the raw AI content in the error message so the frontend can display it for debugging
- In the frontend, show more descriptive toast messages when generation fails

---

## Technical Details

**Edge function changes:**

```
// Remove from request body:
tools: [...]
tool_choice: { ... }

// Add to each system prompt:
"Return ONLY valid JSON. No markdown, no code fences, no extra text."

// Replace result extraction logic with:
const content = data.choices?.[0]?.message?.content ?? "";
console.log("AI raw content:", content.substring(0, 500));

// Clean and parse:
let cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
```

**Frontend changes (Marketing.tsx):**

- New state: `styleInstructions` (string)
- New UI: A collapsible textarea in the preferences bar labeled "Custom Writing Style" with placeholder text like "e.g. Always use our brand name 'Elite Realty'. Keep sentences under 15 words."
- Pass `styleInstructions` alongside `includeEmojis` and `tone` in `callMarketingAI`

**Edge function prompt integration:**

Each system prompt will append:
```
${params.styleInstructions ? `\n\nAdditional writing style instructions from the user: ${params.styleInstructions}` : ''}
```

This ensures all three generators (post, plan, content ideas) respect the user's custom style preferences.
