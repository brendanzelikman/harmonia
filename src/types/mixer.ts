import { nanoid } from "@reduxjs/toolkit";
import * as Constants from "appConstants";
import { inRange } from "lodash";
import {
  Channel as ToneChannel,
  getDestination,
  InputNode,
  FFT,
  Waveform,
} from "tone";
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
import { Volume } from "./units";
import { TrackId } from "./tracks";
import { Effect, EffectNode, EffectId, EffectKey } from "./effect";
import {
  defaultReverb,
  defaultChorus,
  defaultFeedbackDelay,
  defaultPingPongDelay,
  defaultPhaser,
  defaultTremolo,
  defaultVibrato,
  defaultDistortion,
  defaultBitCrusher,
  defaultFilter,
  defaultEqualizer,
  defaultCompressor,
  defaultLimiter,
  defaultGain,
  defaultWarp,
} from "./effect";
import {
  ReverbEffect,
  ChorusEffect,
  FeedbackDelayEffect,
  PingPongDelayEffect,
  PhaserEffect,
  TremoloEffect,
  VibratoEffect,
  DistortionEffect,
  BitCrusherEffect,
  FilterEffect,
  EqualizerEffect,
  CompressorEffect,
  LimiterEffect,
  GainEffect,
  WarpEffect,
} from "./effect";

export interface ChannelProps {
  volume: Volume;
  pan: number;
  mute: boolean;
  solo: boolean;
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

export const initializeToneEffect = (
  node: EffectNode,
  id?: EffectId
): ToneEffect => ({
  node,
  id: id?.length ? id : nanoid(),
});

export const defaultMixer: Mixer = {
  id: "default-mixer",
  trackId: "default-pattern-track",
  volume: Constants.DEFAULT_VOLUME,
  pan: 0,
  mute: false,
  solo: false,
  effects: [],
};

type ToneEffect = {
  node: EffectNode;
  id: EffectId;
};

export class MixerInstance {
  channel: ToneChannel;
  effects: ToneEffect[] = [];
  fft: FFT;
  waveform: Waveform;

