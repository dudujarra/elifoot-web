// SPEC-189: GoatCounter analytics, privacy-respecting, env-gated.
// No-op if VITE_GOATCOUNTER_CODE unset (dev local, tests, pre-signup).
// Privacy: no cookies, no PII, hash IP per GoatCounter default.

const CODE = import.meta.env?.VITE_GOATCOUNTER_CODE;
const SCRIPT_SRC = 'https://gc.zgo.at/count.js';

let _initialized = false;

export function initAnalytics() {
    if (_initialized) return;
    if (!CODE) return;
    if (typeof document === 'undefined') return;

    const endpoint = `https://${CODE}.goatcounter.com/count`;
    const script = document.createElement('script');
    script.async = true;
    script.src = SCRIPT_SRC;
    script.setAttribute('data-goatcounter', endpoint);
    document.head.appendChild(script);
    _initialized = true;
}

export function trackEvent(eventName) {
    if (!CODE) return;
    if (typeof window === 'undefined') return;
    if (typeof window.goatcounter?.count !== 'function') return;
    window.goatcounter.count({
        path: `evt-${eventName}`,
        event: true,
    });
}

export function isAnalyticsEnabled() {
    return !!CODE;
}
