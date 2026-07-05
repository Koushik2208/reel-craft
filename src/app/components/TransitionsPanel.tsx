import React, { useState } from "react";
import { Check, Shuffle } from "lucide-react";
import { useStore } from "../store";
import { EmptyTargetState } from "./EmptyTargetState";
import { SceneSelector } from "./SceneSelector";
import { DEFAULT_TRANSITION, TRANSITIONS, type TransitionDuration } from "../../transitions/types";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2.5">
    <h3 className="text-xs font-medium uppercase tracking-wider text-muted">{title}</h3>
    {children}
  </div>
);

const DURATIONS: TransitionDuration[] = ["short", "medium", "long"];

export const TransitionsPanel: React.FC = () => {
  const { projectMode, scenes, activeSceneId, setTransition, applyTransitionToAllScenes } = useStore();

  const [applied, setApplied] = useState(false);
  const handleApplyAll = (sourceId: string) => {
    applyTransitionToAllScenes(sourceId);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  if (projectMode === "linked") {
    return <EmptyTargetState message="Transitions are only available in manual mode" />;
  }

  const scene = scenes.find((s) => s.id === activeSceneId) ?? scenes[0];
  if (!scene) {
    return <EmptyTargetState message="No active scene yet." linkTo="/editor" linkLabel="Go to Editor" />;
  }

  const transition = scene.transition ?? DEFAULT_TRANSITION;

  return (
    <div className="flex flex-col gap-7">
      <SceneSelector />

      {/* ── Transition picker ── */}
      <Section title="Transition">
        <div className="grid grid-cols-2 gap-2.5">
          {TRANSITIONS.map((t) => {
            const active = transition.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTransition({ ...transition, id: t.id })}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  active
                    ? "border-accent-purple/60 bg-accent-purple/10"
                    : "border-rim bg-surface hover:border-accent-purple"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[12px] font-medium text-zinc-100">{t.label}</div>
                  {active && <Check size={14} className="mt-0.5 shrink-0 text-accent-purple" />}
                </div>
                <div className="mt-0.5 text-[11px] leading-snug text-muted">{t.description}</div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Duration ── */}
      {transition.id !== "none" && (
        <Section title="Duration">
          <div className="flex gap-1 rounded-lg border border-rim bg-surface p-0.5">
            {DURATIONS.map((duration) => {
              const on = transition.duration === duration;
              return (
                <button
                  key={duration}
                  onClick={() => setTransition({ ...transition, duration })}
                  className={`flex-1 rounded-md py-1.5 text-[11px] font-medium capitalize transition ${
                    on
                      ? "border border-accent-purple/40 bg-accent-purple/20 text-zinc-100"
                      : "text-muted hover:text-zinc-200"
                  }`}
                >
                  {duration}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── One-shot transition copy ── */}
      {scenes.length > 1 && (
        <div className="space-y-1.5">
          <button
            onClick={() => handleApplyAll(scene.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rim bg-surface px-3.5 py-2.5 text-[13px] text-muted transition hover:border-accent-purple hover:text-zinc-200"
          >
            {applied ? (
              <>
                <Check size={14} className="text-accent-purple" />
                <span className="text-accent-purple">Applied</span>
              </>
            ) : (
              <>
                <Shuffle size={14} />
                Apply transition to all scenes
              </>
            )}
          </button>
          <p className="text-center text-[11px] leading-snug text-muted/70">
            Copies this scene's transition to every other scene.
          </p>
        </div>
      )}
    </div>
  );
};
