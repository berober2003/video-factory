/**
 * Demo series config — a generic "how work flows" pipeline in three stages.
 * This object is the single source of the chrome every demo film renders.
 * Copy this folder to start your own series: change the config, keep the
 * mechanics.
 */

import { C, type SeriesConfig } from "../shared";

export const DEMO: SeriesConfig = {
  title: "VIDEO FACTORY",
  subtitle: "HOW WORK FLOWS",
  stages: ["SIGNAL", "TRIAGE", "SHIP"] as const,
  footer: (
    <>
      <span style={{ color: C.accent, fontWeight: 600 }}>3 films</span>
      {" · one shared chrome · 12s each · "}
      <span style={{ color: C.good, fontWeight: 600 }}>cuts land on matching frames</span>
    </>
  ),
};
