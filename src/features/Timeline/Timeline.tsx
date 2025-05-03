import DataGrid, {
  Column,
  DataGridHandle,
  RenderCellProps,
} from "react-data-grid";
import { useState, useCallback, useMemo } from "react";
import { useAppValue } from "hooks/useRedux";
import { TimelineContextMenu } from "./components/TimelineContextMenu";
import { TimelineGraphics } from "./components/TimelineGraphics";
import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  MEASURE_COUNT,
  TRACK_WIDTH,
} from "utils/constants";
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
import { dispatchCustomEvent } from "utils/event";
import { throttle } from "lodash";
import { useEvent } from "hooks/useEvent";
import { STOP_TRANSPORT } from "types/Transport/TransportState";
import { TimelineHeaderCell } from "./TimelineHeaderCell";
import { TimelineCell } from "./TimelineCell";

export type Row = {
  index: number;
  id?: TrackId;
};
export type TrackRow = Row & { id: TrackId };
export type TimelineElement = { element?: HTMLDivElement };

export default function Timeline() {
  const cellWidth = useAppValue(selectCellWidth);
  const cellHeight = useAppValue(selectCellHeight);
  const collapsedMap = useAppValue(selectCollapsedTrackMap);
  const trackIds = useAppValue(selectTrackIds);

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
        cellClass: `bg-transparent`,
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
      dispatchCustomEvent("scrollTimeline", { scrollLeft, scrollRight });
    }, 100),
    []
  );

  /** The timeline grid is built with react-data-grid. */
  const TimelineGrid = useMemo(() => {
    return (
      <DataGrid
        className="size-full rdg-grid bg-transparent animate-in fade-in focus:outline-none"
        ref={dataGridHandler}
        enableVirtualization
        columns={columns}
        rows={[
          ...trackIds.map((id, index) => ({ id, index })),
          { id: undefined, index: trackIds.length },
        ]}
        rowHeight={({ id }) =>
          id && collapsedMap[id] ? COLLAPSED_TRACK_HEIGHT : cellHeight
        }
        headerRowHeight={HEADER_HEIGHT}
        onScroll={onScroll}
      />
    );
  }, [trackIds, collapsedMap, cellWidth]);

  return (
    <div id="timeline" className="relative total-center-col size-full">
      <TimelineContextMenu />
      {TimelineGrid}
      <TimelineElements />
    </div>
  );
}
