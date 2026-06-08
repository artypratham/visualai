import type { ComponentType } from "react";
import type { ArtifactKey } from "@/lib/curriculum";
import { TeachTheMachine } from "./TeachTheMachine";
import { PixelInspector } from "./PixelInspector";
import { FitTheLine } from "./FitTheLine";
import { NeuronPlayground } from "./NeuronPlayground";
import { SpiralClassifier } from "./SpiralClassifier";
import { EmbeddingSpace } from "./EmbeddingSpace";
import { AttentionVisualizer } from "./AttentionVisualizer";
import { NextTokenPredictor } from "./NextTokenPredictor";

/** Interactive artifacts that are fully built. Others render as ComingSoon. */
export const artifacts: Partial<Record<ArtifactKey, ComponentType>> = {
  "teach-the-machine": TeachTheMachine,
  "pixel-inspector": PixelInspector,
  "fit-the-line": FitTheLine,
  "neuron-playground": NeuronPlayground,
  "spiral-classifier": SpiralClassifier,
  "embedding-space": EmbeddingSpace,
  attention: AttentionVisualizer,
  "next-token": NextTokenPredictor,
};
