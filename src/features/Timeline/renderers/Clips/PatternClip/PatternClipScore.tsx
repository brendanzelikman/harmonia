import { use, useDeep, useProjectDispatch } from "types/hooks";
import { NoteCallback, useOSMD } from "lib/opensheetmusicdisplay";
import {
  selectPatternClipMidiStream,
  selectPatternClipXML,
} from "types/Arrangement/ArrangementSelectors";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { removePatternBlock } from "types/Pattern/PatternSlice";
import { PatternClipRendererProps } from "./usePatternClipRenderer";
import { useCallback } from "react";

export interface PatternClipScoreProps extends PatternClipRendererProps {
  isRemoving: boolean;
  stopRemoving: () => void;
}

const noteClasses = ["cursor-pointer"];

export function PatternClipScore(props: PatternClipScoreProps) {
  const { clip, portaledClip, isRemoving, stopRemoving } = props;
  const pcId = portaledClip?.id;
  const pattern = useDeep((_) => selectPatternById(_, clip.patternId));
  const stream = useDeep((_) => selectPatternClipMidiStream(_, pcId));
  const streamLength = stream.length;
  const xml = use((_) => selectPatternClipXML(_, portaledClip));
  const dispatch = useProjectDispatch();

  // Remove the block if removing notes
  const onNoteClick = useCallback<NoteCallback>(
    (_, index) => {
      if (isRemoving) {
        dispatch(removePatternBlock({ id: pattern.id, index }));
        if (streamLength < 2) stopRemoving();
      }
    },
    [isRemoving, streamLength]
  );

  // Create the score
  const { score } = useOSMD({
    id: `${pcId}_score`,
    xml,
    className: "size-full",
    stream,
    noteClasses,
    noteColor: isRemoving ? "fill-red-500" : "fill-black",
    onNoteClick,
  });

  // Render the score
  return (
    <div className="bg-white overflow-scroll min-h-[200px] max-h-full rounded-lg border-2 border-teal-200">
      {score}
    </div>
  );
}
