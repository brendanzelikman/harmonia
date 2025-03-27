import { selectHasTracks } from "types/Track/TrackSelectors";
import { useDeep } from "types/hooks";
import { selectHideTimeline } from "types/Meta/MetaSelectors";
import { TimelineForest } from "./components/TimelineForest";
import { TimelineGrid } from "./components/TimelineGrid";
import { TimelineStart } from "./components/TimelineStart";

export const Timeline = () => {
  const hideTimeline = useDeep(selectHideTimeline);
  const hasTracks = useDeep(selectHasTracks);
  if (hideTimeline) return <TimelineForest />;
  if (!hasTracks) return <TimelineStart />;
  return <TimelineGrid />;
};
