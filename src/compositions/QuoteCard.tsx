/**
 * QuoteCard — Animated quote/insight card
 *
 * Props:
 *   quote (string) — the main text
 *   attribution (string, optional) — author/source
 *   theme (string, default "neutral") — theme name
 *   format ("square" | "wide", default "square") — output dimensions
 *   entrance ("fade-up" | "typewriter" | "word-by-word" | "slide-in", default "fade-up")
 *   holdSeconds (number, default 3) — seconds the full quote stays on screen
 *   underlineWord (string, optional) — word(s) to emphasize with animated underline
 *
 * Example prompts:
 *   "Make a quote card with 'Ship early, learn fast' by Jane Doe"
 *   "Quote card: 'Ship it.' theme buildvsbuy, entrance typewriter"
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
import { Background } from "../components/Background";
import { AnimatedText } from "../components/AnimatedText";
import { FadeInOut } from "../components/FadeInOut";
import { resolveFontFamily } from "../lib/fonts";

export const quoteCardSchema = z.object({
  quote: z.string(),
  attribution: z.string().optional(),
  theme: z.string().default("neutral"),
  format: z.enum(["square", "wide"]).default("square"),
  entrance: z
    .enum(["fade-up", "typewriter", "word-by-word", "slide-in"])
    .default("fade-up"),
  holdSeconds: z.number().default(3),
  underlineWord: z.string().optional(),
});

export type QuoteCardProps = z.infer<typeof quoteCardSchema>;

export const calculateQuoteCardMetadata = ({
  props,
}: {
  props: QuoteCardProps;
}) => {
  const fps = 30;
  const fadeIn = 15;
  const textEntrance = 45;
  const hold = props.holdSeconds * fps;
  const fadeOut = 15;
  const totalFrames = fadeIn + textEntrance + hold + fadeOut;

  const dimensions =
    props.format === "wide"
      ? { width: 1920, height: 1080 }
      : { width: 1080, height: 1080 };

  return {
    durationInFrames: totalFrames,
    fps,
    ...dimensions,
  };
};

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  attribution,
  theme: themeName,
  entrance,
  underlineWord,
}) => {
  const theme = useTheme(themeName);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isSquare = width === height;
  const quoteFontSize = isSquare
    ? Math.min(48, Math.max(28, Math.floor(800 / Math.sqrt(quote.length))))
    : Math.min(56, Math.max(32, Math.floor(1000 / Math.sqrt(quote.length))));

  const attributionStart = 60;
  const attributionProgress = spring({
    frame: frame - attributionStart,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  return (
    <FadeInOut fadeInFrames={15} fadeOutFrames={15}>
      <Background theme={theme} />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: isSquare ? "80px" : "80px 160px",
        }}
      >
        <div
          style={{
            maxWidth: isSquare ? "900px" : "1400px",
            textAlign: "center",
          }}
        >
          <AnimatedText
            text={`"${quote}"`}
            theme={theme}
            entrance={entrance}
            startFrame={15}
            fontSize={quoteFontSize}
            fontType="heading"
            underlineWord={underlineWord}
            textAlign="center"
          />

          {attribution && (
            <div
              style={{
                marginTop: 32,
                opacity: attributionProgress,
                transform: `translateY(${interpolate(attributionProgress, [0, 1], [10, 0])}px)`,
                fontSize: isSquare ? 28 : 32,
                fontFamily: resolveFontFamily(theme.fontBody),
                color: theme.textMuted,
              }}
            >
              — {attribution}
            </div>
          )}
        </div>
      </AbsoluteFill>
    </FadeInOut>
  );
};
