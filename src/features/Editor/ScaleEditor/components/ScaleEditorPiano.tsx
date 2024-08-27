import { ScaleEditorProps } from "../ScaleEditor";
import { Sampler } from "tone";
import { getMidiPitch } from "utils/midi";
import { EditorPiano } from "features/Editor/components/EditorPiano";
import { useProjectDispatch } from "types/hooks";
import { addNoteToScale, removeNoteFromScale } from "types/Scale/ScaleThunks";

export function ScaleEditorPiano(props: ScaleEditorProps) {
  const dispatch = useProjectDispatch();
  const { instance, scale, isAdding, isRemoving, isShowingPiano } = props;

  /** Play the note and add/remove it based on the editor action. */
  const playNote = (sampler: Sampler, midiNumber: number) => {
    if (isAdding) {
      dispatch(addNoteToScale(scale, midiNumber));
    } else if (isRemoving) {
      dispatch(removeNoteFromScale(scale, midiNumber));
    }
    if (!sampler?.loaded || sampler?.disposed) return;
    sampler.triggerAttackRelease(getMidiPitch(midiNumber), "4n");
  };

  /** Change the color of the piano border based on the editor action. */
  const border = `border-t-[6px] ${
    isAdding
      ? "border-t-sky-500"
      : isRemoving
      ? "border-t-red-500"
      : "border-t-slate-400"
  }`;

  /** Return the piano */
  return (
    <EditorPiano
      show={isShowingPiano}
      className={border}
      sampler={instance?.sampler}
      playNote={playNote}
      stopNote={() => null}
    />
  );
}
