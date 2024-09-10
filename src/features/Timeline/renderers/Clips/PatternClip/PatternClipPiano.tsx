import { useDeep, useProjectDispatch } from "types/hooks";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { addPatternNote } from "types/Pattern/PatternSlice";
import classNames from "classnames";
import { PatternClipRendererProps } from "./usePatternClipRenderer";
import { useCallback } from "react";
import { EditorPiano } from "features/Editor/components/EditorPiano";
import { EighthNoteTicks } from "utils/durations";
import { DEFAULT_VELOCITY } from "utils/constants";
import { Sampler } from "tone";
import { autoBindNoteToTrack } from "types/Track/TrackThunks";
import { PatternNote } from "types/Pattern/PatternTypes";

export interface PatternClipPianoProps extends PatternClipRendererProps {
  isAdding: boolean;
}

const noteRange = ["C2", "C8"] as const;

export function PatternClipPiano(props: PatternClipPianoProps) {
  const { clip, isAdding } = props;
  const dispatch = useProjectDispatch();
  const pattern = useDeep((_) => selectPatternById(_, clip.patternId));

  // Add the MIDI note and try to autobind it to the best scale
  const playNote = useCallback(
    (_: Sampler, MIDI: number) => {
      if (isAdding) {
        let note: PatternNote = {
          duration: EighthNoteTicks,
          MIDI,
          velocity: DEFAULT_VELOCITY,
        };
        const bestNote = dispatch(autoBindNoteToTrack(clip.trackId, note));
        if (bestNote) note = bestNote;
        dispatch(addPatternNote({ data: { id: pattern.id, note } }));
      }
    },
    [isAdding, clip]
  );

  // Render the piano
  return (
    <div className="animate-in fade-in slide-in-from-top-10 slide-in-from-left-12">
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
