import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  X,
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
import { parseSRT, srtEntriesToTranscript } from "../srtParser";

const MAX_LINKED_SECONDS = 300;

const CAPTION_STYLE_OPTIONS: { id: CaptionStyle; label: string }[] = [
  { id: "fade", label: "Fade" },
  { id: "pop", label: "Pop" },
  { id: "typewriter", label: "Typewriter" },
  { id: "highlight", label: "Highlight" },
  { id: "slide-up", label: "Slide Up" },
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
  } = useStore();

  const [srtError, setSrtError] = useState<string | null>(null);
  const audioFileRef = useRef<HTMLInputElement>(null);
  const srtFileRef = useRef<HTMLInputElement>(null);
  const backgroundFileRef = useRef<HTMLInputElement>(null);

  const audio = linkedPair?.audio ?? null;
  const transcript = linkedPair?.transcript ?? null;
  const background = linkedPair?.background ?? null;

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

      {/* ── Caption style ── */}
      <div className="border-t border-rim pt-7">
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
