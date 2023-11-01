import { Sampler } from "tone";
import { getMidiPitch } from "utils/midi";
import { PatternEditorProps } from "../PatternEditor";
import { Editor } from "features/Editor/components";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { getDurationSubdivision, getDurationTicks } from "utils/durations";
import { PatternNote } from "types/Pattern";
import {
  addPatternNote,
  insertPatternNote,
  updatePatternNote,
} from "redux/Pattern";

export function PatternEditorPiano(props: PatternEditorProps) {
  const { cursor, pattern, instance, isAdding, isInserting, isCustom } = props;
  const id = pattern?.id;
  const index = cursor.index;
  const asChord = useHeldHotkeys(["shift"]).shift;
  const { duration } = props.settings.note;
  const durationTicks = getDurationTicks(duration);
  const durationSubdivision = getDurationSubdivision(duration);

  // Play note event handler handling editor states
  const playNote = (sampler: Sampler, midiNumber: number) => {
    // Play the note
    if (sampler?.loaded) {
      const pitch = getMidiPitch(midiNumber);
      const subdivision = isCustom ? durationSubdivision : "4n";
      sampler.triggerAttackRelease(pitch, subdivision, undefined, 1);
    }
    if (!id) return;

    // Prepare the corresponding note
    const note = { MIDI: midiNumber, duration: durationTicks, velocity: 100 };

    // Dispatch the appropriate action
    if (isAdding && cursor.hidden) {
      props.dispatch(addPatternNote({ id, note, asChord }));
    }
    if (isAdding && !cursor.hidden) {
      props.dispatch(updatePatternNote({ id, index, note, asChord }));
    }
    if (isInserting) {
      props.dispatch(insertPatternNote({ id, index, note }));
    }
  };

  return (
    <Editor.Piano
      show={props.isShowingPiano}
      sampler={instance?.sampler}
      className={`border-t-8 ${
        isAdding
          ? "border-t-green-400"
          : isInserting
          ? "border-t-green-400"
          : "border-t-zinc-800/90"
      }`}
      playNote={playNote}
    />
  );
}
