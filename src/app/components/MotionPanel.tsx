import React, { useState } from "react";
import { Check, Paintbrush } from "lucide-react";
import { useActiveStyle } from "../hooks/useActiveStyle";
import { EmptyTargetState } from "./EmptyTargetState";
import { SceneSelector } from "./SceneSelector";
import { MOTION_GRAPHICS, type ActiveMotion, type MotionConfig } from "../../motion/types";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2.5">
    <h3 className="text-xs font-medium uppercase tracking-wider text-muted">{title}</h3>
    {children}
  </div>
);

function PillToggle<T extends string | number>({
  options,
  value,
  onChange,
  formatLabel,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  formatLabel?: (v: T) => string;
}) {
  const wrap = options.length > 3;
  return (
    <div
      className={`gap-1 rounded-lg border border-rim bg-surface p-0.5 ${wrap ? "grid grid-cols-2" : "flex"}`}
    >
      {options.map((opt) => {
        const on = value === opt;
        const label = formatLabel ? formatLabel(opt) : String(opt).replace(/-/g, " ");
        return (
          <button
            key={String(opt)}
            onClick={() => onChange(opt)}
            className={`rounded-md py-1 text-[10px] font-medium capitalize transition ${wrap ? "" : "flex-1"} ${
              on
                ? "border border-accent-purple/40 bg-accent-purple/20 text-zinc-100"
                : "text-muted hover:text-zinc-200"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

const NumberField: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({
  label,
  value,
  onChange,
}) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] text-muted">{label}</span>
    <input
      type="number"
      value={value}
      onChange={(e) => {
        const n = parseInt(e.target.value, 10);
        if (!isNaN(n)) onChange(n);
      }}
      className="w-full rounded-lg border border-rim bg-surface px-2 py-1.5 text-[12px] text-zinc-100 outline-none transition focus:border-accent-purple/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
  </label>
);

const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] text-muted">{label}</span>
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-rim bg-surface px-2 py-1.5 text-[12px] text-zinc-100 outline-none transition placeholder:text-muted/60 focus:border-accent-purple/40"
    />
  </label>
);

const POSITION_OPTIONS = ["top", "bottom"] as const;
const DIRECTION_OPTIONS = ["left", "right"] as const;
const COUNTDOWN_OPTIONS = [3, 5, 10] as const;
const BADGE_POSITION_OPTIONS = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;

const MotionConfigFields: React.FC<{
  motion: ActiveMotion;
  onChange: (config: MotionConfig) => void;
}> = ({ motion, onChange }) => {
  switch (motion.id) {
    case "progress-bar":
      return (
        <PillToggle
          options={POSITION_OPTIONS}
          value={motion.config.position}
          onChange={(position) => onChange({ position })}
        />
      );
    case "number-counter":
      return (
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="Start"
            value={motion.config.startNumber}
            onChange={(startNumber) => onChange({ ...motion.config, startNumber })}
          />
          <NumberField
            label="End"
            value={motion.config.endNumber}
            onChange={(endNumber) => onChange({ ...motion.config, endNumber })}
          />
          <TextField
            label="Prefix"
            value={motion.config.prefix}
            onChange={(prefix) => onChange({ ...motion.config, prefix })}
          />
          <TextField
            label="Suffix"
            value={motion.config.suffix}
            onChange={(suffix) => onChange({ ...motion.config, suffix })}
          />
        </div>
      );
    case "countdown":
      return (
        <PillToggle
          options={COUNTDOWN_OPTIONS}
          value={motion.config.startFrom}
          onChange={(startFrom) => onChange({ startFrom })}
        />
      );
    case "ticker":
      return (
        <div className="space-y-2">
          <TextField
            label="Text"
            value={motion.config.text}
            placeholder="Breaking News"
            onChange={(text) => onChange({ ...motion.config, text })}
          />
          <div className="grid grid-cols-2 gap-2">
            <PillToggle
              options={DIRECTION_OPTIONS}
              value={motion.config.direction}
              onChange={(direction) => onChange({ ...motion.config, direction })}
            />
            <PillToggle
              options={POSITION_OPTIONS}
              value={motion.config.position}
              onChange={(position) => onChange({ ...motion.config, position })}
            />
          </div>
        </div>
      );
    case "step-badge":
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Step"
              value={motion.config.stepNumber}
              onChange={(stepNumber) => onChange({ ...motion.config, stepNumber })}
            />
            <NumberField
              label="Of"
              value={motion.config.totalSteps}
              onChange={(totalSteps) => onChange({ ...motion.config, totalSteps })}
            />
          </div>
          <PillToggle
            options={BADGE_POSITION_OPTIONS}
            value={motion.config.position}
            onChange={(position) => onChange({ ...motion.config, position })}
          />
        </div>
      );
    default:
      return null;
  }
};

export const MotionPanel: React.FC = () => {
  const style = useActiveStyle();

  const [applied, setApplied] = useState(false);
  const handleApplyAll = () => {
    if (!style.ready || !style.applyMotionToAllScenes) return;
    style.applyMotionToAllScenes();
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  if (!style.ready) {
    return <EmptyTargetState message={style.message} linkTo={style.linkTo} linkLabel={style.linkLabel} />;
  }

  return (
    <div className="flex flex-col gap-7">
      <SceneSelector />

      {/* ── Active motion summary ── */}
      {style.motion.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {style.motion.map((m) => {
            const meta = MOTION_GRAPHICS.find((g) => g.id === m.id);
            if (!meta) return null;
            return (
              <span
                key={m.id}
                className="rounded-full border border-accent-purple/40 bg-accent-purple/10 px-2.5 py-1 text-[11px] font-medium text-accent-purple"
              >
                {meta.label}
              </span>
            );
          })}
        </div>
      )}

      {/* ── Motion graphics picker ── */}
      <Section title="Motion Graphics">
        <div className="grid grid-cols-2 gap-2.5">
          {MOTION_GRAPHICS.map((graphic) => {
            const activeMotion = style.motion.find((m) => m.id === graphic.id);
            const active = !!activeMotion;
            return (
              <div
                key={graphic.id}
                className={`rounded-xl border px-3 py-3 transition ${
                  active
                    ? "border-accent-purple/60 bg-accent-purple/10"
                    : "border-rim bg-surface hover:border-accent-purple"
                }`}
              >
                <button
                  onClick={() => style.toggleMotion(graphic.id)}
                  className="flex w-full items-start justify-between gap-2 text-left"
                >
                  <div>
                    <div className="text-[12px] font-medium text-zinc-100">{graphic.label}</div>
                    <div className="mt-0.5 text-[11px] leading-snug text-muted">{graphic.description}</div>
                  </div>
                  {active && <Check size={14} className="mt-0.5 shrink-0 text-accent-purple" />}
                </button>

                {active && activeMotion && (
                  <div className="mt-2.5">
                    <MotionConfigFields
                      motion={activeMotion}
                      onChange={(config) => style.setMotionConfig(graphic.id, config)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── One-shot motion copy (manual mode only) ── */}
      {style.applyMotionToAllScenes && (
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
                Apply motion to all scenes
              </>
            )}
          </button>
          <p className="text-center text-[11px] leading-snug text-muted/70">
            Copies this scene's motion graphics to every other scene.
          </p>
        </div>
      )}
    </div>
  );
};
