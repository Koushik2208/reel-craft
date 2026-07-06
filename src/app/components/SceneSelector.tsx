import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "../store";

export type ApplyOption = {
  label: string;
  action: () => void;
};

type SceneSelectorProps = {
  applyOptions?: ApplyOption[];
};

/**
 * Shared scene-context switcher for scene-scoped tool pages (Content, Style,
 * Frames, Overlays, Motion). Keeps `activeSceneId` visible and changeable
 * without leaving the current tab. Renders nothing in linked mode or when
 * there's only one scene to switch between.
 */
export const SceneSelector: React.FC<SceneSelectorProps> = ({ applyOptions }) => {
  const { scenes, activeSceneId, setActiveScene, projectMode } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [dropdownOpen]);

  if (projectMode !== "manual" || scenes.length <= 1) return null;

  const idx = scenes.findIndex((s) => s.id === activeSceneId);
  const prevScene = idx > 0 ? scenes[idx - 1] : null;
  const nextScene = idx < scenes.length - 1 ? scenes[idx + 1] : null;

  const handleSelect = (option: ApplyOption) => {
    option.action();
    setDropdownOpen(false);
    setApplied(true);
    setTimeout(() => setApplied(false), 1500);
  };

  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted">Scene</h3>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => prevScene && setActiveScene(prevScene.id)}
          disabled={!prevScene}
          title="Previous scene"
          className="shrink-0 rounded-lg p-1.5 text-muted transition hover:bg-rim/60 hover:text-zinc-100 disabled:opacity-25"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex flex-1 snap-x snap-mandatory gap-1.5 overflow-x-auto pb-1">
          {scenes.map((scene, i) => {
            const isActive = scene.id === activeSceneId;
            return (
              <button
                key={scene.id}
                onClick={() => setActiveScene(scene.id)}
                className={`shrink-0 snap-start rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                  isActive
                    ? "border-accent-purple/60 bg-accent-purple/10 text-zinc-100"
                    : "border-rim bg-surface text-muted hover:border-accent-purple"
                }`}
              >
                Scene {i + 1}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => nextScene && setActiveScene(nextScene.id)}
          disabled={!nextScene}
          title="Next scene"
          className="shrink-0 rounded-lg p-1.5 text-muted transition hover:bg-rim/60 hover:text-zinc-100 disabled:opacity-25"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {applyOptions && applyOptions.length > 0 && (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-lg border border-rim bg-surface px-3 py-2 text-[12px] text-muted transition hover:border-accent-purple hover:text-zinc-200"
          >
            {applied ? (
              <span className="mx-auto text-accent-purple">Applied ✓</span>
            ) : (
              <>
                <span>Apply to all</span>
                <span>▾</span>
              </>
            )}
          </button>

          {dropdownOpen && (
            <div
              className="absolute left-0 top-full z-50 mt-1.5 min-w-full overflow-hidden rounded-xl border border-rim bg-surface shadow-lg"
            >
              {applyOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleSelect(option)}
                  className="block w-full px-3 py-2 text-left text-[12px] text-zinc-200 transition hover:bg-accent-purple/10 hover:text-zinc-100"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
