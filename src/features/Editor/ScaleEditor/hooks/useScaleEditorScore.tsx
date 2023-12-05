import { DemoXML } from "assets/demoXML";
import { EditorProps } from "features/Editor";
import { NoteCallback, useOSMD } from "lib/opensheetmusicdisplay";
import { useCallback, useMemo } from "react";
import { exportScaleToXML } from "redux/Scale";
import {
  selectTrackMidiScale,
  removeNoteFromScaleTrackByIndex,
} from "redux/Track";
import { useProjectDeepSelector } from "redux/hooks";

export function useScaleEditorScore(props: EditorProps) {
  const { dispatch, isRemoving, track } = props;
  const trackId = track?.id ?? "";

  // Use the Scale XML or a default demo to render the score correctly
  const scale = useProjectDeepSelector((_) => selectTrackMidiScale(_, trackId));
  const xml = scale ? dispatch(exportScaleToXML(scale)) : DemoXML;

  // Clicking on a scale note will remove it if currently removing notes
  const onNoteClick = useCallback<NoteCallback>(
    (_, index) => {
      if (isRemoving) dispatch(removeNoteFromScaleTrackByIndex(trackId, index));
    },
    [isRemoving, trackId]
  );
  const noteClasses = useMemo(
    () => (isRemoving ? ["fill-blue-500", "border", "cursor-pointer"] : []),
    [isRemoving]
  );

  /** Return the score and cursor */
  return useOSMD({
    id: "scale-score",
    xml,
    className: "items-center w-full h-full p-4",
    notes: scale,
    onNoteClick,
    noteClasses,
    noteColor: isRemoving ? "fill-red-500" : "fill-black",
  });
}
