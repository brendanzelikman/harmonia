import { durationToTicks, ticksToToneSubdivision } from "utils";
import { Sampler } from "tone";
import { MIDI } from "types/midi";
import { PatternEditorCursorProps } from "..";
import { EditorPiano } from "features/Editor/components";
import { PatternNote } from "types/Pattern";
import { Scale } from "types/Scale";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";

interface PatternPianoProps extends PatternEditorCursorProps {
  scale: Scale;
  sampler: Sampler;
}

export function PatternPiano(props: PatternPianoProps) {
  // Keep track of shift key
  const holdingShift = useHeldHotkeys("shift").shift;

  // Play note event handler handling editor states
  const playNote = (sampler: Sampler, midiNumber: number) => {
    const velocity = props.noteVelocity ?? MIDI.DefaultVelocity;
    // Play the note
    if (sampler?.loaded) {
      const pitch = MIDI.toPitch(midiNumber);
      const scaledVelocity = velocity / MIDI.MaxVelocity;
      const ticks = durationToTicks(props.noteDuration, {
        dotted: props.noteTiming === "dotted",
        triplet: props.noteTiming === "triplet",
      });
      const subdivision = props.isCustom ? ticksToToneSubdivision(ticks) : "4n";
      sampler.triggerAttackRelease(
        pitch,
        subdivision,
        undefined,
        scaledVelocity
      );
    }

    // Make sure the scale and pattern exist
    const { pattern, scale } = props;
    if (!pattern || !scale) return;

    // Prepare the corresponding note
    const patternNote: PatternNote = {
      MIDI: midiNumber,
      duration: durationToTicks(props.noteDuration, {
        dotted: props.noteTiming === "dotted",
        triplet: props.noteTiming === "triplet",
      }),
      velocity,
    };

    // Dispatch the appropriate action
    // Adding
    if (props.adding) {
      if (props.cursor.hidden) {
        props.addPatternNote(patternNote, holdingShift);
      } else {
        props.updatePatternNote(props.cursor.index, patternNote, holdingShift);
      }
      return;
    }

    // Inserting
    if (props.inserting) {
      if (props.cursor.hidden) {
        props.addPatternNote(patternNote, false);
      } else {
        props.insertPatternNote(patternNote, props.cursor.index);
      }
      return;
    }

    // Removing
    if (props.removing) props.removePatternNote(midiNumber);
  };

  return (
    <EditorPiano
      show={props.showingPiano}
      sampler={props.sampler}
      className={`border-t-8 ${
        props.adding
          ? "border-t-green-400"
          : props.inserting
          ? "border-t-green-400"
          : "border-t-zinc-800/90"
      }`}
      playNote={playNote}
    />
  );
}
