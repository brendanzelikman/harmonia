import * as Effects from "types/effect";
import { useRef } from "react";
import {
  ChorusProps,
  DelayProps,
  PingPongDelayProps,
  Effect,
  EffectId,
  ReverbProps,
  WarpProps,
  DistortionProps,
  PhaserProps,
  TremoloProps,
  FilterProps,
  EQProps,
  CompressorProps,
  LimiterProps,
  INSTRUMENTS,
} from "types";
import { Slider } from "components/Slider";
import { InstrumentEditorProps } from "..";
import { useEffectDrop, useEffectDrag } from "../hooks/useEffectDnd";
import { cancelEvent } from "utils";
import { BsArrowClockwise, BsTrashFill } from "react-icons/bs";
import { Transition } from "@headlessui/react";

interface InstrumentEffectsProps extends InstrumentEditorProps {}

export function InstrumentEffects(props: InstrumentEffectsProps) {
  const { track, mixer } = props;

  if (!track || !mixer) return null;

  // Move an effect to a new index when dragging
  const moveEffect = (dragId: EffectId, hoverIndex: number) => {
    if (!props.mixer) return;
    const id = props.mixer.id;
    props.rearrangeMixerEffects(id, dragId, hoverIndex);
  };

  const mapEffectToSliders = (effect: Effect, index: number) => (
    <InstrumentEffect
      {...props}
      key={effect.id}
      effect={effect}
      index={index}
      moveEffect={moveEffect}
    />
  );

  return (
    <div
      className={`w-full min-h-[8.5rem] my-4 flex-shrink-0 text-white text-[28px] overflow-scroll flex items-center`}
    >
      <div className="flex flex-col w-full h-full min-h-[14rem]">
        <div className="flex w-full overflow-scroll">
          {mixer.effects.map((effect, index) =>
            mapEffectToSliders(effect, index)
          )}
        </div>
      </div>
    </div>
  );
}

export interface DraggableEffectProps extends InstrumentEditorProps {
  effect: Effect;
  index: number;
  element?: any;
  moveEffect: (dragId: EffectId, hoverIndex: number) => void;
}

