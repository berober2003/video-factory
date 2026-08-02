/**
 * DemoSignal — film 01 of the demo series. Five inbound channels stream raw
 * signal into an intake node; a packet emerges stamped RAW and rides toward
 * the TRIAGE edge. Demonstrates: fan-in lanes, traveling dots, energy-lit
 * agent card, the outbound handoff label. 12s @ 30fps = 360 frames.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { z } from "zod";
import {
  C, LABEL, MONO, ci, win, easeIO,
  Chrome, AgentCard, Chip, CaptionCycle, Hi, Stamp, filmEnvelope, CAP3_360,
} from "../shared";
import { DEMO } from "./config";

export const demoSignalSchema = z.object({ format: z.enum(["wide"]).default("wide") });
type Props = z.infer<typeof demoSignalSchema>;

export const calculateDemoSignalMetadata = () => ({
  durationInFrames: 360, fps: 30, width: 1920, height: 1080,
});

const SOURCES = ["EMAIL", "MEETINGS", "TEAM CHAT", "SHARED DOCS", "TICKET QUEUE"];
const CHIP_W = 220;
const chipPos = (i: number) => ({ x: 560, y: 320 + i * 82 });

const INTAKE = { x: 1120, y: 560 };
const IN_W = 260;
const IN_H = 112;
const PACKET = { x: 1520, y: 560 };

export const DemoSignal: React.FC<Props> = () => {
  const frame = useCurrentFrame();
  const dyn = filmEnvelope(frame);

  const STREAM = [40, 150];
  const intakeEnergy = win(frame, STREAM[0], STREAM[0] + 24, STREAM[1] + 70, STREAM[1] + 100);
  const pktIn = ci(frame, 210, 240, 0, 1, easeIO);
  const pktRide = ci(frame, 300, 350, 0, 1, easeIO);
  const stampOn = ci(frame, 246, 258, 0, 1, easeIO);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: LABEL }}>
      <Chrome config={DEMO} filmLabel="01 · SIGNAL" active={["SIGNAL"]} />

      <AbsoluteFill style={{ opacity: dyn }}>
        <svg width={1920} height={1080} style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}>
          {SOURCES.map((_, i) => {
            const cp = chipPos(i);
            return (
              <line key={`ln${i}`} x1={cp.x + CHIP_W} y1={cp.y + 16} x2={INTAKE.x - IN_W / 2 - 8} y2={INTAKE.y}
                stroke={C.line} strokeWidth={1.2} opacity={0.7} />
            );
          })}
          {SOURCES.map((_, i) =>
            [0, 1, 2].map((wave) => {
              const cp = chipPos(i);
              const sx = cp.x + CHIP_W, sy = cp.y + 16;
              const tx = INTAKE.x - IN_W / 2 - 8, ty = INTAKE.y;
              const start = STREAM[0] + i * 5 + wave * 34;
              const t = ci(frame, start, start + 30, 0, 1, easeIO);
              const vis = win(frame, start, start + 6, start + 26, start + 34);
              return vis > 0.02 ? (
                <circle key={`d${i}-${wave}`} cx={sx + (tx - sx) * t} cy={sy + (ty - sy) * t} r={3.6} fill={C.accent} opacity={vis} />
              ) : null;
            })
          )}
          <line x1={INTAKE.x + IN_W / 2 + 8} y1={INTAKE.y} x2={PACKET.x - 70} y2={PACKET.y}
            stroke={C.line} strokeWidth={1.2} opacity={0.7} />
        </svg>

        {SOURCES.map((s, i) => {
          const cp = chipPos(i);
          const appear = ci(frame, 16 + i * 5, 34 + i * 5);
          const start = STREAM[0] + i * 5;
          const pulse = win(frame, start, start + 8, start + 90, start + 108);
          return <Chip key={s} x={cp.x} y={cp.y} w={CHIP_W} text={s} lit={pulse} opacity={appear} />;
        })}
        <div style={{ position: "absolute", left: 560, top: chipPos(4).y + 48, fontFamily: MONO, fontSize: 14, color: C.inkSoft }}>
          always listening · <span style={{ color: C.accent }}>nothing filed by hand</span>
        </div>

        {pktIn > 0.02 && (
          <div
            style={{
              position: "absolute",
              left: PACKET.x - 62 + pktRide * 190,
              top: PACKET.y - 78 + (1 - pktIn) * 16,
              width: 124,
              height: 156,
              opacity: pktIn * (1 - pktRide * 0.25),
              background: C.page,
              border: `1.6px solid ${C.accent}`,
              borderRadius: 8,
              padding: 16,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: 9,
            }}
          >
            {[82, 62, 72, 52, 66, 44].map((w, i) => (
              <div key={i} style={{ height: 3, background: C.inkSoft, opacity: 0.6 - i * 0.05, width: `${w}%` }} />
            ))}
          </div>
        )}
        {stampOn > 0.02 && (
          <Stamp
            x={PACKET.x - 46 + pktRide * 190}
            y={PACKET.y + 44}
            text="RAW"
            color={C.warn}
            scale={0.8 + stampOn * 0.26}
            opacity={stampOn * (1 - pktRide * 0.25)}
          />
        )}
        <div
          style={{
            position: "absolute",
            left: PACKET.x + 40,
            top: PACKET.y + 118,
            fontFamily: MONO,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "0.1em",
            color: C.accent,
            opacity: win(frame, 300, 314, 336, 352),
          }}
        >
          → TRIAGE
        </div>
      </AbsoluteFill>

      <AgentCard x={INTAKE.x} y={INTAKE.y} w={IN_W} h={IN_H} label="INTAKE" sub="capture, verbatim" energy={intakeEnergy * dyn} />

      <CaptionCycle
        frame={frame}
        windows={CAP3_360}
        caps={[
          <>Five channels feed <Hi>one intake</Hi></>,
          <>Raw signal streams in <Hi>as it happens</Hi></>,
          <>Nothing waits. <Hi>Nothing gets lost.</Hi></>,
        ]}
      />
    </AbsoluteFill>
  );
};
