import { useAppSelector, useDispatch } from "redux/hooks";
import { selectTransport, selectEditor } from "redux/selectors";
import * as Thunks from "redux/thunks";
import * as Timeline from "redux/Timeline";
import { UndoTypes } from "redux/undoTypes";
import { clearState, readFiles, saveStateToFile } from "redux/util";
import { useEffect } from "react";
import { hideEditor, showEditor } from "redux/Editor";
import { deselectAllClips, deselectAllTranspositions } from "redux/Root";
import { useHotkeys } from "react-hotkeys-hook";
import { isEditorOn } from "types/Editor";

export default function useGlobalHotkeys() {
  const dispatch = useDispatch();
  const transport = useAppSelector(selectTransport);
  const editor = useAppSelector(selectEditor);

  // Stop the transport on app cleanup
  useEffect(() => {
    return () => {
      dispatch(Thunks.stopTransport());
    };
  }, []);

  // Meta + S = Save Project
  useHotkeys("meta+s", saveStateToFile, { preventDefault: true });

  // Meta + O = Open Project
  useHotkeys("meta+o", readFiles, { preventDefault: true });

  // Meta + Alt + N = New Project
  useHotkeys("meta+alt+n", clearState, { preventDefault: true });

  // Meta + Z = Undo Action
  useHotkeys(
    "meta+z",
    () => {
      if (editor.show && editor.id === "patterns") {
        dispatch({ type: UndoTypes.undoPatterns });
        return;
      }
      if (editor.show && editor.id === "scale") {
        dispatch({ type: UndoTypes.undoScales });
        return;
      }
      dispatch({ type: UndoTypes.undoSession });
    },
    { preventDefault: true },
    [editor]
  );

  // Meta + Shift + Z = Redo Action
  useHotkeys(
    "meta+shift+z",
    () => {
      if (editor.show && editor.id === "patterns") {
        dispatch({ type: UndoTypes.redoPatterns });
        return;
      }
      if (editor.show && editor.id === "scale") {
        dispatch({ type: UndoTypes.redoScales });
        return;
      }
      dispatch({ type: UndoTypes.redoSession });
    },
    { preventDefault: true },
    [editor]
  );

  // Space = Play/Pause Transport
  useHotkeys(
    "space",
    () => {
      if (editor.show) return;
      if (transport.state === "started") {
        dispatch(Thunks.pauseTransport());
      } else {
        dispatch(Thunks.startTransport());
      }
    },
    { preventDefault: true },
    [editor, transport.state]
  );

  // Enter = Stop Transport
  useHotkeys(
    "enter",
    () => {
      if (editor.show) return;
      dispatch(Thunks.stopTransport());
    },
    { preventDefault: true },
    [editor]
  );

  // L = Toggle Loop
  useHotkeys(
    "l",
    () => {
      if (editor.show) return;
      dispatch(Thunks.setTransportLoop(!transport.loop));
    },
    [editor.show, transport.loop]
  );

  // Meta + Shift + M = Toggle Transport Mute
  useHotkeys(
    "meta+shift+m",
    () => {
      if (editor.show) return;
      dispatch(Thunks.setTransportMute(!transport.mute));
    },
    [editor.show, transport.mute]
  );

  // Meta + P = Toggle Pattern Editor
  useHotkeys(
    "meta+p",
    () => {
      const onPatterns = isEditorOn(editor, "patterns");
      if (onPatterns) {
        dispatch(hideEditor());
      } else {
        dispatch(showEditor({ id: "patterns" }));
      }
      dispatch(Timeline.clearTimelineState());
    },
    { preventDefault: true },
    [editor.show]
  );

  // Escape = Hide Editor
  useHotkeys(
    "escape",
    () => {
      if (editor.show) {
        dispatch(hideEditor());
      } else {
        dispatch(deselectAllClips());
        dispatch(deselectAllTranspositions());
      }
    },
    [editor.show, editor.id]
  );
}
