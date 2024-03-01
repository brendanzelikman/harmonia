// @ts-ignore
import { Piano, MidiNumbers } from "react-piano";
import {
  LandingSection,
  LandingPopupHeader,
  LandingHeroProps,
} from "../components";
import { useEffect, useState } from "react";
import { context } from "tone";
import {
  EffectKey,
  LiveAudioInstance,
  MAX_WET,
  MIN_WET,
  defaultChorus,
  defaultFeedbackDelay,
  defaultGain,
  defaultInstrument,
  defaultReverb,
  defaultVibrato,
} from "types/Instrument";
import { getMidiPitch } from "utils/midi";
import { Logo } from "components/Logo";
import { Slider } from "components/Slider";
import { capitalize } from "lodash";

export const LandingPianoHero = (props: LandingHeroProps) => {
  const [instance, setInstance] = useState<LiveAudioInstance>();
  const [effects, setEffects] = useState<Record<EffectKey, number>>({
    reverb: 0.3,
    chorus: 0.2,
    vibrato: 0.3,
    delay: 0.2,
    gain: 0.8,
  });

  // Initialize the piano instance
  useEffect(() => {
    const instance = new LiveAudioInstance({
      ...defaultInstrument,
      id: "landing-piano",
      key: "upright-piano-loud",
      effects: [
        { ...defaultReverb, wet: 0.3, decay: 3 },
        { ...defaultChorus, wet: 0.1 },
        { ...defaultVibrato, wet: 0.1 },
        { ...defaultFeedbackDelay, wet: 0.2 },
        { ...defaultGain, gain: 0.8 },
      ],
    });
    setInstance(instance);
  }, []);

  // Create a wet slider for each effect
  const EffectSlider = (key: EffectKey) => {
    if (!instance) return null;
    const effect = instance.effects.find((effect) => effect.key === key);
    if (!effect) return null;

    const onValueChange = (value: number) => {
      if (key === "gain") {
        instance.updateEffectById(effect.id, { gain: value });
      } else {
        instance.updateEffectById(effect.id, { wet: value });
      }
      setEffects((prev) => ({ ...prev, [key]: value }));
    };

    const label = key === "feedbackDelay" ? "delay" : key;
    return (
      <div className="px-4 h-full flex items-center rounded scale-125">
        <Slider
          min={MIN_WET}
          max={MAX_WET}
          defaultValue={0.5}
          value={effects[key]}
          onValueChange={onValueChange}
          step={0.01}
          label={capitalize(label)}
          hideValue
        />
      </div>
    );
  };

  // Play the piano and start the context if necessary
  const playNote = (midi: number) => {
    if (!instance?.isLoaded()) return;
    if (!context.state.startsWith("running")) {
      context.resume();
    }
    const pitch = getMidiPitch(midi);
    instance.sampler.triggerAttack(pitch);
  };

  // Stop the piano note
  const stopNote = (midi: number) => {
    if (!instance?.isLoaded()) return;
    const pitch = getMidiPitch(midi);
    instance.sampler.triggerRelease(pitch);
  };

  return (
    <LandingSection className="relative group justify-center px-8 gap-16 text-white">
      <LandingPopupHeader title="Emergency Piano Solo!" />
      <div className="w-full h-96 p-4 flex flex-col bg-slate-950 rounded ring-8 ring-slate-900 active:shadow-[0_0_100px_100px_rgb(255,255,255)] active:duration-20000 transition-all">
        <div className="h-32 flex items-center font-light gap-6 text-xl overflow-x-scroll overflow-y-hidden">
          <Logo width="80px" height="80px" className="-mt-2 ml-2" />
          <h2 className="text-4xl mr-8 w-48 -mt-2">Harmonia Instruments</h2>
          {EffectSlider("reverb")}
          {EffectSlider("chorus")}
          {EffectSlider("vibrato")}
          {EffectSlider("feedbackDelay")}
          {EffectSlider("gain")}
        </div>
        <div className="w-full flex-1 mt-auto">
          <Piano
            className="landing-piano"
            noteRange={{
              first: MidiNumbers.fromNote("C3"),
              last: MidiNumbers.fromNote("C7"),
            }}
            playNote={playNote}
            stopNote={stopNote}
          />
        </div>
      </div>
    </LandingSection>
  );
};
