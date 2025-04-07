import { selectHasTracks } from "types/Track/TrackSelectors";
import { useStore } from "types/hooks";
import { selectHideTimeline } from "types/Meta/MetaSelectors";
import { TimelineForest } from "./components/TimelineForest";
import { TimelineGrid } from "./components/TimelineGrid";
import { TimelineStart } from "./components/TimelineStart";

export const Timeline = () => {
  const hideTimeline = useStore(selectHideTimeline);
  const hasTracks = useStore(selectHasTracks);
  if (hideTimeline) return <TimelineForest />;
  if (!hasTracks) return <TimelineStart />;
  return <TimelineGrid />;
};
