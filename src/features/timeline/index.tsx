import { TrackId, TrackType } from "types/Track";
import { createScaleTrack } from "redux/thunks";
import {
  selectTrackInfoRecord,
  selectCell,
  selectTrackMap,
} from "redux/selectors";
import DataGrid, {
  Column,
  DataGridHandle,
  FormatterProps,
  RowHeightArgs,
} from "react-data-grid";
import { useState, useCallback, useMemo } from "react";
import {
  useAppSelector,
  useDeepEqualSelector,
  useAppDispatch,
} from "redux/hooks";
import TrackRenderer from "./Track";
import CellRenderer from "./Cell";
import HeaderRenderer from "./Header";

import { TimelineClips } from "./Clips";
import { TimelineTranspositions } from "./Transpositions";
import TimelineContextMenu from "./components/TimelineContextMenu";
import TimelineGraphics from "./components/TimelineGraphics";

import useTimelineHotkeys from "./hooks/useTimelineHotkeys";
import { useTimelineLiveHotkeys } from "./hooks/useTimelineLiveHotkeys";
import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  MEASURE_COUNT,
  TRACK_WIDTH,
} from "utils/constants";

import "lib/react-data-grid.css";
import "react-data-grid/lib/styles.css";

export interface Row {
  trackId?: TrackId;
  type: TrackType;
  depth: number;
  index: number;
  lastRow?: boolean;
  collapsed?: boolean;
}

export interface TimelinePortalElement {
  timeline: DataGridHandle;
}

export default function TimelineComponent() {
  const dispatch = useAppDispatch();
  const cell = useAppSelector(selectCell);
  const dependencyMap = useDeepEqualSelector(selectTrackInfoRecord);
  const trackMap = useDeepEqualSelector(selectTrackMap);
  const [timeline, setTimeline] = useState<DataGridHandle>();
  useTimelineHotkeys();
  useTimelineLiveHotkeys();

  /**
   * The timeline is the react-data-grid element.
   * A callback is used in order to get the inner timeline element.
   */
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

  /**
   * The rows are built from the dependency map.
   */
  const rows: Row[] = useMemo((): Row[] => {
    const rows: Row[] = [];
    const topLevelIds = dependencyMap.topLevelIds;
    const trackMap = dependencyMap.byId;

    // Recursively add all children of a track
    const addChildren = (children: TrackId[]) => {
      if (!children?.length) return;
      children.forEach((trackId) => {
        const child = trackMap[trackId];
        if (!child) return;
        rows.push({ ...child, trackId, index: trackIndex++ });
        addChildren(child.trackIds);
      });
    };

    // Add the scale tracks from the top level
    let trackIndex = 0;
    for (const trackId of topLevelIds) {
      const track = trackMap[trackId];
      if (!track) continue;
      // Add the row
      rows.push({ ...track, trackId, index: trackIndex++ });
      // Add the children tracks
      addChildren(track.trackIds);
    }

    // Add the track button
    rows.push({
      index: trackIndex++,
      lastRow: true,
      type: "emptyTrack",
      depth: 0,
    });

    return rows;
  }, [dependencyMap]);

  /**
   * The Add Track button is located directly under the last track, appearing on hover.
   */
  const AddTrackButton = (
    <div
      className={`rdg-track flex font-nunito w-full h-full justify-center items-center hover:bg-sky-500/30 text-slate-50/0 hover:text-slate-100 ease-in-out transition-all duration-500 rounded cursor-pointer`}
      onClick={() => dispatch(createScaleTrack())}
    >
      <h4 className="text-lg font-light">Add a Scale Track</h4>
    </div>
  );

  /**
   * The track column contains all tracks and the add track button.
   * It is frozen in the data grid so that it stays in place when scrolling.
   */
  const trackColumn = useMemo(
    (): Column<Row> => ({
      key: "tracks",
      name: "Tracks",
      width: TRACK_WIDTH,
      frozen: true,
      formatter: (formatterProps: FormatterProps<Row>) => {
        if (formatterProps.row.lastRow) return AddTrackButton;
        if (!formatterProps.row.trackId) return null;
        return <TrackRenderer {...formatterProps} />;
      },
      cellClass() {
        return "bg-transparent";
      },
    }),
    []
  );

  /**
   * The column is memoized so that it is not recreated on every render.
   */
  const column = useCallback(
    (key: string): Column<Row> => ({
      key,
      name: key,
      width: cell.width,
      minWidth: 1,
      formatter(formatterProps) {
        return <CellRenderer {...formatterProps} rows={rows} />;
      },
      headerRenderer(props) {
        return <HeaderRenderer {...props} />;
      },
      cellClass() {
        return "bg-transparent";
      },
    }),
    [rows, cell.width]
  );

  /**
   * The columns are memoized so that they are not recreated on every render.
   * Currently, the number of columns is fixed, so higher subdivision = less measures.
   */
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

  /**
   * The row height should always equal the cell height unless the track is collapsed.
   */
  const rowHeight = useCallback(
    (row: RowHeightArgs<Row>) => {
      if (row.type !== "ROW") return cell.height;
      if (row.row.trackId === undefined) return cell.height;
      if (!trackMap[row.row.trackId]?.collapsed) return cell.height;
      return COLLAPSED_TRACK_HEIGHT;
    },
    [cell.height, trackMap]
  );

  /**
   * The timeline elements are portaled into the timeline.
   * * TimelineGraphics: The background graphics + cursor.
   * * TimelineClips: All tracked clips.
   * * TimelineTranspositions: All tracked transpositions.
   * * TimelineShortcuts: The shortcuts hook.
   */
  const TimelineElements = useMemo(() => {
    if (!timeline?.element) return null;
    return (
      <>
        <TimelineGraphics timeline={timeline} />
        <TimelineClips timeline={timeline} />
        <TimelineTranspositions timeline={timeline} />
      </>
    );
  }, [timeline]);

  /**
   * The timeline grid is built with react-data-grid.
   * The track column is frozen so that it stays in place when scrolling.
   * ***Virtualization should always be enabled.***
   */
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

  // Render the timeline
  return (
    <div id="timeline" className="flex flex-col relative w-full h-full">
      <TimelineContextMenu />
      {TimelineGrid}
      {TimelineElements}
    </div>
  );
}
