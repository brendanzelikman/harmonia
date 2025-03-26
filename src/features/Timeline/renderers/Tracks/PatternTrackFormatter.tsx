import { memo } from "react";
import { TrackName, TrackDropdownMenu, TrackSliders } from "./components";
import { cancelEvent } from "utils/html";
import { PatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";
import { PatternTrackButtons } from "./components/TrackButtons";
import { MemoizedPatternTrackBody } from "./components/TrackBody";

export const PatternTrackFormatter = memo((props: { track: PatternTrack }) => {
  const track = props.track;
  const trackId = track.id;
  const isCollapsed = !!track.collapsed;
  return (
    <>
      {!isCollapsed && <TrackSliders trackId={trackId} />}
      <div className="px-1 size-full flex flex-col">
        <div
          data-collapsed={isCollapsed}
          className="w-full total-center gap-1 relative data-[collapsed=false]:pt-2 data-[collapsed=false]:pr-1 data-[collapsed=true]:p-1"
        >
          <TrackName track={track} />
          <div
            className="flex flex-col items-end pr-1"
            draggable
            onDragStart={cancelEvent}
          >
            {<TrackDropdownMenu track={track} />}
            <PatternTrackButtons trackId={trackId} collapsed />
          </div>
        </div>
        {!isCollapsed && (
          <div
            className="flex size-full items-start justify-end"
            onDoubleClick={cancelEvent}
          >
            <MemoizedPatternTrackBody trackId={trackId} />
            <PatternTrackButtons trackId={trackId} />
          </div>
        )}
      </div>
    </>
  );
});

export const MemoizedPatternTrack = memo(PatternTrackFormatter);
