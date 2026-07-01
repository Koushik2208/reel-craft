import React, { useCallback, useRef, useState } from "react";
import {
  Upload,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Plus,
  Clock,
  Scissors,
  Paintbrush,
  Music,
  Volume2,
  Sparkles,
  Circle,
  Minus,
  Download,
} from "lucide-react";
import { useStore, sceneDurationInFrames, type CinematicFinishes, type Scene } from "../store";
import { TEMPLATE_LIST, TEMPLATES } from "../../templates/registry";
import type { LayerMode, TemplateId } from "../../templates/schema";
import { FPS } from "../../templates/shared/timing";
import { splitTextIntoScenes, MAX_CHARS_PER_SCENE } from "../../templates/shared/textSplit";
import { LANGUAGES } from "../../templates/shared/language";
import { renderSceneToFile } from "../renderScene";
import { downloadBlob, getExportFormat } from "../render";

const LAYER_MODE_OPTIONS: { id: LayerMode; label: string; hint?: string }[] = [
  { id: "full", label: "Full" },
  { id: "text-only", label: "Text only", hint: "→ WebM" },
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

export const Inspector: React.FC = () => {
  const {
    scenes,
    activeSceneId,
    syncStyle,
    audio,
    finishes,
    addScene,
    duplicateScene,
    removeScene,
    moveScene,
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
    setSyncStyle,
    applyStyleToAllScenes,
    setAudio,
    setAudioTrim,
    setAudioFadeIn,
    setAudioFadeOut,
    clearAudio,
    setFinish,
  } = useStore();

  const [styleApplied, setStyleApplied] = useState(false);
  const handleApplyStyle = () => {
    applyStyleToAllScenes(activeSceneId);
    setStyleApplied(true);
    setTimeout(() => setStyleApplied(false), 2000);
  };

  // Per-scene export progress, keyed by scene id. Absence of a key means idle.
  const [sceneExportProgress, setSceneExportProgress] = useState<Record<string, number>>({});

  const handleExportScene = useCallback(
    (scene: Scene, idx: number) => {
      setSceneExportProgress((s) => ({ ...s, [scene.id]: 0 }));
      const handle = renderSceneToFile(scene, finishes, (p) => {
        setSceneExportProgress((s) => ({ ...s, [scene.id]: p }));
      });
      handle.promise
        .then((blob) => {
          const format = getExportFormat(scene.layerMode ?? "full");
          downloadBlob(blob, `reelcraft-scene-${idx + 1}.${format.container}`);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          setSceneExportProgress((s) => {
            const next = { ...s };
            delete next[scene.id];
            return next;
          });
        });
    },
    [finishes]
  );

  const activeScene = scenes.find((s) => s.id === activeSceneId) ?? scenes[0];
  const meta = TEMPLATES[activeScene.template];
  const fileRef = useRef<HTMLInputElement>(null);
  const audioFileRef = useRef<HTMLInputElement>(null);

  const onAudioFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      void setAudio(file);
    },
    [setAudio]
  );

  const onFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const kind: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
      setAsset({ src: URL.createObjectURL(file), kind, name: file.name });
    },
    [setAsset]
  );

  // Current auto duration for display / seeding the manual input
  const autoDurationFrames = sceneDurationInFrames({ ...activeScene, durationMode: "auto" });
  const manualInputFrames = activeScene.manualDurationInFrames ?? autoDurationFrames;

  return (
    <div className="flex flex-col gap-7">
      {/* ── Scene list ── */}
      <Section
        title="Scenes"
        hint={syncStyle ? "Syncing style from selected scene" : undefined}
      >
        {/* Sync lock toggle */}
        <div className="flex items-start gap-3 rounded-2xl border border-rim bg-surface/60 px-3.5 py-3 shadow-rim">
          <div className="flex-1">
            <p className="text-[13px] text-zinc-200">Keep scenes in sync</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted/70">
              While on, the selected scene's template, look, and background apply to all
              scenes. Text stays per scene.
            </p>
          </div>
          <button
            onClick={() => setSyncStyle(!syncStyle)}
            aria-pressed={syncStyle}
            title={syncStyle ? "Disable style sync" : "Enable style sync"}
            className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
              syncStyle ? "bg-accent-purple" : "bg-rim"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                syncStyle ? "translate-x-[19px]" : "translate-x-[3px]"
              }`}
            />
          </button>
        </div>

        <div className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 lg:snap-none">
          {scenes.map((scene, idx) => {
            const isActive = scene.id === activeSceneId;
            const preview = scene.text.trim().split("\n")[0]?.slice(0, 42) || "—";
            const dur = (sceneDurationInFrames(scene) / FPS).toFixed(1);
            const isTextOnly = (scene.layerMode ?? "full") === "text-only";
            const exportProgress = sceneExportProgress[scene.id];
            const isExporting = exportProgress !== undefined;
            return (
              <div
                key={scene.id}
                onClick={() => setActiveScene(scene.id)}
                className={`group flex w-[240px] shrink-0 snap-start cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2.5 shadow-rim transition lg:w-auto ${
                  isActive
                    ? "border-accent-purple/50 bg-accent-purple/10"
                    : "border-rim bg-surface hover:border-accent-purple"
                }`}
              >
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide ${
                        isActive ? "text-accent-purple" : "text-muted"
                      }`}
                    >
                      Scene {idx + 1}
                    </span>
                    <span className="text-[10px] text-muted/50">{dur}s</span>
                    <span
                      className={`rounded px-1 py-px text-[9px] font-semibold uppercase tracking-wide ${
                        isTextOnly ? "bg-accent-purple/15 text-accent-purple" : "bg-rim/60 text-muted/70"
                      }`}
                    >
                      {isTextOnly ? "WebM" : "MP4"}
                    </span>
                  </div>
                  <p className="truncate text-[12px] leading-snug text-zinc-300">{preview}</p>
                </div>
                {isExporting ? (
                  <div className="flex w-[104px] shrink-0 items-center gap-1.5">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-rim">
                      <div
                        className="h-full rounded-full bg-accent-purple transition-[width] duration-200"
                        style={{ width: `${Math.max(4, exportProgress * 100)}%` }}
                      />
                    </div>
                    <span className="w-7 shrink-0 text-right text-[10px] text-muted">
                      {Math.round(exportProgress * 100)}%
                    </span>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveScene(scene.id, "up");
                      }}
                      disabled={idx === 0}
                      title="Move up"
                      className="rounded p-1 text-muted hover:text-zinc-100 disabled:opacity-25"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveScene(scene.id, "down");
                      }}
                      disabled={idx === scenes.length - 1}
                      title="Move down"
                      className="rounded p-1 text-muted hover:text-zinc-100 disabled:opacity-25"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateScene(scene.id);
                      }}
                      title="Duplicate"
                      className="rounded p-1 text-muted hover:text-zinc-100"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportScene(scene, idx);
                      }}
                      title="Export this scene"
                      className="rounded p-1 text-muted hover:text-zinc-100"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeScene(scene.id);
                      }}
                      disabled={scenes.length <= 1}
                      title="Delete"
                      className="rounded p-1 text-muted hover:text-red-400 disabled:opacity-25"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={addScene}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-rim bg-surface/60 px-3.5 py-2.5 text-[13px] text-muted transition hover:border-accent-purple/40 hover:text-zinc-200"
        >
          <Plus size={14} />
          Add scene
        </button>
      </Section>

      {/* ── Project-level audio ── */}
      <div className="border-t border-rim pt-7">
        <Section title="Audio">
          {!audio ? (
            <button
              onClick={() => audioFileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-rim bg-surface/60 px-3.5 py-4 text-[13px] text-muted transition hover:border-accent-purple/50 hover:text-zinc-200"
            >
              <Music size={15} />
              Add audio track
            </button>
          ) : !audio.src ? (
            <div className="rounded-2xl border border-rim bg-surface/60 px-3.5 py-3 shadow-rim">
              <p className="text-[11px] text-muted/70">
                Re-upload to restore:{" "}
                <span className="text-zinc-300">{audio.name}</span>
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => audioFileRef.current?.click()}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rim bg-surface px-2.5 py-1.5 text-[12px] text-muted transition hover:border-accent-purple hover:text-zinc-200"
                >
                  <Upload size={12} />
                  Re-upload
                </button>
                <button
                  onClick={clearAudio}
                  title="Remove"
                  className="rounded-lg border border-rim bg-surface p-1.5 text-muted transition hover:border-accent-purple hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-2xl border border-rim bg-surface px-3.5 py-2.5 shadow-rim">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Volume2 size={14} className="shrink-0 text-muted" />
                  <span className="truncate text-[13px] text-zinc-200">{audio.name}</span>
                  <span className="shrink-0 text-[11px] text-muted/60">
                    {audio.durationInSeconds.toFixed(1)}s
                  </span>
                </div>
                <button
                  onClick={clearAudio}
                  title="Remove audio"
                  className="ml-2 shrink-0 text-muted hover:text-zinc-100"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { label: "Start at", value: audio.trimStartSeconds, min: 0, max: audio.durationInSeconds, step: 0.1, onChange: setAudioTrim },
                    { label: "Fade in", value: audio.fadeInSeconds, min: 0, max: 5, step: 0.1, onChange: setAudioFadeIn },
                    { label: "Fade out", value: audio.fadeOutSeconds, min: 0, max: 5, step: 0.1, onChange: setAudioFadeOut },
                  ] as const
                ).map(({ label, value, min, max, step, onChange }) => (
                  <div key={label} className="rounded-xl border border-rim bg-surface px-3 py-2">
                    <p className="mb-1 text-[10px] uppercase tracking-wider text-muted/70">{label}</p>
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={value.toFixed(1)}
                        onChange={(e) => {
                          const n = parseFloat(e.target.value);
                          if (!isNaN(n)) onChange(n);
                        }}
                        className="w-full bg-transparent text-[13px] text-zinc-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <span className="shrink-0 text-[11px] text-muted">s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <input
            ref={audioFileRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => onAudioFile(e.target.files?.[0])}
          />
        </Section>
      </div>

      {/* ── Cinematic finishes ── */}
      <div className="border-t border-rim pt-7">
        <Section title="Finish">
          {(
            [
              {
                key: "grain" as keyof CinematicFinishes,
                icon: <Sparkles size={14} className="shrink-0 text-muted" />,
                label: "Grain",
                description: "Subtle film texture",
              },
              {
                key: "vignette" as keyof CinematicFinishes,
                icon: <Circle size={14} className="shrink-0 text-muted" />,
                label: "Vignette",
                description: "Darken edges, focus center",
              },
              {
                key: "letterbox" as keyof CinematicFinishes,
                icon: <Minus size={14} className="shrink-0 text-muted" />,
                label: "Letterbox",
                description: "Cinematic bars top and bottom",
              },
            ] as const
          ).map(({ key, icon, label, description }) => {
            const on = finishes[key];
            return (
              <div
                key={key}
                className="flex items-start gap-3 rounded-2xl border border-rim bg-surface/60 px-3.5 py-3 shadow-rim"
              >
                <div className="mt-0.5">{icon}</div>
                <div className="flex-1">
                  <p className="text-[13px] text-zinc-200">{label}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted/70">{description}</p>
                </div>
                <button
                  onClick={() => setFinish(key, !on)}
                  aria-pressed={on}
                  title={on ? `Disable ${label}` : `Enable ${label}`}
                  className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    on ? "bg-accent-purple" : "bg-rim"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                      on ? "translate-x-[19px]" : "translate-x-[3px]"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </Section>
      </div>

      {/* ── Active-scene controls ── */}
      <Section title="Text">
        <div className="flex gap-1 rounded-lg border border-rim bg-surface p-0.5">
          {LANGUAGES.map((lang) => {
            const active = (activeScene.language ?? "en") === lang.id;
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
          key={activeScene.id}
          value={activeScene.text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => applyAutoSplit(activeSceneId)}
          onPaste={() => setTimeout(() => applyAutoSplit(activeSceneId), 0)}
          rows={4}
          placeholder="Paste a thought, quote, or line…"
          className="w-full resize-none rounded-xl border border-rim bg-surface px-3.5 py-3 text-[15px] leading-relaxed text-zinc-100 outline-none transition placeholder:text-muted/60 focus:border-accent-purple/40 focus:ring-2 focus:ring-accent-purple/30"
        />
        {(activeScene.language ?? "en") === "te" && (
          <p className="text-[11px] text-muted/70">
            Telugu fonts loaded — type or paste తెలుగు text.
          </p>
        )}
        {activeScene.text.length > MAX_CHARS_PER_SCENE && (() => {
          const splitCount = splitTextIntoScenes(activeScene.text).length;
          return (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-muted/70">
                Will split into {splitCount} scenes on blur
              </span>
              <button
                onClick={() => applyAutoSplit(activeSceneId)}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-rim bg-surface px-2 py-1 text-[11px] text-muted transition hover:border-accent-purple hover:text-zinc-200"
              >
                <Scissors size={11} />
                Split into scenes
              </button>
            </div>
          );
        })()}
      </Section>

      <Section title="Template">
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATE_LIST.map((t) => {
            const active = t.id === activeScene.template;
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

      <Section title="Layers">
        <div className="grid grid-cols-3 gap-2">
          {LAYER_MODE_OPTIONS.map((opt) => {
            const active = (activeScene.layerMode ?? "full") === opt.id;
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
                {opt.hint && (
                  <div className={`mt-0.5 text-[10px] ${active ? "text-accent-purple" : "text-muted/60"}`}>
                    {opt.hint}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {activeScene.layerMode === "text-only" && (
          <p className="text-[11px] leading-snug text-muted/70">
            Exports as WebM with alpha channel. Drop into any editor over your own background.
          </p>
        )}
        {activeScene.layerMode === "background-only" && !activeScene.asset && (
          <p className="text-[11px] leading-snug text-amber-400/80">
            No background — this scene will export as a transparent frame.
          </p>
        )}
      </Section>

      {meta.accepts !== "none" && (
        <Section title="Background" hint={meta.accepts === "video" ? "video" : "image"}>
          {activeScene.asset ? (
            <div className="flex items-center justify-between rounded-2xl border border-rim bg-surface px-3.5 py-2.5 shadow-rim">
              <span className="truncate text-[13px] text-zinc-200">{activeScene.asset.name}</span>
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
              Add {meta.accepts}
            </button>
          )}
          <input
            key={activeScene.id + meta.accepts}
            ref={fileRef}
            type="file"
            accept={meta.accepts === "video" ? "video/*" : "image/*"}
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </Section>
      )}

      <Section title="Look">
        <div className="flex flex-wrap gap-2">
          {meta.variants.map((v) => {
            const active = v.id === activeScene.variant;
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
        <div className="flex items-center gap-2 pt-1">
          {TEXT_COLOR_SWATCHES.map((color) => {
            const active = activeScene.textColorOverride === color;
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
          {activeScene.textColorOverride && (
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

      <Section title="Duration">
        <div className="flex gap-2">
          {(["auto", "manual"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setDurationMode(mode)}
              className={`flex-1 rounded-xl border py-2.5 text-[13px] capitalize transition ${
                activeScene.durationMode === mode
                  ? "border-accent-purple/60 bg-accent-purple/10 text-zinc-100"
                  : "border-rim bg-surface text-muted hover:border-accent-purple"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        {activeScene.durationMode === "manual" && (
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

      {/* ── One-shot style copy ── */}
      <button
        onClick={handleApplyStyle}
        disabled={scenes.length <= 1}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-rim bg-surface px-3.5 py-2.5 text-[13px] text-muted transition hover:border-accent-purple hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {styleApplied ? (
          <>
            <Check size={14} className="text-accent-purple" />
            <span className="text-accent-purple">Applied</span>
          </>
        ) : (
          <>
            <Paintbrush size={14} />
            Apply style to all scenes
          </>
        )}
      </button>
    </div>
  );
};
