import { isInputEvent, mod } from "appUtil";
import { useAppSelector, useDispatch } from "redux/hooks";
import {
  selectActivePatternId,
  selectSelectedClipIds,
  selectRoot,
  selectTransport,
  selectPatterns,
} from "redux/selectors";
import { exportClipsToMidi } from "redux/thunks/clips";
import * as Root from "redux/slices/root";
import { setTransportLoop } from "redux/thunks/transport";
import {
  startTransport,
  pauseTransport,
  stopTransport,
} from "redux/thunks/transport";
import { UndoTypes } from "redux/undoTypes";
import { readFiles, saveStateToFile } from "redux/util";
import useEventListeners from "./useEventListeners";
import { useState } from "react";
import { selectSelectedClipTransforms } from "redux/selectors/transforms";
import { deleteClips, deleteClipsAndTransforms } from "redux/slices/clips";

export default function useShortcuts() {
  const transport = useAppSelector(selectTransport);
  const root = useAppSelector(selectRoot);
  const patterns = useAppSelector(selectPatterns);

  const activePatternId = useAppSelector(selectActivePatternId);
  const selectedClipIds = useAppSelector(selectSelectedClipIds);
  const selectedClipTransformIds = useAppSelector(selectSelectedClipTransforms);
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
          if (root.showingEditor) return;
          e.preventDefault();
          const holdingShift = !!(e as KeyboardEvent).shiftKey;
          const type = holdingShift
            ? UndoTypes.redoTimeline
            : UndoTypes.undoTimeline;
          dispatch({ type });
        },
      },
      // Shift + M = Export selected clips to MIDI
      M: {
        keydown: (e) => {
          if (isInputEvent(e) || !(e as KeyboardEvent).shiftKey) return;
          if (root.showingEditor) return;
          e.preventDefault();
          if (!selectedClipIds.length) return;
          dispatch(exportClipsToMidi(selectedClipIds));
        },
      },
    },
    [holdingCommand, selectedClipIds]
  );

  useEventListeners(
    {
      // "Space" = Play/Pause
      " ": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (!root.showingEditor) {
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
          if (!root.showingEditor) {
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
    [root.showingEditor, transport]
  );

  useEventListeners(
    {
      ArrowDown: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (root.showingEditor) return;
          e.preventDefault();
          if (!activePatternId) return;
          const index = patterns.findIndex(
            (pattern) => pattern.id === activePatternId
          );
          if (index === -1) return;
          const nextIndex = (index + 1) % patterns.length;
          dispatch(Root.setActivePattern(patterns[nextIndex].id));
        },
      },
      ArrowUp: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (root.showingEditor) return;
          e.preventDefault();
          if (!activePatternId) return;
          const index = patterns.findIndex(
            (pattern) => pattern.id === activePatternId
          );
          if (index === -1) return;
          const nextIndex = mod(index - 1, patterns.length);
          dispatch(Root.setActivePattern(patterns[nextIndex].id));
        },
      },
    },
    [patterns, activePatternId, root]
  );

  useEventListeners(
    {
      // "p" = Toggle Pattern Editor
      p: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (root.editorState === "patterns" && root.showingEditor) {
            dispatch(Root.hideEditor());
          } else {
            dispatch(Root.showEditor({ id: "patterns" }));
            if (root.timelineState === "adding") {
              dispatch(Root.toggleAddingClip());
            } else if (root.timelineState === "cutting") {
              dispatch(Root.toggleCuttingClip());
            } else if (root.timelineState === "merging") {
              dispatch(Root.toggleMergingClips());
            } else if (root.timelineState === "repeating") {
              dispatch(Root.toggleRepeatingClips());
            } else if (root.timelineState === "transposing") {
              dispatch(Root.toggleTransposingClip());
            }
          }
        },
      },
      // "Escape" = Hide Editor
      Escape: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (root.showingEditor) {
            dispatch(Root.hideEditor());
          } else {
            dispatch(Root.selectClips([]));
          }
        },
      },
      // "a" = Toggle Adding
      a: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          dispatch(Root.toggleAddingClip());
          dispatch(Root.hideEditor());
        },
      },
      // "c" = Toggle Cutting
      c: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          dispatch(Root.toggleCuttingClip());
          dispatch(Root.hideEditor());
        },
      },
      // "m" = Toggle Merging
      m: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          dispatch(Root.toggleMergingClips());
          dispatch(Root.hideEditor());
        },
      },
      // "r" = Toggle Repeating
      r: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          dispatch(Root.toggleRepeatingClips());
          dispatch(Root.hideEditor());
        },
      },
      // "t" = Toggle Transposing
      t: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          dispatch(Root.toggleTransposingClip());
          dispatch(Root.hideEditor());
        },
      },
      // "Backspace" = Delete Clip
      Backspace: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (!root.showingEditor) {
            e.preventDefault();
            if (selectedClipIds.length > 0) {
              const holdingShift = !!(e as KeyboardEvent).shiftKey;

              if (holdingShift) {
                const transformIds = selectedClipTransformIds
                  .flat()
                  .map((t) => t.id);
                dispatch(
                  deleteClipsAndTransforms(selectedClipIds, transformIds)
                );
              } else {
                dispatch(deleteClips(selectedClipIds));
              }
            }
          }
        },
      },
    },
    [activePatternId, root, selectedClipIds, selectedClipTransformIds]
  );
}
