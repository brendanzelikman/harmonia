import {
  cancelEvent,
  isHoldingCommand,
  isHoldingShift,
  isInputEvent,
} from "utils";
import {
  selectEditor,
  selectOrderedTracks,
  selectSelectedTrackParents,
} from "redux/selectors";
import { useAppSelector, useDeepEqualSelector, useDispatch } from "redux/hooks";
import { useHotkeys } from "react-hotkeys-hook";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { toggleInstrumentMute, toggleInstrumentSolo } from "redux/Instrument";
import { unmuteTracks, unsoloTracks } from "redux/Track";
import {
  offsetSelectedTranspositions,
  updateSelectedTranspositions,
} from "redux/Transposition";
import { isPatternTrack } from "types/PatternTrack";
import { TranspositionOffsetRecord } from "types/Transposition";

export const useTimelineLiveHotkeys = () => {
  const dispatch = useDispatch();
  const editor = useAppSelector(selectEditor);
  const orderedTracks = useDeepEqualSelector(selectOrderedTracks);
  const scaleTracks = useDeepEqualSelector(selectSelectedTrackParents);

  const keys = ["`", "x", "q", "w", "s", "x", "f", "e", "z", "y", "u", "z"];
  const heldKeys = useHeldHotkeys(keys);

  const keyKeydown = (key: string) => (e: Event) => {
    if ((e as KeyboardEvent).key !== key) return;
    if (isInputEvent(e) || isHoldingCommand(e)) return;

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
    const negative = heldKeys.z || heldKeys["`"];
    const dir = negative ? -1 : 1;
    let offset = isHoldingShift(e) ? 12 * dir : 0;
    offset += parseInt(key) * dir;

    // Apply chromatic offset if holding q
    if (heldKeys.q) {
      dispatch(offsetSelectedTranspositions({ _chromatic: offset }));
    }

    // Apply scalar offsets if holding w, s, or x
    const scalarKeys = ["w", "s", "x"];
    const scalarOffsets = scalarKeys.reduce((acc, cur) => {
      const id = scaleTracks[scalarKeys.indexOf(cur)]?.id;
      if (!heldKeys[cur] || !id) return acc;
      return { ...acc, [id]: offset };
    }, {} as TranspositionOffsetRecord);
    dispatch(offsetSelectedTranspositions(scalarOffsets));

    // Apply chordal offset if holding e
    if (heldKeys.e) {
      dispatch(offsetSelectedTranspositions({ _self: offset }));
    }
  };

  const zeroKeydown = (e: Event) => {
    cancelEvent(e);

    // Unmute all tracks if holding y
    if (heldKeys.y) {
      dispatch(unmuteTracks());
    }

    // Unsolo all tracks if holding u
    if (heldKeys.u) {
      dispatch(unsoloTracks());
    }

    // Reset all offsets if holding z
    if ((e as KeyboardEvent).key === "z") {
      dispatch(updateSelectedTranspositions({}));
      return;
    }

    // Reset the chromatic offset if holding q
    if (heldKeys.q) {
      dispatch(updateSelectedTranspositions({ _chromatic: 0 }));
    }

    // Reset the scalar offsets if holding w, s, or x
    const scalarKeys = ["w", "s", "x"];
    const scalarOffsets = scalarKeys.reduce((acc, cur) => {
      const id = scaleTracks[scalarKeys.indexOf(cur)]?.id;
      if (!heldKeys[cur] || !id) return acc;
      return { ...acc, [id]: 0 };
    }, {} as TranspositionOffsetRecord);
    dispatch(updateSelectedTranspositions(scalarOffsets));

    // Reset the chordal offset if holding e
    if (heldKeys.e) {
      dispatch(updateSelectedTranspositions({ _self: 0 }));
    }
  };

  // 1 = Transpose by 1 step
  useHotkeys(["1", "!"], keyKeydown("1"), [keyKeydown]);

  // 2 = Transpose by 2 steps
  useHotkeys(["2", "@"], keyKeydown("2"), [keyKeydown]);

  // 3 = Transpose by 3 steps
  useHotkeys(["3", "#"], keyKeydown("3"), [keyKeydown]);

  // 4 = Transpose by 4 steps
  useHotkeys(["4", "$"], keyKeydown("4"), [keyKeydown]);

  // 5 = Transpose by 5 steps
  useHotkeys(["5", "%"], keyKeydown("5"), [keyKeydown]);

  // 6 = Transpose by 6 steps
  useHotkeys(["6", "^"], keyKeydown("6"), [keyKeydown]);

  // 7 = Transpose by 7 steps
  useHotkeys(["7", "&"], keyKeydown("7"), [keyKeydown]);

  // 8 = Transpose by 8 steps
  useHotkeys(["8", "*"], keyKeydown("8"), [keyKeydown]);

  // 9 = Transpose by 9 steps
  useHotkeys(["9", "("], keyKeydown("9"), [keyKeydown]);

  // "-" = Transpose by 10 steps
  useHotkeys(["-", "_"], keyKeydown("10"), [keyKeydown]);

  // "=" = Transpose by 11 steps
  useHotkeys(["="], keyKeydown("11"), [keyKeydown]);

  // "0" = Reset offsets, "z" = Reset all offsets
  useHotkeys(["0", ")", "z"], zeroKeydown, [zeroKeydown]);

  // Up arrow = Transpose up by 1 step
  useHotkeys("up", (e) => {
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
  });

  // Down arrow = Transpose down by 1 step
  useHotkeys(
    "down",
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
    [editor.show]
  );
};
