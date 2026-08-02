import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Theme } from "../themes/types";

type BackgroundProps = {
  theme: Theme;
};

const GrainOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame * 1.7;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='${Math.floor(seed)}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity: 0.06,
        mixBlendMode: "overlay",
      }}
    />
  );
};

const VignetteOverlay: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
      }}
    />
  );
};

export const Background: React.FC<BackgroundProps> = ({ theme }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      {theme.grain && <GrainOverlay />}
      {theme.vignette && <VignetteOverlay />}
    </AbsoluteFill>
  );
};
