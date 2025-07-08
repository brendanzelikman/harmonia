import classNames from "classnames";
import { RenderCellProps } from "react-data-grid";
import { useDrop } from "react-dnd";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { onCellClick } from "types/Timeline/thunks/TimelineClickThunks";
import {
  selectHasPortalFragment,
  selectPortalFragment,
  selectSubdivisionTicks,
  selectTimelineState,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import { getBarsBeatsSixteenths } from "utils/duration";
import {
  selectTransportBPM,
  selectTransportTimeSignature,
} from "types/Transport/TransportSelectors";
import { Row } from "./Timeline";
import { NativeTypes } from "react-dnd-html5-backend";
import {
  loadMidiIntoProject,
  sampleProjectByFile,
} from "types/Timeline/TimelineThunks";

export function TimelineCell(props: RenderCellProps<Row, unknown>) {
  const dispatch = useAppDispatch();
  const state = useAppValue(selectTimelineState);
  const type = useAppValue(selectTimelineType);
  const hasFragment = useAppValue(selectHasPortalFragment);
  const fragment = useAppValue(selectPortalFragment);
  const trackId = props.row.id;
  const index = props.row.index;

  const bpm = useAppValue(selectTransportBPM);
  const timeSignature = useAppValue(selectTransportTimeSignature);
  const subdivisionTicks = useAppValue(selectSubdivisionTicks);
  const key = parseInt(props.column.key);
  const tick = subdivisionTicks * (key - 1);
  const time = getBarsBeatsSixteenths(tick, { bpm, timeSignature });
  const isMeasure = time.beats === 0 && time.sixteenths === 0;
  const hasBorder = isMeasure && key > 1;

  const isPortaling = state === "portaling-clips";
  const isPortalingEntry = isPortaling && !hasFragment;
  const isPortalingExit = isPortaling && hasFragment;
  const isAdding = state === "adding-clips";
  const isAddingPatterns = isAdding && type === "pattern";
  const isAddingPoses = isAdding && type === "pose";
  const disablePortals = !!hasFragment && !fragment.trackId;

  const [_, drop] = useDrop(() => ({
    accept: ["clip", "portal", NativeTypes.FILE],
    hover(item: any) {
      item.trackId = trackId;
      item.canDrop = true;
      item.hoveringColumn = key;
      item.hoveringRow = index;
      item.isDragging = true;
    },
    drop(item: any) {
      const file = item?.files?.[0];
      if (file) {
        const props = { tick, trackId };

        // Check for project files
        if (file.type === "application/json") {
          dispatch(sampleProjectByFile({ data: { file, props } }));
        }

        // Check for midi files
        else if (file.type === "audio/midi") {
          dispatch(loadMidiIntoProject({ data: { file, props } }));
        }
      }
    },
  }));

  if (!props.row.id) return null;
  return (
    <div
      ref={drop}
      data-border={hasBorder}
      className={classNames(
        "size-full animate-in fade-in duration-150 border-b border-b-white/20 border-l-[0.5px] border-l-slate-700/50 data-[border=true]:border-l-2 data-[border=true]:border-l-white/20",
        {
          "cursor-portalgunb hover:bg-sky-400/50":
            isPortalingEntry && !disablePortals,
        },
        {
          "cursor-portalguno hover:bg-orange-400/50":
            isPortalingExit && !disablePortals,
        },
        { "cursor-paintbrush hover:bg-teal-500/50": isAddingPatterns },
        { "cursor-wand hover:bg-fuchsia-500/50": isAddingPoses }
      )}
      onClick={(e) => dispatch(onCellClick(e, key, trackId))}
    />
  );
}
