'use client';

// Camera / microphone choosers for the web recorders. The browser's default
// device is used until the user picks one; the choice is remembered.

import type { DeviceControls } from '@/hooks/useVideoRecorder';

const selectClass =
  'w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-accent-primary';

export function DevicePicker({ controls, showMic = true, disabled }: {
  controls: DeviceControls;
  /** Hide the microphone chooser (e.g. a song is playing and the mic is off). */
  showMic?: boolean;
  disabled?: boolean;
}) {
  const { cams, mics, cameraId, micId, setCameraId, setMicId, refreshDevices, labelsKnown } = controls;
  if (cams.length === 0 && mics.length === 0) return null;

  const name = (d: MediaDeviceInfo, i: number, fallback: string) => d.label || `${fallback} ${i + 1}`;

  return (
    <div className="mb-3 space-y-2">
      {!labelsKnown && (
        <button
          type="button"
          onClick={() => refreshDevices(true)}
          disabled={disabled}
          className="w-full text-xs text-accent-primary underline disabled:opacity-50"
        >
          Allow access to choose your camera and microphone
        </button>
      )}
      <div className={`grid gap-2 ${showMic ? 'sm:grid-cols-2' : ''}`}>
        <label className="block">
          <span className="block text-[11px] text-text-muted mb-1">Camera</span>
          <select value={cameraId} onChange={(e) => setCameraId(e.target.value)} disabled={disabled} className={selectClass}>
            <option value="" className="bg-bg-secondary">Default camera</option>
            {cams.map((d, i) => (
              <option key={d.deviceId || i} value={d.deviceId} className="bg-bg-secondary">{name(d, i, 'Camera')}</option>
            ))}
          </select>
        </label>
        {showMic && (
          <label className="block">
            <span className="block text-[11px] text-text-muted mb-1">Microphone</span>
            <select value={micId} onChange={(e) => setMicId(e.target.value)} disabled={disabled} className={selectClass}>
              <option value="" className="bg-bg-secondary">Default microphone</option>
              {mics.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId} className="bg-bg-secondary">{name(d, i, 'Microphone')}</option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
