import { cancelEvent, isHoldingShift, isInputEvent } from "utils";
import {
  selectEditor,
  selectOrderedTracks,
  selectSelectedTrackParents,
  selectTransport,
} from "redux/selectors";
import { useDeepEqualSelector, useAppDispatch } from "redux/hooks";
import { useHotkeys } from "react-hotkeys-hook";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { toggleInstrumentMute, toggleInstrumentSolo } from "redux/Instrument";
import { unmuteTracks, unsoloTracks } from "redux/Track";
import {
  offsetSelectedTranspositions,
  resetSelectedTranspositions,
  updateSelectedTranspositions,
} from "redux/Transposition";
import { isPatternTrack } from "types/PatternTrack";
import { TranspositionOffsetRecord } from "types/Transposition";
import {
  startRecordingTransport,
  stopRecordingTransport,
} from "redux/Transport";

export const useTimelineLiveHotkeys = () => {
  const dispatch = useAppDispatch();
  const { recording } = useDeepEqualSelector(selectTransport);
  const editor = useDeepEqualSelector(selectEditor);
  const orderedTracks = useDeepEqualSelector(selectOrderedTracks);
  const scaleTracks = useDeepEqualSelector(selectSelectedTrackParents);

  const keyMap: Record<string, string> = {
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "-": "10",
    "=": "11",
  };
  const zeroKeys = ["0", ")", "z"];
  const keys = ["`", "q", "w", "s", "x", "f", "e", "z", "y", "u"];
  const heldKeys = useHeldHotkeys(keys);

  useHotkeys(
    "shift+r",
    () =>
      recording
        ? dispatch(stopRecordingTransport())
        : dispatch(startRecordingTransport()),
    [recording]
  );

  const keyKeydown = (key: string) => (e: KeyboardEvent) => {
    if (e.key !== keyMap[key]) return;
    // Get the number of the key
    const number = parseInt(key);
    if (isNaN(number)) return;

    // Get the pattern track by number
    const patternTracks = orderedTracks.filter(isPatternTrack);
    const patternTrack = patternTracks[number - 1];
    const instrumentId = patternTrack?.instrumentId;

    // Toggle mute if holding y
    if (heldKeys.y && instrumentId) {
      dispatch(toggleInstrumentMute(instrumentId));
    }
    // Toggle solo if holding u
    if (heldKeys.u && instrumentId) {
      dispatch(toggleInstrumentSolo(instrumentId));
    }

    // Compute the initial offset based on up/down/shift
    const negative = heldKeys["`"];
    const dir = negative ? -1 : 1;
    const offsets = {} as TranspositionOffsetRecord;
    let offset = isHoldingShift(e) ? 12 * dir : 0;
    offset += parseInt(key) * dir;

    // Apply chromatic offset if holding q
    if (heldKeys.q) {
      offsets._chromatic = offset;
    }

    // Apply scalar offsets if holding w, s, or x
    const scalarKeys = ["w", "s", "x"];
    scalarKeys.forEach((key) => {
      const keyIndex = scalarKeys.indexOf(key);
      const heldKey = heldKeys[key];
      const id = scaleTracks[keyIndex]?.id;
      if (heldKey && id) offsets[id] = offset;
    });

    // Apply chordal offset if holding e
    if (heldKeys.e) {
      offsets._self = offset;
    }
    if (Object.keys(offsets).length) {
      dispatch(offsetSelectedTranspositions(offsets));
    }
  };

  const zeroKeydown = (e: KeyboardEvent) => {
    const key = e.key;
    if (!zeroKeys.includes(key)) return;

    // Unmute all tracks if holding y
    if (heldKeys.y) {
      dispatch(unmuteTracks());
    }

    // Unsolo all tracks if holding u
    if (heldKeys.u) {
      dispatch(unsoloTracks());
    }

    // Reset all offsets if holding z
    if (key === "z") {
      dispatch(resetSelectedTranspositions());
      return;
    }

    const offsets = {} as TranspositionOffsetRecord;

    // Reset the chromatic offset if holding q
    if (heldKeys.q) {
      offsets._chromatic = 0;
    }

    // Reset the scalar offsets if holding w, s, or x
    const scalarKeys = ["w", "s", "x"];
    scalarKeys.forEach((key) => {
      const keyIndex = scalarKeys.indexOf(key);
      const heldKey = heldKeys[key];
      const id = scaleTracks[keyIndex]?.id;
      if (heldKey && id) offsets[id] = 0;
    });

    // Reset the chordal offset if holding e
    if (heldKeys.e) {
      offsets._self = 0;
    }

    if (Object.keys(offsets).length) {
      dispatch(updateSelectedTranspositions(offsets));
    }
  };

  // 1 = Transpose by 1/13 steps
  useHotkeys(["1", "shift+1"], keyKeydown("1"), [keyKeydown]);

  // 2 = Transpose by 2/14 steps
  useHotkeys(["2", "shift+2"], keyKeydown("2"), [keyKeydown]);

  // 3 = Transpose by 3/15 steps
  useHotkeys(["3", "shift+3"], keyKeydown("3"), [keyKeydown]);

  // 4 = Transpose by 4/16 steps
  useHotkeys(["4", "shift+4"], keyKeydown("4"), [keyKeydown]);

  // 5 = Transpose by 5/17 steps
  useHotkeys(["5", "shift+5"], keyKeydown("5"), [keyKeydown]);

  // 6 = Transpose by 6/18 steps
  useHotkeys(["6", "shift+6"], keyKeydown("6"), [keyKeydown]);

  // 7 = Transpose by 7/19 steps
  useHotkeys(["7", "shift+7"], keyKeydown("7"), [keyKeydown]);

  // 8 = Transpose by 8/20 steps
  useHotkeys(["8", "shift+8"], keyKeydown("8"), [keyKeydown]);

  // 9 = Transpose by 9/21 steps
  useHotkeys(["9", "shift+9"], keyKeydown("9"), [keyKeydown]);

  // "-" = Transpose by 10/22 steps
  useHotkeys(["-", "shift+-", "_", "shift+_"], keyKeydown("10"), [keyKeydown]);

  // "=" = Transpose by 11/23 steps
  useHotkeys(
    ["=", "+", "shift&=", "shift&+"],
    keyKeydown("11"),
    { combinationKey: "&" },
    [keyKeydown]
  );

  // "0" = Reset selected offsets, "z" = Reset all offsets
  useHotkeys(["0", "shift+0", "z"], zeroKeydown, [zeroKeydown]);

  // Up arrow = Transpose up by 1/12 steps
  useHotkeys(
    ["up", "shift+up"],
    (e) => {
      if (isInputEvent(e) || editor.show) return;
      cancelEvent(e);

      // Offset the selected transpositions
      const holdingShift = isHoldingShift(e);
      const N = heldKeys.q ? (holdingShift ? 12 : 1) : 0;
      const T1 = heldKeys.w ? (holdingShift ? 12 : 1) : 0;
      const T2 = heldKeys.s ? (holdingShift ? 12 : 1) : 0;
      const T3 = heldKeys.x ? (holdingShift ? 12 : 1) : 0;
      const t = heldKeys.e ? (holdingShift ? 12 : 1) : 0;
      dispatch(
        offsetSelectedTranspositions({
          _chromatic: N,
          [scaleTracks?.[0]?.id ?? ""]: T1,
          [scaleTracks?.[1]?.id ?? ""]: T2,
          [scaleTracks?.[2]?.id ?? ""]: T3,
          _self: t,
        })
      );
    },
    [editor.show, heldKeys, scaleTracks]
  );

  // Down arrow = Transpose down by 1/12 steps
  useHotkeys(
    ["down", "shift+down"],
    (e) => {
      if (isInputEvent(e) || editor.show) return;
      cancelEvent(e);

      // Offset the selected transpositions
      const holdingShift = isHoldingShift(e);
      const N = heldKeys.q ? (holdingShift ? -12 : -1) : 0;
      const T1 = heldKeys.w ? (holdingShift ? -12 : -1) : 0;
      const T2 = heldKeys.s ? (holdingShift ? -12 : -1) : 0;
      const T3 = heldKeys.x ? (holdingShift ? -12 : -1) : 0;
      const t = heldKeys.e ? (holdingShift ? -12 : -1) : 0;
      dispatch(
        offsetSelectedTranspositions({
          ...{
            _chromatic: N,
            _self: t,
          },
          [scaleTracks?.[0]?.id ?? ""]: T1,
          [scaleTracks?.[1]?.id ?? ""]: T2,
          [scaleTracks?.[2]?.id ?? ""]: T3,
        })
      );
    },
    [editor.show, heldKeys]
  );
};
