import { DemoXML } from "assets/demoXML";
import { EditorProps } from "features/Editor";
import { useOSMD, BaseProps, NoteCallback } from "lib/opensheetmusicdisplay";
import { PresetPatternMap } from "presets/patterns";
import { useCallback, useMemo } from "react";
import { exportPatternToXML } from "redux/Pattern";
import { selectTrackScaleChain } from "redux/Track";
import { useProjectSelector, useProjectDispatch } from "redux/hooks";
import { resolvePatternToMidi } from "types/Pattern";

export function usePatternEditorScore(props: EditorProps) {
  const dispatch = useProjectDispatch();

  // Use the Pattern XML or a default demo to render the score correctly
  const pattern = props.pattern;
  const isCustom = !PresetPatternMap[pattern?.id ?? ""];
  const xml = pattern ? dispatch(exportPatternToXML(props.pattern)) : DemoXML;

  // Get the pattern stream using its scales, if any
  const trackId = pattern?.patternTrackId;
  const scales = useProjectSelector((_) => selectTrackScaleChain(_, trackId));
  const stream = resolvePatternToMidi(pattern, scales);

  // Clicking on a pattern note will update the cursor
  const onNoteClick = useCallback<NoteCallback>(
    (cursor, index) => isCustom && cursor.show(index),
    [isCustom]
  );

  const noteClasses = useMemo(() => ["cursor-pointer"], []);

  // Return the score hook props
  return useOSMD({
    id: "pattern-score",
    xml,
    className: "items-center w-full h-full p-4",
    stream,
    onNoteClick,
    noteClasses,
  });
}
