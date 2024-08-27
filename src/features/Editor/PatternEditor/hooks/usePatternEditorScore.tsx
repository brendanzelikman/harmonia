import { EditorProps } from "features/Editor/Editor";
import { useOSMD, NoteCallback } from "lib/opensheetmusicdisplay";
import { PresetPatternMap } from "presets/patterns";
import { useCallback, useMemo } from "react";
import { selectPatternXML } from "types/Arrangement/ArrangementSelectors";
import { use, useDeep } from "types/hooks";
import { resolvePatternToMidi } from "types/Pattern/PatternResolvers";
import { selectTrackScaleChain } from "types/Track/TrackSelectors";

export function usePatternEditorScore(props: EditorProps) {
  // Use the Pattern XML or a default demo to render the score correctly
  const pattern = props.pattern;
  const id = pattern?.id;
  const isCustom = !PresetPatternMap[pattern?.id ?? ""];
  const xml = use((_) => selectPatternXML(_, id));

  // Get the pattern stream using its scales, if any
  const trackId = pattern?.patternTrackId;
  const scales = useDeep((_) => selectTrackScaleChain(_, trackId));
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
    className: "size-full",
    stream,
    onNoteClick,
    noteClasses,
  });
}
