import * as Tone from "tone";
import { InstrumentKey, Instrument, InstrumentId } from "./InstrumentTypes";
import * as Instruments from "../Instrument";
import { Volume } from "../units";

/** A map of instrument IDs to live audio instances. */
export type LiveInstrumentMap = Record<InstrumentId, LiveAudioInstance>;

/** The global map of live audio instances. */
export const LIVE_AUDIO_INSTANCES: LiveInstrumentMap = {};

/** The live recorder instance. */
export const LIVE_RECORDER_INSTANCE = new Tone.Recorder();

/** The live audio instance class stores Tone.js objects and effects. */
export class LiveAudioInstance {
  id: InstrumentId;
  key: InstrumentKey;
  sampler: Tone.Sampler;
  channel: Tone.Channel;
  effects: Instruments.ToneEffect[] = [];
  fft: Tone.FFT;
  waveform: Tone.Waveform;

  constructor({
    id,
    key,
    volume = -30,
    pan = 0,
    mute = false,
    solo = false,
    effects = [],
  }: Instrument) {
    // Store the id and key
    this.id = id;
    this.key = key;

    // Initialize the sampler
    const urls = Instruments.getInstrumentSamplesMap(key);
    const baseUrl = Instruments.getInstrumentSamplesBaseUrl(key);
    this.sampler = new Tone.Sampler({ urls, baseUrl });

    // Initialize the channel
    this.channel = new Tone.Channel({
      volume,
      pan,
      mute,
      solo,
    });

    // Initialize the effects
    this.effects = LiveAudioInstance.createToneEffects(effects);
    const nodes = this.effects.map((e) => e.node) as Tone.InputNode[];

    // Initialize the FFT and waveform
    this.fft = new Tone.FFT({ size: 2048 });
    this.waveform = new Tone.Waveform({ size: 2048 });

    // Chain the sampler, effects, and analyzers to the destination
    this.sampler = this.sampler.chain(
      this.channel,
      ...nodes,
      this.fft,
      this.waveform,
      Tone.getDestination()
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
      key: this.key,
      volume: this.volume,
      pan: this.pan,
      mute: this.mute,
      solo: this.solo,
      effects: this.effects.map(Instruments.getSafeToneEffect),
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
  getEffectById = (id: Instruments.EffectId) => {
    return this.effects.find((e) => e.id === id);
  };

  /**
   * Create and add an effect to the instrument based on the given key.
   * @param key - The effect key.
   * @returns The effect ID.
   */
  addEffect = (key: Instruments.EffectKey) => {
    let effect: Instruments.ToneEffect;
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
  updateEffectById = (
    id: Instruments.EffectId,
    update: Partial<Instruments.SafeEffect>
  ) => {
    // Get the corresponding effect
    const effect = this.getEffectById(id);
    if (!effect) return;

    // Get the typed node of the effect
    const typedNode = Instruments.getTypedEffectNode(effect);
    if (!typedNode) return;

    // Get the property values of the effect
    const props = Instruments.getToneEffectProps(effect);

    // Update the values
    for (const key in props) {
      if (update[key] !== undefined) {
        const isSignal = typedNode[key] instanceof Tone.Signal;
        const isParam = typedNode[key] instanceof Tone.Param;
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
  removeEffectById = (id: Instruments.EffectId) => {
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
  rearrangeEffectById = (id: Instruments.EffectId, newIndex: number) => {
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
  public static createToneEffect = (effect: Instruments.SafeEffect) => {
    switch (effect.key) {
      case "reverb":
        return this.createReverb(effect as Instruments.ReverbEffect);
      case "chorus":
        return this.createChorus(effect as Instruments.ChorusEffect);
      case "feedbackDelay":
        return this.createFeedbackDelay(
          effect as Instruments.FeedbackDelayEffect
        );
      case "pingPongDelay":
        return this.createPingPongDelay(
          effect as Instruments.PingPongDelayEffect
        );
      case "phaser":
        return this.createPhaser(effect as Instruments.PhaserEffect);
      case "tremolo":
        return this.createTremolo(effect as Instruments.TremoloEffect);
      case "vibrato":
        return this.createVibrato(effect as Instruments.VibratoEffect);
      case "distortion":
        return this.createDistortion(effect as Instruments.DistortionEffect);
      case "bitcrusher":
        return this.createBitCrusher(effect as Instruments.BitCrusherEffect);
      case "filter":
        return this.createFilter(effect as Instruments.FilterEffect);
      case "equalizer":
        return this.createEqualizer(effect as Instruments.EqualizerEffect);
      case "compressor":
        return this.createCompressor(effect as Instruments.CompressorEffect);
      case "limiter":
        return this.createLimiter(effect as Instruments.LimiterEffect);
      case "gain":
        return this.createGain(effect as Instruments.GainEffect);
      case "warp":
        return this.createWarp(effect as Instruments.WarpEffect);
      default:
        throw new Error("Invalid effect type");
    }
  };

  /**
   * Create a list of `ToneEffects` from the initial values provided.
   * @param effects - The values of the effects to create.
   * @returns The effects.
   */
  public static createToneEffects = (effects: Instruments.SafeEffect[]) => {
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
  resetEffect = (effect: Instruments.SafeEffect) => {
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
  chainEffects = (effects: Instruments.ToneEffect[]) => {
    // Disconnect the sampler, channel, and effects
    this.sampler.disconnect();
    this.channel.disconnect();
    this.effects.forEach((e) => e.node.disconnect());

    // Chain the sampler, effects, and analyzers to the destination
    const newEffects = [...effects];
    const nodes = newEffects.map((e) => e.node) as Tone.InputNode[];
    this.sampler = this.sampler.chain(
      this.channel,
      ...nodes,
      this.fft,
      this.waveform,
      Tone.getDestination()
    );

    // Update the effects
    this.effects = effects;
  };

  /**
   * Create a reverb effect from the initial values provided.
   * @param reverb - Optional. The parameters for the reverb effect.
   * @returns The reverb effect.
   */
  public static createReverb = (
    reverb: Instruments.ReverbEffect = Instruments.defaultReverb
  ) => {
    const reverbEffect = new Tone.Reverb(reverb);
    return Instruments.initializeToneEffect(reverbEffect, reverb.id);
  };

  /**
   * Create a chorus effect from the initial values provided.
   * @param chorus - Optional. The parameters for the chorus effect.
   * @returns The chorus effect.
   */
  public static createChorus = (
    chorus: Instruments.ChorusEffect = Instruments.defaultChorus
  ) => {
    const chorusEffect = new Tone.Chorus(chorus).start();
    return Instruments.initializeToneEffect(chorusEffect, chorus.id);
  };

  /**
   * Create a feedback delay effect from the initial values provided.
   * @param delay - Optional. The parameters for the feedback delay effect.
   * @returns The feedback delay effect.
   */
  public static createFeedbackDelay = (
    delay: Instruments.FeedbackDelayEffect = Instruments.defaultFeedbackDelay
  ) => {
    const delayEffect = new Tone.FeedbackDelay(delay);
    return Instruments.initializeToneEffect(delayEffect, delay.id);
  };

  /**
   * Create a ping pong delay effect from the initial values provided.
   * @param delay - Optional. The parameters for the ping pong delay effect.
   * @returns The ping pong delay effect.
   */
  public static createPingPongDelay = (
    delay: Instruments.PingPongDelayEffect = Instruments.defaultPingPongDelay
  ) => {
    const delayEffect = new Tone.PingPongDelay(delay);
    return Instruments.initializeToneEffect(delayEffect, delay.id);
  };

  /**
   * Create a phaser effect from the initial values provided.
   * @param phaser - Optional. The parameters for the phaser effect.
   * @returns The phaser effect.
   */
  public static createPhaser = (
    phaser: Instruments.PhaserEffect = Instruments.defaultPhaser
  ) => {
    const phaserEffect = new Tone.Phaser(phaser);
    return Instruments.initializeToneEffect(phaserEffect, phaser.id);
  };

  /**
   * Create a tremolo effect from the initial values provided.
   * @param tremolo - Optional. The parameters for the tremolo effect.
   * @returns The tremolo effect.
   */
  public static createTremolo = (
    tremolo: Instruments.TremoloEffect = Instruments.defaultTremolo
  ) => {
    const tremoloEffect = new Tone.Tremolo(tremolo).start();
    return Instruments.initializeToneEffect(tremoloEffect, tremolo.id);
  };

  /**
   * Create a vibrato effect from the initial values provided.
   * @param vibrato - Optional. The parameters for the vibrato effect.
   * @returns The vibrato effect.
   */
  public static createVibrato = (
    vibrato: Instruments.VibratoEffect = Instruments.defaultVibrato
  ) => {
    const vibratoEffect = new Tone.Vibrato(vibrato);
    return Instruments.initializeToneEffect(vibratoEffect, vibrato.id);
  };

  /**
   * Create a distortion effect from the initial values provided.
   * @param distortion - Optional. The parameters for the distortion effect.
   * @returns The distortion effect.
   */
  public static createDistortion = (
    distortion: Instruments.DistortionEffect = Instruments.defaultDistortion
  ) => {
    const distortionEffect = new Tone.Distortion(distortion);
    return Instruments.initializeToneEffect(distortionEffect, distortion.id);
  };

  /**
   * Create a bitcrusher effect from the initial values provided.
   * @param bitcrusher - Optional. The parameters for the bitcrusher effect.
   * @returns The bitcrusher effect.
   */
  public static createBitCrusher = (
    bitcrusher: Instruments.BitCrusherEffect = Instruments.defaultBitCrusher
  ) => {
    const bitcrusherEffect = new Tone.BitCrusher(bitcrusher);
    return Instruments.initializeToneEffect(bitcrusherEffect, bitcrusher.id);
  };

  /**
   * Create a filter effect from the initial values provided.
   * @param filter - Optional. The parameters for the filter effect.
   * @returns The filter effect.
   */
  public static createFilter = (
    filter: Instruments.FilterEffect = Instruments.defaultFilter
  ) => {
    const filterEffect = new Tone.Filter({ ...filter, type: "bandpass" });
    return Instruments.initializeToneEffect(filterEffect, filter.id);
  };

  /**
   * Create an equalizer effect from the initial values provided.
   * @param eq - Optional. The parameters for the equalizer effect.
   * @returns The equalizer effect.
   */
  public static createEqualizer = (
    eq: Instruments.EqualizerEffect = Instruments.defaultEqualizer
  ) => {
    const eqEffect = new Tone.EQ3(eq);
    return Instruments.initializeToneEffect(eqEffect, eq.id);
  };

  /**
   * Create a compressor effect from the initial values provided.
   * @param compressor - Optional. The parameters for the compressor effect.
   * @returns The compressor effect.
   */
  public static createCompressor = (
    compressor: Instruments.CompressorEffect = Instruments.defaultCompressor
  ) => {
    const compressorEffect = new Tone.Compressor(compressor);
    return Instruments.initializeToneEffect(compressorEffect, compressor.id);
  };

  /**
   * Create a limiter effect from the initial values provided.
   * @param limiter - Optional. The parameters for the limiter effect.
   * @returns The limiter effect.
   */
  public static createLimiter = (
    limiter: Instruments.LimiterEffect = Instruments.defaultLimiter
  ) => {
    const limiterEffect = new Tone.Limiter(limiter);
    return Instruments.initializeToneEffect(limiterEffect, limiter.id);
  };

  /**
   * Create a gain effect from the initial values provided.
   * @param gain - Optional. The parameters for the gain effect.
   * @returns The gain effect.
   */
  public static createGain = (
    gain: Instruments.GainEffect = Instruments.defaultGain
  ) => {
    const gainEffect = new Tone.Gain(gain);
    return Instruments.initializeToneEffect(gainEffect, gain.id);
  };

  /**
   * Create a warp effect from the initial values provided.
   * @param warp - Optional. The parameters for the warp effect.
   * @returns The warp effect.
   */
  public static createWarp = (
    warp: Instruments.WarpEffect = Instruments.defaultWarp
  ) => {
    const pitchShift = new Tone.PitchShift(warp);
    return Instruments.initializeToneEffect(pitchShift, warp.id);
  };

  /**
   * Return the default effect for the given key.
   */
  public static defaultEffect = (key: Instruments.EffectKey) => {
    switch (key) {
      case "reverb":
        return Instruments.defaultReverb;
      case "chorus":
        return Instruments.defaultChorus;
      case "feedbackDelay":
        return Instruments.defaultFeedbackDelay;
      case "pingPongDelay":
        return Instruments.defaultPingPongDelay;
      case "phaser":
        return Instruments.defaultPhaser;
      case "tremolo":
        return Instruments.defaultTremolo;
      case "vibrato":
        return Instruments.defaultVibrato;
      case "distortion":
        return Instruments.defaultDistortion;
      case "bitcrusher":
        return Instruments.defaultBitCrusher;
      case "filter":
        return Instruments.defaultFilter;
      case "equalizer":
        return Instruments.defaultEqualizer;
      case "compressor":
        return Instruments.defaultCompressor;
      case "limiter":
        return Instruments.defaultLimiter;
      case "gain":
        return Instruments.defaultGain;
      case "warp":
        return Instruments.defaultWarp;
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
