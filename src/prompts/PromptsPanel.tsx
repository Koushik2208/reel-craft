import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, FolderOpen, X } from "lucide-react";
import { useStore } from "../app/store";
import { importProjectJson } from "../app/render";

const SYSTEM_PROMPT = `You are a video project generator for Reel Craft, a vertical video
creation tool (1080x1920, 9:16). Your job is to take a user's script
or video idea and generate a valid Reel Craft project JSON file.

OUTPUT FORMAT:
Return ONLY a valid JSON object. No explanation, no markdown, no
code fences. The JSON must match this exact structure:

{
  "version": 1,
  "projectTitle": "string — short title for the video",
  "projectMode": "manual",
  "finishes": {
    "grain": false,
    "vignette": false,
    "letterbox": false
  },
  "activeSceneId": "must match the id of the first scene",
  "audio": null,
  "linkedPair": null,
  "scenes": [ ...Scene objects ]
}

SCENE OBJECT STRUCTURE:
Each scene must have ALL of these fields:
{
  "id": "unique string (use incrementing ids like scene-1, scene-2)",
  "text": "the text shown on screen for this scene",
  "template": "one of: minimal | cinematic | imageCard",
  "variant": "see valid variants below",
  "language": "en",
  "durationMode": "manual",
  "manualDurationInFrames": number (30fps — 5s=150, 6s=180, 7s=210 (always add 30 frames for transition overlap)),
  "asset": null,
  "layerMode": "full",
  "textColorOverride": null,
  "frameId": "see valid frame ids below",
  "overlays": [],
  "motion": [],
  "imageEffect": "zoom-in",
  "textStyle": "see valid text styles below",
  "fontOverride": null,
  "fontWeightOverride": null,
  "fontSizeOverride": null,
  "captionPosition": "center",
  "transition": {
    "id": "crossfade",
    "duration": "medium"
  }
}

VALID VALUES:

Templates and their variants:
- minimal: ink | paper | midnight | rose | forest | sand | slate | gold
- cinematic: noir | ember | cool | dusk | arctic | sepia | verdant | none
- imageCard: frost | warm | bold | midnight | ember | steel | verdant | none
  (cinematic and imageCard need a background image — set asset: null
   and use minimal unless user specifies an image)

Frame ids (frameId):
none | minimal-bezel | square-bezel | landscape-bezel | browser-window |
gradient-border | neon-glow | film-strip | polaroid | dark-spotlight |
cinematic-scope | tv-frame | floating-device | neon-sign | arch-portal |
vintage-projector | sticky-note | split-screen

Text styles (textStyle):
cinema | editorial | impact | minimal | neon | handwritten | luxury |
street | soft | cinematic-title | condensed | dancing

Image effects (imageEffect):
none | zoom-in | zoom-out | pan-left | pan-right | pan-up | pan-down |
ken-burns | slide-in | scale-pop | sway

Overlays (add to overlays array if needed):
Each overlay: { "id": overlayId, "intensity": "low"|"medium"|"high" }
Overlay ids: crt-scanlines | vhs | light-leak | film-dust | noise |
glow-bloom | speed-lines | halftone | halation | grid

Motion graphics (add to motion array if needed):
progress-bar: { "id": "progress-bar", "config": { "position": "top"|"bottom" } }
number-counter: { "id": "number-counter", "config": { "startNumber": 0, "endNumber": 100, "prefix": "", "suffix": "" } }
countdown: { "id": "countdown", "config": { "startFrom": 3|5|10 } }
ticker: { "id": "ticker", "config": { "text": "your text", "direction": "left"|"right", "position": "top"|"bottom" } }
step-badge: { "id": "step-badge", "config": { "stepNumber": 1, "totalSteps": 5, "position": "top-left"|"top-right"|"bottom-left"|"bottom-right" } }
code-block: { "id": "code-block", "config": { "code": "your code here", "language": "python"|"sql"|"r"|"bash"|"js", "position": "top"|"center"|"bottom", "linesPerPage": 8 } }

Transitions (transition.id):
none | crossfade | slide-left | slide-right | slide-up | slide-down |
wipe | clapperboard
Durations: short | medium | long

Caption positions (captionPosition):
top | center | bottom

STYLE GUIDELINES:
- Keep text SHORT per scene — max 60 characters ideally
- Hook scene: bold, punchy, 2-4 seconds
- Body scenes: one idea per scene, 3-5 seconds
- Conclusion: memorable, 3-4 seconds
- For dark/moody content: minimal midnight or cinematic noir
- For educational/clean: minimal slate or minimal paper
- For bold/impact: minimal ink with impact text style
- For cinematic feel: cinematic-scope frame + halation overlay
- For code/tech content: browser-window frame + code-block motion
- Transitions should match the energy: crossfade for calm,
  slide-up for energy, wipe for editorial

FINISHES:
- grain: true for film/cinematic feel
- vignette: true for dramatic/moody feel
- letterbox: true when using cinematic-scope frame

Always generate between 4-8 scenes unless user specifies otherwise.
Last scene never needs a transition (it's ignored) but include it anyway.
TIMING: Minimum scene duration is 150 frames. For scenes with
more than 8 words add 30 extra frames per additional 4 words.
Always add 30 frames on top to account for transition overlap.`;

