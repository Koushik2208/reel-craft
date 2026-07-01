# Reel Craft

A personal, no-backend tool for making short typography videos for Reels / Shorts / TikTok.
Paste text → pick a finished look → download an MP4. Everything renders in your browser.

## Run it

```bash
npm install
npm run dev
```

Open the URL it prints (default http://localhost:5173). Use **Chrome or Edge** — in-browser
video encoding relies on WebCodecs.

## Daily workflow

1. Paste your text. Long passages are automatically split into multiple scenes.
2. Pick a template (Minimal / Cinematic / Image Card) per scene.
3. Drop a background if the template uses one (Cinematic → video, Image Card → image).
4. Pick a Look (variant).
5. Optionally set a **Language** (English / Telugu), **Layer Mode**, or **text color override** per scene.
6. Hit **Download MP4** (or `⌘/Ctrl + Enter`) to export the full stitch, or export individual scenes.

Duration is derived from your text automatically, so nothing gets cut off. Your text and
choices are remembered between sessions. The 9:16 output is 1080×1920.

## The three templates

| Template | Background | What it does | Looks |
|---|---|---|---|
| **Minimal** | none (solid color) | Centered text, fade in / pause / fade out | Ink, Paper, Midnight |
| **Cinematic** | video | Dark overlay, slow zoom, word-by-word serif reveal | Noir, Ember, Cool |
| **Image Card** | image | Gradient scrim, slow pan/zoom, animated text | Frost, Warm, Bold |

## Layer modes

Each scene can be rendered in one of three modes:

- **Full** (default) — background + text, exported as MP4/H.264.
- **Green Screen** — text over a solid `#00FF00` background, exported as MP4/H.264. Key it out
  in CapCut, DaVinci, or any editor to composite the text over your own footage.
- **Background Only** — background without any text overlay, exported as MP4.

## Cinematic finishes

Global post-processing overlays applied on top of every scene:

- **Grain** — subtle film grain texture.
- **Vignette** — soft darkened edge.
- **Letterbox** — cinematic 2.35:1 black bars.

## If the in-browser render fails

Some browsers don't support WebCodecs encoding yet. The CLI render always works and uses
real Chrome, so it supports every CSS feature:

```bash
npx remotion render src/remotion.ts video out.mp4 \
  --props='{"text":"Your line here","template":"minimal","variant":"ink"}'
```

For backgrounds via the CLI, put the file in `public/` and pass its name as `backgroundSrc`
(e.g. `"backgroundSrc":"clip.mp4"`). Preview templates live with `npm run studio`.

## Adding a template

Each template is one folder under `src/templates/`. A template is a React component that's
a pure function of `VideoProps` (text, backgroundSrc, variant, language, layerMode,
textColorOverride), plus an exported list of variants.
Register it in `src/templates/registry.tsx` and it appears in the UI automatically.

```
src/
  templates/
    registry.tsx        # the only file you edit to add a template
    schema.ts           # VideoProps type (text, variant, language, layerMode, …)
    shared/             # WordReveal, fonts, timing, textSplit, audioFade, autoContrast
    minimal/ cinematic/ imageCard/
  app/
    App.tsx             # layout + keyboard shortcut + render button
    store.ts            # multi-scene state (persisted) + uploads + audio
    render.ts           # full-stitch MP4 render (WebCodecs)
    renderScene.ts      # single-scene render with cinematic finishes
    components/
      Inspector.tsx         # right-panel controls
      PreviewStage.tsx      # live Remotion Player
      SceneSeries.tsx       # Remotion Series sequencing all scenes
      VideoComposition.tsx  # routes props to the active template
      CinematicFinishes.tsx # Grain / Vignette / Letterbox overlays
      MobileExportBanner.tsx
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check + production bundle |
| `npm run studio` | Open Remotion Studio for template preview |
| `npm run render` | CLI render via Remotion |
| `npm run generate-favicon` | Regenerate `public/favicon-*.png` assets |

## Notes

- Remotion is free for individuals and teams up to 3; a company license is needed at 4+.
  The in-app render calls `acknowledgeRemotionLicense` for the Player.
- Keep important text out of the bottom ~18% and top ~14% (the **Safe area** toggle shows where
  the app's UI sits on each platform).
- Audio is trimmed, fade-in/out is configurable, and the codec is chosen automatically
  (AAC → Opus → PCM) based on what your browser supports.
