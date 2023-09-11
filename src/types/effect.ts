import {
  PitchShift,
  Reverb,
  Chorus,
  FeedbackDelay,
  Phaser,
  Tremolo,
  Distortion,
  Filter,
  EQ3,
  PingPongDelay,
  Compressor,
  Limiter,
} from "tone";
import { Hertz } from "tone/build/esm/core/type/Units";
import { Time } from "./units";

export type EffectId = string;
export const EFFECT_TYPES = [
  "warp",
  "reverb",
  "chorus",
  "delay",
  "pingPongDelay",
  "distortion",
  "phaser",
  "tremolo",
  "filter",
  "equalizer",
  "compressor",
  "limiter",
];
export type EffectType = (typeof EFFECT_TYPES)[number];

export const EFFECT_NAMES: Record<EffectType, string> = {
  warp: "Warp",
  reverb: "Reverb",
  chorus: "Chorus",
  delay: "Feedback Delay",
  pingPongDelay: "Ping Pong Delay",
  distortion: "Distortion",
  phaser: "Phaser",
  tremolo: "Tremolo",
  filter: "Filter",
  equalizer: "EQ",
  compressor: "Compressor",
  limiter: "Limiter",
};
export type EffectName = (typeof EFFECT_NAMES)[keyof typeof EFFECT_NAMES];

export type EffectNode =
  | PitchShift
  | Reverb
  | Chorus
  | FeedbackDelay
  | PingPongDelay
  | Phaser
  | Tremolo
  | Distortion
  | Filter
  | EQ3
  | Compressor
  | Limiter;

export interface Effect {
  id: EffectId;
  type: EffectType;
  name: string;
  [key: string]: any;
}
export interface EffectProps extends Effect {}

// Effects
export const DEFAULT_WET = 0;
export const MIN_WET = 0;
export const MAX_WET = 1;

// Warp
export interface WarpProps {
  wet: number;
  pitch: Hertz;
  window: number;
}
export interface WarpEffect extends Effect, WarpProps {
  type: "warp";
}
export const DEFAULT_WARP_PITCH = 0;
export const MIN_WARP_PITCH = -12;
export const MAX_WARP_PITCH = 12;

export const DEFAULT_WARP_WINDOW = 0.01;
export const MIN_WARP_WINDOW = 0.01;
export const MAX_WARP_WINDOW = 0.1;

export const defaultWarp: WarpEffect = {
  id: "",
  type: "warp",
  name: "Warp",
  wet: DEFAULT_WET,
  pitch: DEFAULT_WARP_PITCH,
  window: DEFAULT_WARP_WINDOW,
};

// Reverb
export interface ReverbProps {
  wet: number;
  decay: number;
  predelay: number;
}

export interface ReverbEffect extends Effect, ReverbProps {}

export const DEFAULT_REVERB_DECAY = 1;
export const MIN_REVERB_DECAY = 0.1;
export const MAX_REVERB_DECAY = 10;

export const DEFAULT_REVERB_PREDELAY = 0.01;
export const MIN_REVERB_PREDELAY = 0.01;
export const MAX_REVERB_PREDELAY = 0.5;

export const defaultReverb: ReverbEffect = {
  id: "",
  type: "reverb",
  name: "Reverb",
  wet: DEFAULT_WET,
  decay: DEFAULT_REVERB_DECAY,
  predelay: DEFAULT_REVERB_PREDELAY,
};

// Chorus
export interface ChorusProps {
  wet: number;
  frequency: number;
  depth: number;
  delay: number;
}
export interface ChorusEffect extends Effect, ChorusProps {}

export const DEFAULT_CHORUS_FREQUENCY = 1.5;
export const MIN_CHORUS_FREQUENCY = 0.1;
export const MAX_CHORUS_FREQUENCY = 5;

export const DEFAULT_CHORUS_DEPTH = 0.5;
export const MIN_CHORUS_DEPTH = 0;
export const MAX_CHORUS_DEPTH = 1;

export const DEFAULT_CHORUS_DELAY_TIME = 3.5;
export const MIN_CHORUS_DELAY_TIME = 0.1;
export const MAX_CHORUS_DELAY_TIME = 5.0;

export const defaultChorus: ChorusEffect = {
  id: "",
  type: "chorus",
  name: "Chorus",
  wet: DEFAULT_WET,
  frequency: DEFAULT_CHORUS_FREQUENCY,
  depth: DEFAULT_CHORUS_DEPTH,
  delay: DEFAULT_CHORUS_DELAY_TIME,
};

