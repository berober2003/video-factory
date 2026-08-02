import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const useFadeIn = (startFrame: number, durationFrames: number = 15) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const useFadeOut = (startFrame: number, durationFrames: number = 15) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
};

export const useSlideIn = (
  startFrame: number,
  direction: "up" | "down" | "left" | "right" = "up",
  distance: number = 40
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  const offsets = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  const offset = offsets[direction];
  return {
    x: interpolate(progress, [0, 1], [offset.x, 0]),
    y: interpolate(progress, [0, 1], [offset.y, 0]),
    opacity: progress,
  };
};

export const useCountUp = (
  startFrame: number,
  endFrame: number,
  targetValue: number
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 30, stiffness: 80 },
    durationInFrames: endFrame - startFrame,
  });

  return Math.round(interpolate(progress, [0, 1], [0, targetValue]));
};