const VALUE_GROUPS: { label: string; values: string[] }[] = [
  { label: "Templates", values: ["minimal", "cinematic", "imageCard"] },
  {
    label: "Minimal variants",
    values: ["ink", "paper", "midnight", "rose", "forest", "sand", "slate", "gold"],
  },
  {
    label: "Cinematic variants",
    values: ["noir", "ember", "cool", "dusk", "arctic", "sepia", "verdant"],
  },
  {
    label: "Text styles",
    values: [
      "cinema",
      "editorial",
      "impact",
      "minimal",
      "neon",
      "handwritten",
      "luxury",
      "street",
      "soft",
      "cinematic-title",
      "condensed",
      "dancing",
    ],
  },
  {
    label: "Frames",
    values: [
      "none",
      "minimal-bezel",
      "square-bezel",
      "landscape-bezel",
      "browser-window",
      "gradient-border",
      "neon-glow",
      "film-strip",
      "polaroid",
      "dark-spotlight",
      "cinematic-scope",
      "tv-frame",
      "floating-device",
      "neon-sign",
      "arch-portal",
      "vintage-projector",
      "sticky-note",
      "split-screen",
    ],
  },
  {
    label: "Overlays",
    values: [
      "crt-scanlines",
      "vhs",
      "light-leak",
      "film-dust",
      "noise",
      "glow-bloom",
      "speed-lines",
      "halftone",
      "halation",
      "grid",
    ],
  },
  {
    label: "Transitions",
    values: [
      "none",
      "crossfade",
      "slide-left",
      "slide-right",
      "slide-up",
      "slide-down",
      "wipe",
      "clapperboard",
    ],
  },
];

const EXAMPLE_PROMPTS: { title: string; prompt: string }[] = [
  {
    title: "Data Science Tutorial",
    prompt:
      "Make a 5-scene video about what pandas DataFrames are. Use minimal slate template, editorial text style, browser-window frame for the code scene. Add a code-block motion graphic on scene 3 showing: import pandas as pd / df = pd.read_csv('data.csv') / df.head(). Use slide-up transitions. Hook: what is a DataFrame. Scenes: definition, why it matters, code example, key takeaway.",
  },
  {
    title: "Opinion / Hot Take",
    prompt:
      "Make a 5-scene punchy opinion video about why most people fail at building habits. Use minimal midnight, impact text style, cinematic-scope frame, halation low overlay, slide-up transitions. Hook should be provocative. End with a strong verdict.",
  },
  {
    title: "Motivational Quote Reel",
    prompt:
      "Make a 4-scene motivational video. Use cinematic noir template, cinema text style, dark-spotlight frame, light-leak low overlay, crossfade transitions, grain finish. Each scene one short powerful line. Topic: consistency beats talent.",
  },
  {
    title: "News Breakdown",
    prompt:
      "Make a 6-scene news breakdown video. Use minimal slate, condensed text style, no frame, crt-scanlines low overlay, wipe transitions, ticker motion graphic at top. Structure: headline, context, 3 key points, what to watch next.",
  },
];

