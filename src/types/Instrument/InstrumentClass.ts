import {
  InstrumentKey,
  Instrument,
  InstrumentId,
  BitCrusherEffect,
  ChorusEffect,
  CompressorEffect,
  defaultBitCrusher,
  defaultChorus,
  defaultCompressor,
  defaultDistortion,
  defaultEqualizer,
  defaultFeedbackDelay,
  defaultFilter,
  defaultGain,
  defaultLimiter,
  defaultPhaser,
  defaultPingPongDelay,
  defaultReverb,
  defaultTremolo,
  defaultVibrato,
  defaultWarp,
  DistortionEffect,
  EffectId,
  EffectKey,
  EqualizerEffect,
  FeedbackDelayEffect,
  FilterEffect,
  GainEffect,
  getSafeToneEffect,
  getToneEffectProps,
  getTypedEffectNode,
  initializeToneEffect,
  LimiterEffect,
  PhaserEffect,
  PingPongDelayEffect,
  ReverbEffect,
  SafeEffect,
  ToneEffect,
  TremoloEffect,
  VibratoEffect,
  WarpEffect,
} from "./InstrumentTypes";
import { Volume } from "../units";
import {
  getInstrumentSamplesBaseUrl,
  getInstrumentSamplesMap,
} from "./InstrumentFunctions";
import {
  Recorder,
  Sampler,
  Channel,
  FFT,
  Waveform,
  InputNode,
  getDestination,
  Signal,
  Param,
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
  SamplerOptions,
} from "tone";
import { TrackId } from "types/Track/TrackTypes";

/** A map of instrument IDs to live audio instances. */
export type LiveInstrumentMap = Record<InstrumentId, LiveAudioInstance>;

// Live audio instances
export const LIVE_AUDIO_INSTANCES: LiveInstrumentMap = {};
export const LIVE_RECORDER_INSTANCE = new Recorder();

export const getActiveInstances: () => Set<string> = () => {
  const instances: string[] = [];
  let solo = false;
  for (const id in LIVE_AUDIO_INSTANCES) {
    const instance = LIVE_AUDIO_INSTANCES[id];
    if (instance.solo) {
      solo = true;
    }
    if (instance.sampler && !instance.mute && (!solo || instance.solo)) {
      instances.push(instance.id);
    }
  }
  return new Set(instances);
};

/** Initialize the sampler with the given object. */
export const initializeSampler = (obj: LiveAudioInstance) => {
  return obj.sampler.chain(
    obj.channel,
    ...LiveAudioInstance.createToneEffects(obj.effects).map((e) => e.node),
    obj.fft,
    obj.waveform,
    getDestination()
  );
};
export type LiveSamplerOptions = Partial<{
  urls: SamplerOptions["urls"];
  onload: SamplerOptions["onload"];
}>;

/** The live audio instance class stores Tone.js objects and effects. */
export class LiveAudioInstance {
  id: InstrumentId;
  urls?: SamplerOptions["urls"];
  trackId: TrackId;
  key: InstrumentKey;
  sampler: Sampler;
  channel: Channel;
  effects: ToneEffect[] = [];
  fft: FFT;
  waveform: Waveform;

