import { Editor } from "features/Editor/components";
import { InstrumentEditorProps } from "../InstrumentEditor";
import { Sampler } from "tone";
import { getMidiPitch } from "utils/midi";

export const InstrumentEditorPiano = (props: InstrumentEditorProps) => {
  const { instance, isShowingPiano, startPlaying, stopPlaying } = props;

  /** Attack the note with the instrument */
  const playNote = (sampler: Sampler, midiNumber: number) => {
    if (!sampler?.loaded || sampler?.disposed) return;
    const pitch = getMidiPitch(midiNumber);
    sampler.triggerAttack(pitch);
    startPlaying();
  };

  /** Release the note with the instrument */
  const stopNote = (sampler: Sampler, midiNumber: number) => {
    if (!sampler?.loaded || sampler?.disposed) return;
    const pitch = getMidiPitch(midiNumber);
    sampler.triggerRelease(pitch);
    stopPlaying();
  };

  return (
    <Editor.Piano
      {...props}
      sampler={instance?.sampler}
      show={isShowingPiano}
      playNote={playNote}
      stopNote={stopNote}
    />
  );
};
