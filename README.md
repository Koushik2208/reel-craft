# Reel Craft

## What is Reel Craft

Reel Craft is a no-backend, browser-based tool for creating vertical video content for
Instagram Reels, YouTube Shorts, and TikTok. There is no server and no signup — you open the
app, build a video out of text, images, video clips, and (optionally) audio, and it renders an
MP4 entirely client-side using WebCodecs. Nothing is uploaded anywhere.

Reel Craft is designed to work alongside **DaVinci Resolve** for final finishing, not to replace
it. Reel Craft handles the visual content creation — templates, captions, frames, overlays,
motion effects. DaVinci (or CapCut, or any NLE) handles audio mixing, sound design, color
grading, and multi-track composition. Green Screen layer mode exists specifically to make that
handoff easy: export text-on-#00FF00, key it out, composite over your own footage.

## Tech Stack

- React 18 + TypeScript
- Remotion 4.x (`@remotion/player`, `@remotion/web-renderer`, `@remotion/media`, `@remotion/google-fonts`, `@remotion/transitions`)
- Tailwind CSS
- Zustand (with `persist` middleware — your project survives a reload, minus object URLs)
- Vite
- Deployed on Vercel — but there is no backend, no API routes, no database. It's a static SPA.

## Getting Started

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

**Use Chrome or Edge for rendering.** In-browser MP4 encoding relies on WebCodecs, which only
those browsers currently support well. The rest of the app (editing, preview) works anywhere.

```bash
npm run build   # type-check + production bundle
```

## Two Project Modes

Every project is either **Manual** or **Linked**. This is the first decision to make, and it
determines which pages and controls are available. Switch modes with the toggle at the top of
the editor (`ModeSwitcher`, visible on the Scenes / Linked pages) — switching clears the other
mode's data, so the app asks for confirmation first.

### Manual Mode
Build a video scene by scene. Each scene has its own text, background (image or video,
depending on the template), template, look, frame, overlays, image effect, transition, language,
and layer mode. Scenes play back-to-back (`SceneSeries`), and duration is derived automatically
from each scene's word count (clamped 3–14s) unless you set a manual duration. Pasting or typing
text past the per-scene character limit offers a one-click split into multiple scenes, dividing
the text by word count.

Use Manual Mode for: quote reels, listicles, tutorials, or any video where you're writing/pasting
text yourself, scene by scene.

### Linked Mode
Upload one audio file and link it to one transcript (an SRT file). Captions are timed to the
audio automatically — no per-scene duration guessing. There's a single background (image or
video), a single template/look, and a project-level caption style. The video's total length is
the audio's length (minus any trim), capped at 5 minutes.

Use Linked Mode for: voiceovers, TTS narration, or any video where the audio and the captions
need to line up exactly.

## Feature Catalog

### Templates

Templates are the biggest style choice — they set the background type, text treatment, and
overall vibe. There are three, each with a family of "looks" (color variants).

| Template | Background | Vibe | Looks |
|---|---|---|---|
| **Minimal** | none (solid color) | Centered type, fade in / pause / fade out. Clean and quiet — good default for text-first content. | Ink, Paper, Midnight, Rose, Forest, Sand, Slate, Gold (8) |
| **Cinematic** | video | Dark scrim over a video background, slow zoom, word-by-word serif reveal. Moody and dramatic. | Noir, Ember, Cool, Dusk, Arctic, Sepia, Verdant, None (7 + none) |
| **Image Card** | image | Gradient scrim over a photo, slow pan/zoom, animated text. Editorial, photo-forward. | Frost, Warm, Bold, Midnight, Ember, Steel, Verdant, None (7 + none) |

Pick **Minimal** for pure-text content (quotes, lists, tips). Pick **Cinematic** when you have
b-roll or footage and want a trailer-like feel. Pick **Image Card** when you have still photos
and want a caption-card look.

### Frames

Frames wrap the rendered scene in a decorative shell — a device, a border, a cinematic treatment.
They're purely cosmetic and stack independently of template/overlay choices.

