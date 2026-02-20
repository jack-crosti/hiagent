

# Embed Master Writing Prompts into Marketing AI

## Overview

Integrate your two master prompts (one for Real Estate Agents, one for Business Brokers) into the backend so the AI always follows the correct style guide based on the user's role. The frontend will pass the user's role to the edge function, which selects the appropriate master prompt automatically.

## Changes

### 1. Frontend: Pass user type to the edge function (`src/pages/Marketing.tsx`)

- Fetch the user's `user_type` from the `profiles` table on mount (same pattern used in other pages)
- Include `userType` in every `callMarketingAI` call so the backend knows which master prompt to use
- The "Writing Style Instructions" textarea remains for additional per-request customization on top of the master prompt

### 2. Backend: Embed both master prompts (`supabase/functions/marketing-ai/index.ts`)

- Add two large constant strings: `MASTER_PROMPT_REAL_ESTATE` and `MASTER_PROMPT_BUSINESS_BROKER`
- Each contains the full style requirements, platform rules, goal-type adaptation rules, and output format you provided
- At the start of each action handler (`generate_post`, `generate_plan`, `generate_content_ideas`), prepend the appropriate master prompt to the system prompt based on `params.userType`
- If no user type is provided, default to the Real Estate Agent prompt
- The existing emoji toggle, tone toggle, and style instructions continue to be appended after the master prompt

### 3. What stays the same

- All existing UI controls (goal type, style, CTA, platforms, emoji toggle, tone toggle, writing style textarea) remain unchanged
- The JSON output format instructions remain in each action's system prompt
- The robust JSON parsing logic stays as-is

## Technical Details

**Frontend (`Marketing.tsx`):**
- Add `userType` state, fetched from `profiles` table on mount
- In `callMarketingAI`, add `userType` to the params object

**Edge function (`marketing-ai/index.ts`):**
- Two new constants at the top of the file containing the full master prompts
- Selection logic: `const masterPrompt = params.userType === 'business_broker' ? MASTER_PROMPT_BUSINESS_BROKER : MASTER_PROMPT_REAL_ESTATE;`
- Each action's system prompt becomes: `masterPrompt + actionSpecificInstructions + styleAppend`

The master prompts encode all the rules you specified: platform-specific formatting (LinkedIn professional, TikTok script format, etc.), goal-type adaptation, style requirements (no em dashes, no cliches, no AI filler), and output format (Hook, Body, CTA, Hashtags, optional video script).
