import { EditorPiano } from "features/Editor/components/EditorPiano";
import { PatternClip } from "types/Clip/ClipTypes";
import { useDeep } from "types/hooks";
import { selectTrackScale } from "types/Track/TrackSelectors";

export interface PatternClipPianoProps {
  clip: PatternClip;
  playNote: (MIDI?: number) => void;
}

export function PatternClipPiano(props: PatternClipPianoProps) {
  const scale = useDeep((_) => selectTrackScale(_, props.clip.trackId));
  return (
    <EditorPiano
      className="animate-in border-t-8 border-t-emerald-500 fade-in w-full max-w-xl overflow-scroll"
      show
      noteRange={noteRange}
      playNote={(_, note) => props.playNote(note)}
      scale={scale}
      width={896}
      keyWidthToHeight={0.14}
    />
  );
}

const noteRange = ["A1", "C8"] as const;
