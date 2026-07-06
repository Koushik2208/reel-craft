import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useStore } from "../store";
import { useActiveStyle } from "../hooks/useActiveStyle";
import { EmptyTargetState } from "./EmptyTargetState";
import { SceneSelector, type ApplyOption } from "./SceneSelector";
import { FRAMES, type FrameId } from "../../frames/types";
import { exportFrameAsPng } from "../../frames/exportFramePng";
import { titledFilename } from "../render";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2.5">
    <h3 className="text-xs font-medium uppercase tracking-wider text-muted">{title}</h3>
    {children}
  </div>
);

const FramePreview: React.FC<{ id: FrameId }> = ({ id }) => {
  if (id === "minimal-bezel") {
    return (
      <div className="h-14 w-10 shrink-0 rounded-[10px] bg-[#1A1A1F] p-1 shadow-[0_0_0_1px_#2A2A3A]">
        <div className="h-full w-full rounded-[6px] bg-gradient-to-br from-accent-purple/30 to-accent-cyan/20" />
      </div>
    );
  }
  if (id === "browser-window") {
    return (
      <div className="h-14 w-10 shrink-0 overflow-hidden rounded-[6px] shadow-[0_0_0_1px_#2A2A3A]">
        <div className="flex h-2.5 items-center gap-0.5 bg-[#1E1E28] px-1">
          <span className="h-1 w-1 rounded-full bg-[#FF5F57]" />
          <span className="h-1 w-1 rounded-full bg-[#FFBD2E]" />
          <span className="h-1 w-1 rounded-full bg-[#28C840]" />
        </div>
        <div className="h-[calc(100%-10px)] w-full bg-gradient-to-br from-accent-purple/30 to-accent-cyan/20" />
      </div>
    );
  }
  return (
    <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-rim/70 bg-surface/40">
      <span className="text-[8px] font-semibold uppercase tracking-wide text-muted/60">Raw</span>
    </div>
  );
};

export const FramesPanel: React.FC = () => {
  const { projectTitle } = useStore();
  const style = useActiveStyle();

  const [exporting, setExporting] = useState(false);
  const handleExportPng = async (frameId: FrameId) => {
    setExporting(true);
    try {
      await exportFrameAsPng(
        frameId,
        titledFilename(projectTitle, "-frame", "png", "reelcraft-frame.png")
      );
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  if (!style.ready) {
    return <EmptyTargetState message={style.message} linkTo={style.linkTo} linkLabel={style.linkLabel} />;
  }

  const frameId = style.frameId;
  const supportsGreenScreen =
    frameId === "minimal-bezel" ||
    frameId === "square-bezel" ||
    frameId === "landscape-bezel" ||
    frameId === "floating-device";

  return (
    <div className="flex flex-col gap-7">
      <SceneSelector
        applyOptions={[
          style.applyFrameToAllScenes
            ? { label: "Frame to all scenes", action: style.applyFrameToAllScenes }
            : null,
        ].filter((o): o is ApplyOption => o !== null)}
      />

      {supportsGreenScreen && (
        <button
          onClick={() => style.setFrameGreenScreen(!style.frameGreenScreen)}
          aria-pressed={style.frameGreenScreen}
          className={`flex items-center justify-center rounded-xl border px-3.5 py-2.5 text-center text-[12px] font-medium transition ${
            style.frameGreenScreen
              ? "border-accent-purple/60 bg-accent-purple/10 text-zinc-100"
              : "border-rim bg-surface text-muted hover:border-accent-purple"
          }`}
        >
          Green screen background
        </button>
      )}

      {/* ── Frame picker ── */}
      <Section title="Frame">
        <div className="grid grid-cols-2 gap-2.5">
          {FRAMES.map((frame) => {
            const active = frame.id === frameId;
            return (
              <button
                key={frame.id}
                onClick={() => style.setFrame(frame.id)}
                className={`flex flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left transition ${
                  active
                    ? "border-accent-purple/60 bg-accent-purple/10"
                    : "border-rim bg-surface hover:border-accent-purple"
                }`}
              >
                <FramePreview id={frame.id} />
                <div>
                  <div className="text-[12px] font-medium text-zinc-100">{frame.label}</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-muted">{frame.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Green screen PNG export ── */}
      <div className="border-t border-rim pt-7">
        <Section title="Frame Shell PNG">
          <div className="rounded-2xl border border-rim bg-surface/60 px-3.5 py-3.5 shadow-rim">
            <p className="text-[11px] leading-snug text-muted/70">
              Download the frame with a green screen hole for DaVinci or CapCut compositing.
            </p>
            <button
              onClick={() => handleExportPng(frameId)}
              disabled={frameId === "none" || exporting}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rim bg-surface px-3.5 py-2.5 text-[13px] text-muted transition hover:border-accent-purple hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {exporting ? "Rendering…" : "Download PNG"}
            </button>
            <p className="mt-2 text-[11px] leading-snug text-muted/70">
              Drop into your editor and chroma key #00FF00.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
};
