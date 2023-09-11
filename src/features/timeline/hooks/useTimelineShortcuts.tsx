import {
  cancelEvent,
  isHoldingCommand,
  isHoldingShift,
  isInputEvent,
} from "utils";
import { Row, TimelineProps } from "..";
import useEventListeners from "hooks/useEventListeners";
import useKeyHolder from "hooks/useKeyHolder";

interface ShortcutProps extends TimelineProps {
  rows: Row[];
}

export default function useTimelineShortcuts(props: ShortcutProps) {
  const heldKeys = useKeyHolder(["`", "x", "q", "w", "e"]);

  const keyKeydown = (key: string) => (e: Event) => {
    if (isInputEvent(e)) return;
    cancelEvent(e);
    const holdingShift = isHoldingShift(e);
    const negative = heldKeys.x || heldKeys["`"];
    const dir = negative ? -1 : 1;

    let offset = holdingShift ? 12 * dir : 0;
    if (key === "-") offset += 10 * dir;
    else if (key === "=") offset += 11 * dir;
    else offset += parseInt(key) * dir;

    if (heldKeys.q) {
      props.offsetSelectedTransforms({
        N: offset,
        T: 0,
        t: 0,
      });
    }
    if (heldKeys.w) {
      props.offsetSelectedTransforms({
        N: 0,
        T: offset,
        t: 0,
      });
    }
    if (heldKeys.e) {
      props.offsetSelectedTransforms({
        N: 0,
        T: 0,
        t: offset,
      });
    }
  };

  const zeroKeydown = (e: Event) => {
    if (isInputEvent(e)) return;
    cancelEvent(e);
    if (heldKeys.q) {
      props.updateSelectedTransforms({ N: 0 });
    }
    if (heldKeys.w) {
      props.updateSelectedTransforms({ T: 0 });
    }
    if (heldKeys.e) {
      props.updateSelectedTransforms({ t: 0 });
    }
  };

  const offsets = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "="];
  const keyMap = offsets.reduce(
    (acc, offset) => ({
      ...acc,
      [offset]: {
        keydown: keyKeydown(offset),
      },
    }),
    {}
  );

  useEventListeners(
    {
      ...keyMap,
      "0": { keydown: zeroKeydown },
      ArrowUp: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          cancelEvent(e);

          // Offset the selected transforms
          const holdingShift = isHoldingShift(e);
          const N = heldKeys.q ? (holdingShift ? 12 : 1) : 0;
          const T = heldKeys.w ? (holdingShift ? 12 : 1) : 0;
          const t = heldKeys.e ? (holdingShift ? 12 : 1) : 0;
          props.offsetSelectedTransforms({ N, T, t });
          if (N || T || t) return;

          // Select the previous track
          if (!props.selectedTrackId) return;
          const trackIds = props.rows.map((row) => row.trackId).filter(Boolean);
          const selectedIndex = trackIds.indexOf(props.selectedTrackId);
          if (selectedIndex === -1) return;
          const newIndex = selectedIndex - 1;
          if (newIndex < 0) return;
          const newTrackId = trackIds[newIndex];
          if (!newTrackId) return;
          props.setSelectedTrack(newTrackId);
        },
      },
      ArrowDown: {
        keydown: (e) => {
          if (isInputEvent(e) || props.showingEditor) return;
          cancelEvent(e);

          // Offset the selected transforms
          const holdingShift = isHoldingShift(e);
          const N = heldKeys.q ? (holdingShift ? -12 : -1) : 0;
          const T = heldKeys.w ? (holdingShift ? -12 : -1) : 0;
          const t = heldKeys.e ? (holdingShift ? -12 : -1) : 0;
          props.offsetSelectedTransforms({ N, T, t });
          if (N || T || t) return;

          // Select the next track
          if (!props.selectedTrackId) return;
          const trackIds = props.rows.map((row) => row.trackId).filter(Boolean);
          const selectedIndex = trackIds.indexOf(props.selectedTrackId);
          if (selectedIndex === -1) return;
          const newIndex = selectedIndex + 1;
          if (newIndex >= trackIds.length) return;
          const newTrackId = trackIds[newIndex];
          if (!newTrackId) return;
          props.setSelectedTrack(newTrackId);
        },
      },
      v: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e) || props.showingEditor)
            return;
          cancelEvent(e);
          props.pasteClipsAndTransforms(props.rows);
        },
      },
    },
    [props.selectedTrackId, props.rows, props.showingEditor, heldKeys]
  );
}
