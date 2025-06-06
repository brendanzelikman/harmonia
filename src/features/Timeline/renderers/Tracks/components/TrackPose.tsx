import classNames from "classnames";
import { useAppValue } from "hooks/useRedux";
import { ArrangePoseIcon } from "lib/hotkeys/timeline";
import { memo } from "react";
import { selectTrackJSXAtTick } from "types/Arrangement/ArrangementTrackSelectors";
import { TrackId } from "types/Track/TrackTypes";
import { useTick } from "types/Transport/TransportTick";

export const TrackPose = memo(
  (props: { trackId: TrackId; className?: string }) => {
    const tick = useTick();
    const pose = useAppValue((_) =>
      selectTrackJSXAtTick(_, props.trackId, tick)
    );
    return (
      <div
        className={classNames(
          props.className,
          "flex hover:saturate-150 overflow-scroll mr-2 items-center gap-1 text-fuchsia-300"
        )}
      >
        <ArrangePoseIcon className="shrink-0" />
        {pose}
      </div>
    );
  }
);