| Frame | Evokes |
|---|---|
| **None** | Raw scene, no device |
| **Minimal Bezel** | Clean, neutral device shell — works with any content |
| **Square Bezel** | Square content window on a black shell |
| **Landscape Bezel** | 16:9 content window on a black shell |
| **Browser Window** | Desktop browser chrome (tab bar, traffic lights) |
| **Gradient Border** | Glowing pink → purple → cyan ring |
| **Neon Glow** | Electric cyan border with outer glow |
| **Film Strip** | Sprocket holes down the left and right edges |
| **Polaroid** | Classic white border with a thick bottom strip |
| **Dark Spotlight** | Oval spotlight, dramatic dark surround |
| **Cinematic Scope** | Anamorphic 2.39:1 letterbox bars |
| **TV Frame** | Retro CRT television shell |
| **Floating Device** | Phone floating on a solid background |
| **Neon Sign** | Flickering neon tube border |
| **Arch Portal** | Arch-shaped content window |
| **Vintage Projector** | Dust particles, flicker, and vignette |
| **Sticky Note** | Content on a pinned sticky note |
| **Split Screen** | Content split across three vertical panels |

You can also export a frame's shell alone as a transparent PNG (Frames page → "Frame Shell PNG")
— useful if you want the device chrome as a compositing element in another editor without
re-exporting the whole video.

### Overlays

Overlays are post-processing textures layered on top of a scene. Ten are available, most with a
low/medium/high intensity control, and they're combinable — stack as many as you like. They
render in a fixed stack order (subtle textures first, expressive effects on top): grid,
halftone, noise, film-dust, crt-scanlines, halation, glow-bloom, light-leak, vhs, speed-lines.

| Overlay | Description | Intensity |
|---|---|---|
| **CRT Scanlines** | Horizontal scan-line grid | yes |
| **VHS** | Tape distortion + color fringe | no |
| **Light Leak** | Animated color bleed across the frame | yes |
| **Film Dust** | Random grain particles | no |
| **Noise** | Animated feTurbulence texture | yes |
| **Glow Bloom** | Radial color glow spread | yes |
| **Speed Lines** | Radial lines from center | no |
| **Halftone** | Dot pattern overlay | yes |
| **Halation** | Soft bloom bleed around bright areas | yes |
| **Grid** | Subtle flat digital grid | yes |

Typical combos:
- **Retro VHS**: VHS + CRT Scanlines (high) + Noise (medium)
- **Film look**: Halation + Film Dust + Noise (low/medium)
- **Glitch/HUD**: Grid + Glow Bloom

### Motion Graphics

Stackable animated overlays for adding information/UI-style elements on top of a scene —
distinct from the textural Overlays above. Five are available, each with its own inline config,
and they're combinable. They render in a fixed stack order: progress-bar, ticker, step-badge,
number-counter, countdown.

| Motion Graphic | Description | Config |
|---|---|---|
| **Progress Bar** | Thin gradient bar that grows left-to-right across the scene's duration | Position (top / bottom) |
| **Number Counter** | Large bold number animating from a start to an end value | Start, end, prefix, suffix |
| **Countdown** | Big centered numbers that spring in one at a time, then disappear at 0 | Start from (3 / 5 / 10) |
| **Ticker** | Scrolling text bar, semi-transparent background | Text, direction (left / right), position (top / bottom) |
| **Step Badge** | Small pill reading "Step X / Y" with a gradient border | Step number, total steps, corner position |

Available in both Manual Mode (per-scene, with "Apply motion to all scenes") and Linked Mode
(project-level). Driven purely by frame/spring interpolation (no CSS animation), so it renders
identically in preview and in the exported MP4.

### Transitions

Manual Mode only. Each scene carries a transition that plays between it and the next scene, with
a short / medium / long duration (10 / 20 / 30 frames). Eight are available: None (hard cut),
Crossfade, Slide (left / right / up / down), Wipe, and Clapperboard (cinema clap reveal). Set
per-scene, with an "Apply transition to all scenes" shortcut.

### Image Effects

