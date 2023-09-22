import {
  Reverb,
  Chorus,
  FeedbackDelay,
  PingPongDelay,
  Phaser,
  Tremolo,
  Vibrato,
  Distortion,
  BitCrusher,
  Filter,
  EQ3,
  Compressor,
  Limiter,
  Gain,
  PitchShift,
} from "tone";
import { Hertz } from "tone/build/esm/core/type/Units";
import { Time } from "./units";

export type EffectId = string;
export const EFFECT_KEYS = [
  "reverb",
  "chorus",
  "phaser",
  "tremolo",
  "vibrato",
  "filter",
  "equalizer",
  "distortion",
  "bitcrusher",
  "feedbackDelay",
  "pingPongDelay",
  "compressor",
  "limiter",
  "gain",
  "warp",
];
export type EffectKey = (typeof EFFECT_KEYS)[number];

export const EFFECT_NAMES: Record<EffectKey, string> = {
  reverb: "Reverb",
  chorus: "Chorus",
  phaser: "Phaser",
  tremolo: "Tremolo",
  vibrato: "Vibrato",
  filter: "Filter",
  equalizer: "Equalizer",
  distortion: "Distortion",
  bitcrusher: "Bitcrusher",
  feedbackDelay: "Feedback Delay",
  pingPongDelay: "Ping Pong Delay",
  compressor: "Compressor",
  limiter: "Limiter",
  gain: "Gain",
  warp: "Warp",
};
export type EffectName = (typeof EFFECT_NAMES)[keyof typeof EFFECT_NAMES];

export type EffectNode =
  | Reverb
  | Chorus
  | FeedbackDelay
  | PingPongDelay
  | Phaser
  | Tremolo
  | Vibrato
  | Distortion
  | BitCrusher
  | Filter
  | EQ3
  | Compressor
  | Limiter
  | Gain
  | PitchShift;

export interface Effect {
  id: EffectId;
  key: EffectKey;
  [key: string]: any;
}
export interface EffectProps extends Effect {}

// Effects
export const DEFAULT_WET = 0;
export const MIN_WET = 0;
export const MAX_WET = 1;

// Reverb
export interface ReverbProps {
  wet: number;
  decay: number;
  predelay: number;
}

export interface ReverbEffect extends Effect, ReverbProps {}

// The duration of the reverb
export const DEFAULT_REVERB_DECAY = 1;
export const MIN_REVERB_DECAY = 0.1;
export const MAX_REVERB_DECAY = 10;

// The amount of time before the reverb is fully ramped in
export const DEFAULT_REVERB_PREDELAY = 0.01;
export const MIN_REVERB_PREDELAY = 0.01;
export const MAX_REVERB_PREDELAY = 0.5;

export const defaultReverb: ReverbEffect = {
  id: "",
  key: "reverb",
  wet: DEFAULT_WET,
  decay: DEFAULT_REVERB_DECAY,
  predelay: DEFAULT_REVERB_PREDELAY,
};

// Chorus
export interface ChorusProps {
  wet: number;
  frequency: number;
  delay: number;
  depth: number;
}
export interface ChorusEffect extends Effect, ChorusProps {}

// The frequency of the LFO
export const DEFAULT_CHORUS_FREQUENCY = 1.5;
export const MIN_CHORUS_FREQUENCY = 0.1;
export const MAX_CHORUS_FREQUENCY = 5;

// The delay of the chorus effect in ms
export const DEFAULT_CHORUS_DELAY_TIME = 3.5;
export const MIN_CHORUS_DELAY_TIME = 0.1;
export const MAX_CHORUS_DELAY_TIME = 5.0;

// The depth of the chorus
export const DEFAULT_CHORUS_DEPTH = 0.5;
export const MIN_CHORUS_DEPTH = 0;
export const MAX_CHORUS_DEPTH = 1;

export const defaultChorus: ChorusEffect = {
  id: "",
  key: "chorus",
  wet: DEFAULT_WET,
  frequency: DEFAULT_CHORUS_FREQUENCY,
  delay: DEFAULT_CHORUS_DELAY_TIME,
  depth: DEFAULT_CHORUS_DEPTH,
};

