/**
 * DataViz — Animated data visualization
 *
 * Props:
 *   vizType ("counter" | "bar-chart" | "comparison" | "progress")
 *   title (string) — headline above the visualization
 *   data (array of { label, value, color? }) — the data to visualize
 *   theme (string, default "neutral") — theme name
 *   format ("square" | "wide", default "square") — output dimensions
 *   suffix (string, optional) — unit label for counters ("%", "x", "M")
 *   source (string, optional) — data source attribution
 *
 * Example prompts:
 *   "Data viz counter: 47% cost reduction, source McKinsey 2026"
 *   "Bar chart showing React 45%, Vue 28%, Svelte 15%, Angular 12%"
 *   "Comparison: Before 120 hours, After 8 hours, title Manual vs AI"
 */

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { z } from "zod";
import { useTheme } from "../themes/types";
import type { Theme } from "../themes/types";
import { Background } from "../components/Background";
import { FadeInOut } from "../components/FadeInOut";
import { resolveFontFamily } from "../lib/fonts";
import { useCountUp } from "../lib/animations";

const dataItemSchema = z.object({
  label: z.string(),
  value: z.number(),
  color: z.string().optional(),
});

export const dataVizSchema = z.object({
  vizType: z.enum(["counter", "bar-chart", "comparison", "progress"]),
  title: z.string(),
  data: z.array(dataItemSchema),
  theme: z.string().default("neutral"),
  format: z.enum(["square", "wide"]).default("square"),
  suffix: z.string().optional(),
  source: z.string().optional(),
});

export type DataVizProps = z.infer<typeof dataVizSchema>;

export const calculateDataVizMetadata = ({
  props,
}: {
  props: DataVizProps;
}) => {
  const fps = 30;
  const durationInFrames = 180;
  const dimensions =
    props.format === "wide"
      ? { width: 1920, height: 1080 }
      : { width: 1080, height: 1080 };
  return { durationInFrames, fps, ...dimensions };
};

type VizSubProps = {
  data: z.infer<typeof dataItemSchema>[];
  suffix?: string;
  theme: Theme;
};

const Counter: React.FC<VizSubProps> = ({ data, suffix, theme }) => {
  const { width, height } = useVideoConfig();
  const isSquare = width === height;
  const item = data[0];
  if (!item) return null;
  const count = useCountUp(15, 105, item.value);

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: isSquare ? 120 : 140, fontWeight: "bold", fontFamily: resolveFontFamily(theme.fontHeading), color: item.color ?? theme.accent, lineHeight: 1 }}>
        {count}
        {suffix && <span style={{ fontSize: isSquare ? 60 : 70 }}>{suffix}</span>}
      </div>
      {item.label && (
        <div style={{ marginTop: 16, fontSize: isSquare ? 24 : 28, fontFamily: resolveFontFamily(theme.fontBody), color: theme.textMuted }}>
          {item.label}
        </div>
      )}
    </div>
  );
};

