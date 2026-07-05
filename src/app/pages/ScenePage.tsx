import React, { useRef } from "react";
import { Upload, X, Clock, Scissors, Trash2 } from "lucide-react";
import { useStore, sceneDurationInFrames } from "../store";
import { TEMPLATES } from "../../templates/registry";
import { FPS } from "../../templates/shared/timing";
import { splitTextIntoScenes, MAX_CHARS_PER_SCENE } from "../../templates/shared/textSplit";
import { SceneSelector } from "../components/SceneSelector";
import { EmptyTargetState } from "../components/EmptyTargetState";

const Section: React.FC<{ title: string; children: React.ReactNode; hint?: string }> = ({
  title,
  children,
  hint,
}) => (
  <div className="space-y-2.5">
    <div className="flex items-baseline justify-between">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted">{title}</h3>
      {hint && <span className="text-[11px] text-muted/70">{hint}</span>}
    </div>
    {children}
  </div>
);

export const ScenePage: React.FC = () => {
  const {
    scenes,
    activeSceneId,
    projectMode,
    setText,
    setAsset,
    clearAsset,
    setDurationMode,
    setManualDuration,
    applyAutoSplit,
    removeScene,
  } = useStore();

  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const kind: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
    setAsset({ src: URL.createObjectURL(file), kind, name: file.name });
  };

  if (projectMode === "linked") {
    return (
      <EmptyTargetState
        message="Content editing isn't available in linked mode — text comes from your transcript."
        linkTo="/editor/linked"
        linkLabel="Go to Linked editor"
      />
    );
  }

  const scene = scenes.find((s) => s.id === activeSceneId) ?? scenes[0];
  const meta = TEMPLATES[scene.template];
  const autoDurationFrames = sceneDurationInFrames({ ...scene, durationMode: "auto" });
  const manualInputFrames = scene.manualDurationInFrames ?? autoDurationFrames;

  return (
    <div className="flex flex-col gap-7">
      <h2 className="text-sm font-semibold text-zinc-100">Content</h2>
      <SceneSelector />

      {/* ── Text ── */}
      <Section title="Text">
        <textarea
          key={scene.id}
          value={scene.text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => applyAutoSplit(scene.id)}
          onPaste={() => setTimeout(() => applyAutoSplit(scene.id), 0)}
          rows={4}
          placeholder="Paste a thought, quote, or line…"
          className="w-full resize-none rounded-xl border border-rim bg-surface px-3.5 py-3 text-[15px] leading-relaxed text-zinc-100 outline-none transition placeholder:text-muted/60 focus:border-accent-purple/40 focus:ring-2 focus:ring-accent-purple/30"
        />
        {(scene.language ?? "en") === "te" && (
          <p className="text-[11px] text-muted/70">Telugu fonts loaded — type or paste తెలుగు text.</p>
        )}
        {scene.text.length > MAX_CHARS_PER_SCENE &&
          (() => {
            const splitCount = splitTextIntoScenes(scene.text).length;
            return (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted/70">Will split into {splitCount} scenes on blur</span>
                <button
                  onClick={() => applyAutoSplit(scene.id)}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-rim bg-surface px-2 py-1 text-[11px] text-muted transition hover:border-accent-purple hover:text-zinc-200"
                >
                  <Scissors size={11} />
                  Split into scenes
                </button>
              </div>
            );
          })()}
      </Section>

      {/* ── Background (per-scene) ── */}
      {meta.accepts !== "none" && (
        <Section title="Background" hint={meta.accepts === "video" ? "video · this scene only" : "image · this scene only"}>
          {scene.asset ? (
            <div className="flex items-center justify-between rounded-2xl border border-rim bg-surface px-3.5 py-2.5 shadow-rim">
              <span className="truncate text-[13px] text-zinc-200">{scene.asset.name}</span>
              <button onClick={clearAsset} className="text-muted hover:text-zinc-100">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-rim bg-surface/60 px-3.5 py-4 text-[13px] text-muted transition hover:border-accent-purple/50 hover:text-zinc-200"
            >
              <Upload size={15} />
              Add {meta.accepts} for this scene
            </button>
          )}
          <input
            key={scene.id + meta.accepts}
            ref={fileRef}
            type="file"
            accept={meta.accepts === "video" ? "video/*" : "image/*"}
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </Section>
      )}

      {/* ── Duration ── */}
      <Section title="Duration">
        <div className="flex gap-2">
          {(["auto", "manual"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setDurationMode(mode)}
              className={`flex-1 rounded-xl border py-2.5 text-[13px] capitalize transition ${
                scene.durationMode === mode
                  ? "border-accent-purple/60 bg-accent-purple/10 text-zinc-100"
                  : "border-rim bg-surface text-muted hover:border-accent-purple"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        {scene.durationMode === "manual" && (
          <div className="flex items-center gap-2.5 rounded-xl border border-rim bg-surface px-3.5 py-2.5">
            <Clock size={14} className="shrink-0 text-muted" />
            <input
              type="number"
              min={1.5}
              step={0.5}
              value={(manualInputFrames / FPS).toFixed(1)}
              onChange={(e) => {
                const secs = parseFloat(e.target.value);
                if (!isNaN(secs) && secs > 0) setManualDuration(Math.round(secs * FPS));
              }}
              className="w-full bg-transparent text-[14px] text-zinc-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="shrink-0 text-[12px] text-muted">s</span>
          </div>
        )}
      </Section>

      {/* ── Delete ── */}
      <div className="border-t border-rim pt-7">
        <button
          onClick={() => removeScene(scene.id)}
          disabled={scenes.length <= 1}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-rim bg-surface px-3.5 py-2.5 text-[13px] text-muted transition hover:border-red-400/60 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={14} />
          Delete scene
        </button>
      </div>
    </div>
  );
};