export const InstrumentEffect = (props: DraggableEffectProps) => {
  const { effect, track, mixer } = props;

  // Ref information
  const ref = useRef<HTMLDivElement>(null);
  const [{}, drop] = useEffectDrop({ ...props, element: ref.current });
  const [{ isDragging }, drag] = useEffectDrag({
    ...props,
    element: ref.current,
  });
  drag(drop(ref));

  if (!track || !mixer) return null;

  const setTrackWarp = (warpProps: Partial<WarpProps>) => {
    props.updateMixerEffect(mixer.id, { ...warpProps, id: effect.id });
  };

  const setTrackReverb = (reverbProps: Partial<ReverbProps>) => {
    props.updateMixerEffect(mixer.id, { ...reverbProps, id: effect.id });
  };

  const setTrackChorus = (chorusProps: Partial<ChorusProps>) => {
    props.updateMixerEffect(mixer.id, { ...chorusProps, id: effect.id });
  };

  const setTrackDelay = (delayProps: Partial<DelayProps>) => {
    props.updateMixerEffect(mixer.id, { ...delayProps, id: effect.id });
  };

  const setTrackPingPongDelay = (delayProps: Partial<PingPongDelayProps>) => {
    props.updateMixerEffect(mixer.id, { ...delayProps, id: effect.id });
  };

  const setTrackDistortion = (distortionProps: Partial<DistortionProps>) => {
    props.updateMixerEffect(mixer.id, { ...distortionProps, id: effect.id });
  };

  const setTrackPhaser = (phaserProps: Partial<PhaserProps>) => {
    props.updateMixerEffect(mixer.id, { ...phaserProps, id: effect.id });
  };

  const setTrackTremolo = (tremoloProps: Partial<TremoloProps>) => {
    props.updateMixerEffect(mixer.id, { ...tremoloProps, id: effect.id });
  };

  const setTrackFilter = (filterProps: Partial<FilterProps>) => {
    props.updateMixerEffect(mixer.id, { ...filterProps, id: effect.id });
  };

  const setTrackEQ = (eqProps: Partial<EQProps>) => {
    props.updateMixerEffect(mixer.id, { ...eqProps, id: effect.id });
  };

  const setTrackCompressor = (compressorProps: Partial<CompressorProps>) => {
    props.updateMixerEffect(mixer.id, { ...compressorProps, id: effect.id });
  };

  const setTrackLimiter = (limiterProps: Partial<LimiterProps>) => {
    props.updateMixerEffect(mixer.id, { ...limiterProps, id: effect.id });
  };

  const ResetEffectButton = (effect: Effect) => (
    <div
      className="capitalize text-sm cursor-pointer"
      onClick={() => props.resetMixerEffect(mixer.id, effect.id)}
    >
      <BsArrowClockwise />
    </div>
  );

  const RemoveEffectButton = (effect: Effect) => (
    <div className="text-xs mx-2 cursor-pointer hover:text-red-500">
      <BsTrashFill
        onClick={() => props.removeMixerEffect(mixer.id, effect.id)}
      />
    </div>
  );

  const name = Effects.EFFECT_NAMES[effect.type] ?? "Effect";
  const liveMixer = INSTRUMENTS[track.id]?.mixer;
  const trackEffect = liveMixer?.getEffectById(effect.id);
  const wasDisposed = !trackEffect || trackEffect?.node?.disposed;

  return (
    <Transition
      appear
      enter="transition-all ease-in-out duration-150"
      enterFrom="opacity-0 transform scale-0"
      enterTo="opacity-100 transform scale-100"
      leave="transition-all ease-in-out duration-150"
      leaveFrom="opacity-100 transform scale-100"
      leaveTo="opacity-0 transform scale-0"
      className={`flex ml-2 mr-5 md:mr-3 my-2 select-none min-w-fit min-h-[9rem] ${
        isDragging || wasDisposed ? "opacity-50" : ""
      } bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden capitalize `}
      ref={ref}
      as="div"
    >
      <div className="w-full mx-2 py-2">
        <div className="w-full flex items-center mb-4 bg-slate-800 border-0.5 border-slate-600/50 rounded">
          <label className="text-base font-bold px-2 flex-1 whitespace-nowrap">
            {name}
          </label>
          {ResetEffectButton(effect)}
          {RemoveEffectButton(effect)}
        </div>
        <div className="w-full flex" draggable onDragStart={cancelEvent}>
          {effect.type === "warp" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                value={effect.wet}
                onValueChange={(wet) => setTrackWarp({ wet })}
                step={0.01}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_WARP_PITCH}
                max={Effects.MAX_WARP_PITCH}
                defaultValue={Effects.DEFAULT_WARP_PITCH}
                value={effect.pitch}
                onValueChange={(pitch) => setTrackWarp({ pitch })}
                step={0.1}
                label="Pitch"
              />
              <Slider
                min={Effects.MIN_WARP_WINDOW}
                max={Effects.MAX_WARP_WINDOW}
                defaultValue={Effects.DEFAULT_WARP_WINDOW}
                value={effect.window}
                onValueChange={(window) => setTrackWarp({ window })}
                step={0.01}
                label="Window"
              />
            </>
          ) : null}
          {effect.type === "reverb" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                value={effect.wet}
                onValueChange={(wet) => setTrackReverb({ wet })}
                step={0.01}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_REVERB_DECAY}
                max={Effects.MAX_REVERB_DECAY}
                defaultValue={Effects.DEFAULT_REVERB_DECAY}
                value={effect.decay}
                onValueChange={(decay) => setTrackReverb({ decay })}
                step={0.01}
                label="Decay"
              />
              <Slider
                min={Effects.MIN_REVERB_PREDELAY}
                max={Effects.MAX_REVERB_PREDELAY}
                defaultValue={Effects.DEFAULT_REVERB_PREDELAY}
                value={effect.predelay}
                onValueChange={(predelay) => setTrackReverb({ predelay })}
                step={0.01}
                label="Predelay"
              />
            </>
          ) : null}
          {effect.type === "chorus" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                value={effect.wet}
                onValueChange={(wet) => setTrackChorus({ wet })}
                step={0.01}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_CHORUS_FREQUENCY}
                max={Effects.MAX_CHORUS_FREQUENCY}
                defaultValue={Effects.DEFAULT_CHORUS_FREQUENCY}
                value={effect.frequency}
                onValueChange={(frequency) => setTrackChorus({ frequency })}
                step={0.01}
                label="Frequency"
              />
              <Slider
                min={Effects.MIN_CHORUS_DEPTH}
                max={Effects.MAX_CHORUS_DEPTH}
                defaultValue={Effects.DEFAULT_CHORUS_DEPTH}
                value={effect.depth}
                onValueChange={(depth) => setTrackChorus({ depth })}
                step={0.01}
                label="Depth"
              />
              <Slider
                min={Effects.MIN_CHORUS_DELAY_TIME}
                max={Effects.MAX_CHORUS_DELAY_TIME}
                defaultValue={Effects.DEFAULT_CHORUS_DELAY_TIME}
                value={effect.delay}
                onValueChange={(delay) => setTrackChorus({ delay })}
                step={0.01}
                label="Delay"
              />
            </>
          ) : null}
          {effect.type === "delay" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                step={0.01}
                value={effect.wet}
                onValueChange={(wet) => setTrackDelay({ wet })}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_DELAY_TIME}
                max={Effects.MAX_DELAY_TIME}
                defaultValue={Effects.DEFAULT_DELAY_TIME}
                value={effect.delay}
                onValueChange={(delay) => setTrackDelay({ delay })}
                step={0.01}
                label="Time"
              />
              <Slider
                min={Effects.MIN_DELAY_FEEDBACK}
                max={Effects.MAX_DELAY_FEEDBACK}
                defaultValue={Effects.DEFAULT_DELAY_FEEDBACK}
                value={effect.feedback}
                onValueChange={(feedback) => setTrackDelay({ feedback })}
                step={0.01}
                label="Feedback"
              />
            </>
          ) : null}
          {effect.type === "pingPongDelay" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                step={0.01}
                value={effect.wet}
                onValueChange={(wet) => setTrackPingPongDelay({ wet })}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_PING_PONG_DELAY_TIME}
                max={Effects.MAX_PING_PONG_DELAY_TIME}
                defaultValue={Effects.DEFAULT_PING_PONG_DELAY_TIME}
                value={effect.delay}
                onValueChange={(delay) => setTrackPingPongDelay({ delay })}
                step={0.01}
                label="Time"
              />
              <Slider
                min={Effects.MIN_PING_PONG_DELAY_FEEDBACK}
                max={Effects.MAX_PING_PONG_DELAY_FEEDBACK}
                defaultValue={Effects.DEFAULT_PING_PONG_DELAY_FEEDBACK}
                value={effect.feedback}
                onValueChange={(feedback) =>
                  setTrackPingPongDelay({ feedback })
                }
                step={0.01}
                label="Feedback"
              />
            </>
          ) : null}
          {effect.type === "distortion" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                step={0.01}
                value={effect.wet}
                onValueChange={(wet) => setTrackDistortion({ wet })}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_DISTORTION}
                max={Effects.MAX_DISTORTION}
                defaultValue={Effects.DEFAULT_DISTORTION}
                value={effect.distortion}
                onValueChange={(distortion) =>
                  setTrackDistortion({ distortion })
                }
                step={0.01}
                label="Distortion"
              />
            </>
          ) : null}
          {effect.type === "phaser" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                step={0.01}
                value={effect.wet}
                onValueChange={(wet) => setTrackPhaser({ wet })}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_PHASER_FREQUENCY}
                max={Effects.MAX_PHASER_FREQUENCY}
                defaultValue={Effects.DEFAULT_PHASER_FREQUENCY}
                value={effect.frequency}
                onValueChange={(frequency) => setTrackPhaser({ frequency })}
                step={0.01}
                label="Frequency"
              />
              <Slider
                min={Effects.MIN_PHASER_OCTAVES}
                max={Effects.MAX_PHASER_OCTAVES}
                defaultValue={Effects.DEFAULT_PHASER_OCTAVES}
                value={effect.octaves}
                onValueChange={(octaves) => setTrackPhaser({ octaves })}
                step={1}
                label="Octaves"
              />
              <Slider
                min={Effects.MIN_PHASER_BASE_FREQUENCY}
                max={Effects.MAX_PHASER_BASE_FREQUENCY}
                defaultValue={Effects.DEFAULT_PHASER_BASE_FREQUENCY}
                value={effect.baseFrequency}
                onValueChange={(baseFrequency) =>
                  setTrackPhaser({ baseFrequency })
                }
                step={1}
                label="Base (Hz)"
              />
            </>
          ) : null}
          {effect.type === "tremolo" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                step={0.01}
                value={effect.wet}
                onValueChange={(wet) => setTrackTremolo({ wet })}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_TREMOLO_FREQUENCY}
                max={Effects.MAX_TREMOLO_FREQUENCY}
                defaultValue={Effects.DEFAULT_TREMOLO_FREQUENCY}
                value={effect.frequency}
                onValueChange={(frequency) => setTrackTremolo({ frequency })}
                step={0.01}
                label="Frequency"
              />
              <Slider
                min={Effects.MIN_TREMOLO_DEPTH}
                max={Effects.MAX_TREMOLO_DEPTH}
                defaultValue={Effects.DEFAULT_TREMOLO_DEPTH}
                value={effect.depth}
                onValueChange={(depth) => setTrackTremolo({ depth })}
                step={0.01}
                label="Depth"
              />
            </>
          ) : null}
          {effect.type === "filter" ? (
            <>
              <Slider
                min={Effects.MIN_FILTER_FREQUENCY}
                max={Effects.MAX_FILTER_FREQUENCY}
                defaultValue={Effects.DEFAULT_FILTER_FREQUENCY}
                value={effect.frequency}
                onValueChange={(frequency) => setTrackFilter({ frequency })}
                step={0.01}
                label="Frequency"
              />
              <Slider
                min={Effects.MIN_FILTER_Q}
                max={Effects.MAX_FILTER_Q}
                defaultValue={Effects.DEFAULT_FILTER_Q}
                value={effect.Q}
                onValueChange={(Q) => setTrackFilter({ Q })}
                step={0.01}
                label="Q"
              />
            </>
          ) : null}
          {effect.type === "equalizer" ? (
            <>
              <Slider
                min={Effects.MIN_EQ_LOW}
                max={Effects.MAX_EQ_LOW}
                defaultValue={Effects.DEFAULT_EQ_LOW}
                value={effect.low}
                onValueChange={(low) => setTrackEQ({ low })}
                step={0.01}
                label="Low"
              />
              <Slider
                min={Effects.MIN_EQ_MID}
                max={Effects.MAX_EQ_MID}
                defaultValue={Effects.DEFAULT_EQ_MID}
                value={effect.mid}
                onValueChange={(mid) => setTrackEQ({ mid })}
                step={0.01}
                label="Mid"
              />
              <Slider
                min={Effects.MIN_EQ_HIGH}
                max={Effects.MAX_EQ_HIGH}
                defaultValue={Effects.DEFAULT_EQ_HIGH}
                value={effect.high}
                onValueChange={(high) => setTrackEQ({ high })}
                step={0.01}
                label="High"
              />
              <Slider
                min={Effects.MIN_EQ_LOW_FREQUENCY}
                max={Effects.MAX_EQ_LOW_FREQUENCY}
                defaultValue={Effects.DEFAULT_EQ_LOW_FREQUENCY}
                value={effect.lowFrequency}
                onValueChange={(lowFrequency) => setTrackEQ({ lowFrequency })}
                step={0.01}
                label="Low/Mid"
              />
              <Slider
                min={Effects.MIN_EQ_HIGH_FREQUENCY}
                max={Effects.MAX_EQ_HIGH_FREQUENCY}
                defaultValue={Effects.DEFAULT_EQ_HIGH_FREQUENCY}
                value={effect.highFrequency}
                onValueChange={(highFrequency) => setTrackEQ({ highFrequency })}
                step={0.01}
                label="Mid/High"
              />
            </>
          ) : null}
          {effect.type === "compressor" ? (
            <>
              <Slider
                min={Effects.MIN_COMPRESSOR_THRESHOLD}
                max={Effects.MAX_COMPRESSOR_THRESHOLD}
                defaultValue={Effects.DEFAULT_COMPRESSOR_THRESHOLD}
                value={effect.threshold}
                onValueChange={(threshold) => setTrackCompressor({ threshold })}
                step={0.01}
                label="Threshold"
              />
              <Slider
                min={Effects.MIN_COMPRESSOR_RATIO}
                max={Effects.MAX_COMPRESSOR_RATIO}
                defaultValue={Effects.DEFAULT_COMPRESSOR_RATIO}
                value={effect.ratio}
                onValueChange={(ratio) => setTrackCompressor({ ratio })}
                step={0.01}
                label="Ratio"
              />
              <Slider
                min={Effects.MIN_COMPRESSOR_ATTACK}
                max={Effects.MAX_COMPRESSOR_ATTACK}
                defaultValue={Effects.DEFAULT_COMPRESSOR_ATTACK}
                value={effect.attack}
                onValueChange={(attack) => setTrackCompressor({ attack })}
                step={0.001}
                label="Attack"
              />
              <Slider
                min={Effects.MIN_COMPRESSOR_RELEASE}
                max={Effects.MAX_COMPRESSOR_RELEASE}
                defaultValue={Effects.DEFAULT_COMPRESSOR_RELEASE}
                value={effect.release}
                onValueChange={(release) => setTrackCompressor({ release })}
                step={0.01}
                label="Release"
              />
              <Slider
                min={Effects.MIN_COMPRESSOR_KNEE}
                max={Effects.MAX_COMPRESSOR_KNEE}
                defaultValue={Effects.DEFAULT_COMPRESSOR_KNEE}
                value={effect.knee}
                onValueChange={(knee) => setTrackCompressor({ knee })}
                step={0.01}
                label="Knee"
              />
            </>
          ) : null}
          {effect.type === "limiter" ? (
            <>
              <Slider
                min={Effects.MIN_LIMITER_THRESHOLD}
                max={Effects.MAX_LIMITER_THRESHOLD}
                defaultValue={Effects.DEFAULT_LIMITER_THRESHOLD}
                value={effect.threshold}
                onValueChange={(threshold) => setTrackLimiter({ threshold })}
                step={0.01}
                label="Threshold"
              />
            </>
          ) : null}
        </div>
      </div>
    </Transition>
  );
};
