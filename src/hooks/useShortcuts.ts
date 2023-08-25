import { isHoldingCommand, isHoldingShift, isInputEvent } from "appUtil";
import { useAppSelector, useDispatch } from "redux/hooks";
import {
  selectRoot,
  selectTransport,
  selectClips,
  selectTransforms,
  selectClipsByIds,
  selectTransformsByIds,
  selectClipDuration,
} from "redux/selectors";
import { exportClipsToMidi } from "redux/thunks/clips";
import * as Root from "redux/slices/root";
import { seekTransport, setTransportLoop } from "redux/thunks/transport";
import {
  startTransport,
  pauseTransport,
  stopTransport,
} from "redux/thunks/transport";
import { UndoTypes } from "redux/undoTypes";
import { readFiles, saveStateToFile } from "redux/util";
import useEventListeners from "./useEventListeners";

import {
  createClipsAndTransforms,
  deleteClipsAndTransforms,
} from "redux/slices/clips";

export default function useShortcuts() {
  const transport = useAppSelector(selectTransport);
  const root = useAppSelector(selectRoot);
  const clips = useAppSelector(selectClips);
  const transforms = useAppSelector(selectTransforms);

  const { selectedClipIds, selectedPatternId, selectedTransformIds } = root;
  const selectedClips = useAppSelector((state) =>
    selectClipsByIds(state, selectedClipIds)
  );
  const selectedClipDurations = useAppSelector((state) =>
    selectedClips.map((clip) => selectClipDuration(state, clip?.id))
  );
  const selectedTransforms = useAppSelector((state) =>
    selectTransformsByIds(state, selectedTransformIds)
  );
  const dispatch = useDispatch();

  useEventListeners(
    {
      // "Command + S" = Save
      s: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e)) return;
          e.preventDefault();
          saveStateToFile();
        },
      },
      // "Command + O" = Open
      O: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e)) return;
          e.preventDefault();
          readFiles();
        },
      },
      // "Command + A" = Select All Clips/Transforms
      // "a" = Toggle Adding
      a: {
        keydown: (e) => {
          if (isInputEvent(e) || root.showingEditor) return;
          e.preventDefault();
          if (isHoldingCommand(e)) {
            dispatch(Root.selectClips(clips.map((c) => c.id)));
            dispatch(Root.selectTransforms(transforms.map((t) => t.id)));
          } else {
            dispatch(Root.toggleAddingClip());
            dispatch(Root.hideEditor());
          }
        },
      },
      // "Command + C" = Copy
      // "c" = Toggle Cutting
      c: {
        keydown: (e) => {
          if (isInputEvent(e) || root.showingEditor) return;
          e.preventDefault();

          // Copy Selected Clips and Transforms
          if (isHoldingCommand(e)) {
            dispatch(
              Root.setClipboard({
                clips: clips.filter((c) => selectedClipIds.includes(c.id)),
                transforms: transforms.filter((t) =>
                  selectedTransformIds.includes(t.id)
                ),
              })
            );
            return;
          }
          // Toggle Cutting
          dispatch(Root.toggleCuttingClip());
          dispatch(Root.hideEditor());
        },
      },
      // "Command + X" = Cut
      x: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (!isHoldingCommand(e)) return;
          e.preventDefault();

          // Copy Selected Clips and Transforms to Clipboard
          dispatch(
            Root.setClipboard({
              clips: clips.filter((c) => selectedClipIds.includes(c.id)),
              transforms: transforms.filter((t) =>
                selectedTransformIds.includes(t.id)
              ),
            })
          );
          // Delete Selected Clips and Transforms
          dispatch(
            deleteClipsAndTransforms(selectedClipIds, selectedTransformIds)
          );
        },
      },

      // "Command + Z" = Undo
      // "Command + Shift + Z" = Redo
      z: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e)) return;
          e.preventDefault();

          const holdingShift = isHoldingShift(e);

          // Pattern Editor
          if (root.showingEditor && root.editorState === "patterns") {
            const type = holdingShift
              ? UndoTypes.redoPatterns
              : UndoTypes.undoPatterns;
            dispatch({ type });
            return;
          }

          // Scale Editor
          if (root.showingEditor && root.editorState === "scale") {
            const type = holdingShift
              ? UndoTypes.redoScales
              : UndoTypes.undoScales;
            dispatch({ type });
            return;
          }

          // Timeline
          const type = holdingShift
            ? UndoTypes.redoTimeline
            : UndoTypes.undoTimeline;
          dispatch({ type });
        },
      },
      // Shift + M = Export selected clips to MIDI
      M: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingShift(e)) return;
          if (root.showingEditor || !selectedClipIds.length) return;
          e.preventDefault();

          dispatch(exportClipsToMidi(selectedClipIds));
        },
      },
      // "Command + D" = Duplicate selected clips
      d: {
        keydown: async (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e)) return;
          e.preventDefault();
          if (!selectedClipIds.length) return;

          const startTime = Math.min(
            ...selectedClips.map((clip) => clip.startTime),
            ...selectedTransforms.map((transform) => transform.time)
          );
          const lastTime = Math.max(
            ...selectedClips.map(
              (clip, i) => clip.startTime + selectedClipDurations[i]
            ),
            ...selectedTransforms.map((transform) => transform.time + 1)
          );
          const duration = lastTime - startTime;

          const newClips = selectedClips.map((clip) => ({
            ...clip,
            startTime: clip.startTime + duration,
          }));
          const newTransforms = selectedTransforms.map((transform) => ({
            ...transform,
            time: transform.time + duration,
          }));

          const { clipIds, transformIds } = await dispatch(
            createClipsAndTransforms(newClips, newTransforms)
          );
          if (clipIds) dispatch(Root.selectClips(clipIds));
          if (transformIds) dispatch(Root.selectTransforms(transformIds));
        },
      },
    },
    [root, selectedClipIds, selectedTransformIds, clips, transforms]
  );

  useEventListeners(
    {
      // "Space" = Play/Pause
      " ": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          e.preventDefault();
          if (transport.state === "started") {
            dispatch(pauseTransport());
          } else {
            dispatch(startTransport());
          }
        },
      },
      // "Enter" = Stop
      Enter: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          e.preventDefault();
          dispatch(stopTransport());
        },
      },
      // "Left Arrow" = Go Back
      ArrowLeft: {
        keydown: (e) => {
          if (isInputEvent(e) || root.showingEditor) return;
          e.preventDefault();
          if (transport.time === 0) return;
          dispatch(seekTransport(transport.time - 1));
        },
      },
      // "Right Arrow" = Go Forward
      ArrowRight: {
        keydown: (e) => {
          if (isInputEvent(e) || root.showingEditor) return;
          e.preventDefault();
          dispatch(seekTransport(transport.time + 1));
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
      // "p" = Toggle Pattern Editor
      p: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (root.editorState === "patterns" && root.showingEditor) {
            dispatch(Root.hideEditor());
          } else {
            dispatch(Root.showEditor({ id: "patterns" }));
            dispatch(Root.clearTimelineState());
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
            dispatch(Root.deselectAllClips());
            dispatch(Root.deselectAllTransforms());
          }
        },
      },
      // "m" = Toggle Merging
      m: {
        keydown: (e) => {
          if (isInputEvent(e) || root.showingEditor) return;
          dispatch(Root.toggleMergingClips());
          dispatch(Root.hideEditor());
        },
      },
      // "r" = Toggle Repeating
      r: {
        keydown: (e) => {
          if (isInputEvent(e) || root.showingEditor) return;
          dispatch(Root.toggleRepeatingClips());
          dispatch(Root.hideEditor());
        },
      },
      // "t" = Toggle Transposing
      t: {
        keydown: (e) => {
          if (isInputEvent(e) || root.showingEditor) return;
          dispatch(Root.toggleTransposingClip());
          dispatch(Root.hideEditor());
        },
      },
      // "Backspace" = Delete Clips and Transforms
      Backspace: {
        keydown: (e) => {
          if (isInputEvent(e) || root.showingEditor) return;
          e.preventDefault();
          dispatch(
            deleteClipsAndTransforms(selectedClipIds, selectedTransformIds)
          );
        },
      },
    },
    [selectedPatternId, root, selectedClipIds, selectedTransformIds]
  );
}