  constructor(
    props: Instrument &
      Partial<{
        urls: SamplerOptions["urls"];
        onload: SamplerOptions["onload"];
      }>
  ) {
    // Store the id and key
    const { id, trackId, key } = props;
    this.id = id;
    this.trackId = trackId;
    this.key = key;
    this.urls = props.urls;

    // Initialize the sampler
    const isLocal = !!props.urls;
    const urls = props.urls || getInstrumentSamplesMap(props.key);
    const baseUrl = getInstrumentSamplesBaseUrl(props.key);
    const samplerOptions: Partial<SamplerOptions> = isLocal
      ? urls
      : { urls, baseUrl };
    if (props.onload) samplerOptions.onload = props.onload;
    this.sampler = new Sampler(samplerOptions);

    // Initialize the channel
    const { volume, pan, mute, solo, effects } = props;
    const channelOptions = { volume, pan, mute, solo };
    this.channel = new Channel(channelOptions);

    // Initialize the effects
    this.effects = LiveAudioInstance.createToneEffects(effects);
    const nodes = this.effects.map((e) => e.node) as InputNode[];

    // Initialize the FFT and waveform
    this.fft = new FFT({ size: 2048 });
    this.waveform = new Waveform({ size: 2048 });

    // Chain the sampler, effects, and analyzers to the destination
    this.sampler = this.sampler.chain(
      this.channel,
      ...nodes,
      this.fft,
      this.waveform,
      getDestination()
    );

    // Add to the record if not already in there
    if (LIVE_AUDIO_INSTANCES[id]) LIVE_AUDIO_INSTANCES[id].dispose();
    LIVE_AUDIO_INSTANCES[id] = this;
  }

  /**
   * Get the initialization props for the instrument.
   * @returns The initialization props.
   */
  getInitializationProps = () => {
    return {
      id: this.id,
      trackId: this.trackId,
      key: this.key,
      volume: this.volume,
      pan: this.pan,
      mute: this.mute,
      solo: this.solo,
      effects: this.effects.map(getSafeToneEffect),
      urls: this.urls,
    };
  };

  /**
   * The volume of the instrument in decibels.
   */
  get volume() {
    return this.channel.volume.value;
  }
  set volume(value: Volume) {
    if (!this.mute) this.channel.volume.value = value;
  }
  /**
   * The pan of the instrument from -1 to 1.
   */
  get pan() {
    return this.channel.pan.value;
  }
  set pan(value: number) {
    this.channel.pan.value = value;
  }
  /**
   * A boolean indicating whether the instrument is muted or not.
   */
  get mute() {
    return this.channel.mute;
  }
  set mute(value: boolean) {
    this.channel.mute = value;
  }
  /**
   * A boolean indicating whether the instrument is soloed or not.
   */
  get solo() {
    return this.channel.solo;
  }
  set solo(value: boolean) {
    this.channel.solo = value;
  }

  /**
   * Get an effect by ID from the instrument.
   * @param id - The effect ID.
   * @returns The effect.
   */
  getEffectById = (id?: EffectId) => {
    if (!id) return;
    return this.effects.find((e) => e.id === id);
  };

  /**
   * Create and add an effect to the instrument based on the given key.
   * @param key - The effect key.
   * @returns The effect ID.
   */
  addEffect = (key: EffectKey) => {
    let effect: ToneEffect;
    switch (key) {
      case "reverb":
        effect = LiveAudioInstance.createReverb();
        break;
      case "chorus":
        effect = LiveAudioInstance.createChorus();
        break;
      case "feedbackDelay":
        effect = LiveAudioInstance.createFeedbackDelay();
        break;
      case "pingPongDelay":
        effect = LiveAudioInstance.createPingPongDelay();
        break;
      case "phaser":
        effect = LiveAudioInstance.createPhaser();
        break;
      case "tremolo":
        effect = LiveAudioInstance.createTremolo();
        break;
      case "vibrato":
        effect = LiveAudioInstance.createVibrato();
        break;
      case "distortion":
        effect = LiveAudioInstance.createDistortion();
        break;
      case "bitcrusher":
        effect = LiveAudioInstance.createBitCrusher();
        break;
      case "filter":
        effect = LiveAudioInstance.createFilter();
        break;
      case "equalizer":
        effect = LiveAudioInstance.createEqualizer();
        break;
      case "compressor":
        effect = LiveAudioInstance.createCompressor();
        break;
      case "limiter":
        effect = LiveAudioInstance.createLimiter();
        break;
      case "gain":
        effect = LiveAudioInstance.createGain();
        break;
      case "warp":
        effect = LiveAudioInstance.createWarp();
        break;
      default:
        throw new Error("Invalid effect type");
    }
    this.chainEffects([...this.effects, effect]);
    return effect.id;
  };

