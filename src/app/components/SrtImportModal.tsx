import React, { useCallback, useRef, useState } from "react";
import { FileText, X, AlertCircle } from "lucide-react";
import { useStore, type Scene } from "../store";
import { parseSRT } from "../srtParser";
import { srtToScenes } from "../srtToScenes";

type ParsedResult = {
  fileName: string;
  subtitleCount: number;
  scenes: Scene[];
};

type Props = {
  onClose: () => void;
};

export const SrtImportModal: React.FC<Props> = ({ onClose }) => {
  const { scenes, replaceScenes, appendScenes } = useStore();
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setError(null);
      setResult(null);

      const raw = await file.text();
      const entries = parseSRT(raw);
      if (entries.length === 0) {
        setError("Could not parse this SRT file. Please check the format.");
        return;
      }

      const defaultScene = scenes[0];
      const generatedScenes = srtToScenes(entries, defaultScene);
      setResult({
        fileName: file.name,
        subtitleCount: entries.length,
        scenes: generatedScenes,
      });
    },
    [scenes]
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.toLowerCase().endsWith(".srt")) {
      void handleFile(file);
    } else {
      setError("Could not parse this SRT file. Please check the format.");
    }
  };

  const handleReplace = () => {
    if (!result) return;
    replaceScenes(result.scenes);
    onClose();
  };

  const handleAppend = () => {
    if (!result) return;
    appendScenes(result.scenes);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Import SRT"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-rim bg-surface p-5 shadow-rim"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Import SRT</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition hover:bg-rim/60 hover:text-zinc-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-3.5 py-6 text-center transition ${
              dragOver
                ? "border-accent-purple bg-accent-purple/10"
                : "border-rim bg-surface/60 hover:border-accent-purple/50"
            }`}
          >
            <FileText size={20} className="text-muted" />
            <p className="text-[13px] text-zinc-200">
              {result ? result.fileName : "Drop .srt file here, or click to browse"}
            </p>
            <p className="text-[11px] text-muted/70">Only .srt files are supported</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".srt"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-3.5 py-2.5">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
              <p className="text-[12px] leading-snug text-red-400">{error}</p>
            </div>
          )}

          {result && (
            <div className="rounded-xl border border-rim bg-surface/60 px-3.5 py-2.5">
              <p className="text-[12px] text-zinc-300">
                <span className="text-zinc-100">{result.subtitleCount}</span> subtitles →{" "}
                <span className="text-zinc-100">{result.scenes.length}</span> scenes will be
                generated
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={handleReplace}
            disabled={!result}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-[13px] font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Replace all scenes
          </button>
          <button
            onClick={handleAppend}
            disabled={!result}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rim bg-surface px-4 py-2.5 text-[13px] text-zinc-100 transition hover:border-accent-purple hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Append to existing
          </button>
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-[12px] text-muted transition hover:text-zinc-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