const PillGroup: React.FC<{ label: string; values: string[] }> = ({ label, values }) => (
  <div>
    <p className="mb-1.5 text-[11px] font-medium text-muted">{label}</p>
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <span
          key={v}
          className="rounded-full border border-rim bg-surface/40 px-2 py-0.5 text-[11px] text-zinc-300"
        >
          {v}
        </span>
      ))}
    </div>
  </div>
);

const ExampleCard: React.FC<{ title: string; prompt: string }> = ({ title, prompt }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-rim bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-medium text-zinc-100">{title}</h3>
        <button
          onClick={copy}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
            copied
              ? "border-accent-purple/60 bg-accent-purple/10 text-accent-purple"
              : "border-rim text-muted hover:border-accent-purple hover:text-zinc-200"
          }`}
        >
          {copied ? (
            <>
              <Check size={13} />
              Copied
            </>
          ) : (
            <>
              <Copy size={13} />
              Copy
            </>
          )}
        </button>
      </div>
      <p className="mt-2.5 text-[12px] leading-relaxed text-muted">{prompt}</p>
    </div>
  );
};

export const PromptsPanel: React.FC = () => {
  const { loadProject } = useStore();

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [banner, setBanner] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 5000);
    return () => clearTimeout(t);
  }, [banner]);

  const copySystemPrompt = async () => {
    await navigator.clipboard.writeText(SYSTEM_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const fileRef = useRef<HTMLInputElement>(null);
  const handleImportFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      try {
        const json = await importProjectJson(file);
        loadProject(json);
        setBanner({
          kind: "success",
          text: "Project loaded. Re-attach any audio or background files.",
        });
      } catch (e) {
        console.error(e);
        setBanner({
          kind: "error",
          text: "Could not load this file. Please check the format.",
        });
      }
    },
    [loadProject]
  );

  return (
    <div className="flex flex-col gap-7">
      {banner && (
        <div
          className={`fixed left-1/2 top-3 z-50 flex max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border border-rim bg-surface px-4 py-2.5 text-[13px] shadow-rim ${
            banner.kind === "success" ? "text-zinc-100" : "text-red-300"
          }`}
        >
          <span className="flex-1">{banner.text}</span>
          <button
            onClick={() => setBanner(null)}
            className="shrink-0 text-muted transition hover:text-zinc-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Generate with AI ── */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted">
          Generate with AI
        </h2>
        <p className="text-[12px] leading-snug text-muted">
          Paste the system prompt below into Claude or ChatGPT, then describe your video idea or
          paste your script. Download the JSON it generates, then use Open Project to load it.
        </p>
        <textarea
          readOnly
          value={SYSTEM_PROMPT}
          rows={12}
          spellCheck={false}
          className="w-full resize-y rounded-2xl border border-rim bg-base p-3.5 font-mono text-[11px] leading-relaxed text-haze outline-none"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={copySystemPrompt}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-2.5 text-[13px] font-medium text-white transition hover:brightness-110"
          >
            {copiedPrompt ? (
              <>
                <Check size={14} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy System Prompt
              </>
            )}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rim bg-surface px-4 py-2.5 text-[13px] text-muted transition hover:border-accent-purple hover:text-zinc-200"
          >
            <FolderOpen size={14} />
            Import Generated JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.reelcraft.json"
            className="hidden"
            onChange={(e) => {
              void handleImportFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* ── Valid Values Reference ── */}
      <div className="rounded-2xl border border-rim bg-surface p-4">
        <button
          onClick={() => setReferenceOpen((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted">
            Valid Values Reference
          </h2>
          {referenceOpen ? (
            <ChevronUp size={14} className="text-muted" />
          ) : (
            <ChevronDown size={14} className="text-muted" />
          )}
        </button>
        {referenceOpen && (
          <div className="mt-3.5 flex flex-col gap-3 border-t border-rim/60 pt-3.5">
            {VALUE_GROUPS.map((group) => (
              <PillGroup key={group.label} label={group.label} values={group.values} />
            ))}
          </div>
        )}
      </div>

      {/* ── Example Prompts ── */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted">
          Example Prompts
        </h2>
        <div className="flex flex-col gap-3">
          {EXAMPLE_PROMPTS.map((example) => (
            <ExampleCard key={example.title} title={example.title} prompt={example.prompt} />
          ))}
        </div>
      </div>
    </div>
  );
};