  /**
   * Update an effect by id with a partial update.
   * @param index The id of the effect.
   * @param update The partial update.
   */
  updateEffectById = (id: EffectId, update: Partial<SafeEffect>) => {
    // Get the corresponding effect
    const effect = this.getEffectById(id);
    if (!effect) return;

    // Get the typed node of the effect
    const typedNode = getTypedEffectNode(effect);
    if (!typedNode) return;

    // Get the property values of the effect
    const props = getToneEffectProps(effect);

    // Update the values
    for (const key in props) {
      if (update[key] !== undefined) {
        const isSignal = typedNode[key] instanceof Signal;
        const isParam = typedNode[key] instanceof Param;
        if (isSignal || isParam) {
          typedNode[key].value = update[key];
        } else {
          typedNode[key] = update[key];
        }
      }
    }
  };

  /**
   * Remove an effect by id.
   * @param id - The id of the effect.
   * @returns The new list of effects.
   */
  removeEffectById = (id: EffectId) => {
    const effect = this.getEffectById(id);
    if (!effect) return;

    // Find the index of the effect
    const index = this.effects.indexOf(effect);
    if (index === -1) return;

    // Dispose of the effect
    const effectAtIndex = this.effects[index];
    if (!effectAtIndex.node.disposed) effectAtIndex.node.dispose();

    // Remove the effect from the list
    const newEffects = [...this.effects];
    newEffects.splice(index, 1);

    // Chain the new effects
    this.chainEffects(newEffects);
  };

  /**
   * Remove all effects from the instrument.
   */
  removeAllEffects = () => {
    this.chainEffects([]);
  };

  // Rearrange an effect by id
  rearrangeEffectById = (id: EffectId, newIndex: number) => {
    const effect = this.getEffectById(id);
    if (!effect) return;

    // Get the old index of the effect
    const oldIndex = this.effects.indexOf(effect);
    if (oldIndex === -1) return;

    // Don't rearrange if the indices are the same
    if (newIndex === oldIndex) return;

    // Remove the effect from the old index
    const newEffects = [...this.effects];
    newEffects.splice(oldIndex, 1);
    newEffects.splice(newIndex, 0, effect);

    // Chain the new effects
    this.chainEffects(newEffects);
  };

  /**
   * Create a `ToneEffect` from the initial values provided.
   * @param effect - The values of the effect to create.
   * @returns The effect.
   */
  public static createToneEffect = (effect: SafeEffect) => {
    switch (effect.key) {
      case "reverb":
        return this.createReverb(effect as ReverbEffect);
      case "chorus":
        return this.createChorus(effect as ChorusEffect);
      case "feedbackDelay":
        return this.createFeedbackDelay(effect as FeedbackDelayEffect);
      case "pingPongDelay":
        return this.createPingPongDelay(effect as PingPongDelayEffect);
      case "phaser":
        return this.createPhaser(effect as PhaserEffect);
      case "tremolo":
        return this.createTremolo(effect as TremoloEffect);
      case "vibrato":
        return this.createVibrato(effect as VibratoEffect);
      case "distortion":
        return this.createDistortion(effect as DistortionEffect);
      case "bitcrusher":
        return this.createBitCrusher(effect as BitCrusherEffect);
      case "filter":
        return this.createFilter(effect as FilterEffect);
      case "equalizer":
        return this.createEqualizer(effect as EqualizerEffect);
      case "compressor":
        return this.createCompressor(effect as CompressorEffect);
      case "limiter":
        return this.createLimiter(effect as LimiterEffect);
      case "gain":
        return this.createGain(effect as GainEffect);
      case "warp":
        return this.createWarp(effect as WarpEffect);
      default:
        throw new Error("Invalid effect type");
    }
  };

