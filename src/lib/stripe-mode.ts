// Single source of truth for "are we in test mode?" — used by the banner,
// per-page test-mode notes, and anywhere we need to condition UI on whether
// real payments can happen. When STRIPE_SECRET_KEY is missing we assume test
// mode so production without env vars doesn't accidentally present itself as
// live.
export function isTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return true;
  return key.startsWith("sk_test_");
}

// Height of the site-wide preview banner in pixels. Exposed so pages with
// fixed top headers can offset themselves when the banner is visible.
export const BANNER_HEIGHT = 40;
