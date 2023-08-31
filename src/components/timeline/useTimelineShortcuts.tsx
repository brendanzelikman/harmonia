import {
  cancelEvent,
  isHoldingCommand,
  isHoldingShift,
  isInputEvent,
} from "appUtil";
import { Row, TimelineProps } from ".";
import useEventListeners from "hooks/useEventListeners";
import { useState } from "react";

interface ShortcutProps extends TimelineProps {
  rows: Row[];
}

export default function useTimelineShortcuts(props: ShortcutProps) {
  const [holdingKeys, setHoldingKeys] = useState<Record<string, boolean>>({});

  const keyKeydown = (key: string) => (e: Event) => {
    if (isInputEvent(e)) return;
    cancelEvent(e);
    setHoldingKeys({ ...holdingKeys, [key]: true });
  };

  const keyKeyup = (key: string) => (e: Event) => {
    if (isInputEvent(e)) return;
    cancelEvent(e);
    setHoldingKeys({ ...holdingKeys, [key]: false });
  };

  useEventListeners(
    {
      0: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          cancelEvent(e);
          if (holdingKeys["1"]) {
            props.updateSelectedTransforms({ N: 0 });
          }
          if (holdingKeys["2"]) {
            props.updateSelectedTransforms({ T: 0 });
          }
          if (holdingKeys["3"]) {
            props.updateSelectedTransforms({ t: 0 });
          }
        },
      },
      ")": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          cancelEvent(e);
          if (holdingKeys["1"]) {
            props.updateSelectedTransforms({ N: 0 });
          }
          if (holdingKeys["2"]) {
            props.updateSelectedTransforms({ T: 0 });
          }
          if (holdingKeys["3"]) {
            props.updateSelectedTransforms({ t: 0 });
          }
        },
      },
      "1": {
        keydown: keyKeydown("1"),
        keyup: keyKeyup("1"),
      },
      "2": {
        keydown: keyKeydown("2"),
        keyup: keyKeyup("2"),
      },
      "3": {
        keydown: keyKeydown("3"),
        keyup: keyKeyup("3"),
      },
      "4": {
        keydown: keyKeydown("4"),
        keyup: keyKeyup("4"),
      },
      "5": {
        keydown: keyKeydown("5"),
        keyup: keyKeyup("5"),
      },
      "6": {
        keydown: keyKeydown("6"),
        keyup: keyKeyup("6"),
      },
      "7": {
        keydown: keyKeydown("7"),
        keyup: keyKeyup("7"),
      },
      "8": {
        keydown: keyKeydown("8"),
        keyup: keyKeyup("8"),
      },
      "9": {
        keydown: keyKeydown("9"),
        keyup: keyKeyup("9"),
      },
      "!": {
        keydown: keyKeydown("1"),
        keyup: keyKeyup("1"),
      },
      "@": {
        keydown: keyKeydown("2"),
        keyup: keyKeyup("2"),
      },
      "#": {
        keydown: keyKeydown("3"),
        keyup: keyKeyup("3"),
      },
      $: {
        keydown: keyKeydown("4"),
        keyup: keyKeyup("4"),
      },
      "%": {
        keydown: keyKeydown("5"),
        keyup: keyKeyup("5"),
      },
      "^": {
        keydown: keyKeydown("6"),
        keyup: keyKeyup("6"),
      },
      "&": {
        keydown: keyKeydown("7"),
        keyup: keyKeyup("7"),
      },
      "*": {
        keydown: keyKeydown("8"),
        keyup: keyKeyup("8"),
      },
      "(": {
        keydown: keyKeydown("9"),
        keyup: keyKeyup("9"),
      },
      ArrowUp: {
        keydown: (e) => {
          if (isInputEvent(e) || props.showingEditor) return;
          cancelEvent(e);

          const holdingShift = isHoldingShift(e);

          const summing = ["4", "5", "6", "7", "8", "9"].some(
            (key) => holdingKeys[key]
          );
          let offset = holdingShift ? 12 : summing ? 0 : 1;
          if (holdingKeys["4"]) offset += 4;
          if (holdingKeys["5"]) offset += 5;
          if (holdingKeys["6"]) offset += 6;
          if (holdingKeys["7"]) offset += 7;
          if (holdingKeys["8"]) offset += 8;
          if (holdingKeys["9"]) offset += 9;

          if (holdingKeys["1"]) {
            props.offsetSelectedTransforms({
              N: offset,
              T: 0,
              t: 0,
            });
          }
          if (holdingKeys["2"]) {
            props.offsetSelectedTransforms({
              N: 0,
              T: offset,
              t: 0,
            });
          }
          if (holdingKeys["3"]) {
            props.offsetSelectedTransforms({
              N: 0,
              T: 0,
              t: offset,
            });
          }

          // Select the previous track
          if (holdingKeys["1"] || holdingKeys["2"] || holdingKeys["3"]) return;
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

          const holdingShift = isHoldingShift(e);

          const summing = ["4", "5", "6", "7", "8", "9"].some(
            (key) => holdingKeys[key]
          );
          let offset = holdingShift ? -12 : summing ? 0 : -1;
          if (holdingKeys["4"]) offset -= 4;
          if (holdingKeys["5"]) offset -= 5;
          if (holdingKeys["6"]) offset -= 6;
          if (holdingKeys["7"]) offset -= 7;
          if (holdingKeys["8"]) offset -= 8;
          if (holdingKeys["9"]) offset -= 9;

          if (holdingKeys["1"]) {
            props.offsetSelectedTransforms({
              N: offset,
              T: 0,
              t: 0,
            });
          }
          if (holdingKeys["2"]) {
            props.offsetSelectedTransforms({
              N: 0,
              T: offset,
              t: 0,
            });
          }
          if (holdingKeys["3"]) {
            props.offsetSelectedTransforms({
              N: 0,
              T: 0,
              t: offset,
            });
          }

          if (holdingKeys["1"] || holdingKeys["2"] || holdingKeys["3"]) return;
          if (!props.selectedTrackId) return;

          // Select the next track
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
    [
      props.selectedTrackId,
      props.rows,
      props.showingEditor,
      JSON.stringify(holdingKeys),
    ]
  );
}
