import { TrackId } from "types/Track";
import { createRandomHierarchy, createScaleTrack } from "redux/thunks";
import { selectCell, selectTrackIds, selectTrackMap } from "redux/selectors";
import DataGrid, {
  Column,
  DataGridHandle,
  FormatterProps,
  RowHeightArgs,
} from "react-data-grid";
import { useState, useCallback, useMemo } from "react";
import {
  useProjectSelector,
  useProjectDeepSelector,
  useProjectDispatch,
} from "redux/hooks";
import { TrackFormatter } from "./Track";
import { TimelineHeaderRenderer } from "./Header";
import { TimelineClips } from "./Clips";
import { TimelineContextMenu } from "./components/TimelineContextMenu";
import { TimelineGraphics } from "./components/TimelineGraphics";
import { useTimelineHotkeys } from "./hooks/useTimelineHotkeys";
import { useTimelineLiveHotkeys } from "./hooks/useTimelineLiveHotkeys";
import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  MEASURE_COUNT,
  TRACK_WIDTH,
} from "utils/constants";

import "lib/react-data-grid.css";
import "react-data-grid/lib/styles.css";
import { TimelinePortals } from "./Portals";
import { CellFormatter } from "./Cell";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";

export type Row = { index: number; trackId?: TrackId; trackButton?: boolean };

export type TimelinePortalElement = { timeline?: DataGridHandle };

export function Timeline() {
  const dispatch = useProjectDispatch();
  const cell = useProjectSelector(selectCell);
  const trackIds = useProjectDeepSelector(selectTrackIds);
  const trackMap = useProjectDeepSelector(selectTrackMap);
  const heldKeys = useHeldHotkeys(["alt"]);
  const [timeline, setTimeline] = useState<DataGridHandle>();
  useTimelineHotkeys(timeline);
  useTimelineLiveHotkeys();

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
    rows.push(...trackIds.map((id, i) => ({ index: i, trackId: id })));
    rows.push({ trackButton: true, index: rows.length });
    return rows;
  }, [trackIds]);

  /** The Add Track button is located directly under the last track, appearing on hover. */
  const AddTrackButton = (
    <div
      className={`rdg-track flex font-nunito w-full h-full justify-center items-center hover:bg-indigo-500/30 text-slate-50/0 hover:text-slate-100 ease-in-out transition-all duration-500 rounded cursor-pointer`}
      onClick={() =>
        dispatch(heldKeys.alt ? createRandomHierarchy() : createScaleTrack())
      }
    >
      <h4 className="text-lg font-light select-none">
        Add a {!!heldKeys.alt ? "Random Hierarchy" : "Scale Track"}
      </h4>
    </div>
  );

  /** The track column contains all tracks and the add track button. */
  const trackColumn = useMemo(
    (): Column<Row> => ({
      key: "tracks",
      name: "Tracks",
      width: TRACK_WIDTH,
      frozen: true,
      formatter: (formatterProps: FormatterProps<Row>) => {
        if (formatterProps.row.trackButton) return AddTrackButton;
        if (!formatterProps.row.trackId) return null;
        return <TrackFormatter {...formatterProps} />;
      },
      cellClass: "bg-transparent",
    }),
    [heldKeys.alt]
  );

  /** The column is memoized so that it is not recreated on every render. */
  const column = useCallback(
    (key: string): Column<Row> => ({
      key,
      name: key,
      width: cell.width,
      minWidth: 1,
      formatter: CellFormatter,
      headerRenderer: TimelineHeaderRenderer,
      cellClass: "bg-transparent",
    }),
    [rows, cell.width]
  );

  /** The columns are memoized so that they are not recreated on every render. */
  const columns = useMemo((): Column<Row>[] => {
    const columns: Column<Row>[] = [];
    const beatCount = MEASURE_COUNT * 128;
    for (let i = 1; i <= beatCount; i++) {
      columns.push(column(i.toString()));
    }
    return columns;
  }, [column]);

  // Columns with the track column prepended
  const trackedColumns = useMemo((): Column<Row>[] => {
    return [trackColumn, ...columns];
  }, [trackColumn, columns]);

  /** The row height should always equal the cell height unless the track is collapsed. */
  const rowHeight = useCallback(
    (row: RowHeightArgs<Row>) => {
      if (row.type !== "ROW") return cell.height;
      if (row.row.trackId === undefined) return cell.height;
      if (!trackMap[row.row.trackId]?.collapsed) return cell.height;
      return COLLAPSED_TRACK_HEIGHT;
    },
    [cell.height, trackMap]
  );

  /** The timeline elements are portaled into the timeline. */
  const TimelineElements = useMemo(() => {
    if (!timeline?.element) return null;
    return (
      <>
        <TimelineGraphics timeline={timeline} />
        <TimelineClips timeline={timeline} />
        <TimelinePortals timeline={timeline} />
      </>
    );
  }, [timeline]);

  /** The timeline grid is built with react-data-grid. */
  const TimelineGrid = useMemo(() => {
    return (
      <DataGrid
        className="data-grid w-full h-full bg-transparent"
        ref={gridRef}
        columns={trackedColumns}
        rows={rows}
        rowHeight={rowHeight}
        headerRowHeight={HEADER_HEIGHT}
        enableVirtualization={true}
      />
    );
  }, [trackedColumns, rows, rowHeight]);

  return (
    <div
      id="timeline"
      className="flex flex-col relative w-full h-full animate-in fade-in zoom-in-150"
    >
      <TimelineContextMenu />
      {TimelineGrid}
      {TimelineElements}
    </div>
  );
}
