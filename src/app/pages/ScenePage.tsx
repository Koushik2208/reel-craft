import React, { useEffect, useRef } from "react";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Upload, X, Check, Clock, Scissors } from "lucide-react";
import { useStore, sceneDurationInFrames } from "../store";
import { TEMPLATE_LIST, TEMPLATES } from "../../templates/registry";
import type { LayerMode, TemplateId } from "../../templates/schema";
import { FPS } from "../../templates/shared/timing";
import { splitTextIntoScenes, MAX_CHARS_PER_SCENE } from "../../templates/shared/textSplit";
import { LANGUAGES } from "../../templates/shared/language";
import { FRAMES } from "../../frames/types";
import { OVERLAYS } from "../../overlays/types";

const LAYER_MODE_OPTIONS: { id: LayerMode; label: string }[] = [
  { id: "full", label: "Full" },
  { id: "greenscreen", label: "Green Screen" },
  { id: "background-only", label: "Background only" },
];

const TEXT_COLOR_SWATCHES = [
  "#FFFFFF",
  "#F4F3EE",
  "#FFD966",
  "#FFE4C0",
  "#C8F0D8",
  "#C8E8FF",
  "#FFD6D6",
  "#0F0F12",
];

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
  const { sceneId } = useParams<{ sceneId: string }>();
  const navigate = useNavigate();
  const {
    scenes,
    activeSceneId,
    finishes,
    setActiveScene,
    setText,
    setTemplate,
    setVariant,
    setAsset,
    clearAsset,
    setLanguage,
    setDurationMode,
    setManualDuration,
    setLayerMode,
    setTextColorOverride,
    applyAutoSplit,
    setFinish,
  } = useStore();

  const scene = scenes.find((s) => s.id === sceneId);
  const idx = scenes.findIndex((s) => s.id === sceneId);

  useEffect(() => {
    if (!scene) {
      navigate("/editor", { replace: true });
      return;
    }
    if (activeSceneId !== scene.id) {
      setActiveScene(scene.id);
    }
  }, [scene, activeSceneId, setActiveScene, navigate]);

  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const kind: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
    setAsset({ src: URL.createObjectURL(file), kind, name: file.name });
  };

  if (!scene) return null;

  const meta = TEMPLATES[scene.template];
  const frameLabel = FRAMES.find((f) => f.id === (scene.frameId ?? "none"))?.label ?? "None";
  const autoDurationFrames = sceneDurationInFrames({ ...scene, durationMode: "auto" });
  const manualInputFrames = scene.manualDurationInFrames ?? autoDurationFrames;

  const prevScene = idx > 0 ? scenes[idx - 1] : null;
  const nextScene = idx < scenes.length - 1 ? scenes[idx + 1] : null;

  return (
    <div className="flex flex-col gap-7">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/editor")}
          className="flex items-center gap-1.5 rounded-lg p-1.5 text-muted transition hover:bg-rim/60 hover:text-zinc-100"
          title="Back to scene list"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-sm font-semibold text-zinc-100">Scene {idx + 1}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => prevScene && navigate(`/editor/scene/${prevScene.id}`)}
            disabled={!prevScene}
            title="Previous scene"
            className="rounded-lg p-1.5 text-muted transition hover:bg-rim/60 hover:text-zinc-100 disabled:opacity-25"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => nextScene && navigate(`/editor/scene/${nextScene.id}`)}
            disabled={!nextScene}
            title="Next scene"
            className="rounded-lg p-1.5 text-muted transition hover:bg-rim/60 hover:text-zinc-100 disabled:opacity-25"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Text ── */}
      <Section title="Text">
        <div className="flex gap-1 rounded-lg border border-rim bg-surface p-0.5">
          {LANGUAGES.map((lang) => {
            const active = (scene.language ?? "en") === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`flex-1 rounded-md py-1.5 text-[12px] font-medium transition ${
                  active
                    ? "bg-accent-purple/20 text-zinc-100 border border-accent-purple/40"
                    : "text-muted hover:text-zinc-200"
                }`}
              >
                {lang.label}
              </button>
            );
          })}
        </div>
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

      {/* ── Template ── */}
      <Section title="Template">
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATE_LIST.map((t) => {
            const active = t.id === scene.template;
            return (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id as TemplateId)}
                className={`rounded-xl border px-2.5 py-3 text-left transition ${
                  active
                    ? "border-accent-purple/60 bg-accent-purple/10"
                    : "border-rim bg-surface hover:border-accent-purple"
                }`}
              >
                <div className="text-[13px] font-medium text-zinc-100">{t.label}</div>
                <div className="mt-0.5 text-[11px] leading-snug text-muted">{t.blurb}</div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Look ── */}
      <Section title="Look">
        <div className="flex flex-wrap gap-2">
          {meta.variants.map((v) => {
            const active = v.id === scene.variant;
            return (
              <button
                key={v.id}
                onClick={() => setVariant(v.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition ${
                  active
                    ? "border-accent-purple/60 bg-accent-purple/15 text-zinc-100"
                    : "border-rim bg-surface text-muted hover:border-accent-purple hover:text-zinc-200"
                }`}
              >
                {v.colors ? (
                  <span
                    className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-white/10"
                    style={{
                      background: `linear-gradient(135deg, ${v.colors.bg} 50%, ${v.colors.text} 50%)`,
                    }}
                  />
                ) : (
                  active && <Check size={13} className="text-accent-purple" />
                )}
                {v.label}
              </button>
            );
          })}
        </div>
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

      {/* ── Text color ── */}
      <Section title="Text color">
        <div className="flex items-center gap-2 pt-1">
          {TEXT_COLOR_SWATCHES.map((color) => {
            const active = scene.textColorOverride === color;
            return (
              <button
                key={color}
                onClick={() => setTextColorOverride(color)}
                title={color}
                aria-pressed={active}
                className={`h-6 w-6 shrink-0 rounded-full border transition ${
                  active ? "border-accent-purple ring-2 ring-accent-purple/50" : "border-rim/60 hover:border-accent-purple"
                }`}
                style={{ backgroundColor: color }}
              />
            );
          })}
          {scene.textColorOverride && (
            <button
              onClick={() => setTextColorOverride(null)}
              title="Reset to auto text color"
              className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rim text-muted transition hover:border-accent-purple hover:text-zinc-200"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </Section>

      {/* ── Layer mode ── */}
      <Section title="Layers">
        <div className="grid grid-cols-3 gap-2">
          {LAYER_MODE_OPTIONS.map((opt) => {
            const active = (scene.layerMode ?? "full") === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setLayerMode(opt.id)}
                className={`rounded-xl border px-2 py-2.5 text-center transition ${
                  active
                    ? "border-accent-purple/60 bg-accent-purple/10 text-zinc-100"
                    : "border-rim bg-surface text-muted hover:border-accent-purple"
                }`}
              >
                <div className="text-[12px] font-medium leading-snug">{opt.label}</div>
              </button>
            );
          })}
        </div>
        {scene.layerMode === "greenscreen" && (
          <p className="text-[11px] leading-snug text-muted/70">
            Text on #00FF00 background. Key it out in CapCut, DaVinci, or any editor.
          </p>
        )}
        {scene.layerMode === "background-only" && !scene.asset && (
          <p className="text-[11px] leading-snug text-amber-400/80">
            No background — this scene will export as a transparent frame.
          </p>
        )}
      </Section>

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
              max={20}
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

      {/* ── Frame (lightweight reference) ── */}
      <Section title="Frame">
        <div className="flex items-center justify-between rounded-2xl border border-rim bg-surface px-3.5 py-2.5 shadow-rim">
          <span className="text-[13px] text-zinc-200">{frameLabel}</span>
          <NavLink
            to="/frames"
            className="flex shrink-0 items-center gap-1 text-[12px] text-accent-purple transition hover:underline"
          >
            Go to Frames page
            <ChevronRight size={12} />
          </NavLink>
        </div>
      </Section>

      {/* ── Overlays (lightweight reference) ── */}
      <Section title="Overlays">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-rim bg-surface px-3.5 py-2.5 shadow-rim">
          {scene.overlays.length > 0 ? (
            <div className="flex flex-1 flex-wrap gap-1.5">
              {scene.overlays.map((o) => {
                const label = OVERLAYS.find((m) => m.id === o.id)?.label ?? o.id;
                return (
                  <span
                    key={o.id}
                    className="rounded-full border border-accent-purple/40 bg-accent-purple/10 px-2.5 py-1 text-[11px] font-medium text-accent-purple"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="flex-1 text-[13px] text-muted">No overlays</span>
          )}
          <NavLink
            to="/overlays"
            className="flex shrink-0 items-center gap-1 text-[12px] text-accent-purple transition hover:underline"
          >
            Go to Overlays page
            <ChevronRight size={12} />
          </NavLink>
        </div>
      </Section>

      {/* ── Cinematic finishes (project-wide quick reference) ── */}
      <div className="border-t border-rim pt-7">
        <Section title="Cinematic finishes" hint="Project-wide">
          <div className="flex gap-2">
            {(
              [
                { key: "grain" as const, label: "Grain" },
                { key: "vignette" as const, label: "Vignette" },
                { key: "letterbox" as const, label: "Letterbox" },
              ] as const
            ).map(({ key, label }) => {
              const on = finishes[key];
              return (
                <button
                  key={key}
                  onClick={() => setFinish(key, !on)}
                  aria-pressed={on}
                  className={`flex-1 rounded-xl border px-2 py-2 text-center text-[12px] font-medium transition ${
                    on
                      ? "border-accent-purple/60 bg-accent-purple/10 text-zinc-100"
                      : "border-rim bg-surface text-muted hover:border-accent-purple"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
};
