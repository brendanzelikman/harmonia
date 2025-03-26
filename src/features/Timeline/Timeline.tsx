import { selectHasTracks } from "types/Track/TrackSelectors";
import { useDeep } from "types/hooks";
import { selectHideTimeline } from "types/Meta/MetaSelectors";
import { TimelineStart } from "./components/TimelineStart";
import { TimelineForest } from "./components/TimelineForest";
import { TimelineGrid } from "./components/TimelineGrid";

export const Timeline = () => {
  const hideTimeline = useDeep(selectHideTimeline);
  const hasTracks = useDeep(selectHasTracks);
  if (hideTimeline) return <TimelineForest />;
  if (!hasTracks) return <TimelineStart />;
  return <TimelineGrid />;
};