// Feedback Delay
export interface DelayProps {
  wet: number;
  delay: Time;
  feedback: number;
}

export interface DelayEffect extends Effect, DelayProps {}

export const DEFAULT_DELAY_TIME = 0.25;
export const MIN_DELAY_TIME = 0.01;
export const MAX_DELAY_TIME = 1;

export const DEFAULT_DELAY_FEEDBACK = 0.5;
export const MIN_DELAY_FEEDBACK = 0;
export const MAX_DELAY_FEEDBACK = 1;

export const defaultDelay: DelayEffect = {
  id: "",
  type: "delay",
  name: "Delay",
  wet: DEFAULT_WET,
  delay: DEFAULT_DELAY_TIME,
  feedback: DEFAULT_DELAY_FEEDBACK,
};

// Ping Pong Delay
export interface PingPongDelayProps {
  wet: number;
  delay: Time;
  feedback: number;
}

export interface PingPongDelayEffect extends Effect, PingPongDelayProps {}

export const DEFAULT_PING_PONG_DELAY_TIME = 0.25;
export const MIN_PING_PONG_DELAY_TIME = 0.01;
export const MAX_PING_PONG_DELAY_TIME = 1;

export const DEFAULT_PING_PONG_DELAY_FEEDBACK = 0.5;
export const MIN_PING_PONG_DELAY_FEEDBACK = 0;
export const MAX_PING_PONG_DELAY_FEEDBACK = 1;

export const defaultPingPongDelay: PingPongDelayEffect = {
  id: "",
  type: "pingPongDelay",
  name: "Ping Pong Delay",
  wet: DEFAULT_WET,
  delay: DEFAULT_PING_PONG_DELAY_TIME,
  feedback: DEFAULT_PING_PONG_DELAY_FEEDBACK,
};

// Distortion
export interface DistortionProps {
  wet: number;
  distortion: number;
}

export interface DistortionEffect extends Effect, DistortionProps {}

export const DEFAULT_DISTORTION = 0.4;
export const MIN_DISTORTION = 0;
export const MAX_DISTORTION = 1;

export const defaultDistortion: DistortionEffect = {
  id: "",
  type: "distortion",
  name: "Distortion",
  wet: DEFAULT_WET,
  distortion: DEFAULT_DISTORTION,
};

// Phaser
export interface PhaserProps {
  wet: number;
  frequency: number;
  octaves: number;
  baseFrequency: number;
}

export interface PhaserEffect extends Effect, PhaserProps {}

export const DEFAULT_PHASER_FREQUENCY = 0.5;
export const MIN_PHASER_FREQUENCY = 0.01;
export const MAX_PHASER_FREQUENCY = 10;

export const DEFAULT_PHASER_OCTAVES = 3;
export const MIN_PHASER_OCTAVES = 1;
export const MAX_PHASER_OCTAVES = 10;

export const DEFAULT_PHASER_BASE_FREQUENCY = 350;
export const MIN_PHASER_BASE_FREQUENCY = 20;
export const MAX_PHASER_BASE_FREQUENCY = 20000;

export const defaultPhaser: PhaserEffect = {
  id: "",
  type: "phaser",
  name: "Phaser",
  wet: DEFAULT_WET,
  frequency: DEFAULT_PHASER_FREQUENCY,
  octaves: DEFAULT_PHASER_OCTAVES,
  baseFrequency: DEFAULT_PHASER_BASE_FREQUENCY,
};

// Tremolo
export interface TremoloProps {
  wet: number;
  frequency: number;
  depth: number;
}

export interface TremoloEffect extends Effect, TremoloProps {}

export const DEFAULT_TREMOLO_FREQUENCY = 10;
export const MIN_TREMOLO_FREQUENCY = 0.1;
export const MAX_TREMOLO_FREQUENCY = 20;

export const DEFAULT_TREMOLO_DEPTH = 0.5;
export const MIN_TREMOLO_DEPTH = 0;
export const MAX_TREMOLO_DEPTH = 1;

export const defaultTremolo: TremoloEffect = {
  id: "",
  type: "tremolo",
  name: "Tremolo",
  wet: DEFAULT_WET,
  frequency: DEFAULT_TREMOLO_FREQUENCY,
  depth: DEFAULT_TREMOLO_DEPTH,
};

