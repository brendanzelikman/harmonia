import { isInputEvent } from "appUtil";
import { useAppSelector, useDispatch } from "redux/hooks";
import {
  selectActivePatternId,
  selectSelectedClipIds,
  selectRoot,
  selectTransport,
  selectScaleTracks,
  selectTrackMap,
} from "redux/selectors";
import { deleteClips } from "redux/slices/clips";
import {
  hideEditor,
  toggleAddingClip,
  toggleCuttingClip,
  toggleTransposingClip,
  toggleRepeatingClips,
  viewEditor,
  toggleMergingClips,
  toggleMergeTransforms,
  selectClips,
} from "redux/slices/root";
import { setTransportLoop } from "redux/slices/transport";
import {
  startTransport,
  pauseTransport,
  stopTransport,
} from "redux/thunks/transport";
import { UndoTypes } from "redux/undoTypes";
import { readFiles, saveStateToFile } from "redux/util";
import useEventListeners from "./useEventListeners";
import { useState } from "react";

export default function useShortcuts() {
  const transport = useAppSelector(selectTransport);
  const root = useAppSelector(selectRoot);
  const trackMap = useAppSelector(selectTrackMap);

  const scaleTracks = useAppSelector(selectScaleTracks);
  const lastScaleTrack = scaleTracks[scaleTracks.length - 1];
  const lastPatternTrackIds = lastScaleTrack
    ? trackMap[lastScaleTrack.id].patternTrackIds
    : [];
  const activePatternId = useAppSelector(selectActivePatternId);
  const selectedClipIds = useAppSelector(selectSelectedClipIds);
  const dispatch = useDispatch();

  const [holdingCommand, setHoldingCommand] = useState(false);

  useEventListeners(
    {
      // "Command" = Hold
      Meta: {
        keydown: (e) => {
          setHoldingCommand(true);
        },
        keyup: (e) => {
          setHoldingCommand(false);
        },
      },
      // "Command + S" = Save
      s: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (!holdingCommand) return;
          e.preventDefault();
          saveStateToFile();
        },
      },
      // "Command + O" = Open
      O: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (!holdingCommand) return;
          e.preventDefault();
          readFiles();
        },
      },
      // "Command + Z" = Undo
      // "Command + Shift + Z" = Redo
      z: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (!holdingCommand) return;
          if (root.showEditor) return;
          e.preventDefault();
          const holdingShift = !!(e as KeyboardEvent).shiftKey;
          const type = holdingShift
            ? UndoTypes.redoTimeline
            : UndoTypes.undoTimeline;
          dispatch({ type });
        },
      },
    },
    [holdingCommand]
  );

  useEventListeners(
    {
      // "Space" = Play/Pause
      " ": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (!root.showEditor) {
            e.preventDefault();
            if (transport.state === "started") {
              dispatch(pauseTransport());
            } else {
              dispatch(startTransport());
            }
          }
        },
      },
      // "Enter" = Stop
      Enter: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (!root.showEditor) {
            e.preventDefault();
            dispatch(stopTransport());
          }
        },
      },
      // "l" = Toggle Loop
      l: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          dispatch(setTransportLoop(!transport.loop));
        },
      },
    },
    [root.showEditor, transport]
  );

  useEventListeners(
    {
      // "p" = Toggle Pattern Editor
      p: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (root.editorState === "patterns" && root.showEditor) {
            dispatch(hideEditor());
          } else {
            dispatch(viewEditor({ id: "patterns" }));
            if (root.timelineState === "adding") {
              dispatch(toggleAddingClip());
            } else if (root.timelineState === "cutting") {
              dispatch(toggleCuttingClip());
            } else if (root.timelineState === "merging") {
              dispatch(toggleMergingClips());
            } else if (root.timelineState === "repeating") {
              dispatch(toggleRepeatingClips());
            } else if (root.timelineState === "transposing") {
              dispatch(toggleTransposingClip());
            }
          }
        },
      },
      // "Escape" = Hide Editor
      Escape: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (root.showEditor) {
            dispatch(hideEditor());
          } else {
            dispatch(selectClips([]));
          }
        },
      },
      // "a" = Toggle Adding
      a: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          dispatch(toggleAddingClip());
          dispatch(hideEditor());
        },
      },
      // "c" = Toggle Cutting
      c: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          dispatch(toggleCuttingClip());
          dispatch(hideEditor());
        },
      },
      // "m" = Toggle Merging
      m: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          dispatch(toggleMergingClips());
          dispatch(hideEditor());
        },
      },
      // "r" = Toggle Repeating
      r: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          dispatch(toggleRepeatingClips());
          dispatch(hideEditor());
        },
      },
      // "t" = Toggle Transposing
      t: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          dispatch(toggleTransposingClip());
          dispatch(hideEditor());
        },
      },
      // "Backspace" = Delete Clip
      Backspace: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (!root.showEditor) {
            e.preventDefault();
            if (selectedClipIds.length > 0) {
              dispatch(deleteClips(selectedClipIds));
            }
          }
        },
      },
    },
    [activePatternId, root, selectedClipIds]
  );
}
