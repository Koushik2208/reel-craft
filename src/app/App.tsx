import React, { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, Frame, Scan, SlidersHorizontal, X } from "lucide-react";
import { useStore } from "./store";
import { Inspector } from "./components/Inspector";
import { PreviewStage } from "./components/PreviewStage";
import { MobileExportBanner } from "./components/MobileExportBanner";
import {
  renderToMp4,
  downloadBlob,
  getExportFormat,
  type RenderHandle,
} from "./render";
import { totalDurationInFrames } from "./components/SceneSeries";

type Status = "idle" | "rendering" | "error";

const MIXED_LAYER_MODE_WARNING =
  "Some scenes are set to Text Only (transparent). Export individual scenes to get WebM files with alpha. The full stitched export uses MP4.";

export const App: React.FC = () => {
  const { scenes, audio, finishes } = useStore();
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [safeArea, setSafeArea] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleRef = useRef<RenderHandle | null>(null);

  const hasContent = scenes.some((s) => s.text.trim().length > 0);
  const formats = scenes.map((s) => getExportFormat(s.layerMode ?? "full"));
  const hasMixedLayerModes =
    formats.some((f) => f.transparent) && formats.some((f) => !f.transparent);

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
    <div className="flex h-screen flex-col bg-base">
      <header className="flex items-center justify-between border-b border-rim px-4 py-3 lg:px-6 lg:py-3.5">
        <div className="flex items-center gap-2.5">
          <Frame size={17} className="text-accent-purple" />
          <span className="bg-gradient-brand bg-clip-text text-sm font-semibold tracking-tight text-transparent">
            Reelcraft
          </span>
        </div>
        <div className="flex items-center gap-2">
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
          {/* Mobile-only options toggle */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open options"
            className="flex items-center gap-1.5 rounded-lg border border-rim px-2.5 py-1.5 text-xs text-muted transition hover:border-accent-purple hover:text-zinc-200 lg:hidden"
          >
            <SlidersHorizontal size={14} />
            <span>Options</span>
          </button>
        </div>
      </header>

      <MobileExportBanner />

      {/* Mobile backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_400px] lg:grid-rows-1">
        <section className="flex min-h-0 items-center justify-center overflow-hidden border-b border-rim bg-[radial-gradient(120%_120%_at_50%_0%,#1a1a26_0%,#0D0D12_60%)] px-4 py-6 lg:border-b-0 lg:border-r lg:px-6 lg:py-10">
          <PreviewStage showSafeArea={safeArea} />
        </section>

        {/* Sidebar: offcanvas on mobile, static on lg+ */}
        <aside
          className={`fixed inset-y-0 right-0 z-50 flex w-[85vw] max-w-sm flex-col overflow-hidden border-l border-rim bg-base shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0 lg:shadow-none ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer header (mobile only) */}
          <div className="flex items-center justify-between border-b border-rim px-4 py-3 lg:hidden">
            <span className="text-sm font-medium text-zinc-200">Options</span>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close options"
              className="rounded-lg p-1.5 text-muted transition hover:bg-rim hover:text-zinc-200"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 lg:py-7">
            <Inspector />
          </div>

          <div className="sticky bottom-0 border-t border-rim bg-base/95 px-4 py-4 backdrop-blur lg:px-6">
            {hasMixedLayerModes && status !== "rendering" && (
              <p className="mb-2.5 text-[11px] leading-snug text-amber-400/90">
                {MIXED_LAYER_MODE_WARNING}
              </p>
            )}
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
  );
};
