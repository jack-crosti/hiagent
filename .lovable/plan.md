
## Reorder Auth Flow: Role Selection First, Then Login

### Current Flow
1. `/auth` → Login/Sign Up form (plain card page)
2. After login → `UserTypeSelector` (the big animated TubesBackground page with broker/agent cards)
3. After role → Setup Wizard

### New Flow
1. `/auth` → Role selection screen (the big animated TubesBackground page — "HiAgent" title, broker/agent cards)
2. After selecting role → Login/Sign Up form (same card, but now styled on top of the TubesBackground, with a "Back" option)
3. After login → The selected `user_type` is saved to the profile → Setup Wizard

---

### Implementation Plan

**1. Refactor `src/pages/Auth.tsx`**

Introduce a two-step local state machine:
- `step: 'role' | 'auth'` — starts at `'role'`
- `pendingUserType: string | null` — stores the selection before signup

**Step 1 — Role screen** (replaces current plain auth page):
- Render the full `TubesBackground` with the big "HiAgent" title
- Show the two role cards (Business Broker / Real Estate Agent)
- "Continue" button advances to `step = 'auth'`
- Existing users who already have an account can still use "Sign In" — only Sign Up needs the role stored. For Sign In, the role is already saved in the DB, so we skip storing it again.

**Step 2 — Auth screen**:
- Render the Sign In / Sign Up tabs on top of `TubesBackground` (same animated background for visual continuity)
- Show a `← Back` button to return to role selection
- On Sign Up success: save `pendingUserType` to `localStorage` so it survives email verification redirect
- The `AppLayout` reads `pendingUserType` from `localStorage` after signup and writes it to the profile, clearing the stored value

**2. Refactor `src/components/UserTypeSelector.tsx`**

Since role selection now happens before login, this component is no longer needed as a post-login gate. It can be removed or kept only as a fallback for existing accounts that have no `user_type` set yet (important for backwards compatibility).

**3. `AppLayout` — save pending user type after signup**

After a new user logs in for the first time, `AppLayout` checks if `localStorage` has a `pendingUserType` key. If so, it writes it to the profile and clears the key. This handles the email-verification redirect case where the user is bounced back to the app.

---

### Key Decisions

- **Sign In flow**: Role selection is shown but not re-saved (they already have one). The "Continue" on the role step just advances to the login form. If they sign in, their existing DB role is used as normal.
- **Sign Up flow**: The selected role is stored in `localStorage` under `hiagent_pending_user_type`, then written to the profile in `AppLayout` once the user is authenticated.
- **Back compat**: `UserTypeSelector` stays as a fallback for any existing user with `user_type = null` in the DB.
- **Visual consistency**: Both steps render inside `TubesBackground` so the transition feels seamless.

---

### Files Changed

| File | Change |
|---|---|
| `src/pages/Auth.tsx` | Add `step` state; render role-selector UI on step 1, auth form on step 2; pass `pendingUserType` to `SignUpForm` |
| `src/components/AppLayout.tsx` | On load, check `localStorage` for `hiagent_pending_user_type`; if present, write to profile and clear |
| `src/components/UserTypeSelector.tsx` | Keep as-is (fallback for existing accounts with no role) |
