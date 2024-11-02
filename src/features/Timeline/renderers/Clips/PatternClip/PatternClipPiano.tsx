import { useDeep, useProjectDispatch } from "types/hooks";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { addPatternNote, updatePatternNote } from "types/Pattern/PatternSlice";
import { PatternClipRendererProps } from "./usePatternClipRenderer";
import { useCallback } from "react";
import { EditorPiano } from "features/Editor/components/EditorPiano";
import { DEFAULT_VELOCITY } from "utils/constants";
import { Sampler } from "tone";
import { autoBindNoteToTrack } from "types/Track/TrackThunks";
import { PatternNote } from "types/Pattern/PatternTypes";
import { CursorProps } from "lib/opensheetmusicdisplay";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { PatternClip } from "types/Clip/ClipTypes";

export interface PatternClipPianoProps extends PatternClipRendererProps {
  cursor: CursorProps;
  clip: PatternClip;
  duration: number;
  isAdding: boolean;
}

export function PatternClipPiano(props: PatternClipPianoProps) {
  const { isAdding, duration, cursor, clip } = props;
  const dispatch = useProjectDispatch();
  const pattern = useDeep((_) => selectPatternById(_, clip.patternId));
  const holding = useHeldHotkeys("shift");
  const asChord = holding.shift;

  // Add the MIDI note and try to autobind it to the best scale
  const playNote = useCallback(
    (_: Sampler, MIDI: number) => {
      if (isAdding) {
        let note: PatternNote = {
          duration,
          MIDI,
          velocity: DEFAULT_VELOCITY,
        };
        const bestNote = dispatch(autoBindNoteToTrack(clip.trackId, note));
        if (bestNote) note = bestNote;
        if (cursor.hidden) {
          dispatch(
            addPatternNote({
              data: { id: pattern.id, note, asChord },
            })
          );
        } else {
          dispatch(
            updatePatternNote({
              data: { id: pattern.id, note, asChord, index: cursor.index },
            })
          );
        }
      }
    },
    [isAdding, cursor, clip, duration, asChord]
  );

  // Render the piano
  return (
    <div className="animate-in fade-in slide-in-from-top-10 slide-in-from-left-4 w-full max-w-2xl">
      <EditorPiano
        show
        noteRange={noteRange}
        playNote={playNote}
        className={`border-t-8 ${
          isAdding ? "border-t-emerald-500" : "border-t-emerald-500/0"
        }`}
      />
    </div>
  );
}

const noteRange = ["C1", "C8"] as const;
