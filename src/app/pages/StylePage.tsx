import React, { useState } from "react";
import {
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  Move,
  Zap,
  Wind,
  Paintbrush,
  type LucideIcon,
} from "lucide-react";
import { useStore } from "../store";
import { useActiveStyle } from "../hooks/useActiveStyle";
import { EmptyTargetState } from "../components/EmptyTargetState";
import { TEMPLATE_LIST, TEMPLATES } from "../../templates/registry";
import type { LayerMode, TemplateId } from "../../templates/schema";
import { LANGUAGES } from "../../templates/shared/language";
import { IMAGE_EFFECT_IDS, IMAGE_EFFECT_LABELS, type ImageEffect } from "../../templates/shared/imageEffects";

const LAYER_MODE_OPTIONS: { id: LayerMode; label: string }[] = [
  { id: "full", label: "Full" },
  { id: "greenscreen", label: "Green Screen" },
  { id: "background-only", label: "Background only" },
];

const IMAGE_EFFECT_ICONS: Record<ImageEffect, LucideIcon> = {
  none: X,
  "zoom-in": ZoomIn,
  "zoom-out": ZoomOut,
  "pan-left": ArrowLeft,
  "pan-right": ArrowRight,
  "pan-up": ArrowUp,
  "pan-down": ArrowDown,
  "ken-burns": Move,
  "slide-in": ChevronUp,
  "scale-pop": Zap,
  sway: Wind,
};

const IMAGE_EFFECT_OPTIONS = IMAGE_EFFECT_IDS.map((id) => ({
  id,
  label: IMAGE_EFFECT_LABELS[id],
  icon: IMAGE_EFFECT_ICONS[id],
}));

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

export const StylePage: React.FC = () => {
  const { finishes, setFinish } = useStore();
  const style = useActiveStyle();

  const [effectApplied, setEffectApplied] = useState(false);
  const handleApplyEffect = () => {
    if (!style.ready || !style.applyImageEffectToAllScenes) return;
    style.applyImageEffectToAllScenes();
    setEffectApplied(true);
    setTimeout(() => setEffectApplied(false), 2000);
  };

  if (!style.ready) {
    return <EmptyTargetState message={style.message} linkTo={style.linkTo} linkLabel={style.linkLabel} />;
  }

  const meta = TEMPLATES[style.template];

  return (
    <div className="flex flex-col gap-7">
      <h2 className="text-sm font-semibold text-zinc-100">Style</h2>

      {/* ── Template ── */}
      <Section title="Template">
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATE_LIST.map((t) => {
            const active = t.id === style.template;
            return (
              <button
                key={t.id}
                onClick={() => style.setTemplate(t.id as TemplateId)}
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
            const active = v.id === style.variant;
            return (
              <button
                key={v.id}
                onClick={() => style.setVariant(v.id)}
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

      {/* ── Language ── */}
      <Section title="Language">
        <div className="flex gap-1 rounded-lg border border-rim bg-surface p-0.5">
          {LANGUAGES.map((lang) => {
            const active = style.language === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => style.setLanguage(lang.id)}
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

      {/* ── Text color ── */}
      <Section title="Text color">
        <div className="flex items-center gap-2 pt-1">
          {TEXT_COLOR_SWATCHES.map((color) => {
            const active = style.textColorOverride === color;
            return (
              <button
                key={color}
                onClick={() => style.setTextColorOverride(color)}
                title={color}
                aria-pressed={active}
                className={`h-6 w-6 shrink-0 rounded-full border transition ${
                  active ? "border-accent-purple ring-2 ring-accent-purple/50" : "border-rim/60 hover:border-accent-purple"
                }`}
                style={{ backgroundColor: color }}
              />
            );
          })}
          {style.textColorOverride && (
            <button
              onClick={() => style.setTextColorOverride(null)}
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
            const active = style.layerMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => style.setLayerMode(opt.id)}
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
        {style.layerMode === "greenscreen" && (
          <p className="text-[11px] leading-snug text-muted/70">
            Text on #00FF00 background. Key it out in CapCut, DaVinci, or any editor.
          </p>
        )}
        {style.layerMode === "background-only" && !style.hasBackground && (
          <p className="text-[11px] leading-snug text-amber-400/80">
            No background — this will export as a transparent frame.
          </p>
        )}
      </Section>

      {/* ── Image Effect ── */}
      <Section title="Image Effect">
        <div className="grid grid-cols-3 gap-2">
          {IMAGE_EFFECT_OPTIONS.map((opt) => {
            const active = style.imageEffect === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => style.setImageEffect(opt.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition ${
                  active
                    ? "border-accent-purple/60 bg-accent-purple/10 text-zinc-100"
                    : "border-rim bg-surface text-muted hover:border-accent-purple"
                }`}
              >
                <Icon size={15} />
                <div className="text-[11px] font-medium leading-snug">{opt.label}</div>
              </button>
            );
          })}
        </div>
        {style.applyImageEffectToAllScenes && (
          <button
            onClick={handleApplyEffect}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rim bg-surface px-3.5 py-2.5 text-[13px] text-muted transition hover:border-accent-purple hover:text-zinc-200"
          >
            {effectApplied ? (
              <>
                <Check size={14} className="text-accent-purple" />
                <span className="text-accent-purple">Applied</span>
              </>
            ) : (
              <>
                <Paintbrush size={14} />
                Apply effect to all scenes
              </>
            )}
          </button>
        )}
      </Section>

      {/* ── Cinematic finishes (project-wide) ── */}
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
