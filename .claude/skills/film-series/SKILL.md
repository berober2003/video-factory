---
name: film-series
description: Build a chained film series — short Remotion films, one per stage of a process, engineered so playback reads as one continuous machine. Use when asked to explain a pipeline, workflow, customer journey, or product tour as video, or when a single long explainer video would be a monolith.
---

# Film Series — chained process explainers

A film series turns a multi-stage process into short films (~12s each) that
chain seamlessly. One long video is a monolith: slow to render, painful to
revise one beat, no random access. A series feels like one continuous machine
because the seams are engineered away.

Reference implementation: `src/series/` (shared.tsx = the kit,
`src/series/demo/` = a 3-film example). Study the demo films before writing
new ones — every mechanic below is demonstrated there.

## The four mechanics (all required)

1. **One shared chrome, identical geometry in every film.** Title, a stage
   rail (one chip per film), and a footer render at the same pixels across
   all films; only the active chip changes. Cuts read as the process
   advancing, not scene changes. Use `Chrome` from `src/series/shared.tsx`
   with one `SeriesConfig` object shared by every film.
2. **Scene layers fade through the background at both ends.** Wrap each
   film's dynamic layer in `filmEnvelope` (20-frame in/out) so every cut
   lands on a chrome-only frame.
3. **The last film hands off to the first.** Its final beat sends a token
   arcing back to stage 1's rail chip (see `DemoShip`). The loop closes
   narratively, not just mechanically.
4. **Web playback is double-buffered.** Copy `player/player-template.html`:
   two stacked muted `<video>` elements, the hidden one preloads the next
   film, swap on `ended`, clickable stage rail for random access.

## Building a new series

1. Create `src/series/<name>/config.tsx` — one `SeriesConfig` (title,
   subtitle, stages, footer). Every film imports it.
2. One film per stage, `360` frames @ 30fps, 1920x1080. Same fps and
   dimensions across all films — non-negotiable. A centerpiece film may run
   longer (e.g. 540 frames); everything else stays 360.
3. Compose scenes from the shared primitives: `AgentCard` (processing
   nodes), `Chip` (sources/targets), `EntityCard` (typed records), `Stamp`
   (RAW/APPROVED/...), traveling dots along SVG lanes (see the demo films'
   dot pattern), `CaptionCycle` with `CAP3_360` for the three left-panel
   captions.
4. Captions carry the narration: three per film, one idea each, plain
   language. No em dashes.
5. Register each film in `src/Root.tsx` (copy a demo `<Composition>` line).
6. If real names, projects, companies, or amounts appear in example records,
   replace them with fictional ones that match the audience (enterprise
   examples for enterprise viewers). Mark the page/footer "example records
   are illustrative."

## Render and verify

```bash
./scripts/render-series.sh Film1 Film2 Film3
./scripts/qa-frames.sh
```

Then READ the frames in `out/qa/` and actually look at them before shipping.
This is the step that catches real defects — text overflowing a card,
labels colliding, a packet stopping under a node, one-word-per-line wraps.
Layout collisions only show up in pixels. If you have vision, look yourself;
if not, make a human look. Fix, re-render only the changed films, re-check.

## Ship

Copy the mp4s next to a copy of `player/player-template.html`, set its
`FILMS` list and palette variables, and host the folder anywhere static.

## Tuning knobs

- Segment length: 360f is the proven default; don't go under ~300f or
  captions get rushed.
- Beat timing inside a film: entrance ~f16-40, main action ~f40-200,
  payoff ~f200-300, outbound handoff ~f300-352.
- Palette: edit the `C` tokens in `src/series/shared.tsx` (dark) or fork the
  module for a light variant — keep contrast: on dark backgrounds, brighten
  the accent and use black-based shadows.
