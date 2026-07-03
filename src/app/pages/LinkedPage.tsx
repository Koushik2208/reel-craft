import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  X,
  Check,
  Music,
  FileText,
  Volume2,
  Sparkles,
  Wand2,
  Image as ImageIcon,
} from "lucide-react";
import { useStore, type CaptionStyle } from "../store";
import { ModeSwitcher } from "../components/ModeSwitcher";
import { ProjectTitleInput } from "../components/ProjectTitleInput";
import type { LayerMode, TemplateId } from "../../templates/schema";
import { TEMPLATE_LIST, TEMPLATES } from "../../templates/registry";
import { LANGUAGES } from "../../templates/shared/language";
import { FRAMES, type FrameId } from "../../frames/types";
import { OVERLAYS, type OverlayIntensity } from "../../overlays/types";
import { parseSRT, srtEntriesToTranscript } from "../srtParser";

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

const INTENSITY_LEVELS: OverlayIntensity[] = ["low", "medium", "high"];

const MAX_LINKED_SECONDS = 300;

const CAPTION_STYLE_OPTIONS: { id: CaptionStyle; label: string }[] = [
  { id: "fade", label: "Fade" },
  { id: "pop", label: "Pop" },
  { id: "typewriter", label: "Typewriter" },
  { id: "highlight", label: "Highlight" },
  { id: "slide-up", label: "Slide Up" },
];