  constructor({
    volume = -30,
    pan = 0,
    mute = false,
    solo = false,
    effects = [],
  }: Mixer) {
    // Initialize the channel
    this.channel = new ToneChannel({
      volume,
      pan,
      mute,
      solo,
    });
    let newEffects = MixerInstance.createEffects(effects);
    for (const effect of newEffects) {
      this.effects.push(effect);
    }
    // Connect the effects to the channel
    const nodes = this.effects.map((e) => e.node) as InputNode[];
    this.fft = new FFT({ size: 2048 });
    this.waveform = new Waveform({ size: 2048 });

    this.channel = this.channel.chain(
      ...nodes,
      this.fft,
      this.waveform,
      getDestination()
    );
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

  // Get an effect by id
  getEffectById = (id: EffectId) => {
    return this.effects.find((e) => e.id === id);
  };

  // Add an effect by type
  addEffect = (key: EffectKey) => {
    let effect: ToneEffect;
    switch (key) {
      case "reverb":
        effect = MixerInstance.createReverb();
        break;
      case "chorus":
        effect = MixerInstance.createChorus();
        break;
      case "feedbackDelay":
        effect = MixerInstance.createFeedbackDelay();
        break;
      case "pingPongDelay":
        effect = MixerInstance.createPingPongDelay();
        break;
      case "phaser":
        effect = MixerInstance.createPhaser();
        break;
      case "tremolo":
        effect = MixerInstance.createTremolo();
        break;
      case "vibrato":
        effect = MixerInstance.createVibrato();
        break;
      case "distortion":
        effect = MixerInstance.createDistortion();
        break;
      case "bitcrusher":
        effect = MixerInstance.createBitCrusher();
        break;
      case "filter":
        effect = MixerInstance.createFilter();
        break;
      case "equalizer":
        effect = MixerInstance.createEqualizer();
        break;
      case "compressor":
        effect = MixerInstance.createCompressor();
        break;
      case "limiter":
        effect = MixerInstance.createLimiter();
        break;
      case "gain":
        effect = MixerInstance.createGain();
        break;
      case "warp":
        effect = MixerInstance.createWarp();
        break;
      default:
        throw new Error("Invalid effect type");
    }
    this.chainEffects([...this.effects, effect]);
    return effect.id;
  };

  public static defaultEffect = (key: EffectKey) => {
    switch (key) {
      case "reverb":
        return defaultReverb;
      case "chorus":
        return defaultChorus;
      case "feedbackDelay":
        return defaultFeedbackDelay;
      case "pingPongDelay":
        return defaultPingPongDelay;
      case "phaser":
        return defaultPhaser;
      case "tremolo":
        return defaultTremolo;
      case "vibrato":
        return defaultVibrato;
      case "distortion":
        return defaultDistortion;
      case "bitcrusher":
        return defaultBitCrusher;
      case "filter":
        return defaultFilter;
      case "equalizer":
        return defaultEqualizer;
      case "compressor":
        return defaultCompressor;
      case "limiter":
        return defaultLimiter;
      case "gain":
        return defaultGain;
      case "warp":
        return defaultWarp;
      default:
        throw new Error("Invalid effect type");
    }
  };

  // Update an effect by index with a partial update
  updateEffectByIndex = (index: number, update: Partial<Effect>) => {
    if (!inRange(index, 0, this.effects.length)) return;
    const effect = this.effects[index]?.node;
    if (effect) {
      switch (effect.name) {
        case "Reverb":
          const reverb = effect as Reverb;
          if (update.wet !== undefined) reverb.wet.value = update.wet;
          if (update.decay !== undefined) reverb.decay = update.decay;
          if (update.predelay !== undefined) reverb.preDelay = update.predelay;
          break;
        case "Chorus":
          const chorus = effect as Chorus;
          if (update.wet !== undefined) chorus.wet.value = update.wet;
          if (update.frequency !== undefined)
            chorus.frequency.value = update.frequency;
          if (update.depth !== undefined) chorus.depth = update.depth;
          if (update.delay !== undefined) chorus.delayTime = update.delay;
          break;
        case "FeedbackDelay":
          const delay = effect as FeedbackDelay;
          if (update.wet !== undefined) delay.wet.value = update.wet;
          if (update.delay !== undefined) delay.delayTime.value = update.delay;
          if (update.feedback !== undefined)
            delay.feedback.value = update.feedback;
          break;
        case "PingPongDelay":
          const pingPongDelay = effect as PingPongDelay;
          if (update.wet !== undefined) pingPongDelay.wet.value = update.wet;
          if (update.delay !== undefined)
            pingPongDelay.delayTime.value = update.delay;
          if (update.feedback !== undefined)
            pingPongDelay.feedback.value = update.feedback;
          break;
        case "Phaser":
          const phaser = effect as Phaser;
          if (update.wet !== undefined) phaser.wet.value = update.wet;
          if (update.frequency !== undefined)
            phaser.frequency.value = update.frequency;
          if (update.octaves !== undefined) phaser.octaves = update.octaves;
          break;
        case "Tremolo":
          const tremolo = effect as Tremolo;
          if (update.wet !== undefined) tremolo.wet.value = update.wet;
          if (update.frequency !== undefined)
            tremolo.frequency.value = update.frequency;
          if (update.depth !== undefined) tremolo.depth.value = update.depth;
          break;
        case "Vibrato":
          const vibrato = effect as Vibrato;
          if (update.wet !== undefined) vibrato.wet.value = update.wet;
          if (update.frequency !== undefined)
            vibrato.frequency.value = update.frequency;
          if (update.depth !== undefined) vibrato.depth.value = update.depth;
          break;
        case "Distortion":
          const distortion = effect as Distortion;
          if (update.wet !== undefined) distortion.wet.value = update.wet;
          if (update.distortion !== undefined)
            distortion.distortion = update.distortion;
          break;
        case "BitCrusher":
          const bitcrusher = effect as BitCrusher;
          if (update.wet !== undefined) bitcrusher.wet.value = update.wet;
          if (update.bits !== undefined) bitcrusher.bits.value = update.bits;
          break;
        case "Filter":
          const filter = effect as Filter;
          if (update.frequency !== undefined)
            filter.frequency.value = update.frequency;
          if (update.type !== undefined) filter.type = update.type;
          if (update.Q !== undefined) filter.Q.value = update.Q;
          break;
        case "EQ3":
          const eq = effect as EQ3;
          if (update.low !== undefined) eq.low.value = update.low;
          if (update.lowFrequency !== undefined)
            eq.lowFrequency.value = update.lowFrequency;
          if (update.mid !== undefined) eq.mid.value = update.mid;
          if (update.high !== undefined) eq.high.value = update.high;
          if (update.highFrequency !== undefined)
            eq.highFrequency.value = update.highFrequency;
          break;
        case "Compressor":
          const compressor = effect as Compressor;
          if (update.ratio !== undefined) compressor.ratio.value = update.ratio;
          if (update.threshold !== undefined)
            compressor.threshold.value = update.threshold;
          if (update.attack !== undefined)
            compressor.attack.value = update.attack;
          if (update.release !== undefined)
            compressor.release.value = update.release;
          if (update.knee !== undefined) compressor.knee.value = update.knee;
          break;
        case "Limiter":
          const limiter = effect as Limiter;
          if (update.threshold !== undefined)
            limiter.threshold.value = update.threshold;
          break;
        case "Gain":
          const gain = effect as Gain;
          if (update.gain !== undefined) gain.gain.value = update.gain;
          break;
        case "PitchShift":
          let warp = effect as PitchShift;
          if (update.wet !== undefined) warp.wet.value = update.wet;
          if (update.pitch !== undefined) warp.pitch = update.pitch;
          if (update.window !== undefined) warp.windowSize = update.window;
          break;
        default:
          break;
      }
    }
  };
  // Update an effect by id
  updateEffectById = (id: EffectId, update: Partial<Effect>) => {
    const effect = this.getEffectById(id);
    if (!effect) return;
    const index = this.effects.indexOf(effect);
    this.updateEffectByIndex(index, update);
  };

  // Remove an effect by index
  removeEffectByIndex = (index: number) => {
    if (!inRange(index, 0, this.effects.length)) return;
    const effect = this.effects[index];
    if (!effect) return;
    if (!effect.node.disposed) effect.node.dispose();
    const newEffects = [...this.effects];
    newEffects.splice(index, 1);
    return newEffects;
  };

  // Remove an effect by id
  removeEffectById = (id: EffectId) => {
    const effect = this.getEffectById(id);
    if (!effect) return;
    const index = this.effects.indexOf(effect);
    const newEffects = this.removeEffectByIndex(index);
    if (!newEffects) return;
    this.chainEffects(newEffects);
  };

  // Remove all effects
  removeAllEffects = () => {
    this.chainEffects([]);
  };

  // Rearrange an effect by index
  rearrangeEffectByIndex = (oldIndex: number, newIndex: number) => {
    const length = this.effects.length;
    if (!inRange(oldIndex, 0, length) || !inRange(newIndex, 0, length)) return;
    const effect = this.effects[oldIndex];
    if (!effect) return;
    const newEffects = [...this.effects];
    newEffects.splice(oldIndex, 1);
    newEffects.splice(newIndex, 0, effect);
    return newEffects;
  };

  // Rearrange an effect by id
  rearrangeEffectById = (id: EffectId, newIndex: number) => {
    const effect = this.getEffectById(id);
    if (!effect) return;

    const oldIndex = this.effects.indexOf(effect);
    if (oldIndex === -1) return;
    if (newIndex === oldIndex) return;

    const newEffects = this.rearrangeEffectByIndex(oldIndex, newIndex);
    if (!newEffects) return;

    this.chainEffects(newEffects);
  };

  // Create reverb
  public static createReverb = (reverb: ReverbEffect = defaultReverb) => {
    const reverbEffect = new Reverb({
      wet: reverb.wet ?? defaultReverb.wet,
      decay: reverb.decay ?? defaultReverb.decay,
      preDelay: reverb.predelay ?? defaultReverb.predelay,
    });
    return initializeToneEffect(reverbEffect, reverb.id);
  };

  // Create chorus
  public static createChorus = (chorus: ChorusEffect = defaultChorus) => {
    const chorusEffect = new Chorus({
      wet: chorus.wet ?? defaultChorus.wet,
      frequency: chorus.frequency ?? defaultChorus.frequency,
      delayTime: chorus.delay ?? defaultChorus.delay,
      depth: chorus.depth ?? defaultChorus.depth,
    }).start();
    return initializeToneEffect(chorusEffect, chorus.id);
  };

  // Create feedback delay
  public static createFeedbackDelay = (
    delay: FeedbackDelayEffect = defaultFeedbackDelay
  ) => {
    const delayEffect = new FeedbackDelay({
      wet: delay.wet ?? defaultFeedbackDelay.wet,
      delayTime: delay.delay ?? defaultFeedbackDelay.delay,
      feedback: delay.feedback ?? defaultFeedbackDelay.feedback,
    });
    return initializeToneEffect(delayEffect, delay.id);
  };

  // Create ping pong delay
  public static createPingPongDelay = (
    delay: PingPongDelayEffect = defaultPingPongDelay
  ) => {
    const delayEffect = new PingPongDelay({
      wet: delay.wet ?? defaultPingPongDelay.wet,
      delayTime: delay.delay ?? defaultPingPongDelay.delay,
      feedback: delay.feedback ?? defaultPingPongDelay.feedback,
    });
    return initializeToneEffect(delayEffect, delay.id);
  };

  // Create phaser
  public static createPhaser = (phaser: PhaserEffect = defaultPhaser) => {
    const phaserEffect = new Phaser({
      wet: phaser.wet ?? defaultPhaser.wet,
      frequency: phaser.frequency ?? defaultPhaser.frequency,
      octaves: phaser.octaves ?? defaultPhaser.octaves,
      baseFrequency: phaser.baseFrequency ?? defaultPhaser.baseFrequency,
    });
    return initializeToneEffect(phaserEffect, phaser.id);
  };

  // Create tremolo
  public static createTremolo = (tremolo: TremoloEffect = defaultTremolo) => {
    const tremoloEffect = new Tremolo({
      wet: tremolo.wet ?? defaultTremolo.wet,
      frequency: tremolo.frequency ?? defaultTremolo.frequency,
      depth: tremolo.depth ?? defaultTremolo.depth,
    }).start();
    return initializeToneEffect(tremoloEffect, tremolo.id);
  };

  // Create vibrato
  public static createVibrato = (vibrato: VibratoEffect = defaultVibrato) => {
    const vibratoEffect = new Vibrato({
      wet: vibrato.wet ?? defaultVibrato.wet,
      frequency: vibrato.frequency ?? defaultVibrato.frequency,
      depth: vibrato.depth ?? defaultVibrato.depth,
    });
    return initializeToneEffect(vibratoEffect, vibrato.id);
  };

  // Create distortion
  public static createDistortion = (
    distortion: DistortionEffect = defaultDistortion
  ) => {
    const distortionEffect = new Distortion({
      wet: distortion.wet ?? defaultDistortion.wet,
      distortion: distortion.distortion ?? defaultDistortion.distortion,
    });
    return initializeToneEffect(distortionEffect, distortion.id);
  };

  // Create bitcrusher
  public static createBitCrusher = (
    bitcrusher: BitCrusherEffect = defaultBitCrusher
  ) => {
    const bitcrusherEffect = new BitCrusher({
      bits: bitcrusher.bits ?? defaultBitCrusher.bits,
    });
    bitcrusherEffect.wet.value = bitcrusher.wet ?? defaultBitCrusher.wet;
    return initializeToneEffect(bitcrusherEffect, bitcrusher.id);
  };

  // Create filter
  public static createFilter = (filter: FilterEffect = defaultFilter) => {
    const filterEffect = new Filter({
      frequency: filter.frequency ?? defaultFilter.frequency,
      Q: filter.Q ?? defaultFilter.Q,
      type: "bandpass",
    });
    return initializeToneEffect(filterEffect, filter.id);
  };

  // Create equalizer
  public static createEqualizer = (eq: EqualizerEffect = defaultEqualizer) => {
    const eqEffect = new EQ3({
      low: eq.low ?? defaultEqualizer.low,
      mid: eq.mid ?? defaultEqualizer.mid,
      high: eq.high ?? defaultEqualizer.high,
      lowFrequency: eq.lowFrequency ?? defaultEqualizer.lowFrequency,
      highFrequency: eq.highFrequency ?? defaultEqualizer.highFrequency,
    });
    return initializeToneEffect(eqEffect, eq.id);
  };

  // Create compressor
  public static createCompressor = (
    compressor: CompressorEffect = defaultCompressor
  ) => {
    const compressorEffect = new Compressor({
      threshold: compressor.threshold ?? defaultCompressor.threshold,
      ratio: compressor.ratio ?? defaultCompressor.ratio,
      attack: compressor.attack ?? defaultCompressor.attack,
      release: compressor.release ?? defaultCompressor.release,
      knee: compressor.knee ?? defaultCompressor.knee,
    });
    return initializeToneEffect(compressorEffect, compressor.id);
  };

  // Create limiter
  public static createLimiter = (limiter: LimiterEffect = defaultLimiter) => {
    const limiterEffect = new Limiter({
      threshold: limiter.threshold ?? defaultLimiter.threshold,
    });
    return initializeToneEffect(limiterEffect, limiter.id);
  };

  // Create gain
  public static createGain = (gain: GainEffect = defaultGain) => {
    const gainEffect = new Gain({
      gain: gain.gain ?? defaultGain.gain,
    });
    return initializeToneEffect(gainEffect, gain.id);
  };

  // Create warp
  public static createWarp = (warp: WarpEffect = defaultWarp) => {
    const pitchShift = new PitchShift({
      wet: warp.wet ?? defaultWarp.wet,
      pitch: warp.pitch ?? defaultWarp.pitch,
      windowSize: warp.window ?? defaultWarp.window,
    });
    return initializeToneEffect(pitchShift, warp.id);
  };

  public static createEffect = (effect: Effect) => {
    if (effect.key === "reverb") {
      return this.createReverb(effect as ReverbEffect);
    }
    if (effect.key === "chorus") {
      return this.createChorus(effect as ChorusEffect);
    }
    if (effect.key === "feedbackDelay") {
      return this.createFeedbackDelay(effect as FeedbackDelayEffect);
    }
    if (effect.key === "pingPongDelay") {
      return this.createPingPongDelay(effect as PingPongDelayEffect);
    }
    if (effect.key === "phaser") {
      return this.createPhaser(effect as PhaserEffect);
    }
    if (effect.key === "tremolo") {
      return this.createTremolo(effect as TremoloEffect);
    }
    if (effect.key === "vibrato") {
      return this.createVibrato(effect as VibratoEffect);
    }
    if (effect.key === "distortion") {
      return this.createDistortion(effect as DistortionEffect);
    }
    if (effect.key === "bitcrusher") {
      return this.createBitCrusher(effect as BitCrusherEffect);
    }
    if (effect.key === "filter") {
      return this.createFilter(effect as FilterEffect);
    }
    if (effect.key === "equalizer") {
      return this.createEqualizer(effect as EqualizerEffect);
    }
    if (effect.key === "compressor") {
      return this.createCompressor(effect as CompressorEffect);
    }
    if (effect.key === "limiter") {
      return this.createLimiter(effect as LimiterEffect);
    }
    if (effect.key === "gain") {
      return this.createGain(effect as GainEffect);
    }
    if (effect.key === "warp") {
      return this.createWarp(effect as WarpEffect);
    }
    throw new Error("Invalid effect type");
  };

  // Create new effects
  public static createEffects = (effects: Effect[]) => {
    const newEffects = [];

    for (const effect of effects) {
      const newEffect = this.createEffect(effect);
      newEffects.push(newEffect);
    }
    return newEffects;
  };

  // Reset effect
  resetEffect = (effect: Effect) => {
    const match = this.getEffectById(effect.id);
    if (!match) return;
    const index = this.effects.indexOf(match);
    const newEffects = [...this.effects];
    newEffects[index] = MixerInstance.createEffect(
      MixerInstance.defaultEffect(effect.key)
    );
    this.chainEffects(newEffects);
  };

  // Chain the effects
  chainEffects = (effects: ToneEffect[]) => {
    this.channel.disconnect();
    this.effects.forEach((e) => e.node.disconnect());

    // Connect the new effects to the channel
    const newEffects = effects.map((e) => e);
    const nodes = newEffects.map((e) => e.node) as InputNode[];

    this.effects = newEffects;
    this.channel = this.channel.chain(
      ...nodes,
      this.fft,
      this.waveform,
      getDestination()
    );
  };

  // Dispose the channel and all of its effects
  dispose() {
    this.channel.dispose();
    this.fft.dispose();
    this.waveform.dispose();
    this.effects.forEach((e) => e.node.dispose());
    this.effects = [];
  }
}