  /**
   * Create a list of `ToneEffects` from the initial values provided.
   * @param effects - The values of the effects to create.
   * @returns The effects.
   */
  public static createToneEffects = (effects: SafeEffect[]) => {
    const newEffects = [];

    for (const effect of effects) {
      const newEffect = this.createToneEffect(effect);
      newEffects.push(newEffect);
    }
    return newEffects;
  };

  /**
   * Reset the effect to its default values and rechain all effects.
   * @param effect - The effect to reset.
   */
  resetEffect = (effect: SafeEffect) => {
    const match = this.getEffectById(effect.id);
    if (!match) return;
    const index = this.effects.indexOf(match);
    const newEffects = [...this.effects];
    const defaultEffect = LiveAudioInstance.defaultEffect(effect.key);
    newEffects[index] = {
      ...LiveAudioInstance.createToneEffect(defaultEffect),
      id: effect.id,
    };
    this.chainEffects(newEffects);
  };

  /**
   * Chain a list of effects to the instrument,
   * temporarily disconnecting it and replacing its previous effects.
   * @param effects - The effects to chain.
   */
  chainEffects = (effects: ToneEffect[]) => {
    // Disconnect the sampler, channel, and effects
    this.sampler.disconnect();
    this.channel.disconnect();
    this.effects.forEach((e) => e.node.disconnect());

    // Chain the sampler, effects, and analyzers to the destination
    const newEffects = [...effects];
    const nodes = newEffects.map((e) => e.node) as InputNode[];
    this.sampler = this.sampler.chain(
      this.channel,
      ...nodes,
      this.fft,
      this.waveform,
      getDestination()
    );

    // Update the effects
    this.effects = effects;
  };

  /**
   * Create a reverb effect from the initial values provided.
   * @param reverb - Optional. The parameters for the reverb effect.
   * @returns The reverb effect.
   */
  public static createReverb = (reverb: ReverbEffect = defaultReverb) => {
    const reverbEffect = new Reverb(reverb);
    return initializeToneEffect(reverbEffect, reverb.id);
  };

  /**
   * Create a chorus effect from the initial values provided.
   * @param chorus - Optional. The parameters for the chorus effect.
   * @returns The chorus effect.
   */
  public static createChorus = (chorus: ChorusEffect = defaultChorus) => {
    const chorusEffect = new Chorus(chorus).start();
    return initializeToneEffect(chorusEffect, chorus.id);
  };

  /**
   * Create a feedback delay effect from the initial values provided.
   * @param delay - Optional. The parameters for the feedback delay effect.
   * @returns The feedback delay effect.
   */
  public static createFeedbackDelay = (
    delay: FeedbackDelayEffect = defaultFeedbackDelay
  ) => {
    const delayEffect = new FeedbackDelay(delay);
    return initializeToneEffect(delayEffect, delay.id);
  };

  /**
   * Create a ping pong delay effect from the initial values provided.
   * @param delay - Optional. The parameters for the ping pong delay effect.
   * @returns The ping pong delay effect.
   */
  public static createPingPongDelay = (
    delay: PingPongDelayEffect = defaultPingPongDelay
  ) => {
    const delayEffect = new PingPongDelay(delay);
    return initializeToneEffect(delayEffect, delay.id);
  };

  /**
   * Create a phaser effect from the initial values provided.
   * @param phaser - Optional. The parameters for the phaser effect.
   * @returns The phaser effect.
   */
  public static createPhaser = (phaser: PhaserEffect = defaultPhaser) => {
    const phaserEffect = new Phaser(phaser);
    return initializeToneEffect(phaserEffect, phaser.id);
  };

  /**
   * Create a tremolo effect from the initial values provided.
   * @param tremolo - Optional. The parameters for the tremolo effect.
   * @returns The tremolo effect.
   */
  public static createTremolo = (tremolo: TremoloEffect = defaultTremolo) => {
    const tremoloEffect = new Tremolo(tremolo).start();
    return initializeToneEffect(tremoloEffect, tremolo.id);
  };

