import { EditorPiano } from "features/editor/components";
import { ScaleEditorProps } from "..";
import { Sampler } from "tone";
import { MIDI } from "types/midi";

interface ScalePianoProps extends ScaleEditorProps {
  sampler: Sampler;
}

export function ScalePiano(props: ScalePianoProps) {
  const { scaleTrack, sampler } = props;

  // Play note handler for piano given editor state
  const playNote = (sampler: Sampler, midiNumber: number) => {
    if (!scaleTrack) return;
    if (props.adding) {
      props.addNoteToScaleTrack(scaleTrack.id, midiNumber);
    } else if (props.removing) {
      props.removeNoteFromScaleTrack(scaleTrack.id, midiNumber);
    }
    if (!sampler?.loaded || sampler?.disposed) return;
    sampler.triggerAttackRelease(MIDI.toPitch(midiNumber), "4n");
  };

  return (
    <EditorPiano
      show={props.showingPiano}
      className={`border-t-8 ${
        props.adding
          ? "border-t-emerald-400"
          : props.removing
          ? "border-t-red-500"
          : "border-t-zinc-800/90"
      }`}
      sampler={sampler}
      playNote={playNote}
      stopNote={() => null}
    />
  );
}
