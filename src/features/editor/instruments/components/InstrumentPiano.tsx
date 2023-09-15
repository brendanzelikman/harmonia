import { EditorPiano } from "features/editor/components";
import { InstrumentEditorProps } from "..";
import { Sampler } from "tone";
import { MIDI } from "types";

interface InstrumentPianoProps extends InstrumentEditorProps {
  sampler?: Sampler;
}

export const InstrumentPiano = (props: InstrumentPianoProps) => {
  const playNote = (sampler: Sampler, midiNumber: number) => {
    if (!sampler?.loaded || sampler?.disposed) return;
    const pitch = MIDI.toPitch(midiNumber);
    sampler.triggerAttack(pitch);
  };
  const stopNote = (sampler: Sampler, midiNumber: number) => {
    if (!sampler?.loaded || sampler?.disposed) return;
    const pitch = MIDI.toPitch(midiNumber);
    sampler.triggerRelease(pitch);
  };

  return (
    <EditorPiano
      {...props}
      show={props.showingPiano}
      playNote={playNote}
      stopNote={stopNote}
    />
  );
};
