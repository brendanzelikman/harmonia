import { Editor } from "features/Editor/components";
import { ScaleEditorProps } from "../ScaleEditor";
import { Sampler } from "tone";
import { getMidiPitch } from "utils/midi";
import { addNoteToScaleTrack, removeNoteFromScaleTrack } from "redux/Track";

export function ScaleEditorPiano(props: ScaleEditorProps) {
  const { instance, track, isAdding, isRemoving, isShowingPiano } = props;

  /** Play the note and add/remove it based on the editor action. */
  const playNote = (sampler: Sampler, midiNumber: number) => {
    if (isAdding) {
      props.dispatch(addNoteToScaleTrack(track?.id, midiNumber));
    } else if (isRemoving) {
      props.dispatch(removeNoteFromScaleTrack(track?.id, midiNumber));
    }
    if (!sampler?.loaded || sampler?.disposed) return;
    sampler.triggerAttackRelease(getMidiPitch(midiNumber), "4n");
  };

  /** Change the color of the piano border based on the editor action. */
  const border = `border-t-8 ${
    isAdding
      ? "border-t-emerald-400"
      : isRemoving
      ? "border-t-red-500"
      : "border-t-zinc-800/90"
  }`;

  /** Return the piano */
  return (
    <Editor.Piano
      show={isShowingPiano}
      className={border}
      sampler={instance?.sampler}
      playNote={playNote}
      stopNote={() => null}
    />
  );
}
