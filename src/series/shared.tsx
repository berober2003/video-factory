/**
 * series/shared — the Film Series Kit's shared chrome + primitives.
 *
 * A film series is a set of short films (one per stage of a process) that
 * chain into one continuous machine. Four mechanics make the seams vanish:
 *
 *   1. Every film renders this SAME chrome at identical pixels — title, a
 *      stage rail (only the active chip changes per film), and a footer stat
 *      line. Cuts read as the process advancing, not scene changes.
 *   2. Each film's dynamic layer fades through the background at both ends
 *      (filmEnvelope), so every cut lands on a chrome-only frame.
 *   3. The last film's final beat hands off to the first film's opening
 *      (e.g. a token rides toward stage 1's rail chip). The loop closes
 *      narratively, not just mechanically.
 *   4. Web playback is double-buffered (see player/player-template.html).
 *
 * Configure your series once in a config object (title, stages, footer) and
 * pass it to <Chrome>. Swap the token palette below for your brand.
 */

import React from "react";
import { interpolate, Easing } from "remotion";

// ---- tokens (edit these for your brand) -----------------------------------
export const C = {
  bg: "#1B1815",
  panel: "#242019",
  page: "#2A251E",
  ink: "#F5F0EB", // primary text
  inkSoft: "#A89E93",
  accent: "#D08A4A", // copper
  good: "#5FA378", // green
  warn: "#D4A84B", // gold
  bad: "#C2604D", // red
  line: "#3D372F",
};
export const LABEL = "Inter, system-ui, sans-serif";
export const MONO = "'IBM Plex Mono', 'JetBrains Mono', monospace";

// ---- series config ---------------------------------------------------------
export type SeriesConfig = {
  title: string; // "ACME" — left segment of the header
  subtitle: string; // "HOW ORDERS FLOW" — middle segment
  stages: readonly string[]; // rail chips, one per film
  footer: React.ReactNode; // stat line, identical in every film
};

// ---- helpers ---------------------------------------------------------------
/** clamped interpolate: 0→1 (or from→to) between frames a and b */
export const ci = (
  frame: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  easing: (n: number) => number = Easing.linear
): number =>
  interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** windowed pulse: rises a→b, holds, falls c→d */
export const win = (frame: number, a: number, b: number, c: number, d: number) =>
  Math.min(ci(frame, a, b), ci(frame, c, d, 1, 0));

/** point on a quadratic bezier, t in [0,1] */
export const qbez = (
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number }
) => ({
  x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
  y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y,
});

export const easeIO = Easing.inOut(Easing.cubic);

/** dynamic-layer envelope: fade in over first 20 frames, out over last 20 */
export const filmEnvelope = (frame: number, duration = 360) =>
  Math.min(ci(frame, 0, 20), ci(frame, duration - 20, duration, 1, 0));

/** standard caption windows for a 360-frame film (3 captions cycling) */
export const CAP3_360: [number, number, number, number][] = [
  [8, 28, 100, 122],
  [130, 152, 218, 240],
  [248, 270, 330, 350],
];

