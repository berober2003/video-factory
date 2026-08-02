import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { Theme } from "../themes/types";
import { resolveFontFamily } from "../lib/fonts";

type EntranceType = "fade-up" | "typewriter" | "word-by-word" | "slide-in";

type AnimatedTextProps = {
  text: string;
  theme: Theme;
  entrance: EntranceType;
  startFrame: number;
  fontSize?: number;
  fontType?: "heading" | "body";
  color?: string;
  underlineWord?: string;
  underlineDelay?: number;
  textAlign?: "left" | "center" | "right";
};

type SharedTextProps = {
  text: string;
  startFrame: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  underlineWord?: string;
  underlineDelay: number;
  accentColor: string;
  textAlign: string;
};

const UnderlinedSpan: React.FC<{
  children: React.ReactNode;
  delay: number;
  accentColor: string;
  fontSize: number;
}> = ({ children, delay, accentColor, fontSize }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 30, stiffness: 60 },
  });
  const width = interpolate(progress, [0, 1], [0, 100]);
  const thickness = Math.max(2, Math.round(fontSize * 0.06));

  return (
    <span style={{ position: "relative", display: "inline" }}>
      {children}
      <span
        style={{
          position: "absolute",
          bottom: -2,
          left: 0,
          width: `${width}%`,
          height: thickness,
          backgroundColor: accentColor,
          borderRadius: thickness / 2,
        }}
      />
    </span>
  );
};

const renderText = (
  text: string,
  underlineWord: string | undefined,
  accentColor: string,
  underlineDelay: number,
  fontSize: number,
) => {
  if (!underlineWord) return text;
  const parts = text.split(new RegExp(`(${underlineWord})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === underlineWord?.toLowerCase() ? (
      <UnderlinedSpan key={i} delay={underlineDelay} accentColor={accentColor} fontSize={fontSize}>
        {part}
      </UnderlinedSpan>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

const FadeUpText: React.FC<SharedTextProps> = ({ text, startFrame, fontSize, fontFamily, color, underlineWord, underlineDelay, accentColor, textAlign }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 20, stiffness: 120 } });
  const y = interpolate(progress, [0, 1], [30, 0]);

  return (
    <div style={{ opacity: progress, transform: `translateY(${y}px)`, fontSize, fontFamily, color, textAlign: textAlign as React.CSSProperties["textAlign"], lineHeight: 1.3 }}>
      {renderText(text, underlineWord, accentColor, underlineDelay, fontSize)}
    </div>
  );
};

const TypewriterText: React.FC<SharedTextProps> = ({ text, startFrame, fontSize, fontFamily, color, underlineWord, underlineDelay, accentColor, textAlign }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const charsPerSecond = 30;
  const framesPerChar = fps / charsPerSecond;
  const elapsed = Math.max(0, frame - startFrame);
  const visibleChars = Math.min(text.length, Math.floor(elapsed / framesPerChar));
  const visibleText = text.slice(0, visibleChars);

  return (
    <div style={{ fontSize, fontFamily, color, textAlign: textAlign as React.CSSProperties["textAlign"], lineHeight: 1.3 }}>
      {renderText(visibleText, underlineWord, accentColor, underlineDelay, fontSize)}
    </div>
  );
};

const WordByWordText: React.FC<SharedTextProps> = ({ text, startFrame, fontSize, fontFamily, color, underlineWord, underlineDelay, accentColor, textAlign }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const framesPerWord = Math.max(3, Math.floor((fps * 1.5) / words.length));
  const underlineWords = underlineWord ? underlineWord.toLowerCase().split(/\s+/) : [];

  return (
    <div style={{ fontSize, fontFamily, color, textAlign: textAlign as React.CSSProperties["textAlign"], lineHeight: 1.3, display: "flex", flexWrap: "wrap", gap: `0 ${fontSize * 0.3}px`, justifyContent: textAlign === "center" ? "center" : "flex-start" }}>
      {words.map((word, i) => {
        const wordStart = startFrame + i * framesPerWord;
        const progress = spring({ frame: frame - wordStart, fps, config: { damping: 20, stiffness: 150 } });
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
        const isUnderlined = underlineWords.length > 0 && underlineWords.includes(cleanWord);

        const content = (
          <span key={i} style={{ opacity: progress, transform: `translateY(${interpolate(progress, [0, 1], [10, 0])}px)`, display: "inline-block" }}>
            {word}
          </span>
        );

        if (isUnderlined) {
          return (
            <UnderlinedSpan key={i} delay={underlineDelay} accentColor={accentColor} fontSize={fontSize}>
              <span style={{ opacity: progress, transform: `translateY(${interpolate(progress, [0, 1], [10, 0])}px)`, display: "inline-block" }}>
                {word}
              </span>
            </UnderlinedSpan>
          );
        }

        return content;
      })}
    </div>
  );
};

const SlideInText: React.FC<SharedTextProps> = ({ text, startFrame, fontSize, fontFamily, color, underlineWord, underlineDelay, accentColor, textAlign }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config: { damping: 18, stiffness: 100 } });
  const x = interpolate(progress, [0, 1], [-60, 0]);

  return (
    <div style={{ opacity: progress, transform: `translateX(${x}px)`, fontSize, fontFamily, color, textAlign: textAlign as React.CSSProperties["textAlign"], lineHeight: 1.3 }}>
      {renderText(text, underlineWord, accentColor, underlineDelay, fontSize)}
    </div>
  );
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text, theme, entrance, startFrame, fontSize = 48, fontType = "heading", color, underlineWord, underlineDelay = 45, textAlign = "center",
}) => {
  const fontFamily = resolveFontFamily(fontType === "heading" ? theme.fontHeading : theme.fontBody);
  const textColor = color ?? theme.text;
  const accentColor = theme.accent;
  const sharedProps: SharedTextProps = { text, startFrame, fontSize, fontFamily, color: textColor, underlineWord, underlineDelay: startFrame + underlineDelay, accentColor, textAlign };

  switch (entrance) {
    case "fade-up": return <FadeUpText {...sharedProps} />;
    case "typewriter": return <TypewriterText {...sharedProps} />;
    case "word-by-word": return <WordByWordText {...sharedProps} />;
    case "slide-in": return <SlideInText {...sharedProps} />;
  }
};