Motion applied to the scene's background (or the whole frame, in Minimal). Eleven options:
None, Zoom In, Zoom Out, Pan Left, Pan Right, Pan Up, Pan Down, Ken Burns, Slide In, Scale Pop,
Sway. Set per-scene in Manual Mode, project-level in Linked Mode.

All four pan-style effects (pan-left/right/up/down, and Ken Burns) hold the image at a constant
1.2x scale so there's always extra content past the frame edge to reveal as it translates —
this means they work safely regardless of the source image's aspect ratio or crop.

### Layer Modes

Each scene (or the whole Linked project) renders in one of three modes:

- **Full** (default) — background + text together, exported as a normal MP4.
- **Greenscreen** — text over a solid `#00FF00` background, no textures/cinematic finishes
  applied (they'd dirty the key). Use this when you want to composite Reel Craft's text/captions
  over your own footage in DaVinci, CapCut, or any NLE that can chroma-key.
- **Background-only** — the background/visuals with no text overlay. Use this to export a clean
  visual pass separately from the text pass, or when you plan to add captions elsewhere.

### Cinematic Finishes

Project-level toggles applied over every scene (skipped automatically in Greenscreen mode so
they don't interfere with keying):

- **Grain** — subtle film grain texture
- **Vignette** — soft darkened edge
- **Letterbox** — cinematic 2.35:1 black bars

### Languages

English and Telugu, each with a dedicated font stack (Inter/Playfair Display/Bebas Neue for
English; Baloo 2/Tiro Telugu/Ramabhadra for Telugu). Set per-scene in Manual Mode, project-level
in Linked Mode.

### Text Styles

Twelve named text styles, each a complete typographic identity — font, weight, size, letter/word
spacing, position, opacity, and its own reveal animation — chosen together so picking a style
alone produces a finished look.

| Style | Vibe | Animation |
|---|---|---|
| **Cinéma** | film · light | Reveal Mask — horizontal wipe reveal |
| **Editorial** | serif · classic | Fade Elegant — word-by-word fade + rise |
| **Impact** | bold · shout | Line by Line — one line at a time |
| **Minimal** | quiet · thin | Ghost — static, reduced opacity |
| **Neon** | glow · bold | Blur Resolve — blur-to-sharp with scale |
| **Handwritten** | script · warm | Underline Wipe — underline draws in under each word |
| **Luxury** | wide · elegant | Letter Expand — letter-spacing settles into place |
| **Street** | urban · heavy | Split Reveal — text splits top/bottom to reveal |
| **Soft** | gentle · light | Fade Elegant |
| **Cinematic Title** | epic · bold | Blur Resolve |
| **Condensed** | tight · clean | Reveal Mask |
| **Dancing** | cursive · soft | Fade Elegant |

Any of the twelve can be further tuned without leaving the style behind:

- **Font** — override with any of 12 available fonts, or leave on Auto to use the style's own.
- **Weight** — Auto / Light / Regular / Bold / Black, filtered to whatever weights the active
  font actually ships (e.g. Bebas Neue and Italiana are single-weight, so only Auto shows).
- **Size** — Auto / S / M / L / XL.
- **Position** — Auto / Top / Center / Bottom.

Set per-scene in Manual Mode (with an "Apply style to all scenes" shortcut, like Image Effect),
project-level in Linked Mode.

### Text Color Override

8 fixed swatches for manually forcing the text color, for when auto-contrast (which picks white
or dark text based on background brightness) doesn't match your creative intent. Resettable back
to auto per scene.

### Audio

- **Manual Mode**: one project-level audio track (background music) shared across all scenes.
- **Linked Mode**: the audio *is* the project — it drives total duration and caption timing.

Both support trim-start and fade-in/fade-out (0–5s) controls.

### SRT Import

- **Manual Mode**: importing an SRT generates one scene per subtitle entry, with duration
  proportional to that entry's timing (long entries are split into multiple scenes, sharing
  duration by word count).
- **Linked Mode**: the same SRT file is instead used as the transcript that captions sync to —
  timestamps map directly onto the audio timeline (adjusted for any trim).

`Whisper` is modeled as a second transcript source (`TranscriptSource`) but not yet wired up —
SRT is the only transcript input available today.

### Project Title

Sets the downloaded filename for full exports, per-scene exports, and the frame-shell PNG
export. Falls back to a timestamped default name if left blank or it sanitizes to nothing.

### Per-scene Export

Manual Mode only. Each scene in the scene list can be exported individually as its own MP4,
carrying the same cinematic finishes as the full render (skipped in Greenscreen mode).

### Prompt Templates Panel

A separate `/prompts` page with copyable prompt templates (Motivational, Personal, Political,
Cinematic, Nature, Abstract, Urban, Cultural) — reference text for briefing an AI image/video
generator or TTS tool before bringing the result into Reel Craft. Not a generation feature itself.

## Recommended Workflows

- **Quote reel with voiceover** → Linked Mode + Cinematic template + SRT transcript (e.g. from a
  TTS/captioning tool) + Halation overlay.
- **Motivational quote carousel** → Manual Mode + Minimal template + Ken Burns image effect on
  photo backgrounds.
- **Retro VHS aesthetic** → Either mode + VHS overlay + CRT Scanlines (high) + Noise (medium).
- **Green screen for DaVinci compositing** → Layer mode "Greenscreen" + any frame + export as MP4,
  then key it out in DaVinci over your own footage.
- **Multilingual reel (Telugu)** → Set language to Telugu on each scene (Manual) or project-wide
  (Linked); Minimal and Cinematic both render Telugu cleanly via the Baloo 2 / Tiro Telugu stack.
- **Photo-driven product showcase** → Manual Mode + Image Card template + Pan or Slide In effect
  per photo + Polaroid or Floating Device frame.
- **Tutorial / listicle with steps** → Manual Mode + Step Badge motion graphic per scene (Step 1/N,
  2/N, ...) + Progress Bar to show overall position.
- **Cinematic scene changes** → Manual Mode + Clapperboard transition between scenes (long
  duration) for a dramatic beat, or Crossfade for a subtler cut.

## Rendering

Rendering happens **in the browser** via WebCodecs (`@remotion/web-renderer`) — no upload, no
server round-trip. This only works reliably in Chrome or Edge. Linked-mode renders are capped at
5 minutes of audio; manual-mode duration is uncapped (it's the sum of each scene's derived or
manual duration).

If the in-browser render fails or you need something the web renderer can't handle (e.g. very
long or audio-heavy renders), fall back to the Remotion CLI, which uses real Chrome under the
hood and supports every CSS feature:

