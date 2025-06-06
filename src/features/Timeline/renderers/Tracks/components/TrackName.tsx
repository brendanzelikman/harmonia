import classNames from "classnames";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { selectTrackScaleNameAtTick } from "types/Arrangement/ArrangementTrackSelectors";
import { selectCellHeight } from "types/Timeline/TimelineSelectors";
import {
  selectTrackInstrumentName,
  selectTrackOrderById,
} from "types/Track/TrackSelectors";
import { updateTrack } from "types/Track/TrackThunks";
import { isScaleTrack, Track } from "types/Track/TrackTypes";
import { blurOnEnter } from "utils/event";

export const TrackName = (props: { track: Track }) => {
  const { track } = props;
  const dispatch = useAppDispatch();
  const height = useAppValue(selectCellHeight);
  const isST = isScaleTrack(track);
  const isSmall = height < 100;
  const samplerName = useAppValue((_) =>
    selectTrackInstrumentName(_, track.id)
  );
  const scaleName = useAppValue((_) => selectTrackScaleNameAtTick(_, track.id));
  const size = track.collapsed
    ? "text-xs h-2"
    : isSmall
    ? "text-xs h-4"
    : "text-sm h-7";
  const order = useAppValue((_) => selectTrackOrderById(_, track.id));
  const placeholder = `Tree #${order}`;
  return (
    <input
      disabled={track.collapsed}
      className={classNames(
        size,
        track.collapsed ? "text-slate-500" : "",
        isST ? "focus:border-indigo-500" : "focus:border-emerald-400",
        `flex-auto bg-zinc-800 px-1 w-full mr-2 caret-white outline-none focus:ring-0 rounded-md overflow-scroll text-gray-300 border-2 border-zinc-800`
      )}
      onKeyDown={blurOnEnter}
      placeholder={placeholder}
      value={
        track.collapsed ? (isST ? scaleName : samplerName) : track.name ?? ""
      }
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        dispatch(updateTrack({ data: { id: track.id, name: e.target.value } }))
      }
    />
  );
};
