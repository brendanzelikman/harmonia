import * as Constants from "appConstants";
import { useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";
// @ts-ignore
import { Knob } from "react-rotary-knob";
import { selectMixerByTrackId } from "redux/selectors";
import {
  setMixerWarp,
  setMixerReverb,
  setMixerChorus,
  setMixerFilter,
  setMixerDelay,
} from "redux/slices/mixers";
import { AppDispatch, RootState } from "redux/store";
import {
  WarpProps,
  ReverbProps,
  ChorusProps,
  DelayProps,
  Effect,
  FilterProps,
} from "types/mixer";
import { PatternTrack } from "types/tracks";

import * as Editor from "../Editor";
import skin from "./KnobSkin";

interface KnobProps {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  value: number;
  onValueChange: (value: number) => void;
  label?: string;
}

function EffectKnob(props: KnobProps) {
  // Create an onChange handler that prevents the knob going from max to min
  const onChange = (value: number) => {
    const maxDistance = Math.abs(props.max - props.min) / 5;
    const distance = Math.abs(props.value - value);
    if (distance > maxDistance) return;
    props.onValueChange(value);
  };
  // Return the knob
  return (
    <div
      className="flex flex-col items-center justify-center hover:cursor-pointer active:cursor-grab"
      onDoubleClick={() => props.onValueChange(props.defaultValue)}
    >
      <Knob
        skin={skin(-Math.log10(props.step))}
        step={props.step}
        preciseMode={false}
        unlockDistance={0}
        min={props.min}
        max={props.max}
        defaultValue={props.defaultValue}
        value={props.value}
        onChange={onChange}
      />
      <label className="text-xs mt-2">{props.label}</label>
    </div>
  );
}

interface TrackEffectsProps {
  track: PatternTrack;
}

const mapStateToProps = (state: RootState, ownProps: TrackEffectsProps) => {
  const track = ownProps.track as PatternTrack;
  const mixer = selectMixerByTrackId(state, track.id);
  return {
    ...ownProps,
    track,
    mixer,
  };
};

const mapDispatchToProps = (
  dispatch: AppDispatch,
  ownProps: TrackEffectsProps
) => {
  const trackId = ownProps.track.id;
  return {
    setTrackWarp: (warp: Partial<WarpProps>) => {
      if (!trackId) return;
      dispatch(setMixerWarp(trackId, warp));
    },
    setTrackReverb: (reverb: Partial<ReverbProps>) => {
      if (!trackId) return;
      dispatch(setMixerReverb(trackId, reverb));
    },
    setTrackChorus: (chorus: Partial<ChorusProps>) => {
      if (!trackId) return;
      dispatch(setMixerChorus(trackId, chorus));
    },
    setTrackFilter: (filter: Partial<FilterProps>) => {
      if (!trackId) return;
      dispatch(setMixerFilter(trackId, filter));
    },
    setTrackDelay: (delay: Partial<DelayProps>) => {
      if (!trackId) return;
      dispatch(setMixerDelay(trackId, delay));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(TrackEffects);

function TrackEffects(props: Props) {
  const { mixer } = props;
  const {
    setTrackWarp,
    setTrackReverb,
    setTrackChorus,
    setTrackDelay,
    setTrackFilter,
  } = props;

  if (!mixer) return null;

  const WarpKnobs = useCallback(
    (effect: Effect) => (
      <>
        <EffectKnob
          min={Constants.MIN_WET}
          max={Constants.MAX_WET}
          defaultValue={Constants.DEFAULT_WET}
          value={effect.wet}
          onValueChange={(wet) => setTrackWarp({ wet })}
          step={0.01}
          label="Wet"
        />
        <EffectKnob
          min={Constants.MIN_WARP_PITCH}
          max={Constants.MAX_WARP_PITCH}
          defaultValue={Constants.DEFAULT_WARP_PITCH}
          value={effect.pitch}
          onValueChange={(pitch) => setTrackWarp({ pitch })}
          step={0.1}
          label="Pitch"
        />
        <EffectKnob
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
        <EffectKnob
          min={Constants.MIN_WET}
          max={Constants.MAX_WET}
          defaultValue={Constants.DEFAULT_WET}
          value={effect.wet}
          onValueChange={(wet) => setTrackReverb({ wet })}
          step={0.01}
          label="Wet"
        />
        <EffectKnob
          min={Constants.MIN_REVERB_DECAY}
          max={Constants.MAX_REVERB_DECAY}
          defaultValue={Constants.DEFAULT_REVERB_DECAY}
          value={effect.decay}
          onValueChange={(decay) => setTrackReverb({ decay })}
          step={0.01}
          label="Decay"
        />
        <EffectKnob
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
        <EffectKnob
          min={Constants.MIN_WET}
          max={Constants.MAX_WET}
          defaultValue={Constants.DEFAULT_WET}
          value={effect.wet}
          onValueChange={(wet) => setTrackChorus({ wet })}
          step={0.01}
          label="Wet"
        />
        <EffectKnob
          min={Constants.MIN_CHORUS_DEPTH}
          max={Constants.MAX_CHORUS_DEPTH}
          defaultValue={Constants.DEFAULT_CHORUS_DEPTH}
          value={effect.depth}
          onValueChange={(depth) => setTrackChorus({ depth })}
          step={0.01}
          label="Depth"
        />
        <EffectKnob
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
        <EffectKnob
          min={Constants.MIN_FILTER_LOW}
          max={Constants.MAX_FILTER_LOW}
          defaultValue={Constants.DEFAULT_FILTER_LOW}
          value={effect.low}
          onValueChange={(low) => setTrackFilter({ low })}
          step={1}
          label="Low"
        />
        <EffectKnob
          min={Constants.MIN_FILTER_MID}
          max={Constants.MAX_FILTER_MID}
          defaultValue={Constants.DEFAULT_FILTER_MID}
          value={effect.mid}
          onValueChange={(mid) => setTrackFilter({ mid })}
          step={1}
          label="Mid"
        />
        <EffectKnob
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
        <EffectKnob
          min={Constants.MIN_WET}
          max={Constants.MAX_WET}
          defaultValue={Constants.DEFAULT_WET}
          step={0.01}
          value={effect.wet}
          onValueChange={(wet) => setTrackDelay({ wet })}
          label="Wet"
        />
        <EffectKnob
          min={Constants.MIN_DELAY_TIME}
          max={Constants.MAX_DELAY_TIME}
          defaultValue={Constants.DEFAULT_DELAY_TIME}
          value={effect.delay}
          onValueChange={(delay) => setTrackDelay({ delay })}
          step={0.01}
          label="Time"
        />
        <EffectKnob
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
        <Editor.MenuGroup
          key={effect.type}
          label={effect.type}
          className="w-36 h-36 capitalize"
        >
          <div className="w-full flex justify-center space-x-2">
            {effect.type === "warp" ? WarpKnobs(effect) : null}
            {effect.type === "reverb" ? ReverbKnobs(effect) : null}
            {effect.type === "chorus" ? ChorusKnobs(effect) : null}
            {effect.type === "delay" ? DelayKnobs(effect) : null}
            {effect.type === "filter" ? FilterKnobs(effect) : null}
          </div>
        </Editor.MenuGroup>
      );
    },
    [WarpKnobs, ReverbKnobs, ChorusKnobs, DelayKnobs]
  );

  return <div className="flex">{mixer.effects.map(mapEffectToKnobs)}</div>;
}