// Bandpass Filter
export interface FilterProps {
  frequency: number;
  Q: number;
}

export interface FilterEffect extends Effect, FilterProps {}

export const DEFAULT_FILTER_FREQUENCY = 350;
export const MIN_FILTER_FREQUENCY = 20;
export const MAX_FILTER_FREQUENCY = 20000;
export const DEFAULT_FILTER_Q = 1;
export const MIN_FILTER_Q = 0.01;
export const MAX_FILTER_Q = 10;

export const defaultFilter: FilterEffect = {
  id: "",
  type: "filter",
  name: "Filter",
  frequency: DEFAULT_FILTER_FREQUENCY,
  Q: DEFAULT_FILTER_Q,
};

// EQ
export interface EQProps {
  low: number;
  mid: number;
  high: number;
  lowFrequency: number;
  highFrequency: number;
}

export interface EQEffect extends Effect, EQProps {
  type: "equalizer";
}

export const DEFAULT_EQ_LOW = 0;
export const MIN_EQ_LOW = -60;
export const MAX_EQ_LOW = 6;
export const DEFAULT_EQ_MID = 0;
export const MIN_EQ_MID = -60;
export const MAX_EQ_MID = 6;
export const DEFAULT_EQ_HIGH = 0;
export const MIN_EQ_HIGH = -60;
export const MAX_EQ_HIGH = 6;
export const MIN_EQ_LOW_FREQUENCY = 20;
export const MAX_EQ_LOW_FREQUENCY = 1000;
export const DEFAULT_EQ_LOW_FREQUENCY = 400;
export const MIN_EQ_HIGH_FREQUENCY = 500;
export const MAX_EQ_HIGH_FREQUENCY = 4000;
export const DEFAULT_EQ_HIGH_FREQUENCY = 2500;

export const defaultEQ: EQEffect = {
  id: "",
  type: "equalizer",
  name: "EQ",
  low: DEFAULT_EQ_LOW,
  mid: DEFAULT_EQ_MID,
  high: DEFAULT_EQ_HIGH,
  lowFrequency: DEFAULT_EQ_LOW_FREQUENCY,
  highFrequency: DEFAULT_EQ_HIGH_FREQUENCY,
};

// Compressor
export interface CompressorProps {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  knee: number;
}

export interface CompressorEffect extends Effect, CompressorProps {}

export const DEFAULT_COMPRESSOR_THRESHOLD = -24;
export const MIN_COMPRESSOR_THRESHOLD = -100;
export const MAX_COMPRESSOR_THRESHOLD = 0;

export const DEFAULT_COMPRESSOR_RATIO = 12;
export const MIN_COMPRESSOR_RATIO = 1;
export const MAX_COMPRESSOR_RATIO = 20;

export const DEFAULT_COMPRESSOR_ATTACK = 0.003;
export const MIN_COMPRESSOR_ATTACK = 0.001;
export const MAX_COMPRESSOR_ATTACK = 0.1;

export const DEFAULT_COMPRESSOR_RELEASE = 0.25;
export const MIN_COMPRESSOR_RELEASE = 0.01;
export const MAX_COMPRESSOR_RELEASE = 1;

export const DEFAULT_COMPRESSOR_KNEE = 30;
export const MIN_COMPRESSOR_KNEE = 0;
export const MAX_COMPRESSOR_KNEE = 50;

export const defaultCompressor: CompressorEffect = {
  id: "",
  type: "compressor",
  name: "Compressor",
  threshold: DEFAULT_COMPRESSOR_THRESHOLD,
  ratio: DEFAULT_COMPRESSOR_RATIO,
  attack: DEFAULT_COMPRESSOR_ATTACK,
  release: DEFAULT_COMPRESSOR_RELEASE,
  knee: DEFAULT_COMPRESSOR_KNEE,
};

// Limiter
export interface LimiterProps {
  threshold: number;
}

export interface LimiterEffect extends Effect, LimiterProps {}

export const DEFAULT_LIMITER_THRESHOLD = -12;
export const MIN_LIMITER_THRESHOLD = -100;
export const MAX_LIMITER_THRESHOLD = 0;

export const defaultLimiter: LimiterEffect = {
  id: "",
  type: "limiter",
  name: "Limiter",
  threshold: DEFAULT_LIMITER_THRESHOLD,
};
