import { useTick } from "types/Transport/TransportTick";
import { memo, useState } from "react";
import {
  GiDominoMask,
  GiPianoKeys,
  GiPineTree,
  GiTrumpet,
} from "react-icons/gi";
import {
  selectTrackMidiScaleAtTick,
  selectTrackJSXAtTick,
} from "types/Arrangement/ArrangementTrackSelectors";
import { useAppValue } from "hooks/useRedux";
import {
  selectTrackInstrumentName,
  selectTrackLabelById,
} from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";
import { cancelEvent } from "utils/event";
import { getScaleKey, getScaleName } from "types/Scale/ScaleFinder";
import { mod } from "utils/math";
import { ArrangePoseIcon } from "lib/hotkeys/timeline";
import { CreateTreeIcon } from "lib/hotkeys/track";
import { dispatchOpen, dispatchClose } from "hooks/useToggle";

export const ScaleTrackBody = memo((props: { trackId: TrackId }) => {
  const { trackId } = props;
  const tick = useTick();
  const scale = useAppValue((_) =>
    selectTrackMidiScaleAtTick(_, trackId, tick)
  );
  const label = useAppValue((_) => selectTrackLabelById(_, trackId));
  const pose = useAppValue((_) => selectTrackJSXAtTick(_, trackId, tick));
  const [showNotes, setShowNotes] = useState(false);
  const name = getScaleName(scale);
  const key = getScaleKey(scale);
  const notes = scale.map((n) => key[mod(Math.round(n), 12)]).join(", ");
  const scaleText = showNotes ? (notes === "" ? "No Notes" : notes) : name;
  return (
    <div className="min-w-0 grow flex flex-col text-xs gap-1 *:h-4 pt-1">
      <div className="flex text-teal-400">
        <CreateTreeIcon className="mr-1 my-auto inline shrink-0" />
        <div>Scale ({label})</div>
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
      <div
        className="flex hover:saturate-150 overflow-scroll mr-2 items-center gap-1 text-fuchsia-300"
        onMouseEnter={() => dispatchOpen("livePlay")}
        onMouseLeave={() => dispatchClose("livePlay")}
      >
        <ArrangePoseIcon className="shrink-0" />
        {pose}
      </div>
    </div>
  );
});

export const PatternTrackBody = memo((props: { trackId: TrackId }) => {
  const { trackId } = props;
  const tick = useTick();
  const label = useAppValue((_) => selectTrackLabelById(_, trackId));
  const instrumentName = useAppValue((_) =>
    selectTrackInstrumentName(_, trackId)
  );
  const pose = useAppValue((_) => selectTrackJSXAtTick(_, trackId, tick));
  return (
    <div className="min-w-0 grow flex flex-col text-xs pt-2 *:h-4 gap-[2px]">
      <div className="flex text-teal-300/95">
        <GiPineTree className="mr-1 my-auto inline shrink-0" />
        <div>Sampler ({label})</div>
      </div>
      <div className="flex text-orange-300">
        <GiTrumpet className="mr-1 my-auto inline shrink-0" />
        <div className="overflow-scroll">{instrumentName}</div>
      </div>
      <div
        className="flex hover:saturate-150 overflow-scroll mr-2 items-center gap-1 text-fuchsia-300"
        onMouseEnter={() => dispatchOpen("livePlay")}
        onMouseLeave={() => dispatchClose("livePlay")}
      >
        <ArrangePoseIcon className="shrink-0" />
        {pose}
      </div>
    </div>
  );
});