const LAYER_MODE_OPTIONS: { id: LayerMode; label: string }[] = [
  { id: "full", label: "Full" },
  { id: "greenscreen", label: "Green Screen" },
  { id: "background-only", label: "Background only" },
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

export const LinkedPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    projectMode,
    linkedPair,
    setLinkedAudio,
    setLinkedAudioTrim,
    setLinkedAudioFadeIn,
    setLinkedAudioFadeOut,
    setLinkedTranscript,
    setLinkedBackground,
    clearLinkedBackground,
    clearLinkedPair,
    updateLinkedPairStyle,
    toggleLinkedOverlay,
    setLinkedOverlayIntensity,
  } = useStore();

  const [srtError, setSrtError] = useState<string | null>(null);
  const audioFileRef = useRef<HTMLInputElement>(null);
  const srtFileRef = useRef<HTMLInputElement>(null);
  const backgroundFileRef = useRef<HTMLInputElement>(null);

  const audio = linkedPair?.audio ?? null;
  const transcript = linkedPair?.transcript ?? null;
  const background = linkedPair?.background ?? null;
  const template = linkedPair?.template ?? "minimal";
  const meta = TEMPLATES[template];

  const onAudioFile = (file: File | undefined) => {
    if (!file) return;
    void setLinkedAudio(file);
  };

  const onSrtFile = async (file: File | undefined) => {
    if (!file) return;
    setSrtError(null);
    const raw = await file.text();
    const entries = parseSRT(raw);
    if (entries.length === 0) {
      setSrtError("Could not parse this SRT file. Please check the format.");
      return;
    }
    setLinkedTranscript(srtEntriesToTranscript(entries), "srt");
  };

  const onBackgroundFile = (file: File | undefined) => {
    if (!file) return;
    const kind: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
    setLinkedBackground({ src: URL.createObjectURL(file), kind, name: file.name });
  };

  useEffect(() => {
    if (projectMode === "manual") {
      navigate("/editor", { replace: true });
    }
  }, [projectMode, navigate]);

  if (projectMode === "manual") return null;

  return (
    <div className="flex flex-col gap-7">
      {/* ── Project title ── */}
      <ProjectTitleInput />

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-100">Linked Audio + Transcript</h2>
        <ModeSwitcher />
      </div>

      {/* ── Audio + Transcript ── */}
      <Section title="Audio">
        {!audio ? (
          <button
            onClick={() => audioFileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-rim bg-surface/60 px-3.5 py-4 text-[13px] text-muted transition hover:border-accent-purple/50 hover:text-zinc-200"
          >
            <Music size={15} />
            Upload audio
          </button>
        ) : !audio.src ? (
          <div className="rounded-2xl border border-rim bg-surface/60 px-3.5 py-3 shadow-rim">
            <p className="text-[11px] text-muted/70">
              Re-attach audio to restore: <span className="text-zinc-300">{audio.name}</span>
            </p>
            <button
              onClick={() => audioFileRef.current?.click()}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-rim bg-surface px-2.5 py-1.5 text-[12px] text-muted transition hover:border-accent-purple hover:text-zinc-200"
            >
              <Upload size={12} />
              Re-attach
            </button>
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
            </div>
            {audio.durationInSeconds > MAX_LINKED_SECONDS && (
              <p className="text-[11px] leading-snug text-amber-400/80">
                Audio is longer than 5 minutes — render will be capped at 5:00.
              </p>
            )}
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  {
                    label: "Start at",
                    value: audio.trimStartSeconds,
                    min: 0,
                    max: audio.durationInSeconds,
                    step: 0.1,
                    onChange: setLinkedAudioTrim,
                  },
                  { label: "Fade in", value: audio.fadeInSeconds, min: 0, max: 5, step: 0.1, onChange: setLinkedAudioFadeIn },
                  { label: "Fade out", value: audio.fadeOutSeconds, min: 0, max: 5, step: 0.1, onChange: setLinkedAudioFadeOut },
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

      <Section title="Transcript">
        {transcript ? (
          <div className="flex items-center justify-between rounded-2xl border border-rim bg-surface px-3.5 py-2.5 shadow-rim">
            <div className="flex items-center gap-2">
              <FileText size={14} className="shrink-0 text-muted" />
              <span className="text-[13px] text-zinc-200">
                {linkedPair?.transcriptSource === "whisper" ? "Whisper (word)" : "SRT (block)"}
              </span>
              <span className="text-[11px] text-muted/60">
                {transcript.kind === "block" ? `${transcript.blocks.length} blocks` : `${transcript.words.length} words`}
              </span>
            </div>
            <button
              onClick={() => srtFileRef.current?.click()}
              title="Replace transcript"
              className="text-muted hover:text-zinc-100"
            >
              <Upload size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => srtFileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-rim bg-surface/60 px-3.5 py-4 text-[13px] text-muted transition hover:border-accent-purple/50 hover:text-zinc-200"
            >
              <FileText size={15} />
              Upload transcript (.srt)
            </button>
            <button
              disabled
              title="SRT import works today — Whisper transcription is coming soon"
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-rim bg-surface/40 px-3.5 py-3 text-[13px] text-muted/50"
            >
              <Wand2 size={14} />
              Generate with Whisper (coming soon)
            </button>
          </div>
        )}
        {srtError && <p className="text-[11px] leading-snug text-red-400">{srtError}</p>}
        {transcript && !audio && (
          <p className="text-[11px] leading-snug text-muted/70">
            Upload audio to complete the linked pair — preview will stay empty until then.
          </p>
        )}
        <input
          ref={srtFileRef}
          type="file"
          accept=".srt"
          className="hidden"
          onChange={(e) => void onSrtFile(e.target.files?.[0])}
        />
      </Section>

      {linkedPair && (
        <button
          onClick={clearLinkedPair}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-rim bg-surface px-3.5 py-2.5 text-[13px] text-muted transition hover:border-red-400/60 hover:text-red-400"
        >
          <X size={14} />
          Remove linked pair
        </button>
      )}

      {/* ── Background ── */}
      <div className="border-t border-rim pt-7">
        <Section title="Background">
          {!background ? (
            <button
              onClick={() => backgroundFileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-rim bg-surface/60 px-3.5 py-4 text-[13px] text-muted transition hover:border-accent-purple/50 hover:text-zinc-200"
            >
              <ImageIcon size={15} />
              Add image or video background
            </button>
          ) : !background.src ? (
            <div className="rounded-2xl border border-rim bg-surface/60 px-3.5 py-3 shadow-rim">
              <p className="text-[11px] text-muted/70">
                Re-attach background to restore: <span className="text-zinc-300">{background.name}</span>
              </p>
              <button
                onClick={() => backgroundFileRef.current?.click()}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-rim bg-surface px-2.5 py-1.5 text-[12px] text-muted transition hover:border-accent-purple hover:text-zinc-200"
              >
                <Upload size={12} />
                Re-attach
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-rim bg-surface px-3.5 py-2.5 shadow-rim">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-rim/60 bg-black">
                {background.kind === "video" ? (
                  <video
                    src={background.src}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img src={background.src} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-200">{background.name}</span>
              <button onClick={clearLinkedBackground} className="shrink-0 text-muted hover:text-zinc-100">
                <X size={16} />
              </button>
            </div>
          )}
          <input
            ref={backgroundFileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => onBackgroundFile(e.target.files?.[0])}
          />
        </Section>
      </div>

      {/* ── Style ── */}
      <div className="border-t border-rim pt-7">
        <Section title="Template">
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATE_LIST.map((t) => {
              const active = t.id === template;
              return (
                <button
                  key={t.id}
                  onClick={() =>
                    updateLinkedPairStyle({
                      template: t.id as TemplateId,
                      variant: TEMPLATES[t.id].defaultVariant,
                    })
                  }
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
      </div>

      <Section title="Look">
        <div className="flex flex-wrap gap-2">
          {meta.variants.map((v) => {
            const active = linkedPair ? v.id === linkedPair.variant : false;
            return (
              <button
                key={v.id}
                onClick={() => updateLinkedPairStyle({ variant: v.id })}
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

      <Section title="Language">
        <div className="flex gap-1 rounded-lg border border-rim bg-surface p-0.5">
          {LANGUAGES.map((lang) => {
            const active = (linkedPair?.language ?? "en") === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => updateLinkedPairStyle({ language: lang.id })}
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
      </Section>

      <Section title="Text color">
        <div className="flex items-center gap-2 pt-1">
          {TEXT_COLOR_SWATCHES.map((color) => {
            const active = linkedPair?.textColorOverride === color;
            return (
              <button
                key={color}
                onClick={() => updateLinkedPairStyle({ textColorOverride: color })}
                title={color}
                aria-pressed={active}
                className={`h-6 w-6 shrink-0 rounded-full border transition ${
                  active ? "border-accent-purple ring-2 ring-accent-purple/50" : "border-rim/60 hover:border-accent-purple"
                }`}
                style={{ backgroundColor: color }}
              />
            );
          })}
          {linkedPair?.textColorOverride && (
            <button
              onClick={() => updateLinkedPairStyle({ textColorOverride: null })}
              title="Reset to auto text color"
              className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rim text-muted transition hover:border-accent-purple hover:text-zinc-200"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </Section>

      <Section title="Caption style">
        <div className="grid grid-cols-5 gap-1.5">
          {CAPTION_STYLE_OPTIONS.map((opt) => {
            const active = (linkedPair?.captionStyle ?? "fade") === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => updateLinkedPairStyle({ captionStyle: opt.id })}
                className={`rounded-lg border px-1 py-2 text-center text-[10px] font-medium leading-tight transition ${
                  active
                    ? "border-accent-purple/60 bg-accent-purple/10 text-zinc-100"
                    : "border-rim bg-surface text-muted hover:border-accent-purple"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        {linkedPair?.captionStyle === "highlight" && linkedPair?.transcript?.kind !== "word" && (
          <p className="text-[11px] leading-snug text-muted/70">
            Highlight needs word-level timestamps — falls back to Fade for SRT transcripts.
          </p>
        )}
      </Section>

      <Section title="Layers">
        <div className="grid grid-cols-3 gap-2">
          {LAYER_MODE_OPTIONS.map((opt) => {
            const active = (linkedPair?.layerMode ?? "full") === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => updateLinkedPairStyle({ layerMode: opt.id })}
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
        {linkedPair?.layerMode === "greenscreen" && (
          <p className="text-[11px] leading-snug text-muted/70">
            Captions on #00FF00 background. Key it out in CapCut, DaVinci, or any editor.
          </p>
        )}
        {linkedPair?.layerMode === "background-only" && !background && (
          <p className="text-[11px] leading-snug text-amber-400/80">
            No background — this will export as a transparent frame with no captions.
          </p>
        )}
      </Section>

      {/* ── Frame ── */}
      <div className="border-t border-rim pt-7">
        <Section title="Frame">
          <div className="grid grid-cols-2 gap-2.5">
            {FRAMES.map((frame) => {
              const active = frame.id === (linkedPair?.frameId ?? "none");
              return (
                <button
                  key={frame.id}
                  onClick={() => updateLinkedPairStyle({ frameId: frame.id as FrameId })}
                  className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? "border-accent-purple/60 bg-accent-purple/10"
                      : "border-rim bg-surface hover:border-accent-purple"
                  }`}
                >
                  <div className="text-[12px] font-medium text-zinc-100">{frame.label}</div>
                  <div className="text-[11px] leading-snug text-muted">{frame.description}</div>
                </button>
              );
            })}
          </div>
        </Section>
      </div>

      {/* ── Overlays ── */}
      <div className="border-t border-rim pt-7">
        <Section title="Overlays">
          {linkedPair && linkedPair.overlays.length > 0 && (
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {linkedPair.overlays.map((o) => {
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
          )}
          <div className="grid grid-cols-2 gap-2.5">
            {OVERLAYS.map((overlay) => {
              const activeOverlay = linkedPair?.overlays.find((o) => o.id === overlay.id);
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
                    onClick={() => toggleLinkedOverlay(overlay.id)}
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
                            onClick={() => setLinkedOverlayIntensity(overlay.id, level)}
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
      </div>

      {!linkedPair?.audio?.src && (
        <div className="flex items-center gap-2 rounded-2xl border border-rim bg-surface/60 px-3.5 py-3 shadow-rim">
          <Sparkles size={14} className="shrink-0 text-muted" />
          <p className="text-[11px] leading-snug text-muted/70">
            Upload audio and a transcript above to preview and render your linked video.
          </p>
        </div>
      )}
    </div>
  );
};
