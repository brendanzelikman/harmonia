import { useEffect } from "react";
import { showEditor } from "redux/thunks";
import { EditorProps } from "..";
import { InstrumentEditor } from "../InstrumentEditor";
import { PatternEditor } from "../PatternEditor";
import { ScaleEditor } from "../ScaleEditor";

export function useEditorView(props: EditorProps) {
  const { track, onScaleEditor, onPatternEditor, onInstrumentEditor } = props;

  /** The editor view displays the current view. */
  const EditorView = (
    <div
      style={{ height: "calc(100% - 30px)" }}
      className={`flex flex-col w-full z-50 relative`}
    >
      <div className="min-h-0 h-full" id="editor">
        {onScaleEditor && <ScaleEditor {...props} />}
        {onPatternEditor && <PatternEditor {...props} />}
        {onInstrumentEditor && <InstrumentEditor {...props} />}
      </div>
    </div>
  );

  // Clean up the view if the selected track changes
  useEffect(() => {
    if (!track) return;
    if (track.type === "scaleTrack" && onInstrumentEditor) {
      props.dispatch(showEditor("scale"));
    }
    if (track.type === "patternTrack" && onScaleEditor) {
      props.dispatch(showEditor("instrument"));
    }
  }, [track, onInstrumentEditor, onScaleEditor]);

  // Return the editor view
  return { EditorView };
}