// Feedback Delay
export interface FeedbackDelayProps {
  wet: number;
  delay: Time;
  feedback: number;
}

export interface FeedbackDelayEffect extends Effect, FeedbackDelayProps {}

// The delay applied to the incoming signal
export const DEFAULT_FEEDBACK_DELAY_TIME = 0.25;
export const MIN_FEEDBACK_DELAY_TIME = 0.01;
export const MAX_FEEDBACK_DELAY_TIME = 1;

// The amount of the effected signal which is fed back through the delay
export const DEFAULT_FEEDBACK_DELAY_FEEDBACK = 0.5;
export const MIN_FEEDBACK_DELAY_FEEDBACK = 0;
export const MAX_FEEDBACK_DELAY_FEEDBACK = 1;

export const defaultFeedbackDelay: FeedbackDelayEffect = {
  id: "",
  key: "feedbackDelay",
  wet: DEFAULT_WET,
  delay: DEFAULT_FEEDBACK_DELAY_TIME,
  feedback: DEFAULT_FEEDBACK_DELAY_FEEDBACK,
};

// Ping Pong Delay
export interface PingPongDelayProps {
  wet: number;
  delay: Time;
  feedback: number;
}

export interface PingPongDelayEffect extends Effect, PingPongDelayProps {}

// The delay applied to the incoming signal
export const DEFAULT_PING_PONG_DELAY_TIME = 0.25;
export const MIN_PING_PONG_DELAY_TIME = 0.01;
export const MAX_PING_PONG_DELAY_TIME = 1;

// The amount of the effected signal which is fed back through the delay
export const DEFAULT_PING_PONG_DELAY_FEEDBACK = 0.5;
export const MIN_PING_PONG_DELAY_FEEDBACK = 0;
export const MAX_PING_PONG_DELAY_FEEDBACK = 1;

export const defaultPingPongDelay: PingPongDelayEffect = {
  id: "",
  key: "pingPongDelay",
  wet: DEFAULT_WET,
  delay: DEFAULT_PING_PONG_DELAY_TIME,
  feedback: DEFAULT_PING_PONG_DELAY_FEEDBACK,
};

// Phaser
export interface PhaserProps {
  wet: number;
  frequency: number;
  octaves: number;
  baseFrequency: number;
}

export interface PhaserEffect extends Effect, PhaserProps {}

// The speed of the phasing
export const DEFAULT_PHASER_FREQUENCY = 0.5;
export const MIN_PHASER_FREQUENCY = 0.01;
export const MAX_PHASER_FREQUENCY = 10;

// The number of octaves the phase goes above the baseFrequency
export const DEFAULT_PHASER_OCTAVES = 3;
export const MIN_PHASER_OCTAVES = 1;
export const MAX_PHASER_OCTAVES = 10;

// The base frequency of the filters
export const DEFAULT_PHASER_BASE_FREQUENCY = 350;
export const MIN_PHASER_BASE_FREQUENCY = 20;
export const MAX_PHASER_BASE_FREQUENCY = 20000;

