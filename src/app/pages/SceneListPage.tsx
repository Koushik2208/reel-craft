import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Upload,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Plus,
  Paintbrush,
  Music,
  Volume2,
  Sparkles,
  Circle,
  Minus,
  Download,
  Frame as FrameIcon,
  FileText,
  Pencil,
  Layers,
  FolderOpen,
} from "lucide-react";
import type { EditorPreviewContext } from "../components/editorPreviewContext";
import { useStore, sceneDurationInFrames, type CinematicFinishes, type Scene } from "../store";
import { TEMPLATES } from "../../templates/registry";
import { FPS } from "../../templates/shared/timing";
import { FRAMES } from "../../frames/types";
import { renderSceneToFile } from "../renderScene";
import {
  downloadBlob,
  exportProjectJson,
  getExportFormat,
  importProjectJson,
  titledFilename,
} from "../render";
import { SrtImportModal } from "../components/SrtImportModal";
import { ModeSwitcher } from "../components/ModeSwitcher";
import { ProjectTitleInput } from "../components/ProjectTitleInput";

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

export const SceneListPage: React.FC = () => {
  const navigate = useNavigate();
  const { sceneFocusPreview, setSceneFocusPreview } = useOutletContext<EditorPreviewContext>();
  const {
    scenes,
    activeSceneId,
    audio,
    finishes,
    projectMode,
    projectTitle,
    addScene,
    duplicateScene,
    removeScene,
    moveScene,
    setActiveScene,
    applyStyleToAllScenes,
    setAudio,
    setAudioTrim,
    setAudioFadeIn,
    setAudioFadeOut,
    clearAudio,
    setFinish,
    loadProject,
  } = useStore();

  const [srtModalOpen, setSrtModalOpen] = useState(false);

  const [projectBanner, setProjectBanner] = useState<{ kind: "success" | "error"; text: string } | null>(
    null
  );
  useEffect(() => {
    if (!projectBanner) return;
    const t = setTimeout(() => setProjectBanner(null), 5000);
    return () => clearTimeout(t);
  }, [projectBanner]);

  const projectFileRef = useRef<HTMLInputElement>(null);
  const handleSaveProject = useCallback(() => {
    exportProjectJson(useStore.getState());
  }, []);
  const handleOpenProjectFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      try {
        const json = await importProjectJson(file);
        loadProject(json);
        setProjectBanner({
          kind: "success",
          text: "Project loaded. Re-attach any audio or background files.",
        });
      } catch (e) {
        console.error(e);
        setProjectBanner({
          kind: "error",
          text: "Could not load this file. Please check the format.",
        });
      }
    },
    [loadProject]
  );

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
          downloadBlob(
            blob,
            titledFilename(
              projectTitle,
              `-scene-${idx + 1}`,
              format.container,
              `reelcraft-scene-${idx + 1}.${format.container}`
            )
          );
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
    [finishes, projectTitle]
  );

  const audioFileRef = useRef<HTMLInputElement>(null);
  const onAudioFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      void setAudio(file);
    },
    [setAudio]
  );

  const selectScene = (id: string) => {
    setActiveScene(id);
    setSceneFocusPreview(true);
  };

  const editScene = (id: string) => {
    setActiveScene(id);
    navigate("/content");
  };

  useEffect(() => {
    if (projectMode === "linked") {
      navigate("/editor/linked", { replace: true });
    }
  }, [projectMode, navigate]);

  if (projectMode === "linked") return null;

  return (
    <div className="flex flex-col gap-7">
      {projectBanner && (
        <div
          className={`fixed left-1/2 top-3 z-50 flex max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border border-rim bg-surface px-4 py-2.5 text-[13px] shadow-rim ${
            projectBanner.kind === "success" ? "text-zinc-100" : "text-red-300"
          }`}
        >
          <span className="flex-1">{projectBanner.text}</span>
          <button
            onClick={() => setProjectBanner(null)}
            className="shrink-0 text-muted transition hover:text-zinc-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Project title ── */}
      <ProjectTitleInput />

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-100">Scenes</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handleSaveProject}
              title="Save Project"
              className="flex items-center justify-center rounded-lg border border-rim bg-surface p-1.5 text-muted transition hover:border-accent-purple hover:text-zinc-200"
            >
              <Download size={14} />
            </button>
            <button
              onClick={() => projectFileRef.current?.click()}
              title="Open Project"
              className="flex items-center justify-center rounded-lg border border-rim bg-surface p-1.5 text-muted transition hover:border-accent-purple hover:text-zinc-200"
            >
              <FolderOpen size={14} />
            </button>
            <input
              ref={projectFileRef}
              type="file"
              accept=".json,.reelcraft.json"
              className="hidden"
              onChange={(e) => {
                void handleOpenProjectFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </div>
        <ModeSwitcher />
      </div>
      <div className="flex items-center justify-between gap-2">
        {sceneFocusPreview ? (
          <button
            onClick={() => setSceneFocusPreview(false)}
            className="flex items-center gap-1 text-[12px] text-muted transition hover:text-zinc-200"
          >
            <Layers size={13} />
            Show full sequence
          </button>
        ) : (
          <span className="text-[12px] text-muted/70">Previewing full sequence</span>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSrtModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-rim bg-surface px-2.5 py-1.5 text-[12px] text-white transition hover:border-accent-purple hover:text-zinc-200"
          >
            <FileText size={13} />
            Import SRT
          </button>
          <button
            onClick={addScene}
            className="flex items-center gap-1.5 rounded-lg border border-rim bg-surface px-2.5 py-1.5 text-[12px] text-muted transition hover:border-accent-purple hover:text-zinc-200"
          >
            <Plus size={13} />
            Add scene
          </button>
        </div>
      </div>

      {srtModalOpen && <SrtImportModal onClose={() => setSrtModalOpen(false)} />}

      {/* ── Scene list ── */}
      <div className="flex flex-col gap-2">
        {scenes.map((scene, idx) => {
          const meta = TEMPLATES[scene.template];
          const variantLabel = meta.variants.find((v) => v.id === scene.variant)?.label ?? scene.variant;
          const frameLabel = FRAMES.find((f) => f.id === scene.frameId)?.label;
          const preview = scene.text.trim().split("\n")[0]?.slice(0, 40) || "—";
          const durSeconds = (sceneDurationInFrames(scene) / FPS).toFixed(1);
          const durLabel =
            scene.durationMode === "manual" ? `${durSeconds}s manual` : `${durSeconds}s auto`;
          const exportProgress = sceneExportProgress[scene.id];
          const isExporting = exportProgress !== undefined;
          const isActive = scene.id === activeSceneId;

          return (
            <div
              key={scene.id}
              onClick={() => selectScene(scene.id)}
              className={`group flex cursor-pointer flex-col gap-2 rounded-2xl border px-3.5 py-3 shadow-rim transition ${
                isActive && sceneFocusPreview
                  ? "border-accent-purple/50 bg-accent-purple/10"
                  : isActive
                    ? "border-accent-purple/30 bg-surface hover:border-accent-purple"
                    : "border-rim bg-surface hover:border-accent-purple"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide ${
                        isActive ? "text-accent-purple" : "text-muted"
                      }`}
                    >
                      Scene {idx + 1}
                    </span>
                    <span className="text-[11px] text-zinc-300">{meta.label}</span>
                    <span className="text-[10px] text-muted/60">· {variantLabel}</span>
                  </div>
                  <p className="mt-1 truncate text-[13px] leading-snug text-zinc-300">{preview}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-muted/70">{durLabel}</span>
                    <span className="rounded bg-rim/60 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-muted/70">
                      {(scene.language ?? "en") === "te" ? "తె" : "EN"}
                    </span>
                    {scene.frameId !== "none" && frameLabel && (
                      <span className="flex items-center gap-1 rounded bg-accent-purple/15 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-accent-purple">
                        <FrameIcon size={9} />
                        {frameLabel}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    editScene(scene.id);
                  }}
                  title="Edit scene content"
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-rim px-2 py-1.5 text-muted transition hover:border-accent-purple hover:bg-rim/60 hover:text-zinc-100"
                >
                  <Pencil size={13} />
                  <span className="text-[11px]">Edit</span>
                </button>
              </div>

              {isExporting ? (
                <div className="flex items-center gap-1.5 border-t border-rim/60 pt-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-rim">
                    <div
                      className="h-full rounded-full bg-accent-purple transition-[width] duration-200"
                      style={{ width: `${Math.max(4, exportProgress * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-[10px] text-muted">
                    {Math.round(exportProgress * 100)}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-0.5 border-t border-rim/60 pt-2">
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
                    className="ml-auto rounded p-1 text-muted hover:text-red-400 disabled:opacity-25"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Apply style to all ── */}
      <div className="space-y-1.5">
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
        <p className="text-center text-[11px] leading-snug text-muted/70">
          Copies the active scene's template, look, background, layer mode, and text style
          (font, color, size & position) to every other scene.
        </p>
      </div>

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
                Re-upload to restore: <span className="text-zinc-300">{audio.name}</span>
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
                    {
                      label: "Start at",
                      value: audio.trimStartSeconds,
                      min: 0,
                      max: audio.durationInSeconds,
                      step: 0.1,
                      onChange: setAudioTrim,
                    },
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
    </div>
  );
};
