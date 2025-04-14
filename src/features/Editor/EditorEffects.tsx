import * as Effects from "types/Instrument/InstrumentEffectTypes";
import { useCallback, useRef } from "react";
import { Slider } from "components/Slider";
import { cancelEvent } from "utils/event";
import { BsArrowClockwise, BsTrashFill } from "react-icons/bs";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import {
  rearrangeInstrumentEffect,
  updateInstrumentEffect,
  resetInstrumentEffect,
  removeInstrumentEffect,
} from "types/Instrument/InstrumentSlice";
import { InstrumentId } from "types/Instrument/InstrumentTypes";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument/InstrumentClass";
import { useDrag, useDrop } from "react-dnd";

type InstrumentEffectsProps = { id: InstrumentId };

export function InstrumentEditorEffects(props: InstrumentEffectsProps) {
  const dispatch = useAppDispatch();
  const id = props.id;
  const instrument = useAppValue((_) => selectInstrumentById(_, id));
  const effects = instrument?.effects ?? [];

  /** Move an effect to a new index when dragging */
  const moveEffect = useCallback(
    (effectId: Effects.EffectId, index: number) => {
      if (!instrument) return;
      dispatch(rearrangeInstrumentEffect({ data: { id, effectId, index } }));
    },
    []
  );

  /** Create a slider for each effect */
  const mapEffectToSliders = (effect: Effects.SafeEffect, index: number) => (
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
      className={`w-full min-h-[8.5rem] flex-shrink-0 text-white text-[28px] overflow-scroll flex items-center`}
    >
      <div className="flex flex-col w-full h-full min-h-[10rem]">
        <div className="flex w-full overflow-scroll">
          {effects.map(mapEffectToSliders)}
        </div>
      </div>
    </div>
  );
}

export interface DraggableEffectProps {
  id: InstrumentId;
  effect: Effects.SafeEffect;
  index: number;
  element?: any;
  moveEffect: (dragId: Effects.EffectId, hoverIndex: number) => void;
}