export const defaultPhaser: PhaserEffect = {
  id: "",
  key: "phaser",
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

// The rate of the effect
export const DEFAULT_TREMOLO_FREQUENCY = 10;
export const MIN_TREMOLO_FREQUENCY = 0.1;
export const MAX_TREMOLO_FREQUENCY = 20;

// The depth of the effect
export const DEFAULT_TREMOLO_DEPTH = 0.5;
export const MIN_TREMOLO_DEPTH = 0;
export const MAX_TREMOLO_DEPTH = 1;

export const defaultTremolo: TremoloEffect = {
  id: "",
  key: "tremolo",
  wet: DEFAULT_WET,
  frequency: DEFAULT_TREMOLO_FREQUENCY,
  depth: DEFAULT_TREMOLO_DEPTH,
};

// Vibrato

export interface VibratoProps {
  wet: number;
  frequency: number;
  depth: number;
}

export interface VibratoEffect extends Effect, VibratoProps {}

// The rate of the effect
export const DEFAULT_VIBRATO_FREQUENCY = 5;
export const MIN_VIBRATO_FREQUENCY = 0.1;
export const MAX_VIBRATO_FREQUENCY = 20;

// The depth of the effect
export const DEFAULT_VIBRATO_DEPTH = 0.1;
export const MIN_VIBRATO_DEPTH = 0;
export const MAX_VIBRATO_DEPTH = 1;

export const defaultVibrato: VibratoEffect = {
  id: "",
  key: "vibrato",
  wet: DEFAULT_WET,
  frequency: DEFAULT_VIBRATO_FREQUENCY,
  depth: DEFAULT_VIBRATO_DEPTH,
};

// Distortion
export interface DistortionProps {
  wet: number;
  distortion: number;
}

export interface DistortionEffect extends Effect, DistortionProps {}

// The amount of distortion
export const DEFAULT_DISTORTION = 0.4;
export const MIN_DISTORTION = 0;
export const MAX_DISTORTION = 1;

export const defaultDistortion: DistortionEffect = {
  id: "",
  key: "distortion",
  wet: DEFAULT_WET,
  distortion: DEFAULT_DISTORTION,
};

// Bitcrusher
export interface BitCrusherProps {
  wet: number;
  bits: number;
}

// The number of bits to downsample the signal
export const DEFAULT_BITCRUSHER_BITS = 4;
export const MIN_BITCRUSHER_BITS = 1;
export const MAX_BITCRUSHER_BITS = 8;

export interface BitCrusherEffect extends Effect, BitCrusherProps {}

export const defaultBitCrusher: BitCrusherEffect = {
  id: "",
  key: "bitcrusher",
  wet: DEFAULT_WET,
  bits: DEFAULT_BITCRUSHER_BITS,
};

// Equalizer
export interface EqualizerProps {
  low: number;
  mid: number;
  high: number;
  lowFrequency: number;
  highFrequency: number;
}

export interface EqualizerEffect extends Effect, EqualizerProps {}

// The gain in decibels of the low (bass) frequencies
export const DEFAULT_EQUALIZER_LOW = 0;
export const MIN_EQUALIZER_LOW = -60;
export const MAX_EQUALIZER_LOW = 6;

// The gain in decibels of the mid (mid-range) frequencies
export const DEFAULT_EQUALIZER_MID = 0;
export const MIN_EQUALIZER_MID = -60;
export const MAX_EQUALIZER_MID = 6;

// The gain in decibels of the high (treble) frequencies
export const DEFAULT_EQUALIZER_HIGH = 0;
export const MIN_EQUALIZER_HIGH = -60;
export const MAX_EQUALIZER_HIGH = 6;

// The low/mid crossover frequency
export const MIN_EQUALIZER_LOW_FREQUENCY = 20;
export const MAX_EQUALIZER_LOW_FREQUENCY = 5000;
export const DEFAULT_EQUALIZER_LOW_FREQUENCY = 400;

// The mid/high crossover frequency
export const MIN_EQUALIZER_HIGH_FREQUENCY = 20;
export const MAX_EQUALIZER_HIGH_FREQUENCY = 10000;
export const DEFAULT_EQUALIZER_HIGH_FREQUENCY = 2500;

export const defaultEqualizer: EqualizerEffect = {
  id: "",
  key: "equalizer",
  low: DEFAULT_EQUALIZER_LOW,
  mid: DEFAULT_EQUALIZER_MID,
  high: DEFAULT_EQUALIZER_HIGH,
  lowFrequency: DEFAULT_EQUALIZER_LOW_FREQUENCY,
  highFrequency: DEFAULT_EQUALIZER_HIGH_FREQUENCY,
};

// Filter
export interface FilterProps {
  frequency: number;
  type: BiquadFilterType;
  Q: number;
}

export interface FilterEffect extends Effect, FilterProps {}

// The cutoff frequency of the filter
export const DEFAULT_FILTER_FREQUENCY = 350;
export const MIN_FILTER_FREQUENCY = 20;
export const MAX_FILTER_FREQUENCY = 20000;

// The Q or Quality of the filter
export const DEFAULT_FILTER_Q = 1;
export const MIN_FILTER_Q = 0.01;
export const MAX_FILTER_Q = 10;

export const defaultFilter: FilterEffect = {
  id: "",
  key: "filter",
  frequency: DEFAULT_FILTER_FREQUENCY,
  type: "bandpass",
  Q: DEFAULT_FILTER_Q,
};

// Compressor
export interface CompressorProps {
  ratio: number;
  threshold: number;
  attack: number;
  release: number;
  knee: number;
}

export interface CompressorEffect extends Effect, CompressorProps {}

// The gain reduction ratio
export const DEFAULT_COMPRESSOR_RATIO = 3;
export const MIN_COMPRESSOR_RATIO = 1;
export const MAX_COMPRESSOR_RATIO = 20;

// The decibel value above which the compression is applied
export const DEFAULT_COMPRESSOR_THRESHOLD = -24;
export const MIN_COMPRESSOR_THRESHOLD = -100;
export const MAX_COMPRESSOR_THRESHOLD = 0;

// The attack time in seconds
export const DEFAULT_COMPRESSOR_ATTACK = 0.03;
export const MIN_COMPRESSOR_ATTACK = 0;
export const MAX_COMPRESSOR_ATTACK = 1;

// The release time in seconds
export const DEFAULT_COMPRESSOR_RELEASE = 0.25;
export const MIN_COMPRESSOR_RELEASE = 0;
export const MAX_COMPRESSOR_RELEASE = 1;

// The knee in decibels
export const DEFAULT_COMPRESSOR_KNEE = 10;
export const MIN_COMPRESSOR_KNEE = 0;
export const MAX_COMPRESSOR_KNEE = 40;

export const defaultCompressor: CompressorEffect = {
  id: "",
  key: "compressor",
  ratio: DEFAULT_COMPRESSOR_RATIO,
  threshold: DEFAULT_COMPRESSOR_THRESHOLD,
  attack: DEFAULT_COMPRESSOR_ATTACK,
  release: DEFAULT_COMPRESSOR_RELEASE,
  knee: DEFAULT_COMPRESSOR_KNEE,
};

// Limiter
export interface LimiterProps {
  threshold: number;
}

export interface LimiterEffect extends Effect, LimiterProps {}

// The decibel value above which the limiting is applied
export const DEFAULT_LIMITER_THRESHOLD = -12;
export const MIN_LIMITER_THRESHOLD = -100;
export const MAX_LIMITER_THRESHOLD = 0;

export const defaultLimiter: LimiterEffect = {
  id: "",
  key: "limiter",
  threshold: DEFAULT_LIMITER_THRESHOLD,
};

// Gain
export interface GainProps {
  gain: number;
}

export interface GainEffect extends Effect, GainProps {}

// The ratio between input and output (0 = silence, 1 = no change)
export const DEFAULT_GAIN = 1;
export const MIN_GAIN = 0;
export const MAX_GAIN = 2;

export const defaultGain: GainEffect = {
  id: "",
  key: "gain",
  name: "Gain",
  gain: DEFAULT_GAIN,
};

// Warp
export interface WarpProps {
  wet: number;
  pitch: Hertz;
  window: number;
}
export interface WarpEffect extends Effect, WarpProps {}

// The interval to transpose the incoming signal by
export const DEFAULT_WARP_PITCH = 0;
export const MIN_WARP_PITCH = -12;
export const MAX_WARP_PITCH = 12;

// The window size of the effect (i.e. the sample length)
export const DEFAULT_WARP_WINDOW = 0.1;
export const MIN_WARP_WINDOW = 0.01;
export const MAX_WARP_WINDOW = 0.1;

export const defaultWarp: WarpEffect = {
  id: "",
  key: "warp",
  name: "Warp",
  wet: DEFAULT_WET,
  pitch: DEFAULT_WARP_PITCH,
  window: DEFAULT_WARP_WINDOW,
};
