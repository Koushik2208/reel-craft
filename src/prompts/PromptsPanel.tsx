import React, { useMemo, useState } from "react";
import { Check, Copy, Lightbulb } from "lucide-react";
import { PROMPT_TEMPLATES, type PromptTemplate } from "./templates";

const CATEGORIES = Array.from(new Set(PROMPT_TEMPLATES.map((t) => t.category)));

const PromptCard: React.FC<{ template: PromptTemplate }> = ({ template }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(template.template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewLines = template.template.split("\n").slice(0, 2).join("\n");

  return (
    <div className="rounded-2xl border border-rim bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full border border-rim px-2.5 py-0.5 text-[11px] font-medium text-muted">
          {template.category}
        </span>
        <button
          onClick={copy}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
            copied
              ? "border-accent-purple/60 bg-accent-purple/10 text-accent-purple"
              : "border-rim text-muted hover:border-accent-purple hover:text-zinc-200"
          }`}
        >
          {copied ? (
            <>
              <Check size={13} />
              Copied ✓
            </>
          ) : (
            <>
              <Copy size={13} />
              Copy
            </>
          )}
        </button>
      </div>

      <h3 className="mt-3 text-[15px] font-medium text-zinc-100">{template.label}</h3>
      <p className="mt-0.5 text-[12px] text-muted">{template.description}</p>

      <button
        onClick={copy}
        className="relative mt-3 block w-full overflow-hidden rounded-xl bg-base p-3 text-left"
        style={{ maxHeight: 60 }}
      >
        <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-snug text-haze">
          {previewLines}
        </pre>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-base to-transparent" />
      </button>
    </div>
  );
};

export const PromptsPanel: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? PROMPT_TEMPLATES
        : PROMPT_TEMPLATES.filter((t) => t.category === activeCategory),
    [activeCategory],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-medium text-zinc-100">Prompt Templates</h2>
        <p className="mt-1 text-[12px] leading-snug text-muted">
          Copy a template → paste into Claude or ChatGPT with your script → get image prompts for
          every scene → generate images → drop into Reel Craft.
        </p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {["All", ...CATEGORIES].map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                isActive
                  ? "border-accent-purple/60 bg-accent-purple/10 text-accent-purple"
                  : "border-rim bg-surface text-muted hover:border-accent-purple"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((template) => (
          <PromptCard key={template.id} template={template} />
        ))}
      </div>

      <div className="flex gap-2.5 rounded-xl border border-rim bg-surface p-3.5">
        <Lightbulb size={15} className="mt-0.5 shrink-0 text-accent-purple" />
        <p className="text-[11px] leading-snug text-muted">
          <span className="font-medium text-zinc-200">How to use:</span> Copy a template → open
          Claude.ai or ChatGPT → paste the template → replace [PASTE YOUR SCRIPT HERE] with your
          script → send. You'll get one image prompt per scene. Generate images with Midjourney,
          Flux, or Ideogram, then upload them as scene backgrounds in Reel Craft.
        </p>
      </div>
    </div>
  );
};
