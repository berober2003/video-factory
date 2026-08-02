# Video Factory — Plan

## What it is

The public edition of Ben's private Remotion studio: a prompt-driven video
factory designed to be operated by Claude Code, with the Film Series Kit
(chained process-explainer films) as its flagship element. Public portfolio
piece at github.com/berober2003/video-factory.

## Current status

v1.0.0 — initial public release. Themed compositions (QuoteCard, DataViz),
two themes (neutral, ember), the Film Series Kit with a 3-film demo series,
double-buffered player template, render + frame-QA scripts, and the
`film-series` project-scoped skill.

## Architecture

- Remotion 4.x, React 19, Tailwind v4, Zod schemas per composition.
- Theme registry: 14-token `Theme` objects in `src/themes/`.
- Film Series Kit: `src/series/shared.tsx` (tokens + Chrome + motion helpers
  + scene primitives), per-series config objects, one file per film.
- Agent operation: `CLAUDE.md` (house rules) + `.claude/skills/film-series/`
  (the method). The visual QA loop (render → extract frames → look → fix) is
  a hard rule, not a suggestion.
- Relationship to the private repo: this is an extraction, not a mirror.
  The private `remotion-studio` keeps proprietary compositions (B4, CP,
  client/brand work); improvements to the kit should be made here first and
  copied inward.

## Key files

- `src/series/shared.tsx` — the kit
- `src/series/demo/` — reference series (fan-in / transform / fan-out+handoff)
- `player/player-template.html` — gapless chained playback
- `.claude/skills/film-series/SKILL.md` — the method
- `scripts/render-series.sh`, `scripts/qa-frames.sh`

## Next steps

- Light-palette variant of the series tokens
- A second example series rendered as a GIF in the README
- Optional: package the skill as a Claude Code plugin for centralized
  distribution inside a company
