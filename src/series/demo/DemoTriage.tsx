/**
 * DemoTriage — film 02 of the demo series. The RAW packet rides in from the
 * left; a triage agent reads it against grounding context (team roster,
 * priorities); typed records emerge on the right. Demonstrates: inbound
 * carry-over from the previous film, a scan-line read, staggered typed
 * outputs. 12s @ 30fps = 360 frames.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { z } from "zod";
import {
  C, LABEL, MONO, ci, win, easeIO,
  Chrome, AgentCard, Chip, EntityCard, CaptionCycle, Hi, filmEnvelope, CAP3_360,
} from "../shared";
import { DEMO } from "./config";

export const demoTriageSchema = z.object({ format: z.enum(["wide"]).default("wide") });
type Props = z.infer<typeof demoTriageSchema>;

export const calculateDemoTriageMetadata = () => ({
  durationInFrames: 360, fps: 30, width: 1920, height: 1080,
});

const AGENT = { x: 1050, y: 560 };
const AG_W = 280;
const AG_H = 122;

const GROUNDING = ["TEAM ROSTER", "THIS QUARTER'S PRIORITIES", "OPEN THREADS"];
const GR_W = 230;
const grPos = (i: number) => ({ x: 950, y: 790 + i * 46 });

// example records are fictional
const OUT = [
  { type: "TICKET", title: "Renew the TLS certificates", accent: C.accent },
  { type: "TASK", title: "Draft the vendor shortlist", accent: C.warn },
  { type: "DECISION", title: "Staging mirrors prod config", accent: C.good },
  { type: "FOLLOW-UP", title: "Ping legal about the DPA", accent: C.bad },
];
const OUT_W = 340;
const outPos = (i: number) => ({ x: 1430, y: 350 + i * 100 });

export const DemoTriage: React.FC<Props> = () => {
  const frame = useCurrentFrame();
  const dyn = filmEnvelope(frame);

  const pktRide = ci(frame, 20, 68, 0, 1, easeIO);
  const readOn = win(frame, 70, 84, 200, 224);
  const agEnergy = win(frame, 62, 84, 300, 330);
  const entIn = (i: number) => ci(frame, 170 + i * 30, 196 + i * 30, 0, 1, easeIO);

  const pktX = 560 + pktRide * (AGENT.x - AG_W / 2 - 136 - 560);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: LABEL }}>
      <Chrome config={DEMO} filmLabel="02 · TRIAGE" active={["TRIAGE"]} />

      <AbsoluteFill style={{ opacity: dyn }}>
        <svg width={1920} height={1080} style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}>
          {OUT.map((_, i) => {
            const op = outPos(i);
            return (
              <line key={`ol${i}`} x1={AGENT.x + AG_W / 2 + 8} y1={AGENT.y} x2={op.x - 10} y2={op.y + 20}
                stroke={C.line} strokeWidth={1.2} opacity={0.7} />
            );
          })}
          {GROUNDING.map((_, i) => {
            const gp = grPos(i);
            return (
              <line key={`gl${i}`} x1={gp.x + GR_W / 2} y1={gp.y} x2={AGENT.x} y2={AGENT.y + AG_H / 2 + 6}
                stroke={C.good} strokeWidth={1.2} opacity={0.4} />
            );
          })}
          {OUT.map((_, i) => {
            const op = outPos(i);
            const start = 164 + i * 30;
            const t = ci(frame, start, start + 24, 0, 1, easeIO);
            const vis = win(frame, start, start + 5, start + 19, start + 26);
            const sx = AGENT.x + AG_W / 2 + 8, sy = AGENT.y;
            return vis > 0.02 ? (
              <circle key={`od${i}`} cx={sx + (op.x - 10 - sx) * t} cy={sy + (op.y + 20 - sy) * t} r={3.6}
                fill={OUT[i].accent} opacity={vis} />
            ) : null;
          })}
        </svg>

        {/* raw packet riding in */}
        <div
          style={{
            position: "absolute",
            left: pktX,
            top: AGENT.y - 74,
            width: 118,
            height: 148,
            opacity: Math.min(ci(frame, 12, 26), 1 - ci(frame, 150, 178)),
            background: C.page,
            border: `1.6px solid ${C.warn}`,
            borderRadius: 8,
            padding: 15,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.warn, fontWeight: 700 }}>RAW</div>
          {[80, 62, 72, 52, 64].map((w, i) => (
            <div key={i} style={{ height: 3, background: C.inkSoft, opacity: 0.55, width: `${w}%` }} />
          ))}
        </div>

        {/* scan line while reading */}
        {readOn > 0.02 && (
          <div
            style={{
              position: "absolute",
              left: AGENT.x - AG_W / 2 + 12,
              top: AGENT.y - AG_H / 2 + 14 + ((frame * 3.1) % (AG_H - 30)),
              width: AG_W - 24,
              height: 2,
              background: C.accent,
              opacity: readOn * 0.85,
              zIndex: 4,
            }}
          />
        )}

        {GROUNDING.map((g, i) => {
          const gp = grPos(i);
          const appear = ci(frame, 40 + i * 10, 58 + i * 10);
          const pulse = win(frame, 80 + i * 12, 92 + i * 12, 180, 204);
          return (
            <Chip key={g} x={gp.x - GR_W / 2} y={gp.y - 16} w={GR_W} text={g} lit={pulse} accent={C.good} opacity={appear} />
          );
        })}
        <div style={{ position: "absolute", left: grPos(2).x - GR_W / 2, top: grPos(2).y + 34, fontFamily: MONO, fontSize: 13.5, color: C.inkSoft }}>
          grounded read · <span style={{ color: C.good }}>whole source, not keywords</span>
        </div>

        {OUT.map((o, i) => {
          const op = outPos(i);
          const a = entIn(i);
          return a > 0.02 ? (
            <div key={o.type} style={{ opacity: a, transform: `translateY(${(1 - a) * 14}px)` }}>
              <EntityCard x={op.x} y={op.y} w={OUT_W} type={o.type} title={o.title} accent={o.accent}
                lit={win(frame, 196 + i * 30, 206 + i * 30, 300, 330) > 0.15} />
            </div>
          ) : null;
        })}
        <div
          style={{
            position: "absolute",
            left: outPos(3).x,
            top: outPos(3).y + 58,
            width: OUT_W,
            fontFamily: MONO,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: C.accent,
            opacity: win(frame, 306, 320, 336, 352),
          }}
        >
          TYPED RECORDS → SHIP
        </div>
      </AbsoluteFill>

      <AgentCard x={AGENT.x} y={AGENT.y} w={AG_W} h={AG_H} label="TRIAGE AGENT" sub="reads the source whole" energy={agEnergy * dyn} />

      <CaptionCycle
        frame={frame}
        windows={CAP3_360}
        caps={[
          <>An agent <Hi>reads each packet</Hi>, start to finish</>,
          <>Grounded in the team's <Hi>roster and priorities</Hi></>,
          <>Out come <Hi>typed records</Hi>, not text blobs</>,
        ]}
      />
    </AbsoluteFill>
  );
};
