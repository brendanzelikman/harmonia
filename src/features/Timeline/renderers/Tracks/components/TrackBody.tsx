import { useTick } from "hooks/useTick";
import { memo, useState } from "react";
import {
  GiCrystalWand,
  GiDominoMask,
  GiPianoKeys,
  GiPineTree,
} from "react-icons/gi";
import {
  selectTrackMidiScaleAtTick,
  selectTrackJSXAtTick,
} from "types/Arrangement/ArrangementTrackSelectors";
import { useStore } from "hooks/useStore";
import {
  selectTrackInstrumentName,
  selectTrackLabelById,
} from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";
import { cancelEvent } from "utils/html";
import { getMidiPitchClass } from "utils/midi";
import { getScaleKey, getScaleName } from "utils/scale";

const ScaleTrackBody = (props: { trackId: TrackId }) => {
  const { trackId } = props;
  const { tick } = useTick();
  const scale = useStore((_) => selectTrackMidiScaleAtTick(_, trackId, tick));
  const label = useStore((_) => selectTrackLabelById(_, trackId));
  const pose = useStore((_) => selectTrackJSXAtTick(_, trackId, tick));
  const [showNotes, setShowNotes] = useState(false);
  const name = getScaleName(scale);
  const key = getScaleKey(scale);
  const notes = scale.map((n) => getMidiPitchClass(n, key)).join(", ");
  const scaleText = showNotes ? notes : name;
  return (
    <div className="min-w-0 grow flex flex-col text-xs gap-1 *:h-4 pt-1">
      <div className="flex text-teal-400">
        <GiPineTree className="mr-1 my-auto inline shrink-0" />
        <div>Scale {label}</div>
      </div>
      <div
        className="flex overflow-scroll text-sky-300 cursor-pointer"
        onClick={(e) => {
          cancelEvent(e);
          setShowNotes((prev) => !prev);
        }}
      >
        <GiDominoMask className="mr-1 my-auto inline shrink-0" />
        <div>{scaleText}</div>
      </div>
      <div className="flex hover:saturate-150 overflow-scroll mr-2 items-center gap-1 text-fuchsia-300">
        <GiCrystalWand className="shrink-0" />
        {pose}
      </div>
    </div>
  );
};
export const MemoizedScaleTrackBody = memo(ScaleTrackBody);

export const PatternTrackBody = (props: { trackId: TrackId }) => {
  const { trackId } = props;
  const { tick } = useTick();
  const label = useStore((_) => selectTrackLabelById(_, trackId));
  const instrumentName = useStore((_) => selectTrackInstrumentName(_, trackId));
  const pose = useStore((_) => selectTrackJSXAtTick(_, trackId, tick));
  return (
    <div className="min-w-0 grow flex flex-col text-xs pt-2 *:h-4 gap-0.5">
      <div className="flex text-teal-300/95">
        <GiPineTree className="mr-1 my-auto inline shrink-0" />
        <div>Sampler {label}</div>
      </div>
      <div className="flex text-orange-300">
        <GiPianoKeys className="mr-1 my-auto inline shrink-0" />
        <div className="overflow-scroll">{instrumentName}</div>
      </div>
      <div className="flex hover:saturate-150 overflow-scroll mr-2 items-center gap-1 text-fuchsia-300">
        <GiCrystalWand className="shrink-0" />
        {pose}
      </div>
    </div>
  );
};
export const MemoizedPatternTrackBody = memo(PatternTrackBody);
