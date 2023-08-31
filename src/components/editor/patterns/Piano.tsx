import { durationToTicks } from "appUtil";
import { Sampler } from "tone";
import { MIDI } from "types/midi";
import { Duration, Timing } from "types/units";
import { PatternEditorProps } from ".";
import { EditorState } from "../hooks/useEditorState";
import EditorPiano from "../Piano";

interface Props extends PatternEditorProps, EditorState<any> {
  sampler: Sampler;
  duration: Duration;
  timing: Timing;
  holdingShift: boolean;
  cursor: any;
}
export function PatternsPiano(props: Props) {
  const pattern = props.pattern;
  const playNote = (sampler: Sampler, midiNumber: number) => {
    if (pattern && props.scale) {
      const patternNote = {
        MIDI: midiNumber,
        duration: durationToTicks(props.duration, {
          dotted: props.timing === "dotted",
          triplet: props.timing === "triplet",
        }),
      };
      if (props.onState("adding")) {
        if (props.cursor.hidden) {
          props.addPatternNote(pattern.id, patternNote, props.holdingShift);
        } else {
          props.updatePatternNote(
            pattern.id,
            props.cursor.index,
            patternNote,
            props.holdingShift
          );
        }
      } else if (props.onState("inserting")) {
        if (props.cursor.hidden) {
          props.addPatternNote(pattern.id, patternNote, false);
        } else {
          props.insertPatternNote(pattern.id, patternNote, props.cursor.index);
        }
      }
      if (props.onState("removing")) {
        props.removePatternNote(pattern.id, midiNumber);
      }
    }
    if (!sampler?.loaded || sampler?.disposed) return;
    sampler.triggerAttackRelease(MIDI.toPitch(midiNumber), "4n");
  };
  return (
    <EditorPiano
      sampler={props.sampler}
      className={`border-t-8 ${
        props.onState("adding")
          ? "border-t-emerald-400"
          : props.onState("inserting")
          ? "border-t-green-400"
          : "border-t-zinc-800/90"
      }`}
      playNote={playNote}
    />
  );
}