export const InstrumentEffect = (props: DraggableEffectProps) => {
  const dispatch = useAppDispatch();
  const { id, index, effect, moveEffect } = props;
  const instance = LIVE_AUDIO_INSTANCES[id];
  const ref = useRef<HTMLDivElement>(null);
  const element = ref.current;
  const [{}, drop] = useDrop({
    accept: "effect",
    collect() {
      return { id: effect.id, index };
    },
    drop(item: any) {
      if (!element) return;
      const { index: dragIndex, id: dragId } = item;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveEffect(dragId, hoverIndex);
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: "effect",
    item: () => ({ id: effect.id, index }),
    collect: (monitor: any) => ({ isDragging: monitor.isDragging() }),
  });
  drag(drop(ref));

  /** Update the effect of a track */
  const setTrackEffect = (props: Partial<Effects.EffectProps>) => {
    dispatch(
      updateInstrumentEffect({
        data: { id, effectId: effect.id, update: props },
      })
    );
  };

  /** The user can reset the parameters of a track effect. */
  const ResetEffectButton = (effect: Effects.SafeEffect) => (
    <div
      className="capitalize text-sm cursor-pointer"
      onClick={() =>
        dispatch(
          resetInstrumentEffect({
            data: { id, effectId: effect.id },
          })
        )
      }
    >
      <BsArrowClockwise />
    </div>
  );

  /** The user can remove an effect from the instrument. */
  const RemoveEffectButton = (effect: Effects.SafeEffect) => (
    <div className="text-xs mx-2 cursor-pointer hover:text-red-500">
      <BsTrashFill
        onClick={() =>
          dispatch(
            removeInstrumentEffect({
              data: { id, effectId: effect.id },
            })
          )
        }
      />
    </div>
  );

  const trackEffect = instance ? instance.getEffectById(effect.id) : undefined;
  const name = Effects.EFFECT_NAMES_BY_KEY[effect.key] ?? "Effect";
  const wasDisposed = !trackEffect || trackEffect?.node?.disposed;

  return (
    <div
      className={`animate-in fade-in zoom-in duration-150 flex ml-2 mr-5 md:mr-3 my-2 select-none min-w-fit min-h-[9rem] ${
        isDragging || wasDisposed ? "opacity-50" : "opacity-100"
      } bg-slate-700/50 border border-slate-600 rounded-lg active:ring transition-all overflow-hidden capitalize`}
      ref={ref}
    >
      <div className="w-full mx-2 py-2">
        <div className="w-full flex items-center mb-4 bg-slate-800 border-[2px] border-slate-600/50 rounded">
          <label className="text-base font-bold px-2 flex-1 whitespace-nowrap">
            {name}
          </label>
          {ResetEffectButton(effect)}
          {RemoveEffectButton(effect)}
        </div>
        <div className="w-full flex" draggable onDragStart={cancelEvent}>
          {effect.key === "reverb" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                value={effect.wet}
                onValueChange={(wet) => setTrackEffect({ wet })}
                step={0.01}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_REVERB_DECAY}
                max={Effects.MAX_REVERB_DECAY}
                defaultValue={Effects.DEFAULT_REVERB_DECAY}
                value={effect.decay}
                onValueChange={(decay) => setTrackEffect({ decay })}
                step={0.01}
                label="Decay"
              />
              <Slider
                min={Effects.MIN_REVERB_PREDELAY}
                max={Effects.MAX_REVERB_PREDELAY}
                defaultValue={Effects.DEFAULT_REVERB_PREDELAY}
                value={effect.predelay}
                onValueChange={(predelay) => setTrackEffect({ predelay })}
                step={0.01}
                label="Predelay"
              />
            </>
          ) : null}
          {effect.key === "chorus" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                value={effect.wet}
                onValueChange={(wet) => setTrackEffect({ wet })}
                step={0.01}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_CHORUS_FREQUENCY}
                max={Effects.MAX_CHORUS_FREQUENCY}
                defaultValue={Effects.DEFAULT_CHORUS_FREQUENCY}
                value={effect.frequency}
                onValueChange={(frequency) => setTrackEffect({ frequency })}
                step={0.01}
                label="Frequency"
              />
              <Slider
                min={Effects.MIN_CHORUS_DEPTH}
                max={Effects.MAX_CHORUS_DEPTH}
                defaultValue={Effects.DEFAULT_CHORUS_DEPTH}
                value={effect.depth}
                onValueChange={(depth) => setTrackEffect({ depth })}
                step={0.01}
                label="Depth"
              />
              <Slider
                min={Effects.MIN_CHORUS_DELAY_TIME}
                max={Effects.MAX_CHORUS_DELAY_TIME}
                defaultValue={Effects.DEFAULT_CHORUS_DELAY_TIME}
                value={effect.delayTime}
                onValueChange={(delayTime) => setTrackEffect({ delayTime })}
                step={0.01}
                label="Delay"
              />
            </>
          ) : null}
          {effect.key === "feedbackDelay" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                step={0.01}
                value={effect.wet}
                onValueChange={(wet) => setTrackEffect({ wet })}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_FEEDBACK_DELAY_TIME}
                max={Effects.MAX_FEEDBACK_DELAY_TIME}
                defaultValue={Effects.DEFAULT_FEEDBACK_DELAY_TIME}
                value={effect.delayTime}
                onValueChange={(delayTime) => setTrackEffect({ delayTime })}
                step={0.01}
                label="Time"
              />
              <Slider
                min={Effects.MIN_FEEDBACK_DELAY_FEEDBACK}
                max={Effects.MAX_FEEDBACK_DELAY_FEEDBACK}
                defaultValue={Effects.DEFAULT_FEEDBACK_DELAY_FEEDBACK}
                value={effect.feedback}
                onValueChange={(feedback) => setTrackEffect({ feedback })}
                step={0.01}
                label="Feedback"
              />
            </>
          ) : null}
          {effect.key === "pingPongDelay" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                step={0.01}
                value={effect.wet}
                onValueChange={(wet) => setTrackEffect({ wet })}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_PING_PONG_DELAY_TIME}
                max={Effects.MAX_PING_PONG_DELAY_TIME}
                defaultValue={Effects.DEFAULT_PING_PONG_DELAY_TIME}
                value={effect.delayTime}
                onValueChange={(delayTime) => setTrackEffect({ delayTime })}
                step={0.01}
                label="Time"
              />
              <Slider
                min={Effects.MIN_PING_PONG_DELAY_FEEDBACK}
                max={Effects.MAX_PING_PONG_DELAY_FEEDBACK}
                defaultValue={Effects.DEFAULT_PING_PONG_DELAY_FEEDBACK}
                value={effect.feedback}
                onValueChange={(feedback) => setTrackEffect({ feedback })}
                step={0.01}
                label="Feedback"
              />
            </>
          ) : null}
          {effect.key === "phaser" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                step={0.01}
                value={effect.wet}
                onValueChange={(wet) => setTrackEffect({ wet })}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_PHASER_FREQUENCY}
                max={Effects.MAX_PHASER_FREQUENCY}
                defaultValue={Effects.DEFAULT_PHASER_FREQUENCY}
                value={effect.frequency}
                onValueChange={(frequency) => setTrackEffect({ frequency })}
                step={0.01}
                label="Frequency"
              />
              <Slider
                min={Effects.MIN_PHASER_OCTAVES}
                max={Effects.MAX_PHASER_OCTAVES}
                defaultValue={Effects.DEFAULT_PHASER_OCTAVES}
                value={effect.octaves}
                onValueChange={(octaves) => setTrackEffect({ octaves })}
                step={1}
                label="Octaves"
              />
              <Slider
                min={Effects.MIN_PHASER_BASE_FREQUENCY}
                max={Effects.MAX_PHASER_BASE_FREQUENCY}
                defaultValue={Effects.DEFAULT_PHASER_BASE_FREQUENCY}
                value={effect.baseFrequency}
                onValueChange={(baseFrequency) =>
                  setTrackEffect({ baseFrequency })
                }
                step={1}
                label="Base (Hz)"
              />
            </>
          ) : null}
          {effect.key === "tremolo" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                step={0.01}
                value={effect.wet}
                onValueChange={(wet) => setTrackEffect({ wet })}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_TREMOLO_FREQUENCY}
                max={Effects.MAX_TREMOLO_FREQUENCY}
                defaultValue={Effects.DEFAULT_TREMOLO_FREQUENCY}
                value={effect.frequency}
                onValueChange={(frequency) => setTrackEffect({ frequency })}
                step={0.01}
                label="Frequency"
              />
              <Slider
                min={Effects.MIN_TREMOLO_DEPTH}
                max={Effects.MAX_TREMOLO_DEPTH}
                defaultValue={Effects.DEFAULT_TREMOLO_DEPTH}
                value={effect.depth}
                onValueChange={(depth) => setTrackEffect({ depth })}
                step={0.01}
                label="Depth"
              />
            </>
          ) : null}
          {effect.key === "vibrato" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                step={0.01}
                value={effect.wet}
                onValueChange={(wet) => setTrackEffect({ wet })}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_VIBRATO_FREQUENCY}
                max={Effects.MAX_VIBRATO_FREQUENCY}
                defaultValue={Effects.DEFAULT_VIBRATO_FREQUENCY}
                value={effect.frequency}
                onValueChange={(frequency) => setTrackEffect({ frequency })}
                step={0.01}
                label="Frequency"
              />
              <Slider
                min={Effects.MIN_VIBRATO_DEPTH}
                max={Effects.MAX_VIBRATO_DEPTH}
                defaultValue={Effects.DEFAULT_VIBRATO_DEPTH}
                value={effect.depth}
                onValueChange={(depth) => setTrackEffect({ depth })}
                step={0.01}
                label="Depth"
              />
            </>
          ) : null}
          {effect.key === "distortion" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                step={0.01}
                value={effect.wet}
                onValueChange={(wet) => setTrackEffect({ wet })}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_DISTORTION}
                max={Effects.MAX_DISTORTION}
                defaultValue={Effects.DEFAULT_DISTORTION}
                value={effect.distortion}
                onValueChange={(distortion) => setTrackEffect({ distortion })}
                step={0.01}
                label="Distortion"
              />
            </>
          ) : null}
          {effect.key === "bitcrusher" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                step={0.01}
                value={effect.wet}
                onValueChange={(wet) => setTrackEffect({ wet })}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_BITCRUSHER_BITS}
                max={Effects.MAX_BITCRUSHER_BITS}
                defaultValue={Effects.DEFAULT_BITCRUSHER_BITS}
                value={effect.bits}
                onValueChange={(bits) => setTrackEffect({ bits })}
                step={1}
                label="Bits"
              />
            </>
          ) : null}
          {effect.key === "filter" ? (
            <>
              <Slider
                min={Effects.MIN_FILTER_FREQUENCY}
                max={Effects.MAX_FILTER_FREQUENCY}
                defaultValue={Effects.DEFAULT_FILTER_FREQUENCY}
                value={effect.frequency}
                onValueChange={(frequency) => setTrackEffect({ frequency })}
                step={0.01}
                label="Frequency"
              />
              <Slider
                min={Effects.MIN_FILTER_Q}
                max={Effects.MAX_FILTER_Q}
                defaultValue={Effects.DEFAULT_FILTER_Q}
                value={effect.Q}
                onValueChange={(Q) => setTrackEffect({ Q })}
                step={0.01}
                label="Q"
              />
            </>
          ) : null}
          {effect.key === "equalizer" ? (
            <>
              <Slider
                min={Effects.MIN_EQUALIZER_LOW}
                max={Effects.MAX_EQUALIZER_LOW}
                defaultValue={Effects.DEFAULT_EQUALIZER_LOW}
                value={effect.low}
                onValueChange={(low) => setTrackEffect({ low })}
                step={0.01}
                label="Low"
              />
              <Slider
                min={Effects.MIN_EQUALIZER_MID}
                max={Effects.MAX_EQUALIZER_MID}
                defaultValue={Effects.DEFAULT_EQUALIZER_MID}
                value={effect.mid}
                onValueChange={(mid) => setTrackEffect({ mid })}
                step={0.01}
                label="Mid"
              />
              <Slider
                min={Effects.MIN_EQUALIZER_HIGH}
                max={Effects.MAX_EQUALIZER_HIGH}
                defaultValue={Effects.DEFAULT_EQUALIZER_HIGH}
                value={effect.high}
                onValueChange={(high) => setTrackEffect({ high })}
                step={0.01}
                label="High"
              />
              <Slider
                min={Effects.MIN_EQUALIZER_LOW_FREQUENCY}
                max={Effects.MAX_EQUALIZER_LOW_FREQUENCY}
                defaultValue={Effects.DEFAULT_EQUALIZER_LOW_FREQUENCY}
                value={effect.lowFrequency}
                onValueChange={(lowFrequency) =>
                  setTrackEffect({ lowFrequency })
                }
                step={1}
                label="Low/Mid"
              />
              <Slider
                min={Effects.MIN_EQUALIZER_HIGH_FREQUENCY}
                max={Effects.MAX_EQUALIZER_HIGH_FREQUENCY}
                defaultValue={Effects.DEFAULT_EQUALIZER_HIGH_FREQUENCY}
                value={effect.highFrequency}
                onValueChange={(highFrequency) =>
                  setTrackEffect({ highFrequency })
                }
                step={1}
                label="Mid/High"
              />
            </>
          ) : null}
          {effect.key === "compressor" ? (
            <>
              <Slider
                min={Effects.MIN_COMPRESSOR_RATIO}
                max={Effects.MAX_COMPRESSOR_RATIO}
                defaultValue={Effects.DEFAULT_COMPRESSOR_RATIO}
                value={effect.ratio}
                onValueChange={(ratio) => setTrackEffect({ ratio })}
                step={0.01}
                label="Ratio"
              />
              <Slider
                min={Effects.MIN_COMPRESSOR_THRESHOLD}
                max={Effects.MAX_COMPRESSOR_THRESHOLD}
                defaultValue={Effects.DEFAULT_COMPRESSOR_THRESHOLD}
                value={effect.threshold}
                onValueChange={(threshold) => setTrackEffect({ threshold })}
                step={0.01}
                label="Threshold"
              />
              <Slider
                min={Effects.MIN_COMPRESSOR_ATTACK}
                max={Effects.MAX_COMPRESSOR_ATTACK}
                defaultValue={Effects.DEFAULT_COMPRESSOR_ATTACK}
                value={effect.attack}
                onValueChange={(attack) => setTrackEffect({ attack })}
                step={0.001}
                label="Attack"
              />
              <Slider
                min={Effects.MIN_COMPRESSOR_RELEASE}
                max={Effects.MAX_COMPRESSOR_RELEASE}
                defaultValue={Effects.DEFAULT_COMPRESSOR_RELEASE}
                value={effect.release}
                onValueChange={(release) => setTrackEffect({ release })}
                step={0.01}
                label="Release"
              />
              <Slider
                min={Effects.MIN_COMPRESSOR_KNEE}
                max={Effects.MAX_COMPRESSOR_KNEE}
                defaultValue={Effects.DEFAULT_COMPRESSOR_KNEE}
                value={effect.knee}
                onValueChange={(knee) => setTrackEffect({ knee })}
                step={0.01}
                label="Knee"
              />
            </>
          ) : null}
          {effect.key === "limiter" ? (
            <>
              <Slider
                min={Effects.MIN_LIMITER_THRESHOLD}
                max={Effects.MAX_LIMITER_THRESHOLD}
                defaultValue={Effects.DEFAULT_LIMITER_THRESHOLD}
                value={effect.threshold}
                onValueChange={(threshold) => setTrackEffect({ threshold })}
                step={0.01}
                label="Threshold"
              />
            </>
          ) : null}
          {effect.key === "gain" ? (
            <>
              <Slider
                min={Effects.MIN_GAIN}
                max={Effects.MAX_GAIN}
                defaultValue={Effects.DEFAULT_GAIN}
                value={effect.gain}
                onValueChange={(gain) => setTrackEffect({ gain })}
                step={0.01}
                label="Gain"
              />
            </>
          ) : null}
          {effect.key === "warp" ? (
            <>
              <Slider
                min={Effects.MIN_WET}
                max={Effects.MAX_WET}
                defaultValue={Effects.DEFAULT_WET}
                value={effect.wet}
                onValueChange={(wet) => setTrackEffect({ wet })}
                step={0.01}
                label="Wet"
              />
              <Slider
                min={Effects.MIN_WARP_PITCH}
                max={Effects.MAX_WARP_PITCH}
                defaultValue={Effects.DEFAULT_WARP_PITCH}
                value={effect.pitch}
                onValueChange={(pitch) => setTrackEffect({ pitch })}
                step={0.1}
                label="Pitch"
              />
              <Slider
                min={Effects.MIN_WARP_WINDOW}
                max={Effects.MAX_WARP_WINDOW}
                defaultValue={Effects.DEFAULT_WARP_WINDOW}
                value={effect.window}
                onValueChange={(window) => setTrackEffect({ window })}
                step={0.01}
                label="Window"
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
