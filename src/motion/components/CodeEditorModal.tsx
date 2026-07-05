import React, { useState } from "react";
import { X } from "lucide-react";
import type { CodeBlockConfig } from "../types";

const LANGUAGE_OPTIONS: CodeBlockConfig["language"][] = ["python", "sql", "r", "bash", "js"];
const LANGUAGE_LABEL: Record<CodeBlockConfig["language"], string> = {
  python: "Python",
  sql: "SQL",
  r: "R",
  bash: "Bash",
  js: "JS",
};
const POSITION_OPTIONS: CodeBlockConfig["position"][] = ["top", "center", "bottom"];

type Props = {
  config: CodeBlockConfig;
  onSave: (config: CodeBlockConfig) => void;
  onClose: () => void;
};

export const CodeEditorModal: React.FC<Props> = ({ config, onSave, onClose }) => {
  const [draft, setDraft] = useState<CodeBlockConfig>(config);

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-base/95 px-4 py-8 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Code Block"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-[90vw] max-w-[600px] flex-col rounded-2xl border border-rim bg-surface shadow-rim"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-rim px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-100">Edit Code Block</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition hover:bg-rim/60 hover:text-zinc-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-muted">Code</span>
            <textarea
              rows={20}
              value={draft.code}
              placeholder="Paste your code here..."
              onChange={(e) => setDraft({ ...draft, code: e.target.value })}
              className="w-full resize-y rounded-xl border border-white/10 bg-[#1E1E1E] px-3 py-3 font-mono text-[13px] text-[#D4D4D4] outline-none transition focus:border-accent-purple/40"
            />
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted">Language</span>
            <div className="flex gap-1 rounded-lg border border-rim bg-surface p-0.5">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setDraft({ ...draft, language: lang })}
                  className={`flex-1 rounded-md py-1.5 text-[11px] font-medium transition ${
                    draft.language === lang
                      ? "border border-accent-purple/60 bg-accent-purple/10 text-zinc-100"
                      : "border border-transparent text-muted hover:text-zinc-200"
                  }`}
                >
                  {LANGUAGE_LABEL[lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted">Position</span>
            <div className="flex gap-1 rounded-lg border border-rim bg-surface p-0.5">
              {POSITION_OPTIONS.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setDraft({ ...draft, position: pos })}
                  className={`flex-1 rounded-md py-1.5 text-[11px] font-medium capitalize transition ${
                    draft.position === pos
                      ? "border border-accent-purple/60 bg-accent-purple/10 text-zinc-100"
                      : "border border-transparent text-muted hover:text-zinc-200"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-muted">Lines per page</span>
            <input
              type="number"
              min={4}
              max={20}
              value={draft.linesPerPage}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (!isNaN(n)) setDraft({ ...draft, linesPerPage: Math.min(20, Math.max(4, n)) });
              }}
              className="w-24 rounded-lg border border-rim bg-surface px-2 py-1.5 text-[12px] text-zinc-100 outline-none transition focus:border-accent-purple/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </label>
        </div>

        <div className="flex shrink-0 gap-2 border-t border-rim px-5 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-rim bg-surface px-4 py-2.5 text-[13px] text-muted transition hover:border-accent-purple hover:text-zinc-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-gradient-brand px-4 py-2.5 text-[13px] font-medium text-white transition hover:brightness-110"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
