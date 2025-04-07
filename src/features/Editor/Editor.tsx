import { useStore } from "types/hooks";
import {
  selectIsEditingTracks,
  selectSelectedTrack,
} from "types/Timeline/TimelineSelectors";
import { InstrumentEditor } from "./InstrumentEditor/InstrumentEditor";

export function Editor() {
  const track = useStore(selectSelectedTrack);
  const isEditing = useStore(selectIsEditingTracks);
  if (!track || !isEditing) return null;
  return <InstrumentEditor track={track} />;
}