const BarChart: React.FC<VizSubProps> = ({ data, suffix, theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isSquare = width === height;
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isSquare ? 20 : 24, width: "100%", maxWidth: isSquare ? 800 : 1200 }}>
      {data.map((item, i) => {
        const barStart = 30 + i * 12;
        const progress = spring({ frame: frame - barStart, fps, config: { damping: 20, stiffness: 100 } });
        const barWidth = interpolate(progress, [0, 1], [0, (item.value / maxValue) * 100]);
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontFamily: resolveFontFamily(theme.fontBody), fontSize: isSquare ? 18 : 22, color: theme.text, opacity: progress }}>
              <span>{item.label}</span>
              <span style={{ color: theme.textMuted }}>{Math.round(item.value * progress)}{suffix}</span>
            </div>
            <div style={{ height: isSquare ? 32 : 40, backgroundColor: theme.backgroundAlt, borderRadius: theme.borderRadius, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${barWidth}%`, backgroundColor: item.color ?? theme.accent, borderRadius: theme.borderRadius }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Comparison: React.FC<VizSubProps> = ({ data, suffix, theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isSquare = width === height;
  const left = data[0];
  const right = data[1];
  if (!left || !right) return null;

  const leftProgress = spring({ frame: frame - 20, fps, config: { damping: 18, stiffness: 100 } });
  const rightProgress = spring({ frame: frame - 35, fps, config: { damping: 18, stiffness: 100 } });
  const vsProgress = spring({ frame: frame - 50, fps, config: { damping: 20, stiffness: 120 } });

  const itemStyle = (progress: number, fromLeft: boolean) => ({
    opacity: progress,
    transform: `translateX(${interpolate(progress, [0, 1], [fromLeft ? -40 : 40, 0])}px)`,
    textAlign: "center" as const,
    flex: 1,
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: isSquare ? 40 : 60, width: "100%", maxWidth: isSquare ? 800 : 1200 }}>
      <div style={itemStyle(leftProgress, true)}>
        <div style={{ fontSize: isSquare ? 72 : 84, fontWeight: "bold", fontFamily: resolveFontFamily(theme.fontHeading), color: theme.textMuted, lineHeight: 1 }}>
          {Math.round(left.value * leftProgress)}{suffix}
        </div>
        <div style={{ marginTop: 12, fontSize: isSquare ? 22 : 26, fontFamily: resolveFontFamily(theme.fontBody), color: theme.textMuted }}>
          {left.label}
        </div>
      </div>
      <div style={{ opacity: vsProgress, fontSize: isSquare ? 28 : 32, fontFamily: resolveFontFamily(theme.fontBody), color: theme.textMuted }}>
        vs
      </div>
      <div style={itemStyle(rightProgress, false)}>
        <div style={{ fontSize: isSquare ? 72 : 84, fontWeight: "bold", fontFamily: resolveFontFamily(theme.fontHeading), color: right.color ?? theme.accent, lineHeight: 1 }}>
          {Math.round(right.value * rightProgress)}{suffix}
        </div>
        <div style={{ marginTop: 12, fontSize: isSquare ? 22 : 26, fontFamily: resolveFontFamily(theme.fontBody), color: theme.text }}>
          {right.label}
        </div>
      </div>
    </div>
  );
};

const Progress: React.FC<VizSubProps> = ({ data, suffix, theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isSquare = width === height;
  const item = data[0];
  if (!item) return null;

  const progress = spring({ frame: frame - 20, fps, config: { damping: 25, stiffness: 80 } });
  const fillWidth = interpolate(progress, [0, 1], [0, Math.min(item.value, 100)]);
  const displayValue = Math.round(item.value * progress);

  return (
    <div style={{ width: "100%", maxWidth: isSquare ? 800 : 1200, textAlign: "center" }}>
      <div style={{ fontSize: isSquare ? 72 : 84, fontWeight: "bold", fontFamily: resolveFontFamily(theme.fontHeading), color: theme.accent, lineHeight: 1, marginBottom: 24 }}>
        {displayValue}{suffix ?? "%"}
      </div>
      <div style={{ height: isSquare ? 24 : 32, backgroundColor: theme.backgroundAlt, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${fillWidth}%`, backgroundColor: item.color ?? theme.accent, borderRadius: 999 }} />
      </div>
      {item.label && (
        <div style={{ marginTop: 16, fontSize: isSquare ? 22 : 26, fontFamily: resolveFontFamily(theme.fontBody), color: theme.textMuted, opacity: progress }}>
          {item.label}
        </div>
      )}
    </div>
  );
};

export const DataViz: React.FC<DataVizProps> = ({ vizType, title, data, theme: themeName, suffix, source }) => {
  const theme = useTheme(themeName);
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const isSquare = width === height;

  const titleProgress = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 120 } });
  const sourceStart = durationInFrames - 75;
  const sourceProgress = source ? spring({ frame: frame - sourceStart, fps, config: { damping: 20, stiffness: 120 } }) : 0;

  const VizComponent = { counter: Counter, "bar-chart": BarChart, comparison: Comparison, progress: Progress }[vizType];

  return (
    <FadeInOut fadeInFrames={15} fadeOutFrames={15}>
      <Background theme={theme} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: isSquare ? "80px" : "80px 160px", gap: isSquare ? 40 : 48 }}>
        <div style={{ opacity: titleProgress, transform: `translateY(${interpolate(titleProgress, [0, 1], [15, 0])}px)`, fontSize: isSquare ? 36 : 42, fontFamily: resolveFontFamily(theme.fontHeading), color: theme.text, textAlign: "center", fontWeight: "bold" }}>
          {title}
        </div>
        <VizComponent data={data} suffix={suffix} theme={theme} />
        {source && (
          <div style={{ opacity: sourceProgress, fontSize: isSquare ? 16 : 18, fontFamily: resolveFontFamily(theme.fontBody), color: theme.textMuted, position: "absolute", bottom: isSquare ? 40 : 48 }}>
            Source: {source}
          </div>
        )}
      </AbsoluteFill>
    </FadeInOut>
  );
};
