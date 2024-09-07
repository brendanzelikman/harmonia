import { Hotkey, useHotkeysInEditor } from "lib/react-hotkeys-hook";
import { InstrumentEditorProps } from "../InstrumentEditor";
import { useProjectDispatch } from "types/hooks";
import {
  addInstrumentEffect,
  removeInstrumentEffect,
  removeAllInstrumentEffects,
} from "types/Instrument/InstrumentSlice";
import { Thunk } from "types/Project/ProjectTypes";
import { InstrumentId } from "types/Instrument/InstrumentTypes";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";

interface InstrumentShortcutProps extends InstrumentEditorProps {}

export default function useInstrumentEditorHotkeys(
  props: InstrumentShortcutProps
) {
  const dispatch = useProjectDispatch();
  const { instrument } = props;
  const id = instrument?.id;

  // Add effect hotkeys
  useHotkeysInEditor(dispatch(ADD_REVERB_HOTKEY(id)));
  useHotkeysInEditor(dispatch(ADD_CHORUS_HOTKEY(id)));
  useHotkeysInEditor(dispatch(ADD_PHASER_HOTKEY(id)));
  useHotkeysInEditor(dispatch(ADD_TREMOLO_HOTKEY(id)));
  useHotkeysInEditor(dispatch(ADD_VIBRATO_HOTKEY(id)));
  useHotkeysInEditor(dispatch(ADD_FILTER_HOTKEY(id)));
  useHotkeysInEditor(dispatch(ADD_EQUALIZER_HOTKEY(id)));
  useHotkeysInEditor(dispatch(ADD_DISTORTION_HOTKEY(id)));
  useHotkeysInEditor(dispatch(ADD_BITCRUSHER_HOTKEY(id)));
  useHotkeysInEditor(dispatch(ADD_FEEDBACK_DELAY_HOTKEY(id)));
  useHotkeysInEditor(dispatch(ADD_PING_PONG_DELAY_HOTKEY(id)));
  useHotkeysInEditor(dispatch(ADD_COMPRESSOR_HOTKEY(id)));
  useHotkeysInEditor(dispatch(ADD_GAIN_HOTKEY(id)));
  useHotkeysInEditor(dispatch(ADD_LIMITER_HOTKEY(id)));
  useHotkeysInEditor(dispatch(ADD_WARP_HOTKEY(id)));

  // Remove effect hotkeys
  useHotkeysInEditor(dispatch(REMOVE_LAST_EFFECT_HOTKEY(id)));
  useHotkeysInEditor(dispatch(REMOVE_ALL_EFFECTS_HOTKEY(id)));
}

export const ADD_REVERB_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Reverb",
    description: "Add a reverb effect to the instrument",
    shortcut: "r",
    callback: () =>
      id && dispatch(addInstrumentEffect({ data: { id, key: "reverb" } })),
  });

export const ADD_CHORUS_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Chorus",
    description: "Add a chorus effect to the instrument",
    shortcut: "c",
    callback: () =>
      id && dispatch(addInstrumentEffect({ data: { id, key: "chorus" } })),
  });

export const ADD_PHASER_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Phaser",
    description: "Add a phaser effect to the instrument",
    shortcut: "p",
    callback: () =>
      id && dispatch(addInstrumentEffect({ data: { id, key: "phaser" } })),
  });

export const ADD_TREMOLO_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Tremolo",
    description: "Add a tremolo effect to the instrument",
    shortcut: "t",
    callback: () =>
      id && dispatch(addInstrumentEffect({ data: { id, key: "tremolo" } })),
  });

export const ADD_VIBRATO_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Vibrato",
    description: "Add a vibrato effect to the instrument",
    shortcut: "v",
    callback: () =>
      id && dispatch(addInstrumentEffect({ data: { id, key: "vibrato" } })),
  });

export const ADD_FILTER_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Filter",
    description: "Add a filter effect to the instrument",
    shortcut: "f",
    callback: () =>
      id && dispatch(addInstrumentEffect({ data: { id, key: "filter" } })),
  });

export const ADD_EQUALIZER_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Equalizer",
    description: "Add an equalizer effect to the instrument",
    shortcut: "e",
    callback: () =>
      id && dispatch(addInstrumentEffect({ data: { id, key: "equalizer" } })),
  });

export const ADD_DISTORTION_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Distortion",
    description: "Add a distortion effect to the instrument",
    shortcut: "d",
    callback: () =>
      id && dispatch(addInstrumentEffect({ data: { id, key: "distortion" } })),
  });

export const ADD_BITCRUSHER_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Bitcrusher",
    description: "Add a bitcrusher effect to the instrument",
    shortcut: "b",
    callback: () =>
      id && dispatch(addInstrumentEffect({ data: { id, key: "bitcrusher" } })),
  });

export const ADD_FEEDBACK_DELAY_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Feedback Delay",
    description: "Add a feedback delay effect to the instrument",
    shortcut: "shift+d",
    callback: () =>
      id &&
      dispatch(addInstrumentEffect({ data: { id, key: "feedbackDelay" } })),
  });

export const ADD_PING_PONG_DELAY_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Ping Pong Delay",
    description: "Add a ping pong delay effect to the instrument",
    shortcut: "shift+p",
    callback: () =>
      id &&
      dispatch(addInstrumentEffect({ data: { id, key: "pingPongDelay" } })),
  });

export const ADD_COMPRESSOR_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Compressor",
    description: "Add a compressor effect to the instrument",
    shortcut: "shift+c",
    callback: () =>
      id && dispatch(addInstrumentEffect({ data: { id, key: "compressor" } })),
  });

export const ADD_GAIN_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Gain",
    description: "Add a gain effect to the instrument",
    shortcut: "g",
    callback: () =>
      id && dispatch(addInstrumentEffect({ data: { id, key: "gain" } })),
  });

export const ADD_LIMITER_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Limiter",
    description: "Add a limiter effect to the instrument",
    shortcut: "l",
    callback: () =>
      id && dispatch(addInstrumentEffect({ data: { id, key: "limiter" } })),
  });

export const ADD_WARP_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Add Warp",
    description: "Add a warp effect to the instrument",
    shortcut: "w",
    callback: () =>
      id && dispatch(addInstrumentEffect({ data: { id, key: "warp" } })),
  });

export const REMOVE_LAST_EFFECT_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch, getProject) => ({
    name: "Remove Last Effect",
    description: "Remove the last effect from the instrument",
    shortcut: "backspace",
    callback: () => {
      if (!id) return;
      const project = getProject();
      const instrument = selectInstrumentById(project, id);
      if (!instrument) return;
      const lastEffect = instrument.effects.at(-1);
      if (!lastEffect) return;
      dispatch(
        removeInstrumentEffect({ data: { id, effectId: lastEffect.id } })
      );
    },
  });

export const REMOVE_ALL_EFFECTS_HOTKEY =
  (id?: InstrumentId): Thunk<Hotkey> =>
  (dispatch) => ({
    name: "Remove All Effects",
    description: "Remove all effects from the instrument",
    shortcut: "shift+backspace",
    callback: () => id && dispatch(removeAllInstrumentEffects(id)),
  });
