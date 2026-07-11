/**
 * Lightweight, privacy-preserving observability (§24).
 *
 * Only non-sensitive, enumerable events with primitive, non-identifying
 * properties are tracked. NEVER pass source code, PR descriptions, finding
 * text, prompts, tokens, credentials, or access tokens through here. The
 * default adapter is a no-op; a real adapter can be injected without adding a
 * third-party dependency to the bundle.
 */
export type AnalyticsEvent =
  | 'login_succeeded'
  | 'login_failed'
  | 'connection_opened'
  | 'estimate_requested'
  | 'review_started'
  | 'review_completed'
  | 'review_failed'
  | 'review_cancelled'
  | 'review_stale'
  | 'publish_preview_opened'
  | 'comments_published'
  | 'publish_failed';

/** Only primitive, non-identifying values are permitted as properties. */
export type AnalyticsProps = Record<string, string | number | boolean>;

export interface AnalyticsAdapter {
  track(event: AnalyticsEvent, props?: AnalyticsProps): void;
}

const noopAdapter: AnalyticsAdapter = {
  track: () => {
    /* no-op by default */
  },
};

let adapter: AnalyticsAdapter = noopAdapter;

export function setAnalyticsAdapter(next: AnalyticsAdapter): void {
  adapter = next;
}

export function trackEvent(event: AnalyticsEvent, props?: AnalyticsProps): void {
  adapter.track(event, props);
}
