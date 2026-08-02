/**
 * DemoShip — film 03 of the demo series, the closing film. Typed records fan
 * out to the surfaces where the team works; the final beat emits a token
 * that arcs back to the SIGNAL chip on the rail, where film 01 begins.
 * Demonstrates: the closing-handoff mechanic that makes the series loop.
 * 12s @ 30fps = 360 frames.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { z } from "zod";
import {
  C, LABEL, MONO, ci, win, qbez, easeIO,
  Chrome, AgentCard, CaptionCycle, Hi, filmEnvelope, CAP3_360,
} from "../shared";
import { DEMO } from "./config";

export const demoShipSchema = z.object({ format: z.enum(["wide"]).default("wide") });
type Props = z.infer<typeof demoShipSchema>;

export const calculateDemoShipMetadata = () => ({
  durationInFrames: 360, fps: 30, width: 1920, height: 1080,
});

const HUB = { x: 700, y: 560 };
const H_W = 250;
const H_H = 112;

const SURFACES = [
  { label: "TEAM DASHBOARD", sub: "live status, always current" },
  { label: "WEEKLY DIGEST", sub: "what shipped, what's stuck" },
  { label: "ALERTS", sub: "only when something breaks" },
  { label: "STANDUP NOTES", sub: "pre-written from the record" },
];
const S_W = 330;
const S_H = 96;
const sPos = (i: number) => ({ x: 1360, y: 330 + i * 140 });

// SIGNAL chip on the rail — the handoff target where film 01 begins
const RAIL_TARGET = { x: 122, y: 176 };

export const DemoShip: React.FC<Props> = () => {
  const frame = useCurrentFrame();
  const dyn = filmEnvelope(frame);

  const hubEnergy = win(frame, 30, 50, 280, 310);
  const surfIn = (i: number) => ci(frame, 60 + i * 28, 86 + i * 28, 0, 1, easeIO);

  const HAND = [268, 344] as const;
  const handT = ci(frame, HAND[0], HAND[1], 0, 1, easeIO);
  const src = { x: sPos(0).x - S_W / 2, y: sPos(0).y };
  const ctrl = { x: 700, y: 120 };
  const tokenP = qbez(handT, src, ctrl, RAIL_TARGET);
  const tokenVis = win(frame, HAND[0], HAND[0] + 8, HAND[1] - 4, HAND[1] + 8);
  const chipGlow = win(frame, 330, 342, 352, 360);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: LABEL }}>
      <Chrome config={DEMO} filmLabel="03 · SHIP" active={["SHIP"]} />

      <AbsoluteFill style={{ opacity: dyn }}>
        <svg width={1920} height={1080} style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}>
          {SURFACES.map((_, i) => {
            const sp = sPos(i);
            return (
              <line key={`sl${i}`} x1={HUB.x + H_W / 2 + 8} y1={HUB.y} x2={sp.x - S_W / 2 - 8} y2={sp.y}
                stroke={C.line} strokeWidth={1.2} opacity={0.7} />
            );
          })}
          {SURFACES.map((_, i) =>
            [0, 1].map((wave) => {
              const sp = sPos(i);
              const sx = HUB.x + H_W / 2 + 8, sy = HUB.y;
              const tx = sp.x - S_W / 2 - 8, ty = sp.y;
              const start = 60 + i * 12 + wave * 70;
              const t = ci(frame, start, start + 28, 0, 1, easeIO);
              const vis = win(frame, start, start + 5, start + 23, start + 30);
              return vis > 0.02 ? (
                <circle key={`sd${i}-${wave}`} cx={sx + (tx - sx) * t} cy={sy + (ty - sy) * t} r={3.6} fill={C.accent} opacity={vis} />
              ) : null;
            })
          )}
          {tokenVis > 0.02 && (
            <>
              <path
                d={`M ${src.x} ${src.y} Q ${ctrl.x} ${ctrl.y} ${RAIL_TARGET.x} ${RAIL_TARGET.y}`}
                fill="none" stroke={C.accent} strokeWidth={1.5} opacity={tokenVis * 0.3} strokeDasharray="4 7"
              />
              <circle cx={tokenP.x} cy={tokenP.y} r={7} fill={C.accent} opacity={tokenVis} />
              <circle cx={tokenP.x} cy={tokenP.y} r={13} fill="none" stroke={C.accent} strokeWidth={1.5} opacity={tokenVis * 0.5} />
            </>
          )}
          {chipGlow > 0.02 && (
            <circle cx={RAIL_TARGET.x} cy={RAIL_TARGET.y} r={54} fill="none" stroke={C.accent} strokeWidth={2} opacity={chipGlow * 0.7} />
          )}
        </svg>

        {SURFACES.map((s, i) => {
          const a = surfIn(i);
          const sp = sPos(i);
          const lit = win(frame, 90 + i * 12, 104 + i * 12, 280, 310) > 0.15;
          return a > 0.02 ? (
            <div key={s.label} style={{
              position: "absolute", left: sp.x - S_W / 2, top: sp.y - S_H / 2 + (1 - a) * 16,
              width: S_W, height: S_H, opacity: a,
              background: C.panel, border: `1.5px solid ${lit ? C.accent : C.line}`, borderRadius: 12,
              padding: "16px 20px", boxSizing: "border-box",
              boxShadow: lit ? "0 8px 22px rgba(0,0,0,0.28)" : "none",
            }}>
              <div style={{ fontFamily: LABEL, fontWeight: 600, fontSize: 16, letterSpacing: "0.07em", color: C.ink }}>
                {s.label}
              </div>
              <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 12, color: C.inkSoft, letterSpacing: "0.03em" }}>
                {s.sub}
              </div>
            </div>
          ) : null;
        })}

        <div style={{
          position: "absolute", left: 560, top: 300, fontFamily: MONO, fontSize: 14.5, fontWeight: 600,
          letterSpacing: "0.08em", color: C.accent, opacity: win(frame, 286, 300, 340, 356),
        }}>
          shipping generates new signal → SIGNAL
        </div>
      </AbsoluteFill>

      <AgentCard x={HUB.x} y={HUB.y} w={H_W} h={H_H} label="THE RECORD" sub="one source of truth" energy={hubEnergy * dyn} />

      <CaptionCycle
        frame={frame}
        windows={CAP3_360}
        caps={[
          <>The record feeds <Hi>every surface</Hi></>,
          <>Dashboards, digests, <Hi>alerts</Hi></>,
          <>And shipping <Hi>starts the loop again</Hi></>,
        ]}
      />
    </AbsoluteFill>
  );
};
