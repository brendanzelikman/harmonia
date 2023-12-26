import { useScopedHotkeys } from "lib/react-hotkeys-hook";
import { InstrumentEditorProps } from "../InstrumentEditor";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import {
  addInstrumentEffect,
  removeAllInstrumentEffects,
  removeInstrumentEffect,
} from "redux/Instrument";
import { redoArrangement, undoArrangement } from "redux/thunks";
import { useSelector } from "react-redux";
const useHotkeys = useScopedHotkeys("editor");

interface InstrumentShortcutProps extends InstrumentEditorProps {}

export default function useInstrumentEditorHotkeys(
  props: InstrumentShortcutProps
) {
  const { dispatch, instrument } = props;

  // R = Add Reverb Effect
  useHotkeys(
    "r",
    () => {
      if (!instrument) return;
      dispatch(addInstrumentEffect({ id: instrument.id, key: "reverb" }));
    },
    [instrument]
  );

  // C = Add Chorus Effect
  useHotkeys(
    "c",
    () => {
      if (!instrument) return;
      dispatch(addInstrumentEffect({ id: instrument.id, key: "chorus" }));
    },
    [instrument]
  );

  // P = Add Phaser Effect
  useHotkeys(
    "p",
    () => {
      if (!instrument) return;
      dispatch(addInstrumentEffect({ id: instrument.id, key: "phaser" }));
    },
    [instrument]
  );

  // T = Add Tremolo Effect
  useHotkeys(
    "t",
    () => {
      if (!instrument) return;
      dispatch(addInstrumentEffect({ id: instrument.id, key: "tremolo" }));
    },
    [instrument]
  );

  // V = Add Vibrato Effect
  useHotkeys(
    "v",
    () => {
      if (!instrument) return;
      dispatch(addInstrumentEffect({ id: instrument.id, key: "vibrato" }));
    },
    [instrument]
  );

  // F = Add Filter Effect
  useHotkeys(
    "f",
    () => {
      if (!instrument) return;
      dispatch(addInstrumentEffect({ id: instrument.id, key: "filter" }));
    },
    [instrument]
  );

  // E = Add Equalizer Effect
  useHotkeys(
    "e",
    () => {
      if (!instrument) return;
      dispatch(addInstrumentEffect({ id: instrument.id, key: "equalizer" }));
    },
    [instrument]
  );

  // D = Add Distortion Effect
  useHotkeys(
    "d",
    () => {
      if (!instrument) return;
      dispatch(addInstrumentEffect({ id: instrument.id, key: "distortion" }));
    },
    [instrument]
  );

  // B = Add Bitcrusher Effect
  useHotkeys(
    "b",
    () => {
      if (!instrument) return;
      dispatch(addInstrumentEffect({ id: instrument.id, key: "bitcrusher" }));
    },
    [instrument]
  );

  // Shift + D = Add Feedback Delay Effect
  useHotkeys(
    "shift+d",
    () => {
      if (!instrument) return;
      dispatch(
        addInstrumentEffect({ id: instrument.id, key: "feedbackDelay" })
      );
    },
    [instrument]
  );

  // Shift + P = Add Ping Pong Delay Effect
  useHotkeys(
    "shift+p",
    () => {
      if (!instrument) return;
      dispatch(
        addInstrumentEffect({ id: instrument.id, key: "pingPongDelay" })
      );
    },
    [instrument]
  );

  // Shift + C = Add Compressor Effect
  useHotkeys(
    "shift+c",
    () => {
      if (!instrument) return;
      dispatch(addInstrumentEffect({ id: instrument.id, key: "compressor" }));
    },
    [instrument]
  );

  // Shift + G = Add Gain Effect
  useHotkeys(
    "g",
    () => {
      if (!instrument) return;
      dispatch(addInstrumentEffect({ id: instrument.id, key: "gain" }));
    },
    [instrument]
  );

  // Shift + L = Add Limiter Effect
  useHotkeys(
    "l",
    () => {
      if (!instrument) return;
      dispatch(addInstrumentEffect({ id: instrument.id, key: "limiter" }));
    },
    [instrument]
  );

  // Shift + W = Add Warp Effect
  useHotkeys(
    "w",
    () => {
      if (!instrument) return;
      dispatch(addInstrumentEffect({ id: instrument.id, key: "warp" }));
    },
    [instrument]
  );

  // Backspace = Remove Last Effect
  useHotkeys(
    "backspace",
    () => {
      if (!instrument) return;
      if (!props.instrument) return;
      const lastEffect = props.instrument.effects.at(-1);
      if (!lastEffect) return;
      dispatch(
        removeInstrumentEffect({ id: instrument.id, effectId: lastEffect.id })
      );
    },
    [instrument]
  );

  // Shift + Backspace = Remove All Effects
  useHotkeys(
    "shift+backspace",
    () => {
      if (!instrument) return;
      dispatch(removeAllInstrumentEffects(instrument.id));
    },
    [instrument]
  );
}
