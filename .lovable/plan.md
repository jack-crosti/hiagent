

# Marketing Planner: Three Enhancements

## Overview

Three improvements to the Marketing Planner:
1. **Post Builder**: Scrape listing URL to extract real property details (bedrooms, bathrooms, parking, land size, price, sale method) and feed them to the AI
2. **Weekly Actions**: When "Monthly" is selected, generate a structured 4-week plan based on the posting frequency
3. **Content Ideas**: Make each idea card clickable to expand into a detailed AI-generated execution plan

---

## 1. Post Builder: Scrape Listing URL for Property Details

**Problem**: The AI currently just receives the raw URL text but cannot visit it, so it guesses property details (often wrong).

**Solution**: In the edge function, when a `listingUrl` is provided, fetch the page HTML, extract the text content, and pass it as context to the AI so it uses the real address, bedrooms, bathrooms, car parks, land area, floor area, price/sale method, and key features.

### Edge Function Changes (`marketing-ai/index.ts`)

- Before building the post prompt, if `listingUrl` is present:
  1. Fetch the URL with a standard `fetch()` call
  2. Extract the text content from the HTML (strip tags)
  3. Truncate to ~4000 characters to stay within token limits
  4. Include it in the user prompt as "Listing Page Content" for the AI to reference
- Update the JSON output structure to also return extracted property details: `"propertyDetails": "3 bed, 2 bath, 1 car park, 450sqm land, Auction"`
- If the fetch fails (e.g. blocked), fall back to the current behavior (just pass the URL)

### Frontend Changes (`Marketing.tsx`)

- Display `post.propertyDetails` in the output card if present, as a small info line above the hook

---

## 2. Weekly Actions: Monthly Plan with 4 Weeks

**Problem**: Selecting "Monthly" generates the same 5-7 action items as "Weekly" -- it does not structure content across 4 weeks.

### Edge Function Changes (`marketing-ai/index.ts`)

- In the `generate_plan` action, when `planType === "monthly"`, update:
  - The JSON structure to use `"weeks"` containing 4 week objects, each with actions matching the posting frequency
  - The user prompt to explicitly request: "Create a 4-week monthly plan. Each week should have actions matching the posting frequency of [frequency]. Structure as Week 1, Week 2, Week 3, Week 4."
  - Expected JSON: `{"title":"...","summary":"...","weeks":[{"week":"Week 1","actions":[{"day":"Monday","task":"...","platform":"...","type":"...","details":"..."}]}]}`
- Keep the weekly plan format unchanged (flat actions list)

### Frontend Changes (`Marketing.tsx`)

- When rendering a monthly plan, check for `generatedPlan.weeks` array
- If present, render each week as a section with a "Week 1", "Week 2" etc. header, followed by that week's actions
- If the plan has the old flat `actions` format, render as before (backward compatible)

---

## 3. Content Ideas: Click to Expand with Detailed Plan

**Problem**: Generated idea cards are static and cannot be explored further.

### Frontend Changes (`Marketing.tsx`)

- Add state: `expandedIdeaIndex` (number or null) and `expandedIdeaDetail` (object or null), `expandingIdea` (boolean)
- When a user clicks an idea card:
  1. Set `expandedIdeaIndex` to that card's index
  2. Call `callMarketingAI('expand_content_idea', { idea })` to get a detailed plan
  3. Display the result in an expanded view below the card (or as a dialog/sheet)
- The expanded detail includes: step-by-step execution plan, suggested copy/script outline, recommended posting schedule, content format tips, and estimated time to create

### Edge Function Changes (`marketing-ai/index.ts`)

- Add a new action: `expand_content_idea`
- System prompt: master prompt + "You are a content execution planner. Given a content idea, create a detailed execution plan."
- Expected JSON: `{"title":"...","executionSteps":["step 1","step 2",...],"copyOutline":"draft copy or script outline","schedule":"when to post","formatTips":"how to create this format","estimatedTime":"e.g. 2 hours","platforms":["..."]}`

---

## Technical Details

### Edge function: URL scraping logic

```text
if (listingUrl) {
  try {
    const pageRes = await fetch(listingUrl, {
      headers: { "User-Agent": "Mozilla/5.0 ..." }
    });
    const html = await pageRes.text();
    // Strip HTML tags to get text content
    const textContent = html.replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ').trim().substring(0, 4000);
    // Append to user prompt
    userPrompt += `\n\nListing page content (use this for accurate details):\n${textContent}`;
  } catch (e) {
    console.error("Failed to fetch listing URL:", e);
    // Fall back to just URL reference
  }
}
```

### Edge function: Monthly plan JSON structure

```text
// For monthly plans:
{"title":"...","summary":"...","weeks":[
  {"week":"Week 1","theme":"...","actions":[
    {"day":"Monday","task":"...","platform":"...","type":"...","details":"..."}
  ]},
  {"week":"Week 2","theme":"...","actions":[...]},
  {"week":"Week 3","theme":"...","actions":[...]},
  {"week":"Week 4","theme":"...","actions":[...]}
]}
```

### Edge function: New `expand_content_idea` action

```text
} else if (action === "expand_content_idea") {
  const { idea } = params;
  systemPrompt = `${masterPrompt}
You are a content execution planner.
Return ONLY valid JSON:
{"title":"...","executionSteps":["..."],"copyOutline":"...","schedule":"...","formatTips":"...","estimatedTime":"...","platforms":["..."]}`;
  userPrompt = `Create a detailed execution plan for this content idea:
Title: ${idea.title}
Description: ${idea.description}
Format: ${idea.format}
Platforms: ${(idea.platforms || []).join(", ")}`;
}
```

### Frontend: Monthly plan rendering

```text
{generatedPlan.weeks ? (
  generatedPlan.weeks.map((week) => (
    <div key={week.week}>
      <h4>{week.week}{week.theme ? ` - ${week.theme}` : ''}</h4>
      {week.actions.map((item) => (
        // existing action row rendering
      ))}
    </div>
  ))
) : (
  // existing flat actions rendering
)}
```

### Frontend: Expandable idea cards

- Clicking a card sets `expandedIdeaIndex` and triggers the AI call
- The expanded content renders below the clicked card in a highlighted panel
- Includes a "Close" button to collapse back
- Shows a loading spinner while the AI generates the detail

