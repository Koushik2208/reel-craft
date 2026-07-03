import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";

export const ModeSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const { projectMode, setProjectMode, scenes, linkedPair } = useStore();

  const switchToLinked = () => {
    if (projectMode === "linked") return;
    const hasSceneData = scenes.length > 1 || scenes.some((s) => s.text.trim().length > 0 || s.asset);
    if (
      hasSceneData &&
      !window.confirm("Switching to Linked mode will remove your current scenes. Continue?")
    ) {
      return;
    }
    setProjectMode("linked");
    navigate("/editor/linked");
  };

  const switchToManual = () => {
    if (projectMode === "manual") return;
    if (
      linkedPair &&
      !window.confirm("Switching to Manual mode will remove your linked audio and transcript. Continue?")
    ) {
      return;
    }
    setProjectMode("manual");
    navigate("/editor");
  };

  return (
    <div className="flex gap-1 rounded-lg border border-rim bg-surface p-0.5">
      <button
        onClick={switchToManual}
        aria-pressed={projectMode === "manual"}
        className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition ${
          projectMode === "manual"
            ? "border border-accent-purple/40 bg-accent-purple/20 text-zinc-100"
            : "text-muted hover:text-zinc-200"
        }`}
      >
        Manual Scenes
      </button>
      <button
        onClick={switchToLinked}
        aria-pressed={projectMode === "linked"}
        className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition ${
          projectMode === "linked"
            ? "border border-accent-purple/40 bg-accent-purple/20 text-zinc-100"
            : "text-muted hover:text-zinc-200"
        }`}
      >
        Linked Audio + Transcript
      </button>
    </div>
  );
};
