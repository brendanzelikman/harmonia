import DataGrid, {
  Column,
  DataGridHandle,
  RowHeightArgs,
  FormatterProps,
} from "react-data-grid";
import { useState, useCallback, useMemo } from "react";
import { useProjectDispatch, useDeep, use } from "types/hooks";
import { TimelineContextMenu } from "./components/TimelineContextMenu";
import { TimelineGraphics } from "./components/TimelineGraphics";
import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  MEASURE_COUNT,
  TRACK_WIDTH,
} from "utils/constants";
import "lib/react-data-grid.css";
import "react-data-grid/lib/styles.css";
import classNames from "classnames";
import { TrackId } from "types/Track/TrackTypes";
import { CellFormatter } from "./renderers/Cells/CellFormatter";
import { TimelineClips } from "./renderers/Clips/TimelineClips";
import { TimelinePortals } from "./renderers/Portals/TimelinePortals";
import { TimelineHeaderRenderer } from "./renderers/Header/TimelineHeaderRenderer";
import {
  selectCellWidth,
  selectCellHeight,
  selectSubdivision,
  selectTimelineState,
  selectTimelineType,
  selectHasPortalFragment,
} from "types/Timeline/TimelineSelectors";
import {
  selectCollapsedTrackMap,
  selectOrderedTrackIds,
} from "types/Track/TrackSelectors";
import { TrackFormatter } from "./renderers/Tracks/TrackFormatter";
import { isPatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";
import { getSubdivisionTicks } from "utils/durations";
import { convertTicksToFormattedTime } from "types/Transport/TransportFunctions";
import {
  selectTransportBPM,
  selectTransportTimeSignature,
} from "types/Transport/TransportSelectors";
import { onCellClick } from "types/Timeline/thunks/TimelineClickThunks";
import { TimelineTrackButton } from "./components/TimelineTrackButton";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { dispatchCustomEvent } from "utils/html";
import { debounce } from "lodash";

export type Row = {
  index: number;
  id?: TrackId;
  onPatternTrack?: boolean;
  trackButton?: boolean;
};
export type TimelinePortalElement = { timeline?: DataGridHandle };
export type TimelineElement = { element?: HTMLDivElement };

export function Timeline() {
  const dispatch = useProjectDispatch();
  const [timeline, setTimeline] = useState<DataGridHandle>();
  const state = use(selectTimelineState);
  const type = use(selectTimelineType);
  const cellWidth = use(selectCellWidth);
  const cellHeight = use(selectCellHeight);
  const subdivision = use(selectSubdivision);
  const trackIds = useDeep(selectOrderedTrackIds);
  const collapsedMap = useDeep(selectCollapsedTrackMap);
  const hasFragment = use(selectHasPortalFragment);
  const bpm = use(selectTransportBPM);
  const timeSignature = use(selectTransportTimeSignature);
  const holding = useHeldHotkeys("s, e");

  /** The grid ref stores the react-data-grid element. */
  const gridRef = useCallback<(node: DataGridHandle) => void>(
    (node) => {
      const nodeId = node?.element?.classList[1];
      const timelineId = timeline?.element?.classList[1];
      if (node !== null && nodeId !== timelineId) {
        setTimeline(node);
      }
    },
    [timeline]
  );

  /** The rows are built from the ordered list of track IDs. */
  const rows = useMemo(() => {
    const rows: Row[] = [];
    rows.push(
      ...trackIds.map((id, i) => ({
        index: i,
        id,
        onPatternTrack: !!isPatternTrackId(id),
      }))
    );
    rows.push({ trackButton: true, index: rows.length });
    return rows;
  }, [trackIds]);

  /** The column formatter handles each cell based on its row and column */
  const columnFormatter = useCallback(
    (props: FormatterProps<Row, unknown>) => {
      const key = parseInt(props.column.key);
      if (!props.row.id) {
        const onClick = () => dispatch(onCellClick(key, props.row.id));
        return <div className="size-full bg-transparent" onClick={onClick} />;
      }
      const subdivisionTicks = getSubdivisionTicks(subdivision);
      const tick = subdivisionTicks * (parseInt(props.column.key) - 1);
      const time = convertTicksToFormattedTime(tick, { bpm, timeSignature });
      const isPortaling = state === "portaling-clips" && !!props.row.id;
      const isAdding = state === "adding-clips" && !!props.row.id;
      const isAddingPatternClips = isAdding && type === "pattern";
      const isAddingPoseClips = isAdding && type === "pose";
      const isAddingScaleClips = isAdding && type === "scale";
      const onPT = !!props.row.onPatternTrack;
      const { beats, sixteenths } = time;
      const isMeasure = beats === 0 && sixteenths === 0;
      return (
        <CellFormatter
          {...props}
          col={key}
          onClick={() => dispatch(onCellClick(key, props.row.id))}
          className={classNames(
            "size-full animate-in fade-in duration-150 bg-white/10 border-t border-t-white/20",
            { "border-l-2 border-l-white/20": isMeasure && key > 1 },
            { "border-l-0.5 border-l-slate-700/50": !isMeasure || key <= 1 },
            { "cursor-paintbrush": isAddingPatternClips && onPT },
            { "cursor-portalgunb": isPortaling && !hasFragment },
            { "cursor-portalguno": isPortaling && hasFragment },
            { "cursor-wand": isAddingPoseClips },
            { "cursor-gethsemane": isAddingScaleClips },
            isAddingPatternClips && onPT
              ? "hover:bg-teal-500/50"
              : isAddingPoseClips
              ? "hover:bg-fuchsia-500/50"
              : isAddingScaleClips
              ? "hover:bg-blue-500/50"
              : isPortaling
              ? !hasFragment
                ? "hover:bg-sky-400/50"
                : "hover:bg-orange-400/50"
              : ""
          )}
        />
      );
    },
    [subdivision, bpm, timeSignature, state, type, hasFragment]
  );

  /** The column is memoized so that it is not recreated on every render. */
  const column = useCallback(
    (key: string): Column<Row> => ({
      key,
      name: key,
      width: cellWidth,
      minWidth: 1,
      formatter: columnFormatter,
      headerRenderer: (props) => (
        <TimelineHeaderRenderer
          {...props}
          holdingS={holding.s}
          holdingE={holding.e}
        />
      ),
      cellClass: `bg-transparent rdg-cell-${key}`,
    }),
    [cellWidth, holding, columnFormatter]
  );

  // Columns with the track column prepended
  const columns = useMemo((): Column<Row>[] => {
    const columns: Column<Row>[] = [];
    const beatCount = MEASURE_COUNT * 128;
    for (let i = 1; i <= beatCount; i++) {
      columns.push(column(i.toString()));
    }
    return [
      {
        key: "tracks",
        name: "Tracks",
        width: TRACK_WIDTH,
        frozen: true,
        formatter: (formatterProps: FormatterProps<Row>) => {
          if (formatterProps.row.trackButton) return <TimelineTrackButton />;
          if (!formatterProps.row.id) return null;
          return <TrackFormatter {...formatterProps} />;
        },
        cellClass: "bg-transparent",
      },
      ...columns,
    ];
  }, [column]);

  /** The row height should always equal the cell height unless the track is collapsed. */
  const rowHeight = useCallback(
    (row: RowHeightArgs<Row>) => {
      if (row.type !== "ROW") return cellHeight;
      if (row.row.id === undefined) return cellHeight;
      if (!collapsedMap[row.row.id]) return cellHeight;
      return COLLAPSED_TRACK_HEIGHT;
    },
    [cellHeight, collapsedMap]
  );

  /** The timeline elements are portaled into the timeline. */
  const element = timeline?.element;
  const TimelineElements = useCallback(() => {
    if (!element) return null;
    return (
      <>
        <TimelineGraphics element={element} />
        <TimelineClips element={element} />
        <TimelinePortals element={element} />
      </>
    );
  }, [element]);

  const updateHandler = useCallback(
    debounce(
      (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as any;
        if (!target) return;
        const margin = 300;
        const scrollLeft = target.scrollLeft - margin;
        const scrollRight = target.scrollLeft + target.clientWidth + margin;
        dispatchCustomEvent("scrollLeft", scrollLeft);
        dispatchCustomEvent("scrollRight", scrollRight);
      },
      200,
      { leading: true, trailing: true, maxWait: 1000 }
    ),
    []
  );

  /** The timeline grid is built with react-data-grid. */
  const TimelineGrid = useMemo(() => {
    return (
      <DataGrid
        className="data-grid w-full h-full bg-transparent focus:outline-none"
        ref={gridRef}
        columns={columns}
        rows={rows}
        rowHeight={rowHeight}
        headerRowHeight={HEADER_HEIGHT}
        enableVirtualization={true}
        rowClass={() => "rdg-cell-row"}
        onScroll={updateHandler}
      />
    );
  }, [columns, rows, rowHeight, timeline]);

  return (
    <div id="timeline" className="flex flex-col relative size-full">
      <TimelineContextMenu />
      {TimelineGrid}
      <TimelineElements />
    </div>
  );
}
