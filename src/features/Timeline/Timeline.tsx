import DataGrid, {
  Column,
  DataGridHandle,
  RenderCellProps,
} from "react-data-grid";
import { useState, useCallback, useMemo } from "react";
import { useStore } from "hooks/useStore";
import { TimelineContextMenu } from "./components/TimelineContextMenu";
import { TimelineGraphics } from "./components/TimelineGraphics";
import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  MEASURE_COUNT,
  TRACK_WIDTH,
} from "utils/constants";
import "react-data-grid/lib/styles.css";
import { TrackId } from "types/Track/TrackTypes";
import { TimelineClips } from "./TimelineClips";
import { TimelinePortals } from "./renderers/Portals/TimelinePortals";
import {
  selectCellWidth,
  selectCellHeight,
} from "types/Timeline/TimelineSelectors";
import {
  selectCollapsedTrackMap,
  selectTrackIds,
} from "types/Track/TrackSelectors";
import { TimelineTrack } from "./TimelineTrack";
import { dispatchCustomEvent } from "utils/html";
import { throttle } from "lodash";
import { useEvent } from "hooks/useEvent";
import { STOP_TRANSPORT } from "hooks/useTransport";
import { TimelineHeaderCell } from "./TimelineHeaderCell";
import { TimelineCell } from "./TimelineCell";

export type Row = {
  index: number;
  id?: TrackId;
};
export type TrackRow = Row & { id: TrackId };
export type TimelineElement = { element?: HTMLDivElement };

export function Timeline() {
  const cellWidth = useStore(selectCellWidth);
  const cellHeight = useStore(selectCellHeight);
  const collapsedMap = useStore(selectCollapsedTrackMap);
  const trackIds = useStore(selectTrackIds);

  /** The grid ref stores the react-data-grid element. */
  const [timeline, setTimeline] = useState<DataGridHandle>();
  const dataGridHandler = useCallback<(node: DataGridHandle) => void>(
    (node) => {
      const nodeId = node?.element?.classList[1];
      if (!node) return;
      const timelineId = timeline?.element?.classList[1];
      if (nodeId === timelineId) return;
      setTimeline(node);
    },
    [timeline]
  );

  /** Reset the timeline to the origin when playback is stopped. */
  const resetTimelineScroll = useCallback(() => {
    const grid = timeline?.element;
    if (grid) grid.scroll({ left: 0 });
  }, [timeline]);

  useEvent(STOP_TRANSPORT, resetTimelineScroll);

  // Columns with the track column prepended
  const columns = useMemo((): Column<Row>[] => {
    const columns: Column<Row>[] = [];
    columns.push({
      key: "tracks",
      name: "",
      width: TRACK_WIDTH,
      frozen: true,
      renderCell: (row: RenderCellProps<Row, unknown>) => {
        if (!row.row.id) return null;
        return <TimelineTrack {...(row as RenderCellProps<TrackRow>)} />;
      },
      cellClass: "bg-transparent",
    });
    const beatCount = MEASURE_COUNT * 128;
    for (let i = 1; i <= beatCount; i++) {
      columns.push({
        key: `${i}`,
        name: `${i}`,
        width: cellWidth,
        minWidth: 1,
        renderCell: TimelineCell,
        renderHeaderCell: TimelineHeaderCell,
        cellClass: `bg-transparent rdg-cell rdg-cell-${i}`,
      });
    }
    return columns;
  }, [cellWidth]);

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

  // Update the virtualization on scroll
  const onScroll = useCallback(
    throttle((e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      const margin = 300;
      const scrollLeft = target.scrollLeft - margin;
      const scrollRight = target.scrollLeft + target.clientWidth + margin;
      dispatchCustomEvent("scroll", { scrollLeft, scrollRight });
    }, 200),
    []
  );

  /** The timeline grid is built with react-data-grid. */
  const TimelineGrid = useMemo(() => {
    const rows: Row[] = [
      ...trackIds.map((id, index) => ({ id, index })),
      { id: undefined, index: trackIds.length },
    ];
    return (
      <DataGrid
        className="size-full bg-transparent focus:outline-none"
        ref={dataGridHandler}
        columns={columns}
        rows={rows}
        rowHeight={({ id }) =>
          id && collapsedMap[id] ? COLLAPSED_TRACK_HEIGHT : cellHeight
        }
        headerRowHeight={HEADER_HEIGHT}
        enableVirtualization={true}
        rowClass={() => "rdg-cell-row"}
        onScroll={onScroll}
      />
    );
  }, [trackIds, collapsedMap, cellWidth]);

  if (!trackIds.length) return null;
  return (
    <div
      id="timeline"
      className="animate-in fade-in-50 duration-300 relative total-center-col size-full"
    >
      <TimelineContextMenu />
      {TimelineGrid}
      <TimelineElements />
    </div>
  );
}
