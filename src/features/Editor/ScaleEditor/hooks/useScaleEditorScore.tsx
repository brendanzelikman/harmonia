import { EditorProps } from "features/Editor/Editor";
import { NoteCallback, useOSMD } from "lib/opensheetmusicdisplay";
import { useCallback, useMemo } from "react";
import { useProjectDispatch } from "types/hooks";
import { exportScaleToXML } from "types/Scale/ScaleExporters";
import { removeNoteFromScaleByIndex } from "types/Scale/ScaleThunks";
import { MidiScale } from "utils/midi";

interface ScaleEditorScoreProps extends EditorProps {
  midiScale: MidiScale;
  isCustom: boolean;
  isTracked: boolean;
}
export function useScaleEditorScore(props: ScaleEditorScoreProps) {
  const dispatch = useProjectDispatch();
  const { scale, midiScale, isRemoving, isCustom, isTracked } = props;

  // Use the Scale XML or a default demo to render the score correctly
  const xml = exportScaleToXML(midiScale);

  // Clicking on a scale note will remove it if currently removing notes
  const onNoteClick = useCallback<NoteCallback>(
    (cursor, index) => {
      if (isRemoving) {
        dispatch(removeNoteFromScaleByIndex(scale, index));
      } else if (isCustom || isTracked) {
        cursor.show(index);
      }
    },
    [isRemoving, isCustom, isTracked, scale]
  );

  const noteClasses = useMemo(
    () =>
      isRemoving
        ? ["fill-blue-500", "border", "cursor-pointer"]
        : ["cursor-pointer"],
    [isRemoving]
  );

  /** Return the score and cursor */
  return useOSMD({
    id: "scale-score",
    xml,
    className: "size-full",
    notes: midiScale,
    onNoteClick,
    noteClasses,
    noteColor: isRemoving ? "fill-red-500" : "fill-black",
  });
}
