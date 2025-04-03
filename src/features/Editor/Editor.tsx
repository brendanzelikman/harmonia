import { useDeep } from "types/hooks";
import {
  selectIsEditingTracks,
  selectSelectedTrack,
} from "types/Timeline/TimelineSelectors";
import { InstrumentEditor } from "./InstrumentEditor/InstrumentEditor";

export function Editor() {
  const track = useDeep(selectSelectedTrack);
  const isEditing = useDeep(selectIsEditingTracks);
  if (!track || !isEditing) return null;
  return <InstrumentEditor track={track} />;
}
