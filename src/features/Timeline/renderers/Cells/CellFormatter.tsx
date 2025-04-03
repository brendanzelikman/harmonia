import classNames from "classnames";
import { Row } from "features/Timeline/components/TimelineGrid";
import { RenderCellProps } from "react-data-grid";
import { useDrop } from "react-dnd";
import { useDeep, useProjectDispatch } from "types/hooks";
import { onCellClick } from "types/Timeline/thunks/TimelineClickThunks";
import {
  selectHasPortalFragment,
  selectPortalFragment,
  selectSubdivisionTicks,
  selectTimelineState,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import { getBarsBeatsSixteenths } from "types/Transport/TransportFunctions";
import {
  selectTransportBPM,
  selectTransportTimeSignature,
} from "types/Transport/TransportSelectors";

export function CellFormatter(props: RenderCellProps<Row, unknown>) {
  const dispatch = useProjectDispatch();
  const state = useDeep(selectTimelineState);
  const type = useDeep(selectTimelineType);
  const hasFragment = useDeep(selectHasPortalFragment);
  const fragment = useDeep(selectPortalFragment);
  const trackId = props.row.id;
  const index = props.row.index;

  const bpm = useDeep(selectTransportBPM);
  const timeSignature = useDeep(selectTransportTimeSignature);
  const subdivisionTicks = useDeep(selectSubdivisionTicks);
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
    accept: ["clip", "portal"],
    hover(item: any) {
      item.trackId = trackId;
      item.canDrop = true;
      item.hoveringColumn = key;
      item.hoveringRow = index;
      item.isDragging = true;
    },
  }));

  if (!props.row.id) return null;
  return (
    <div
      ref={drop}
      data-border={hasBorder}
      className={classNames(
        "size-full animate-in fade-in duration-150 border-b border-b-white/20 border-l-0.5 border-l-slate-700/50 data-[border=true]:border-l-2 data-[border=true]:border-l-white/20",
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
      onClick={() => dispatch(onCellClick(key, trackId))}
    />
  );
}
