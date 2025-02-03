import { EditorTabGroup } from "features/Editor/components/EditorTab";
import { ScaleEditorProps } from "../ScaleEditor";
import { getMidiPitchClass } from "utils/midi";
import { isNestedNote } from "types/Scale/ScaleTypes";
import { getScaleKey } from "utils/scale";

export const ScaleEditorNotebox = (props: ScaleEditorProps) => {
  const { scale, midiScale, cursor } = props;

  const key = getScaleKey(scale ?? []);
  const midi = midiScale[cursor.index];
  const pitchClass = getMidiPitchClass(midi, key);
  const selectedNote = scale?.notes[cursor.index];
  const isNested = isNestedNote(selectedNote);
  const degree = isNested ? selectedNote.degree : -1;

  if (cursor.hidden) return null;
  return (
    <div className="h-14 animate-in fade-in flex items-center bg-slate-800/50 rounded border border-sky-500">
      <>
        <EditorTabGroup border>
          <span className="text-emerald-400 font-thin pr-2">Scale Degree:</span>
          {cursor.index + 1}
        </EditorTabGroup>
        <EditorTabGroup border>
          <span className="text-teal-400 font-thin pr-2">Parent Degree:</span>
          {degree + 1}
        </EditorTabGroup>
        <EditorTabGroup border>
          <span className="text-sky-400 font-thin pr-2">Pitch Class:</span>
          {pitchClass}
        </EditorTabGroup>
        <EditorTabGroup>
          <span className="text-blue-400 font-thin pr-2">MIDI Number:</span>
          {midi}
        </EditorTabGroup>
      </>
    </div>
  );
};
