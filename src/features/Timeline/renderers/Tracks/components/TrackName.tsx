import classNames from "classnames";
import { use, useStore, useDispatch } from "types/hooks";
import { selectCellHeight } from "types/Timeline/TimelineSelectors";
import { selectTrackOrderById } from "types/Track/TrackSelectors";
import { updateTrack } from "types/Track/TrackThunks";
import { Track } from "types/Track/TrackTypes";
import { blurOnEnter } from "utils/html";

export const TrackName = (props: { track: Track }) => {
  const { track } = props;
  const dispatch = useDispatch();
  const height = use(selectCellHeight);
  const isST = track.type === "scale";
  const isSmall = height < 100;
  const size = isSmall ? "text-xs h-6" : "text-sm h-7";
  const order = useStore((_) => selectTrackOrderById(_, track.id));
  const placeholder = `Tree #${order}`;
  return (
    <input
      disabled={track.collapsed}
      className={classNames(
        size,
        isST ? "focus:border-indigo-500" : "focus:border-emerald-400",
        `flex-auto bg-zinc-800 px-1 w-full mr-2 caret-white outline-none focus:ring-0 rounded-md overflow-scroll text-gray-300 border-2 border-zinc-800`
      )}
      onKeyDown={blurOnEnter}
      placeholder={placeholder}
      value={track.name ?? ""}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        dispatch(updateTrack({ data: { id: track.id, name: e.target.value } }))
      }
    />
  );
};
