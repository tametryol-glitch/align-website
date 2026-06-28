'use client';

import { useState } from 'react';

export const FOUNDER_ALIGN_NAME = 'Astro Einstein';
export const FOUNDER_ALIGN_CODE = 'ALN-36FB-2324';

/** "Add me as a friend" card — shows the founder's Align name + code so anyone
 *  can find and add them in the Align app. Shown after the founder bio. */
export function AddFounderCard() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(FOUNDER_ALIGN_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="rounded-2xl border border-accent-primary/40 bg-bg-card p-6 sm:p-8 text-center space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-text-primary">Add me as a friend</h2>
        <p className="text-text-tertiary text-sm mt-1">
          Connect with me on the Align app — search my Align code to send a friend request.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-bg-secondary rounded-xl p-4 text-left">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-text-muted">Align Name</p>
          <p className="text-base font-bold text-text-primary">{FOUNDER_ALIGN_NAME}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-text-muted">Align Code</p>
          <p className="text-base font-bold text-text-primary">{FOUNDER_ALIGN_CODE}</p>
        </div>
      </div>

      <button onClick={copy} className="btn-primary text-sm px-6 py-2.5">
        {copied ? 'Copied!' : 'Copy Align code'}
      </button>
    </div>
  );
}
