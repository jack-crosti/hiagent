

# Add Listing URL + Multi-Platform Post Generation

## Overview

Two changes to the Post Builder:
1. Add a "Listing URL" input field so users can paste a link for the AI to reference
2. When multiple platforms are selected, generate a separate post for each platform instead of one generic post

## Changes

### 1. Frontend: Add Listing URL field (`src/pages/Marketing.tsx`)

- Add new state: `listingUrl` (string)
- Add an `Input` field after the "Listing Name" input, labeled "Listing URL (optional)" with placeholder like "https://www.realestate.co.nz/..."
- Pass `listingUrl` to the `callMarketingAI` call

### 2. Frontend: Generate one post per platform (`src/pages/Marketing.tsx`)

- Change `generatedPost` state from a single object to an array: `generatedPosts: any[]`
- In `handleGeneratePost`, loop through `selectedPlatforms` and call the AI once per platform (sequentially to avoid rate limits), passing a single platform each time
- Update the output card to render a list of posts, each with its platform badge, content sections, and a copy button
- Update `handleCopy` to accept an index parameter

### 3. Backend: Use listing URL in the prompt (`supabase/functions/marketing-ai/index.ts`)

- In the `generate_post` action, if `listingUrl` is provided, add it to the user prompt: `Listing URL: ${listingUrl}` so the AI can reference or include it in the CTA
- No other backend changes needed -- the multi-platform logic is handled by the frontend making separate calls per platform

## Technical Details

**New state in Marketing.tsx:**
```
const [listingUrl, setListingUrl] = useState('');
const [generatedPosts, setGeneratedPosts] = useState<any[]>([]);
```

**handleGeneratePost loop:**
```
const posts = [];
for (const platform of selectedPlatforms) {
  const result = await callMarketingAI('generate_post', {
    goal, style, cta, platforms: [platform], listingName, listingUrl,
  });
  posts.push({ ...result, platform });
}
setGeneratedPosts(posts);
```

**Edge function user prompt update (line 124-128):**
Add `listingUrl` to the destructured params and append to user prompt:
```
${listingUrl ? `Listing URL: ${listingUrl}` : ""}
```

**Output card:** Render `generatedPosts.map((post, i) => ...)` with each post showing its platform badge and copy button. Replace the single-post display.
