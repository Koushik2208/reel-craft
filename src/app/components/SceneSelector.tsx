import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "../store";

/**
 * Shared scene-context switcher for scene-scoped tool pages (Content, Style,
 * Frames, Overlays, Motion). Keeps `activeSceneId` visible and changeable
 * without leaving the current tab. Renders nothing in linked mode or when
 * there's only one scene to switch between.
 */
export const SceneSelector: React.FC = () => {
  const { scenes, activeSceneId, setActiveScene, projectMode } = useStore();

  if (projectMode !== "manual" || scenes.length <= 1) return null;

  const idx = scenes.findIndex((s) => s.id === activeSceneId);
  const prevScene = idx > 0 ? scenes[idx - 1] : null;
  const nextScene = idx < scenes.length - 1 ? scenes[idx + 1] : null;

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
    </div>
  );
};
