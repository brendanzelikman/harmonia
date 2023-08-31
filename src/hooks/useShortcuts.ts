import {
  cancelEvent,
  isHoldingCommand,
  isHoldingShift,
  isInputEvent,
  subdivisionToTicks,
} from "appUtil";
import { useAppSelector, useDispatch } from "redux/hooks";
import {
  selectRoot,
  selectTransport,
  selectClipsByIds,
  selectTransformsByIds,
  selectTrack,
} from "redux/selectors";
import * as Thunks from "redux/thunks";
import * as Root from "redux/slices/root";
import { UndoTypes } from "redux/undoTypes";
import { readFiles, saveStateToFile } from "redux/util";
import useEventListeners from "./useEventListeners";
import { updateClipsAndTransforms } from "redux/slices/clips";
import { isPatternTrack } from "types/tracks";
import { Subdivision } from "types/units";
import { MAX_SUBDIVISION, MIN_SUBDIVISION } from "appConstants";
import { useEffect } from "react";
import { Clip } from "types/clips";
import { Transform } from "types/transform";

export default function useShortcuts() {
  const dispatch = useDispatch();

  const transport = useAppSelector(selectTransport);
  const root = useAppSelector(selectRoot);

  const { selectedClipIds, selectedPatternId, selectedTransformIds } = root;
  const selectedTrack = useAppSelector((state) =>
    root.selectedTrackId ? selectTrack(state, root.selectedTrackId) : undefined
  );
  const selectedClips = useAppSelector((state) =>
    selectClipsByIds(state, selectedClipIds)
  ).filter(Boolean) as Clip[];
  const selectedTransforms = useAppSelector((state) =>
    selectTransformsByIds(state, selectedTransformIds)
  ).filter(Boolean) as Transform[];

  // Stop the transport on app cleanup
  useEffect(() => {
    return () => {
      dispatch(Thunks.stopTransport());
    };
  }, []);

  // No dependencies
  useEventListeners(
    {
      // "Command + O" = Open
      o: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e)) return;
          cancelEvent(e);
          readFiles();
        },
      },
      // "Command + S" = Save
      s: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e)) return;
          cancelEvent(e);
          saveStateToFile();
        },
      },
      // "Command + X" = Cut Selected Timeline Objects
      x: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (!isHoldingCommand(e)) return;
          cancelEvent(e);

          dispatch(Thunks.cutSelectedClipsAndTransforms());
        },
      },
      // "Enter" = Stop
      Enter: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          cancelEvent(e);
          dispatch(Thunks.stopTransport());
        },
      },
    },
    []
  );

  useEventListeners(
    {
      // "Command + Z" = Undo
      // "Command + Shift + Z" = Redo
      z: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e)) return;
          cancelEvent(e);

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
      // "Command + A" = Select All Timeline Objects
      // "A" = Toggle Adding Clips
      a: {
        keydown: (e) => {
          if (isInputEvent(e) || root.showingEditor) return;
          cancelEvent(e);

          if (isHoldingCommand(e)) {
            dispatch(Thunks.selectAllClipsAndTransforms());
          } else {
            dispatch(Root.toggleAddingClip());
            dispatch(Root.hideEditor());
          }
        },
      },
      // "Command + C" = Copy Timeline Objects
      // "C" = Toggle Cutting Clips
      c: {
        keydown: (e) => {
          if (isInputEvent(e) || root.showingEditor) return;
          cancelEvent(e);

          if (isHoldingCommand(e)) {
            dispatch(Thunks.copySelectedClipsAndTransforms());
          } else {
            dispatch(Root.toggleCuttingClip());
            dispatch(Root.hideEditor());
          }
        },
      },

      d: {
        keydown: (e) => {
          if (isInputEvent(e) || root.showingEditor) return;
          cancelEvent(e);
          dispatch(Thunks.duplicateSelectedClipsAndTransforms());
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
      // Shift + M = Export selected clips to MIDI
      M: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingShift(e)) return;
          if (root.showingEditor) return;
          cancelEvent(e);
          dispatch(Thunks.exportSelectedClipsToMidi());
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
            dispatch(Root.setSelectedTrack(undefined));
            dispatch(Root.deselectAllClips());
            dispatch(Root.deselectAllTransforms());
          }
        },
      },
      // "Backspace" = Delete Clips and Transforms
      Backspace: {
        keydown: (e) => {
          if (isInputEvent(e) || root.showingEditor) return;
          e.preventDefault();
          dispatch(Thunks.deleteSelectedClipsAndTransforms());
        },
      },
    },
    [root.showingEditor, root.editorState]
  );

  useEventListeners(
    {
      // "Space" = Play/Pause Timeline
      // "Shift + Space" = Play Pattern/Scale
      " ": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          cancelEvent(e);

          // Play/Pause Timeline
          if (!isHoldingShift(e)) {
            if (transport.state === "started") {
              dispatch(Thunks.pauseTransport());
            } else {
              dispatch(Thunks.startTransport());
            }
            return;
          }
          if (!root.showingEditor) return;

          // Play Pattern Track
          if (selectedPatternId && root.editorState === "patterns") {
            dispatch(Thunks.playPattern(selectedPatternId));
            return;
          }

          // Play Scale Track
          if (selectedTrack && root.editorState === "scale") {
            if (isPatternTrack(selectedTrack)) return;
            dispatch(Thunks.playScale(selectedTrack.id));
          }
        },
      },
      // "Left Arrow" = Go Back or Move Selected Timeline Objects
      ArrowLeft: {
        keydown: (e) => {
          if (isInputEvent(e) || root.showingEditor) return;
          cancelEvent(e);

          // If there are selected clips or transforms, move them
          const objects = [...selectedClips, ...selectedTransforms];
          if (objects.length) {
            const offset = subdivisionToTicks(transport.subdivision);
            // Create new clips and transforms with the new times
            const newClips = selectedClips.map((clip) => ({
              ...clip,
              tick: clip.tick - offset,
            }));
            const newTransforms = selectedTransforms.map((transform) => ({
              ...transform,
              tick: transform.tick - offset,
            }));

            // Cancel if any of the new times are invalid
            if (newClips.some((clip) => clip.tick < 0)) return;
            if (newTransforms.some((transform) => transform.tick < 0)) return;

            // Update the clips and transforms
            dispatch(updateClipsAndTransforms(newClips, newTransforms));
            return;
          }

          // Otherwise, go back one beat
          if (transport.tick === 0) return;
          dispatch(Thunks.seekTransport(transport.tick - 1));
        },
      },
      // "Right Arrow" = Go Forward or Move Selected Timeline Objects
      ArrowRight: {
        keydown: (e) => {
          if (isInputEvent(e) || root.showingEditor) return;
          cancelEvent(e);

          // If there are selected clips or transforms, move them
          if ([...selectedClips, ...selectedTransforms].length) {
            const offset = subdivisionToTicks(transport.subdivision);

            const newClips = selectedClips.map((clip) => ({
              ...clip,
              tick: clip.tick + offset,
            }));
            const newTransforms = selectedTransforms.map((transform) => ({
              ...transform,
              tick: transform.tick + offset,
            }));
            dispatch(updateClipsAndTransforms(newClips, newTransforms));
            return;
          }

          dispatch(Thunks.seekTransport(transport.tick + 1));
        },
      },
      // "l" = Toggle Loop
      l: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          dispatch(Thunks.setTransportLoop(!transport.loop));
        },
      },
      _: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (transport.subdivision === MIN_SUBDIVISION) return;
          cancelEvent(e);
          dispatch(
            Thunks.setTransportSubdivision(
              (transport.subdivision / 2) as Subdivision
            )
          );
        },
      },
      "+": {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (transport.subdivision === MAX_SUBDIVISION) return;
          cancelEvent(e);
          dispatch(
            Thunks.setTransportSubdivision(
              (transport.subdivision * 2) as Subdivision
            )
          );
        },
      },
    },
    [
      root.showingEditor,
      root.editorState,
      transport,
      selectedPatternId,
      selectedTrack,
      selectedClips,
      selectedTransforms,
    ]
  );
}
