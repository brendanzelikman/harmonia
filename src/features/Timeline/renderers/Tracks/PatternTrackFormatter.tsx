import { memo } from "react";
import { cancelEvent } from "utils/html";
import { PatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";
import { PatternTrackButtons } from "./components/TrackButtons";
import { MemoizedPatternTrackBody } from "./components/TrackBody";
import { TrackDropdownMenu } from "./components/TrackDropdownMenu";
import { TrackName } from "./components/TrackName";
import { TrackSliders } from "./components/TrackSlider";

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
          className="w-full total-center gap-1 relative data-[collapsed=false]:pt-2 data-[collapsed=false]:pr-1"
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
