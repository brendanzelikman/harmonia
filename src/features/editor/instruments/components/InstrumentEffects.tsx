import * as Constants from "appConstants";
import { useCallback } from "react";
import {
  ChorusProps,
  DelayProps,
  Effect,
  FilterProps,
  ReverbProps,
  WarpProps,
} from "types/mixer";
import * as Editor from "features/editor";
import { InstrumentKnob } from "./InstrumentKnob";
import { InstrumentEditorProps } from "..";

interface InstrumentEffectsProps extends InstrumentEditorProps {}

export function InstrumentEffects(props: InstrumentEffectsProps) {
  const { mixer } = props;

  const setTrackWarp = (warpProps: Partial<WarpProps>) => {
    if (!props.track) return;
    props.setTrackWarp(props.track.id, warpProps);
  };

  const setTrackReverb = (reverbProps: Partial<ReverbProps>) => {
    if (!props.track) return;
    props.setTrackReverb(props.track.id, reverbProps);
  };

  const setTrackChorus = (chorusProps: Partial<ChorusProps>) => {
    if (!props.track) return;
    props.setTrackChorus(props.track.id, chorusProps);
  };

  const setTrackFilter = (filterProps: Partial<FilterProps>) => {
    if (!props.track) return;
    props.setTrackFilter(props.track.id, filterProps);
  };

  const setTrackDelay = (delayProps: Partial<DelayProps>) => {
    if (!props.track) return;
    props.setTrackDelay(props.track.id, delayProps);
  };

  if (!mixer) return null;

  const WarpKnobs = useCallback(
    (effect: Effect) => (
      <>
        <InstrumentKnob
          min={Constants.MIN_WET}
          max={Constants.MAX_WET}
          defaultValue={Constants.DEFAULT_WET}
          value={effect.wet}
          onValueChange={(wet) => setTrackWarp({ wet })}
          step={0.01}
          label="Wet"
        />
        <InstrumentKnob
          min={Constants.MIN_WARP_PITCH}
          max={Constants.MAX_WARP_PITCH}
          defaultValue={Constants.DEFAULT_WARP_PITCH}
          value={effect.pitch}
          onValueChange={(pitch) => setTrackWarp({ pitch })}
          step={0.1}
          label="Pitch"
        />
        <InstrumentKnob
          min={Constants.MIN_WARP_WINDOW}
          max={Constants.MAX_WARP_WINDOW}
          defaultValue={Constants.DEFAULT_WARP_WINDOW}
          value={effect.window}
          onValueChange={(window) => setTrackWarp({ window })}
          step={0.01}
          label="Window"
        />
      </>
    ),
    [setTrackWarp]
  );

  const ReverbKnobs = useCallback(
    (effect: Effect) => (
      <>
        <InstrumentKnob
          min={Constants.MIN_WET}
          max={Constants.MAX_WET}
          defaultValue={Constants.DEFAULT_WET}
          value={effect.wet}
          onValueChange={(wet) => setTrackReverb({ wet })}
          step={0.01}
          label="Wet"
        />
        <InstrumentKnob
          min={Constants.MIN_REVERB_DECAY}
          max={Constants.MAX_REVERB_DECAY}
          defaultValue={Constants.DEFAULT_REVERB_DECAY}
          value={effect.decay}
          onValueChange={(decay) => setTrackReverb({ decay })}
          step={0.01}
          label="Decay"
        />
        <InstrumentKnob
          min={Constants.MIN_REVERB_PREDELAY}
          max={Constants.MAX_REVERB_PREDELAY}
          defaultValue={Constants.DEFAULT_REVERB_PREDELAY}
          value={effect.predelay}
          onValueChange={(predelay) => setTrackReverb({ predelay })}
          step={0.01}
          label="Predelay"
        />
      </>
    ),
    [setTrackReverb]
  );

  const ChorusKnobs = useCallback(
    (effect: Effect) => (
      <>
        <InstrumentKnob
          min={Constants.MIN_WET}
          max={Constants.MAX_WET}
          defaultValue={Constants.DEFAULT_WET}
          value={effect.wet}
          onValueChange={(wet) => setTrackChorus({ wet })}
          step={0.01}
          label="Wet"
        />
        <InstrumentKnob
          min={Constants.MIN_CHORUS_DEPTH}
          max={Constants.MAX_CHORUS_DEPTH}
          defaultValue={Constants.DEFAULT_CHORUS_DEPTH}
          value={effect.depth}
          onValueChange={(depth) => setTrackChorus({ depth })}
          step={0.01}
          label="Depth"
        />
        <InstrumentKnob
          min={Constants.MIN_CHORUS_DELAY_TIME}
          max={Constants.MAX_CHORUS_DELAY_TIME}
          defaultValue={Constants.DEFAULT_CHORUS_DELAY_TIME}
          value={effect.delay}
          onValueChange={(delay) => setTrackChorus({ delay })}
          step={0.01}
          label="Delay"
        />
      </>
    ),
    [setTrackChorus]
  );

  const FilterKnobs = useCallback(
    (effect: Effect) => (
      <>
        <InstrumentKnob
          min={Constants.MIN_FILTER_LOW}
          max={Constants.MAX_FILTER_LOW}
          defaultValue={Constants.DEFAULT_FILTER_LOW}
          value={effect.low}
          onValueChange={(low) => setTrackFilter({ low })}
          step={1}
          label="Low"
        />
        <InstrumentKnob
          min={Constants.MIN_FILTER_MID}
          max={Constants.MAX_FILTER_MID}
          defaultValue={Constants.DEFAULT_FILTER_MID}
          value={effect.mid}
          onValueChange={(mid) => setTrackFilter({ mid })}
          step={1}
          label="Mid"
        />
        <InstrumentKnob
          min={Constants.MIN_FILTER_HIGH}
          max={Constants.MAX_FILTER_HIGH}
          defaultValue={Constants.DEFAULT_FILTER_HIGH}
          value={effect.high}
          onValueChange={(high) => setTrackFilter({ high })}
          step={1}
          label="High"
        />
      </>
    ),
    [setTrackFilter]
  );

  const DelayKnobs = useCallback(
    (effect: Effect) => (
      <>
        <InstrumentKnob
          min={Constants.MIN_WET}
          max={Constants.MAX_WET}
          defaultValue={Constants.DEFAULT_WET}
          step={0.01}
          value={effect.wet}
          onValueChange={(wet) => setTrackDelay({ wet })}
          label="Wet"
        />
        <InstrumentKnob
          min={Constants.MIN_DELAY_TIME}
          max={Constants.MAX_DELAY_TIME}
          defaultValue={Constants.DEFAULT_DELAY_TIME}
          value={effect.delay}
          onValueChange={(delay) => setTrackDelay({ delay })}
          step={0.01}
          label="Time"
        />
        <InstrumentKnob
          min={Constants.MIN_DELAY_FEEDBACK}
          max={Constants.MAX_DELAY_FEEDBACK}
          defaultValue={Constants.DEFAULT_DELAY_FEEDBACK}
          value={effect.feedback}
          onValueChange={(feedback) => setTrackDelay({ feedback })}
          step={0.01}
          label="Feedback"
        />
      </>
    ),
    [setTrackDelay]
  );

  const mapEffectToKnobs = useCallback(
    (effect: Effect) => {
      return (
        <Editor.EffectGroup
          key={effect.type}
          label={effect.type}
          className="h-36 capitalize"
        >
          <div className="w-full flex justify-center space-x-3">
            {effect.type === "warp" ? WarpKnobs(effect) : null}
            {effect.type === "reverb" ? ReverbKnobs(effect) : null}
            {effect.type === "chorus" ? ChorusKnobs(effect) : null}
            {effect.type === "delay" ? DelayKnobs(effect) : null}
            {effect.type === "filter" ? FilterKnobs(effect) : null}
          </div>
        </Editor.EffectGroup>
      );
    },
    [WarpKnobs, ReverbKnobs, ChorusKnobs, DelayKnobs]
  );

  return (
    <div className="flex w-full">{mixer.effects.map(mapEffectToKnobs)}</div>
  );
}