  /**
   * Create a vibrato effect from the initial values provided.
   * @param vibrato - Optional. The parameters for the vibrato effect.
   * @returns The vibrato effect.
   */
  public static createVibrato = (vibrato: VibratoEffect = defaultVibrato) => {
    const vibratoEffect = new Vibrato(vibrato);
    return initializeToneEffect(vibratoEffect, vibrato.id);
  };

  /**
   * Create a distortion effect from the initial values provided.
   * @param distortion - Optional. The parameters for the distortion effect.
   * @returns The distortion effect.
   */
  public static createDistortion = (
    distortion: DistortionEffect = defaultDistortion
  ) => {
    const distortionEffect = new Distortion(distortion);
    return initializeToneEffect(distortionEffect, distortion.id);
  };

  /**
   * Create a bitcrusher effect from the initial values provided.
   * @param bitcrusher - Optional. The parameters for the bitcrusher effect.
   * @returns The bitcrusher effect.
   */
  public static createBitCrusher = (
    bitcrusher: BitCrusherEffect = defaultBitCrusher
  ) => {
    const bitcrusherEffect = new BitCrusher(bitcrusher);
    return initializeToneEffect(bitcrusherEffect, bitcrusher.id);
  };

  /**
   * Create a filter effect from the initial values provided.
   * @param filter - Optional. The parameters for the filter effect.
   * @returns The filter effect.
   */
  public static createFilter = (filter: FilterEffect = defaultFilter) => {
    const filterEffect = new Filter({ ...filter, type: "bandpass" });
    return initializeToneEffect(filterEffect, filter.id);
  };

  /**
   * Create an equalizer effect from the initial values provided.
   * @param eq - Optional. The parameters for the equalizer effect.
   * @returns The equalizer effect.
   */
  public static createEqualizer = (eq: EqualizerEffect = defaultEqualizer) => {
    const eqEffect = new EQ3(eq);
    return initializeToneEffect(eqEffect, eq.id);
  };

  /**
   * Create a compressor effect from the initial values provided.
   * @param compressor - Optional. The parameters for the compressor effect.
   * @returns The compressor effect.
   */
  public static createCompressor = (
    compressor: CompressorEffect = defaultCompressor
  ) => {
    const compressorEffect = new Compressor(compressor);
    return initializeToneEffect(compressorEffect, compressor.id);
  };

  /**
   * Create a limiter effect from the initial values provided.
   * @param limiter - Optional. The parameters for the limiter effect.
   * @returns The limiter effect.
   */
  public static createLimiter = (limiter: LimiterEffect = defaultLimiter) => {
    const limiterEffect = new Limiter(limiter);
    return initializeToneEffect(limiterEffect, limiter.id);
  };

  /**
   * Create a gain effect from the initial values provided.
   * @param gain - Optional. The parameters for the gain effect.
   * @returns The gain effect.
   */
  public static createGain = (gain: GainEffect = defaultGain) => {
    const gainEffect = new Gain(gain);
    return initializeToneEffect(gainEffect, gain.id);
  };

  /**
   * Create a warp effect from the initial values provided.
   * @param warp - Optional. The parameters for the warp effect.
   * @returns The warp effect.
   */
  public static createWarp = (warp: WarpEffect = defaultWarp) => {
    const pitchShift = new PitchShift(warp);
    return initializeToneEffect(pitchShift, warp.id);
  };

  /**
   * Return the default effect for the given key.
   */
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

  /**
   * A boolean indicating whether the instrument is loaded or not.
   * @returns True if the instrument is loaded, false otherwise.
   */
  isLoaded() {
    return this.sampler?.loaded && !this.sampler?.disposed;
  }

  /**
   * Dispose of the instrument and all of its effects.
   */
  dispose() {
    this.sampler.dispose();
    this.channel.dispose();
    this.fft.dispose();
    this.waveform.dispose();
    this.effects.forEach((e) => e.node.dispose());
    this.effects = [];
  }
}
