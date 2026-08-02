import React from "react";
import { Composition } from "remotion";
import "./index.css";
import { QuoteCard, quoteCardSchema, calculateQuoteCardMetadata } from "./compositions/QuoteCard";
import { DataViz, dataVizSchema, calculateDataVizMetadata } from "./compositions/DataViz";
import { DemoSignal, demoSignalSchema, calculateDemoSignalMetadata } from "./series/demo/DemoSignal";
import { DemoTriage, demoTriageSchema, calculateDemoTriageMetadata } from "./series/demo/DemoTriage";
import { DemoShip, demoShipSchema, calculateDemoShipMetadata } from "./series/demo/DemoShip";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QuoteCard"
        component={QuoteCard}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1080}
        schema={quoteCardSchema}
        defaultProps={{
          quote: "Ship early, learn fast",
          attribution: "Jane Doe",
          theme: "neutral",
          format: "square" as const,
          entrance: "fade-up" as const,
          holdSeconds: 3,
        }}
        calculateMetadata={calculateQuoteCardMetadata}
      />
      <Composition
        id="DataViz"
        component={DataViz}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1080}
        schema={dataVizSchema}
        defaultProps={{
          vizType: "counter" as const,
          title: "Deploys per week",
          data: [{ label: "deploys", value: 47 }],
          theme: "neutral",
          format: "square" as const,
        }}
        calculateMetadata={calculateDataVizMetadata}
      />
      <Composition id="DemoSignal" component={DemoSignal} durationInFrames={360} fps={30} width={1920} height={1080}
        schema={demoSignalSchema} defaultProps={{ format: "wide" as const }} calculateMetadata={calculateDemoSignalMetadata} />
      <Composition id="DemoTriage" component={DemoTriage} durationInFrames={360} fps={30} width={1920} height={1080}
        schema={demoTriageSchema} defaultProps={{ format: "wide" as const }} calculateMetadata={calculateDemoTriageMetadata} />
      <Composition id="DemoShip" component={DemoShip} durationInFrames={360} fps={30} width={1920} height={1080}
        schema={demoShipSchema} defaultProps={{ format: "wide" as const }} calculateMetadata={calculateDemoShipMetadata} />
    </>
  );
};
