/**
 * Editor layout — full-screen, no AppShell sidebar/bottom bar.
 * COOP/COEP headers are set via next.config.js for this route
 * to enable SharedArrayBuffer for FFmpeg-wasm.
 */

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a14] flex flex-col overflow-hidden">
      {children}
    </div>
  );
}
