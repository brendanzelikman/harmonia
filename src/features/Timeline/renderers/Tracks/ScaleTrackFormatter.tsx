import { TrackName } from "./components/TrackName";
import { TrackDropdownMenu } from "./components/TrackDropdownMenu";
import { memo } from "react";
import { ScaleTrack } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { ScaleTrackButtons } from "./components/TrackButtons";
import { ScaleTrackBody } from "./components/TrackBody";
import { TrackPose } from "./components/TrackPose";

type ScaleTrackProps = { track: ScaleTrack };

export const ScaleTrackFormatter = memo((props: ScaleTrackProps) => {
  const track = props.track;
  const trackId = track.id;
  const isCollapsed = !!track.collapsed;
  return (
    <>
      <div className="w-full flex items-center gap-1 relative">
        <div className="flex flex-col min-w-min w-full mr-auto pr-2">
          <TrackName track={track} />
          {isCollapsed && (
            <TrackPose trackId={trackId} className="text-xs mt-0.5" />
          )}
        </div>
        <TrackDropdownMenu track={track} />
      </div>
      {isCollapsed ? null : (
        <div className="w-full flex">
          <ScaleTrackBody trackId={trackId} />
          <ScaleTrackButtons trackId={trackId} />
        </div>
      )}
    </>
  );
});
