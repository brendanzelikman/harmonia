import {
  cancelEvent,
  isHoldingCommand,
  isHoldingOption,
  isHoldingShift,
  isInputEvent,
  subdivisionToTicks,
} from "utils";
import { useAppSelector, useDispatch } from "redux/hooks";
import {
  selectRoot,
  selectTransport,
  selectClipsByIds,
  selectTranspositionsByIds,
  selectTrack,
  selectEditor,
  selectTimeline,
} from "redux/selectors";
import * as Thunks from "redux/thunks";
import * as Root from "redux/slices/root";
import * as Timeline from "redux/slices/timeline";
import { UndoTypes } from "redux/undoTypes";
import { clearState, readFiles, saveStateToFile } from "redux/util";
import useEventListeners from "./useEventListeners";
import { updateClipsAndTranspositions } from "redux/slices/clips";
import { useEffect } from "react";
import { Clip } from "types/clip";
import { Transposition } from "types/transposition";
import { hideEditor, showEditor } from "redux/slices/editor";

export default function useShortcuts() {
  const dispatch = useDispatch();

  const transport = useAppSelector(selectTransport);
  const timeline = useAppSelector(selectTimeline);
  const root = useAppSelector(selectRoot);
  const editor = useAppSelector(selectEditor);

  const { selectedClipIds, selectedPatternId, selectedTranspositionIds } = root;
  const selectedTrack = useAppSelector((state) =>
    root.selectedTrackId ? selectTrack(state, root.selectedTrackId) : undefined
  );
  const selectedClips = useAppSelector((state) =>
    selectClipsByIds(state, selectedClipIds)
  ).filter(Boolean) as Clip[];
  const selectedTranspositions = useAppSelector((state) =>
    selectTranspositionsByIds(state, selectedTranspositionIds)
  ).filter(Boolean) as Transposition[];

  // Stop the transport on app cleanup
  useEffect(() => {
    return () => {
      dispatch(Thunks.stopTransport());
    };
  }, []);

  // No dependencies
  useEventListeners(
    {
      // "Command + Option + N" = New Project
      n: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e) || !isHoldingOption(e))
            return;
          cancelEvent(e);
          clearState();
        },
      },
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

          dispatch(Thunks.cutSelectedClipsAndTranspositions());
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
          if (editor.show && editor.id === "patterns") {
            const type = holdingShift
              ? UndoTypes.redoPatterns
              : UndoTypes.undoPatterns;
            dispatch({ type });
            return;
          }

          // Scale Editor
          if (editor.show && editor.id === "scale") {
            const type = holdingShift
              ? UndoTypes.redoScales
              : UndoTypes.undoScales;
            dispatch({ type });
            return;
          }

          // Session
          const type = holdingShift
            ? UndoTypes.redoSession
            : UndoTypes.undoSession;
          dispatch({ type });
        },
      },
      // "Command + A" = Select All Timeline Objects
      // "A" = Toggle Adding Clips
      a: {
        keydown: (e) => {
          if (isInputEvent(e) || editor.show) return;
          cancelEvent(e);

          if (isHoldingCommand(e)) {
            dispatch(Thunks.selectAllClipsAndTranspositions());
          } else {
            dispatch(Timeline.toggleAddingClip());
            dispatch(hideEditor());
          }
        },
      },
      // "Command + C" = Copy Timeline Objects
      // "C" = Toggle Cutting Clips
      c: {
        keydown: (e) => {
          if (isInputEvent(e) || editor.show) return;
          cancelEvent(e);

          if (isHoldingCommand(e)) {
            dispatch(Thunks.copySelectedClipsAndTranspositions());
          } else {
            dispatch(Timeline.toggleCuttingClip());
            dispatch(hideEditor());
          }
        },
      },

      // "Command + D" = Duplicate Timeline Objects
      d: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e) || editor.show) return;
          cancelEvent(e);
          dispatch(Thunks.duplicateSelectedClipsAndTranspositions());
        },
      },

      // "m" = Toggle Merging
      m: {
        keydown: (e) => {
          if (isInputEvent(e) || isHoldingCommand(e) || editor.show) return;
          cancelEvent(e);
          dispatch(Timeline.toggleMergingClips());
          dispatch(hideEditor());
        },
      },
      // Shift + M = Export selected clips to MIDI
      M: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingShift(e)) return;
          if (editor.show) return;
          cancelEvent(e);
          dispatch(Thunks.exportSelectedClipsToMidi());
        },
      },
      // "r" = Toggle Repeating
      r: {
        keydown: (e) => {
          if (
            isInputEvent(e) ||
            editor.show ||
            isHoldingCommand(e) ||
            isHoldingShift(e)
          )
            return;
          cancelEvent(e);
          dispatch(Timeline.toggleRepeatingClips());
          dispatch(hideEditor());
        },
      },
      // "t" = Toggle Transposing
      t: {
        keydown: (e) => {
          if (isInputEvent(e) || editor.show) return;
          cancelEvent(e);
          dispatch(Timeline.toggleTransposingClip());
          dispatch(hideEditor());
        },
      },
      // "Cmd + P" = Toggle Pattern Editor
      p: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e)) return;
          cancelEvent(e);
          if (editor.id === "patterns" && editor.show) {
            dispatch(hideEditor());
          } else {
            dispatch(showEditor({ id: "patterns" }));
            dispatch(Timeline.clearTimelineState());
          }
        },
      },
      // "Escape" = Hide Editor
      Escape: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (editor.show) {
            dispatch(hideEditor());
          } else {
            dispatch(Root.setSelectedTrack(undefined));
            dispatch(Root.deselectAllClips());
            dispatch(Root.deselectAllTranspositions());
          }
        },
      },
      // "Backspace" = Delete Clips and Transpositions
      Backspace: {
        keydown: (e) => {
          if (isInputEvent(e) || editor.show) return;
          e.preventDefault();
          dispatch(Thunks.deleteSelectedClipsAndTranspositions());
        },
      },
    },
    [editor.show, editor.id]
  );

  useEventListeners(
    {
      // "Space" = Play/Pause Timeline
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
          if (!editor.show) return;
        },
      },
      // "Left Arrow" = Go Back or Move Selected Timeline Objects
      ArrowLeft: {
        keydown: (e) => {
          if (isInputEvent(e) || editor.show) return;
          cancelEvent(e);

          // If there are selected clips or transpositions, move them
          const objects = [...selectedClips, ...selectedTranspositions];
          if (objects.length) {
            const offset = subdivisionToTicks(timeline.subdivision);
            // Create new clips and transpositions with the new times
            const newClips = selectedClips.map((clip) => ({
              ...clip,
              tick: clip.tick - offset,
            }));
            const newTranspositions = selectedTranspositions.map(
              (transposition) => ({
                ...transposition,
                tick: transposition.tick - offset,
              })
            );

            // Cancel if any of the new times are invalid
            if (newClips.some((clip) => clip.tick < 0)) return;
            if (
              newTranspositions.some((transposition) => transposition.tick < 0)
            )
              return;

            // Update the clips and transpositions
            dispatch(updateClipsAndTranspositions(newClips, newTranspositions));
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
          if (isInputEvent(e) || editor.show) return;
          cancelEvent(e);

          // If there are selected clips or transpositions, move them
          if ([...selectedClips, ...selectedTranspositions].length) {
            const offset = subdivisionToTicks(timeline.subdivision);

            const newClips = selectedClips.map((clip) => ({
              ...clip,
              tick: clip.tick + offset,
            }));
            const newTranspositions = selectedTranspositions.map(
              (transposition) => ({
                ...transposition,
                tick: transposition.tick + offset,
              })
            );
            dispatch(updateClipsAndTranspositions(newClips, newTranspositions));
            return;
          }

          dispatch(Thunks.seekTransport(transport.tick + 1));
        },
      },
      // "l" = Toggle Loop
      l: {
        keydown: (e) => {
          if (isInputEvent(e) || editor.show) return;
          dispatch(Thunks.setTransportLoop(!transport.loop));
        },
      },
      // Cmd + Shift + M = Toggle Mute
      m: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e) || !isHoldingShift(e))
            return;
          cancelEvent(e);
          dispatch(Thunks.setTransportMute(!transport.mute));
        },
      },
      Dead: {
        keydown: (e) => {
          if (isInputEvent(e) || (e as KeyboardEvent).code !== "KeyN") return;
          clearState();
        },
      },
      // "Cmd + '-'" = Decrease Subdivision
      "-": {
        keydown: (e) => {
          if (editor.show || isInputEvent(e) || !isHoldingCommand(e)) return;
          cancelEvent(e);
          dispatch(Timeline.decreaseSubdivision());
        },
      },
      // "Cmd + '+'" = Increase Subdivision
      "=": {
        keydown: (e) => {
          if (editor.show || isInputEvent(e) || !isHoldingCommand(e)) return;
          cancelEvent(e);
          dispatch(Timeline.increaseSubdivision());
        },
      },
    },
    [
      editor,
      timeline,
      transport,
      selectedPatternId,
      selectedTrack,
      selectedClips,
      selectedTranspositions,
    ]
  );
}
