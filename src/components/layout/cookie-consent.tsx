"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "greenstamp_cookie_consent_v1";

export function CookieConsent() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setAcknowledged(Boolean(window.localStorage.getItem(CONSENT_KEY)));
    } catch {
      setAcknowledged(false);
    }
    setReady(true);
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(CONSENT_KEY, "acknowledged");
    } catch {
      // Dismiss the notice for this render when local storage is unavailable.
    }
    setAcknowledged(true);
  }

  return ready && !acknowledged ? (
    <section className="cookie-banner" aria-label="Browser storage notice" aria-live="polite">
      <h2>Privacy &amp; browser storage</h2>
      <p>Greenstamp uses essential session cookies to keep you signed in and browser storage to remember your appearance theme and this notice. The current app does not load a separate advertising or analytics system. Read the <Link href="/privacy" className="text-link">privacy policy</Link>.</p>
      <div className="cookie-actions">
        <button className="button button-primary button-small" onClick={dismiss}>Got it</button>
      </div>
    </section>
  ) : null;
}
