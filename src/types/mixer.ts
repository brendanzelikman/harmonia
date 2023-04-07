import { nanoid } from "@reduxjs/toolkit";
import * as Constants from "appConstants";
import { inRange } from "lodash";
import {
  Filter,
  Channel as ToneChannel,
  Chorus,
  FeedbackDelay,
  getDestination,
  PitchShift,
  Reverb,
} from "tone";
import { Hertz, Time } from "tone/build/esm/core/type/Units";
import { Volume } from "types/units";
import { TrackId } from "./tracks";

export interface ChannelProps {
  volume: Volume;
  pan: number;
  mute: boolean;
  solo: boolean;
}

export type EffectType = "warp" | "reverb" | "chorus" | "delay" | "filter";

export interface Effect {
  type: EffectType;
  [key: string]: any;
}

export interface WarpProps {
  wet: number;
  pitch: Hertz;
  window: number;
}

export interface WarpEffect extends WarpProps {
  type: "warp";
}

export interface ReverbProps {
  wet: number;
  decay: number;
  predelay: number;
}

export interface ReverbEffect extends ReverbProps {
  type: "reverb";
}

export interface ChorusProps {
  wet: number;
  frequency: number;
  depth: number;
  delay: number;
}
export interface ChorusEffect extends ChorusProps {
  type: "chorus";
}

export interface DelayProps {
  wet: number;
  delay: Time;
  feedback: number;
}

export interface DelayEffect extends DelayProps {
  type: "delay";
}

export interface FilterProps {
  low: number;
  mid: number;
  high: number;
}

export interface FilterEffect extends FilterProps {
  type: "filter";
}

export type MixerId = string;

// A mixer contains a set of controls corresponding to a Tone Channel,
// as well as a set of effects that can be applied to the channel.
export interface Mixer extends ChannelProps {
  id: MixerId;
  trackId: TrackId;
  effects: Effect[];
}

type MixerNoId = Omit<Mixer, "id">;

export const initializeMixer = (mixer: MixerNoId = defaultMixer): Mixer => ({
  ...mixer,
  id: nanoid(),
});

export const defaultWarp: WarpEffect = {
  type: "warp",
  wet: Constants.DEFAULT_WET,
  pitch: Constants.DEFAULT_WARP_PITCH,
  window: Constants.DEFAULT_WARP_WINDOW,
};

export const defaultReverb: ReverbEffect = {
  type: "reverb",
  wet: Constants.DEFAULT_WET,
  decay: Constants.DEFAULT_REVERB_DECAY,
  predelay: Constants.DEFAULT_REVERB_PREDELAY,
};

export const defaultChorus: ChorusEffect = {
  type: "chorus",
  wet: Constants.DEFAULT_WET,
  frequency: Constants.DEFAULT_CHORUS_FREQUENCY,
  depth: Constants.DEFAULT_CHORUS_DEPTH,
  delay: Constants.DEFAULT_CHORUS_DELAY_TIME,
};

export const defaultDelay: DelayEffect = {
  type: "delay",
  wet: Constants.DEFAULT_WET,
  delay: Constants.DEFAULT_DELAY_TIME,
  feedback: Constants.DEFAULT_DELAY_FEEDBACK,
};

export const defaultFilter: FilterEffect = {
  type: "filter",
  low: Constants.DEFAULT_FILTER_LOW,
  mid: Constants.DEFAULT_FILTER_MID,
  high: Constants.DEFAULT_FILTER_HIGH,
};

export const defaultMixer: Mixer = {
  id: "",
  trackId: "",
  volume: Constants.DEFAULT_VOLUME,
  pan: 0,
  mute: false,
  solo: false,
  effects: [defaultWarp, defaultReverb, defaultChorus, defaultDelay],
};

interface ToneFilterProps {
  low: Filter;
  mid: Filter;
  high: Filter;
}
class ToneFilter implements ToneFilterProps {
  low: Filter;
  mid: Filter;
  high: Filter;
  constructor({ low, mid, high }: ToneFilterProps) {
    this.low = low;
    this.mid = mid;
    this.high = high;
  }
  get name() {
    return "ToneFilter";
  }
  dispose() {
    this.low.dispose();
    this.mid.dispose();
    this.high.dispose();
  }
}

type ToneEffect = PitchShift | Reverb | Chorus | FeedbackDelay | ToneFilter;

export class MixerInstance {
  channel: ToneChannel;
  effects: ToneEffect[] = [];

