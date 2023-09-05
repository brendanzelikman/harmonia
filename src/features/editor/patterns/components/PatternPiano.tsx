import { durationToTicks } from "appUtil";
import { Sampler } from "tone";
import { MIDI } from "types/midi";
import { PatternEditorCursorProps } from "..";
import { useState } from "react";
import useEventListeners from "hooks/useEventListeners";
import { isSamplerLoaded } from "types/instrument";
import { EditorPiano } from "features/editor/components";
import { PatternNote } from "types/patterns";

interface PatternPianoProps extends PatternEditorCursorProps {
  sampler: Sampler;
}

export function PatternPiano(props: PatternPianoProps) {
  // Keep track of shift key
  const [holdingShift, setHoldingShift] = useState(false);
  useEventListeners(
    {
      Shift: {
        keydown: () => setHoldingShift(true),
        keyup: () => setHoldingShift(false),
      },
    },
    []
  );

  // Play note event handler handling editor states
  const playNote = (sampler: Sampler, midiNumber: number) => {
    const velocity = props.noteVelocity ?? MIDI.DefaultVelocity;
    // Play the note
    if (isSamplerLoaded(sampler)) {
      const pitch = MIDI.toPitch(midiNumber);
      const scaledVelocity = velocity / MIDI.MaxVelocity;
      sampler.triggerAttackRelease(pitch, "4n", undefined, scaledVelocity);
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
        props.addPatternNote(pattern.id, patternNote, holdingShift);
      } else {
        props.updatePatternNote(
          pattern.id,
          props.cursor.index,
          patternNote,
          holdingShift
        );
      }
      return;
    }

    // Inserting
    if (props.inserting) {
      if (props.cursor.hidden) {
        props.addPatternNote(pattern.id, patternNote, false);
      } else {
        props.insertPatternNote(pattern.id, patternNote, props.cursor.index);
      }
      return;
    }

    // Removing
    if (props.removing) {
      props.removePatternNote(pattern.id, midiNumber);
    }
  };

  return (
    <EditorPiano
      sampler={props.sampler}
      className={`border-t-8 ${
        props.adding
          ? "border-t-emerald-400"
          : props.inserting
          ? "border-t-green-400"
          : "border-t-zinc-800/90"
      }`}
      playNote={playNote}
    />
  );
}
