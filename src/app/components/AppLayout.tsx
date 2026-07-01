import React, { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Download, Loader2, Frame, Scan } from "lucide-react";
import { useStore } from "../store";
import { PreviewStage } from "./PreviewStage";
import { NavSidebar } from "./NavSidebar";
import { MobileExportBanner } from "./MobileExportBanner";
import { renderToMp4, downloadBlob, type RenderHandle } from "../render";
import { totalDurationInFrames } from "./SceneSeries";

type Status = "idle" | "rendering" | "error";

export const AppLayout: React.FC = () => {
  const { scenes, audio, finishes } = useStore();
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [safeArea, setSafeArea] = useState(false);
  const handleRef = useRef<RenderHandle | null>(null);

  const hasContent = scenes.some((s) => s.text.trim().length > 0);

  const render = useCallback(async () => {
    if (status === "rendering" || !hasContent) return;
    setStatus("rendering");
    setProgress(0);
    setError(null);
    try {
      const total = totalDurationInFrames(scenes);
      const handle = renderToMp4(
        { scenes, audio, finishes },
        total,
        setProgress,
      );
      handleRef.current = handle;
      const blob = await handle.promise;
      downloadBlob(blob, `reelcraft-${Date.now()}.mp4`);
      setStatus("idle");
    } catch (e) {
      console.error(e);
      const detail = e instanceof Error ? e.message : String(e);
      setError(
        `Render failed: ${detail}. If this persists, try the CLI render (see README).`,
      );
      setStatus("error");
    }
  }, [status, scenes, audio, finishes, hasContent]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        render();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [render]);

  return (
    <div className="flex h-screen flex-col bg-base lg:flex-row">
      <NavSidebar />

      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-rim px-4 py-3 lg:px-6 lg:py-3.5">
          <div className="flex items-center gap-2.5">
            <Frame size={17} className="text-accent-purple" />
            <span className="bg-gradient-brand bg-clip-text text-sm font-semibold tracking-tight text-transparent">
              Reelcraft
            </span>
          </div>
          <button
            onClick={() => setSafeArea((s) => !s)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition lg:px-3 ${
              safeArea
                ? "border-accent-purple/60 bg-accent-purple/10 text-zinc-100"
                : "border-rim text-muted hover:border-accent-purple hover:text-zinc-200"
            }`}
          >
            <Scan size={14} />
            <span className="hidden lg:inline">Safe area</span>
          </button>
        </header>

        <MobileExportBanner />

        <main className="grid min-h-0 flex-1 grid-rows-[60vh_1fr] pb-14 lg:grid-cols-[1fr_400px] lg:grid-rows-1 lg:pb-0">
          <section className="flex min-h-0 items-center justify-center overflow-hidden border-b border-rim bg-[radial-gradient(120%_120%_at_50%_0%,#1a1a26_0%,#0D0D12_60%)] px-4 py-6 lg:border-b-0 lg:border-r lg:px-6 lg:py-10">
            <PreviewStage showSafeArea={safeArea} />
          </section>

          <aside className="flex min-h-0 flex-col overflow-hidden bg-base">
            <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 lg:py-7">
              <Outlet />
            </div>

            <div className="sticky bottom-0 border-t border-rim bg-base/95 px-4 py-4 backdrop-blur lg:px-6">
              {status === "rendering" ? (
                <div className="space-y-2.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-rim">
                    <div
                      className="h-full rounded-full bg-gradient-progress transition-[width] duration-200"
                      style={{ width: `${Math.max(4, progress * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted">
                    <Loader2 size={13} className="animate-spin" />
                    Encoding {Math.round(progress * 100)}%
                  </div>
                </div>
              ) : (
                <button
                  onClick={render}
                  disabled={!hasContent}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-3 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Download size={16} />
                  Download MP4
                  <kbd className="ml-1 rounded bg-black/25 px-1.5 py-0.5 text-[10px] font-normal">
                    ⌘↵
                  </kbd>
                </button>
              )}
              {error && (
                <p className="mt-2.5 text-[11px] leading-snug text-red-400">
                  {error}
                </p>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};