```bash
npx remotion render src/remotion.ts video out.mp4 \
  --props='{"scenes":[...],"audio":null,"finishes":{"grain":false,"vignette":false,"letterbox":false}}'
```

Mobile export is not supported — a banner warns touch users that preview works but they should
export on desktop Chrome. The download filename is derived from the project title (sanitized;
falls back to a timestamped default).

## Design Philosophy

Reel Craft is a tool for creating visual content, not a full video editor. It intentionally does
not do multi-track audio mixing, sound effects, or complex color grading — that's DaVinci
Resolve's job. Reel Craft stays focused: text, template, frame, overlay, motion, captions, export.
Handing off to a real NLE for finishing is the intended workflow, not a limitation to work around.

## Known Limitations

- Render only works reliably in Chrome/Edge (WebCodecs).
- Linked-mode render duration is capped at 5 minutes.
- Object URLs (audio, backgrounds) don't survive a page reload — the app prompts you to
  re-attach the file while keeping your trim/fade/style choices intact.
- Whisper-based transcription is modeled in the data layer but not implemented — SRT import is
  the only transcript source today.
- Only one aspect ratio: 9:16 (1080×1920).

## Roadmap

- Social UI frames (TikTok/Instagram HUD overlays)
- Whisper API integration for word-level captions without manual SRT authoring
- Project save/load as JSON (currently persisted only to browser storage)
- Additional aspect ratios beyond 9:16
