import { durationToBeats } from "appUtil";
import { Sampler } from "tone";
import { MIDI } from "types/midi";
import { Duration } from "types/units";
import { EditorPatternsProps } from ".";
import { EditorState } from "../hooks/useEditorState";
import EditorPiano from "../Piano";

interface Props extends EditorPatternsProps, EditorState<any> {
  duration: Duration;
  holdingShift: boolean;
  cursor: any;
}
export function PatternsPiano(props: Props) {
  const playNote = (sampler: Sampler, midiNumber: number) => {
    if (props.activePattern && props.scale) {
      const patternNote = {
        MIDI: midiNumber,
        duration: durationToBeats(props.duration),
      };
      if (props.onState("adding")) {
        if (props.cursor.hidden) {
          props.addPatternNote(
            props.activePattern.id,
            patternNote,
            props.holdingShift
          );
        } else {
          props.updatePatternNote(
            props.activePattern.id,
            props.cursor.index,
            patternNote,
            props.holdingShift
          );
        }
      } else if (props.onState("inserting")) {
        if (props.cursor.hidden) {
          props.addPatternNote(props.activePattern.id, patternNote, false);
        } else {
          props.insertPatternNote(
            props.activePattern.id,
            patternNote,
            props.cursor.index
          );
        }
      }
      if (props.onState("removing")) {
        props.removePatternNote(props.activePattern.id, midiNumber);
      }
    }
    sampler.triggerAttackRelease(MIDI.toPitch(midiNumber), "4n");
  };
  return (
    <EditorPiano
      className={`border-t-4 ${
        props.onState("adding") || props.onState("inserting")
          ? "border-t-emerald-500/80"
          : props.onState("inserting")
          ? "border-t-red-500"
          : "border-t-zinc-800/90"
      }`}
      playNote={playNote}
    />
  );
}