// ---- chrome ----------------------------------------------------------------
// Static per film: title, rail (active chips lit), footer. Identical geometry
// across every film so cuts land on matching frames.
export const Chrome: React.FC<{
  config: SeriesConfig;
  filmLabel: string; // "01 · SIGNAL"
  active: string[];
}> = ({ config, filmLabel, active }) => (
  <>
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 72,
        fontFamily: LABEL,
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: "0.26em",
        color: C.ink,
      }}
    >
      {config.title}
      <span style={{ color: C.accent }}> · </span>
      <span style={{ color: C.inkSoft }}>{config.subtitle}</span>
      <span style={{ color: C.accent }}> · </span>
      <span style={{ color: C.inkSoft }}>{filmLabel}</span>
    </div>
    <div style={{ position: "absolute", top: 94, left: 72, width: 336, height: 2, background: C.line }} />
    <div
      style={{
        position: "absolute",
        top: 158,
        left: 72,
        right: 72,
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      {config.stages.map((s, i) => {
        const isActive = active.includes(s);
        return (
          <React.Fragment key={s}>
            {i > 0 && <div style={{ width: 22, height: 1.5, background: C.line, flexShrink: 0 }} />}
            <div
              style={{
                fontFamily: LABEL,
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: "0.12em",
                padding: "7px 16px 8px",
                borderRadius: 99,
                border: `1.5px solid ${isActive ? C.accent : C.line}`,
                background: isActive ? C.accent : "transparent",
                color: isActive ? C.bg : C.inkSoft,
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </div>
          </React.Fragment>
        );
      })}
    </div>
    <div
      style={{
        position: "absolute",
        left: 72,
        bottom: 56,
        fontFamily: MONO,
        fontSize: 15,
        color: C.inkSoft,
        letterSpacing: "0.04em",
      }}
    >
      {config.footer}
    </div>
  </>
);

// ---- primitives ------------------------------------------------------------
/** central processing node: lights up and lifts while energy > 0 */
export const AgentCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  energy: number;
  accent?: string;
}> = ({ x, y, w, h, label, sub, energy, accent = C.accent }) => {
  const lit = energy > 0.12;
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2 - Math.max(0, energy - 0.12) * 5,
        width: w,
        height: h,
        background: C.panel,
        border: `1.5px solid ${lit ? accent : C.line}`,
        borderRadius: 12,
        boxShadow: lit ? `0 8px 26px rgba(0,0,0,${0.2 + energy * 0.2})` : "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
      }}
    >
      <span
        style={{
          fontFamily: LABEL,
          fontWeight: 600,
          fontSize: 16,
          letterSpacing: "0.07em",
          color: C.ink,
          textAlign: "center",
        }}
      >
        {label}
      </span>
      {sub && (
        <div
          style={{
            fontFamily: LABEL,
            fontWeight: 500,
            fontSize: 12,
            letterSpacing: "0.05em",
            color: C.inkSoft,
            textAlign: "center",
            maxWidth: w - 28,
            lineHeight: 1.35,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

/** labeled source/target chip with a status dot */
export const Chip: React.FC<{
  x: number;
  y: number;
  w: number;
  text: string;
  lit?: number;
  accent?: string;
  opacity?: number;
  mono?: boolean;
}> = ({ x, y, w, text, lit = 0, accent = C.accent, opacity = 1, mono = false }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: 32,
      opacity,
      background: C.panel,
      border: `1px solid ${lit > 0.15 ? accent : C.line}`,
      borderRadius: 6,
      padding: "0 10px",
      display: "flex",
      alignItems: "center",
      gap: 8,
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        width: 6,
        height: 6,
        borderRadius: 99,
        background: accent,
        opacity: 0.4 + lit * 0.6,
        flexShrink: 0,
      }}
    />
    <span
      style={{
        fontFamily: mono ? MONO : LABEL,
        fontWeight: 600,
        fontSize: 12,
        letterSpacing: "0.06em",
        color: C.ink,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {text}
    </span>
  </div>
);

/** typed record: type badge + title line */
export const EntityCard: React.FC<{
  x: number;
  y: number;
  w: number;
  type: string;
  title: string;
  accent?: string;
  opacity?: number;
  lit?: boolean;
}> = ({ x, y, w, type, title, accent = C.accent, opacity = 1, lit = false }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      opacity,
      background: C.panel,
      border: `1.5px solid ${lit ? accent : C.line}`,
      borderRadius: 10,
      padding: "10px 14px",
      boxSizing: "border-box",
      boxShadow: lit ? "0 8px 22px rgba(0,0,0,0.28)" : "none",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 10.5,
          letterSpacing: "0.1em",
          color: C.bg,
          background: accent,
          borderRadius: 4,
          padding: "2px 7px 3px",
        }}
      >
        {type}
      </span>
      <span
        style={{
          fontFamily: LABEL,
          fontWeight: 600,
          fontSize: 13.5,
          color: C.ink,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </span>
    </div>
  </div>
);

/** rotated rubber stamp (RAW / APPROVED / SUPERSEDED …) */
export const Stamp: React.FC<{
  x: number;
  y: number;
  text: string;
  color: string;
  scale: number;
  opacity: number;
}> = ({ x, y, text, color, scale, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `rotate(-7deg) scale(${Math.min(scale, 1.06)})`,
      opacity,
      border: `3px solid ${color}`,
      borderRadius: 8,
      padding: "6px 18px 7px",
      fontFamily: LABEL,
      fontWeight: 700,
      fontSize: 26,
      letterSpacing: "0.16em",
      color,
      background: `${C.bg}E8`,
      whiteSpace: "nowrap",
      zIndex: 5,
    }}
  >
    {text}
  </div>
);

/** accent-colored key word inside a big caption */
export const Hi: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: C.accent }}>{children}</span>
);

/** large left-panel caption */
export const BigCap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: LABEL,
      fontWeight: 600,
      fontSize: 44,
      lineHeight: 1.16,
      letterSpacing: "-0.01em",
      color: C.ink,
    }}
  >
    {children}
  </div>
);

/** three captions cycling in the left column — one idea each */
export const CaptionCycle: React.FC<{
  frame: number;
  windows: [number, number, number, number][];
  caps: React.ReactNode[];
  top?: number;
}> = ({ frame, windows, caps, top = 388 }) => (
  <div style={{ position: "absolute", left: 72, top, width: 400, height: 420 }}>
    {caps.map((cap, i) => {
      const o = win(frame, ...windows[i]);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            opacity: o,
            transform: `translateY(${(1 - o) * 14}px)`,
          }}
        >
          <BigCap>{cap}</BigCap>
        </div>
      );
    })}
  </div>
);