  constructor({
    volume = -30,
    pan = 0,
    mute = false,
    solo = false,
    effects = [defaultWarp, defaultReverb, defaultChorus, defaultDelay],
  }: Mixer) {
    // Initialize the channel
    this.channel = new ToneChannel({
      volume,
      pan,
      mute,
      solo,
    });
    // Initialize the effects
    let allEffects: any = [];
    for (const effect of effects) {
      if (effect.type === "warp") {
        const warpEffect = effect as WarpEffect;
        const pitchShift = new PitchShift({
          wet: warpEffect.wet,
          pitch: warpEffect.pitch,
          windowSize: warpEffect.window,
        });
        this.effects.push(pitchShift);
        allEffects.push(pitchShift);
        continue;
      }
      if (effect.type === "reverb") {
        const reverbEffect = effect as ReverbEffect;
        const reverb = new Reverb({
          wet: reverbEffect.wet,
          decay: reverbEffect.decay,
          preDelay: reverbEffect.predelay,
        });
        this.effects.push(reverb);
        allEffects.push(reverb);
        continue;
      }
      if (effect.type === "chorus") {
        const chorusEffect = effect as ChorusEffect;
        const chorus = new Chorus({
          wet: chorusEffect.wet,
          frequency: chorusEffect.frequency ?? 1.5,
          delayTime: chorusEffect.delay,
          depth: chorusEffect.depth ?? 0.5,
        });
        this.effects.push(chorus);
        allEffects.push(chorus);
        continue;
      }
      if (effect.type === "delay") {
        const delayEffect = effect as DelayEffect;
        const delay = new FeedbackDelay({
          wet: delayEffect.wet,
          delayTime: delayEffect.delay,
          feedback: delayEffect.feedback,
        });
        this.effects.push(delay);
        allEffects.push(delay);
        continue;
      } else if (effect.type === "filter") {
        const filterEffect = effect as FilterEffect;
        const filter = new ToneFilter({
          low: new Filter({
            frequency: 200,
            gain: filterEffect.low,
            type: "allpass",
          }),
          mid: new Filter({
            frequency: 1000,
            gain: filterEffect.mid,
            type: "allpass",
          }),
          high: new Filter({
            frequency: 5000,
            gain: filterEffect.high,
            type: "allpass",
          }),
        });
        this.effects.push(filter);
        allEffects.push(filter.low);
        allEffects.push(filter.mid);
        allEffects.push(filter.high);
        continue;
      } else {
        throw new Error("Invalid effect type");
      }
    }
    // Connect the effects to the channel
    this.channel = this.channel.chain(...allEffects, getDestination());
  }
  // Volume
  get volume() {
    return this.channel.volume.value;
  }
  set volume(value: Volume) {
    this.channel.volume.value = value;
  }
  // Pan
  get pan() {
    return this.channel.pan.value;
  }
  set pan(value: number) {
    this.channel.pan.value = value;
  }
  // Mute
  get mute() {
    return this.channel.mute;
  }
  set mute(value: boolean) {
    this.channel.mute = value;
  }
  // Solo
  get solo() {
    return this.channel.solo;
  }
  set solo(value: boolean) {
    this.channel.solo = value;
  }
  // Get an effect by type
  getEffectByType = (effectType: EffectType) => {
    return this.effects.find((e) => {
      switch (e.constructor.name) {
        case PitchShift.name:
          return effectType === "warp";
        case Reverb.name:
          return effectType === "reverb";
        case Chorus.name:
          return effectType === "chorus";
        case FeedbackDelay.name:
          return effectType === "delay";
        case ToneFilter.name:
          return effectType === "filter";
        default:
          return false;
      }
    });
  };
  // Get an effect by index
  getEffectByIndex = (index: number) => {
    return this.effects[index];
  };
  // Update an effect by type with a partial update
  updateEffectByType = (effectType: EffectType, update: Partial<Effect>) => {
    const effect = this.getEffectByType(effectType);

    if (!effect) return;

    const index = this.effects.indexOf(effect);
    this.updateEffectByIndex(index, update);
  };

  // Update an effect by index with a partial update
  updateEffectByIndex = (index: number, update: Partial<Effect>) => {
    if (!inRange(index, 0, this.effects.length)) return;
    const effect = this.effects[index];
    if (effect) {
      switch (effect.name) {
        case PitchShift.name:
          let warp = effect as PitchShift;
          if (update.wet !== undefined) warp.wet.value = update.wet;
          if (update.pitch !== undefined) warp.pitch = update.pitch;
          if (update.window !== undefined) warp.windowSize = update.window;
          return;
        case Reverb.name:
          const reverb = effect as Reverb;
          if (update.wet !== undefined) reverb.wet.value = update.wet;
          if (update.decay !== undefined) reverb.decay = update.decay;
          if (update.predelay !== undefined) reverb.preDelay = update.predelay;
          return;
        case Chorus.name:
          const chorus = effect as Chorus;
          if (update.wet !== undefined) chorus.wet.value = update.wet;
          if (update.frequency !== undefined)
            chorus.frequency.value = update.frequency;
          if (update.depth !== undefined) chorus.depth = update.depth;
          if (update.delay !== undefined) chorus.delayTime = update.delay;
          return;
        case FeedbackDelay.name:
          const delay = effect as FeedbackDelay;
          if (update.wet !== undefined) delay.wet.value = update.wet;
          if (update.delay !== undefined) delay.delayTime.value = update.delay;
          if (update.feedback !== undefined)
            delay.feedback.value = update.feedback;
          return;
        case ToneFilter.name:
          const filter = effect as ToneFilter;
          if (update.low !== undefined) filter.low.gain.value = update.low;
          if (update.mid !== undefined) filter.mid.gain.value = update.mid;
          if (update.high !== undefined) filter.high.gain.value = update.high;
          return;
      }
    }
  };
  // Dispose
  dispose() {
    this.channel.dispose();
    this.effects.forEach((effect) => effect.dispose());
  }
}
