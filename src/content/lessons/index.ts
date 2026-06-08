import type { ComponentType } from "react";
import { WhatIsAiContent } from "./what-is-ai";
import { EverythingIsNumbersContent } from "./everything-is-numbers";
import { PatternsAndPredictionContent } from "./patterns-and-prediction";
import { TheNeuronContent } from "./the-neuron";
import { NeuralNetworksContent } from "./neural-networks";
import { WordsAsNumbersContent } from "./words-as-numbers";
import { AttentionContent } from "./attention";
import { LargeLanguageModelsContent } from "./large-language-models";

/** Prose bodies for lessons that are fully written. */
export const lessonContent: Record<string, ComponentType> = {
  "what-is-ai": WhatIsAiContent,
  "everything-is-numbers": EverythingIsNumbersContent,
  "patterns-and-prediction": PatternsAndPredictionContent,
  "the-neuron": TheNeuronContent,
  "neural-networks": NeuralNetworksContent,
  "words-as-numbers": WordsAsNumbersContent,
  attention: AttentionContent,
  "large-language-models": LargeLanguageModelsContent,
};
