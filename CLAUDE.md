# Video Factory

Prompt-driven Remotion studio. You (Claude) write compositions, render them
with the CLI, and verify output by extracting frames and looking at them.

## Layout

- `src/compositions/` — standalone videos (QuoteCard, DataViz). Each file:
  header comment with props + example prompts, Zod schema,
  `calculateMetadata`, registered in `src/Root.tsx`.
- `src/series/` — the Film Series Kit. `shared.tsx` is the chrome +
  primitives module; `demo/` is a working 3-film example. The full method
  lives in `.claude/skills/film-series/SKILL.md` — invoke that skill for any
  multi-stage explainer request.
- `src/themes/` — palette/typography registry (`neutral`, `ember`). Add a
  brand: new file implementing `Theme`, register in `types.ts`.
- `player/player-template.html` — double-buffered web player for series.
- `scripts/` — `render-series.sh` (sequential renders), `qa-frames.sh`
  (frame extraction for visual QA).

## Rules

- Render: `npx remotion render src/index.ts <CompositionId> out/<name>.mp4`
  (or the scripts). Renders are sequential; parallel renders fight over CPU.
- **Never ship a render nobody looked at.** Extract frames at 2+ beats per
  film (`scripts/qa-frames.sh`) and inspect them. Layout collisions only
  show up in pixels.
- Example records inside videos are fictional. Never bake real names,
  companies, amounts, or anything personal into a composition that might be
  shared.
- New composition type: follow an existing file's structure exactly (header
  comment, schema, metadata, registration). New theme: 14 tokens in one
  file.
- Preview interactively with `npm run dev` (Remotion Studio).

## Licensing note

Remotion is source-available, not MIT. This repo's own code is MIT, but
using Remotion commercially inside a company of 4+ people requires a
Remotion Company License (remotion.pro). See README → Licensing.
