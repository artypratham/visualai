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
import { OverfitPlayground } from "./OverfitPlayground";
import { KernelExplorer } from "./KernelExplorer";
import { KMeansLive } from "./KMeansLive";
import { TokenizerPlayground } from "./TokenizerPlayground";

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
  "overfit-playground": OverfitPlayground,
  "kernel-explorer": KernelExplorer,
  kmeans: KMeansLive,
  tokenizer: TokenizerPlayground,
};
