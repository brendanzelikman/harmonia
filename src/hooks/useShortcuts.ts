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

  useEventListeners(
    {
      // "Shift + S" = Save
      S: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if ((e as KeyboardEvent).shiftKey) {
            e.preventDefault();
            saveStateToFile();
          }
        },
      },
      // "Shift + O" = Open
      O: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if ((e as KeyboardEvent).shiftKey) {
            e.preventDefault();
            readFiles();
          }
        },
      },
      // "Shift + Z" = Undo
      Z: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if ((e as KeyboardEvent).shiftKey) {
            e.preventDefault();
            dispatch({ type: UndoTypes.undoTimeline });
          }
        },
      },
      // "Shift + Y" = Redo
      Y: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if ((e as KeyboardEvent).shiftKey) {
            e.preventDefault();
            dispatch({ type: UndoTypes.redoTimeline });
          }
        },
      },
    },
    []
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
      // "Escape" = Hide Editor
      Escape: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (root.showEditor) {
            dispatch(hideEditor());
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
      // "m" = Toggle Patterns
      m: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          if (root.editorState === "patterns" && root.showEditor) {
            dispatch(hideEditor());
          } else {
            dispatch(viewEditor({ id: "patterns" }));
          }
        },
      },
    },
    [activePatternId, root, selectedClipIds]
  );
}
