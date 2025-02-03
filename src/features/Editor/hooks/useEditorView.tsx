import { useEffect, useRef, useState } from "react";
import { useProjectDeepSelector, useProjectDispatch } from "types/hooks";
import { hideEditor } from "types/Editor/EditorSlice";
import { isScaleTrack } from "types/Track/TrackTypes";
import { PatternEditor } from "../PatternEditor/PatternEditor";
import { ScaleEditor } from "../ScaleEditor/ScaleEditor";
import { EditorProps } from "../Editor";
import { InstrumentEditor } from "../InstrumentEditor/InstrumentEditor";
import { selectSelectedMotif } from "types/Timeline/TimelineSelectors";
import { showEditor } from "types/Editor/EditorThunks";
import { ClipType } from "types/Clip/ClipTypes";

export function useEditorView(props: EditorProps) {
  const dispatch = useProjectDispatch();
  const { track, view } = props;

  /** The editor view displays the current view. */
  const EditorView = (
    <div
      style={{ height: "calc(100% - 30px)" }}
      className={`flex flex-col w-full h-full z-50 relative`}
    >
      <div className="min-h-0 h-full" id="editor">
        {props.onScaleEditor && <ScaleEditor {...props} />}
        {props.onPatternEditor && <PatternEditor {...props} />}
        {props.onInstrumentEditor && <InstrumentEditor {...props} />}
      </div>
    </div>
  );

  // Close the editor if the selected object is undefined
  const selectedObject = useProjectDeepSelector((_) =>
    selectSelectedMotif(_, view as ClipType)
  );
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const hasScale = props.scale || selectedObject;
    if (view === "instrument" || (view === "scale" && hasScale)) return;
    hideTimer.current = setTimeout(() => dispatch(hideEditor()), 500);
    if (selectedObject === undefined && !!view) {
    } else {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, [selectedObject, view]);

  // Clean up the view if the selected track changes
  useEffect(() => {
    if (!track) return;
    if (isScaleTrack(track) && props.onInstrumentEditor) {
      dispatch(showEditor({ data: { view: "scale" } }));
    }
  }, [track, props.onInstrumentEditor]);

  // Return the editor view
  return EditorView;
}
