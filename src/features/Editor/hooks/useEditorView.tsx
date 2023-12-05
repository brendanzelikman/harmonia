import { useEffect } from "react";
import { showEditor } from "redux/thunks";
import { EditorProps } from "..";
import { InstrumentEditor } from "../InstrumentEditor";
import { PatternEditor } from "../PatternEditor";
import { ScaleEditor } from "../ScaleEditor";
import { isPatternTrack, isScaleTrack } from "types/Track";
import { PoseEditor } from "../PoseEditor";

export function useEditorView(props: EditorProps) {
  const { track } = props;

  /** The editor view displays the current view. */
  const EditorView = (
    <div
      style={{ height: "calc(100% - 30px)" }}
      className={`flex flex-col w-full h-full z-50 relative`}
    >
      <div className="min-h-0 h-full" id="editor">
        {props.onScaleEditor && <ScaleEditor {...props} />}
        {props.onPatternEditor && <PatternEditor {...props} />}
        {props.onPoseEditor && <PoseEditor {...props} />}
        {props.onInstrumentEditor && <InstrumentEditor {...props} />}
      </div>
    </div>
  );

  // Clean up the view if the selected track changes
  useEffect(() => {
    if (!track) return;
    if (isScaleTrack(track) && props.onInstrumentEditor) {
      props.dispatch(showEditor("scale"));
    }
    if (isPatternTrack(track) && props.onScaleEditor) {
      props.dispatch(showEditor("instrument"));
    }
  }, [track, props.onInstrumentEditor, props.onScaleEditor]);

  // Return the editor view
  return { EditorView };
}
