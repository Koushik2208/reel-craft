import React, { useState } from "react";
import { Check, Paintbrush } from "lucide-react";
import { useStore } from "../store";
import { useActiveStyle } from "../hooks/useActiveStyle";
import { EmptyTargetState } from "./EmptyTargetState";
import { OVERLAYS, type OverlayIntensity } from "../../overlays/types";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2.5">
    <h3 className="text-xs font-medium uppercase tracking-wider text-muted">{title}</h3>
    {children}
  </div>
);

const INTENSITY_LEVELS: OverlayIntensity[] = ["low", "medium", "high"];

export const OverlaysPanel: React.FC = () => {
  const { scenes, activeSceneId, setActiveScene } = useStore();
  const style = useActiveStyle();

  const [applied, setApplied] = useState(false);
  const handleApplyAll = () => {
    if (!style.ready || !style.applyOverlaysToAllScenes) return;
    style.applyOverlaysToAllScenes();
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  if (!style.ready) {
    return <EmptyTargetState message={style.message} linkTo={style.linkTo} linkLabel={style.linkLabel} />;
  }

  return (
    <div className="flex flex-col gap-7">
      {/* ── Scene selector (manual mode only) ── */}
      {style.mode === "manual" && scenes.length > 1 && (
        <Section title="Scenes">
          <div className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto pb-1">
            {scenes.map((scene, idx) => {
              const isActive = scene.id === activeSceneId;
              return (
                <button
                  key={scene.id}
                  onClick={() => setActiveScene(scene.id)}
                  className={`shrink-0 snap-start rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                    isActive
                      ? "border-accent-purple/60 bg-accent-purple/10 text-zinc-100"
                      : "border-rim bg-surface text-muted hover:border-accent-purple"
                  }`}
                >
                  Scene {idx + 1}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Active overlays summary ── */}
      {style.overlays.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {style.overlays.map((o) => {
            const meta = OVERLAYS.find((m) => m.id === o.id);
            if (!meta) return null;
            return (
              <span
                key={o.id}
                className="rounded-full border border-accent-purple/40 bg-accent-purple/10 px-2.5 py-1 text-[11px] font-medium text-accent-purple"
              >
                {meta.label}
              </span>
            );
          })}
        </div>
      )}

      {/* ── Overlay picker ── */}
      <Section title="Overlays">
        <div className="grid grid-cols-2 gap-2.5">
          {OVERLAYS.map((overlay) => {
            const activeOverlay = style.overlays.find((o) => o.id === overlay.id);
            const active = !!activeOverlay;
            return (
              <div
                key={overlay.id}
                className={`rounded-xl border px-3 py-3 transition ${
                  active
                    ? "border-accent-purple/60 bg-accent-purple/10"
                    : "border-rim bg-surface hover:border-accent-purple"
                }`}
              >
                <button
                  onClick={() => style.toggleOverlay(overlay.id)}
                  className="flex w-full items-start justify-between gap-2 text-left"
                >
                  <div>
                    <div className="text-[12px] font-medium text-zinc-100">{overlay.label}</div>
                    <div className="mt-0.5 text-[11px] leading-snug text-muted">{overlay.description}</div>
                  </div>
                  {active && <Check size={14} className="mt-0.5 shrink-0 text-accent-purple" />}
                </button>

                {active && overlay.hasIntensity && (
                  <div className="mt-2.5 flex gap-1 rounded-lg border border-rim bg-surface p-0.5">
                    {INTENSITY_LEVELS.map((level) => {
                      const on = activeOverlay?.intensity === level;
                      return (
                        <button
                          key={level}
                          onClick={() => style.setOverlayIntensity(overlay.id, level)}
                          className={`flex-1 rounded-md py-1 text-[10px] font-medium capitalize transition ${
                            on
                              ? "border border-accent-purple/40 bg-accent-purple/20 text-zinc-100"
                              : "text-muted hover:text-zinc-200"
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                )}

                {active && !overlay.hasIntensity && (
                  <span className="mt-2.5 inline-block rounded-full border border-accent-purple/40 bg-accent-purple/10 px-2 py-0.5 text-[10px] font-medium text-accent-purple">
                    On
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── One-shot overlay copy (manual mode only) ── */}
      {style.applyOverlaysToAllScenes && (
        <div className="space-y-1.5">
          <button
            onClick={handleApplyAll}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rim bg-surface px-3.5 py-2.5 text-[13px] text-muted transition hover:border-accent-purple hover:text-zinc-200"
          >
            {applied ? (
              <>
                <Check size={14} className="text-accent-purple" />
                <span className="text-accent-purple">Applied</span>
              </>
            ) : (
              <>
                <Paintbrush size={14} />
                Apply overlays to all scenes
              </>
            )}
          </button>
          <p className="text-center text-[11px] leading-snug text-muted/70">
            Copies this scene's overlays to every other scene.
          </p>
        </div>
      )}
    </div>
  );
};
