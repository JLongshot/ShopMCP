// Single source of truth for the landing-page prompt.
// Used by the copy-prompt card and the agent deep-link buttons so they can never drift.
//
// Hardcoded to the production URL on purpose: this string is always meant to be
// handed off to an external agent, which needs the real public URL — never
// localhost or a preview deploy.
export const LANDING_PROMPT =
  "Fetch https://theagentcatalog.com/llms.txt and help me shop";
