import { memo } from "react";
import { cancelEvent } from "utils/event";
import { PatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";
import { PatternTrackButtons } from "./components/TrackButtons";
import { PatternTrackBody } from "./components/TrackBody";
import { TrackDropdownMenu } from "./components/TrackDropdownMenu";
import { TrackName } from "./components/TrackName";
import {
  PanSlider,
  TrackSliders,
  VolumeSlider,
} from "./components/TrackSlider";
import { TrackPose } from "./components/TrackPose";

export const PatternTrackFormatter = memo((props: { track: PatternTrack }) => {
  const track = props.track;
  const trackId = track.id;
  const isCollapsed = !!track.collapsed;
  return (
    <>
      {!isCollapsed && (
        <div className="flex-shrink-0 mr-2 z-50">
          <div className="flex" draggable onDragStart={cancelEvent}>
            <VolumeSlider trackId={props.track.id} />
            <PanSlider trackId={props.track.id} />
          </div>
        </div>
      )}
      <div className="px-1 size-full flex flex-col">
        <div
          data-collapsed={isCollapsed}
          className="w-full total-center gap-1 pt-1 relative data-[collapsed=false]:pt-2 data-[collapsed=false]:pr-1"
        >
          <div className="flex flex-col min-w-min w-full pr-2 mr-auto">
            <TrackName track={track} />
            {isCollapsed && (
              <TrackPose trackId={trackId} className="text-xs mt-0.5" />
            )}
          </div>
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
            <PatternTrackBody trackId={trackId} />
            <PatternTrackButtons trackId={trackId} />
          </div>
        )}
      </div>
    </>
  );
});
