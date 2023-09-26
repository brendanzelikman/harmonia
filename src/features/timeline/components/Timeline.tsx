import DataGrid, {
  Column,
  DataGridHandle,
  FormatterProps,
  HeaderRendererProps,
} from "react-data-grid";
import { Row, TimelineProps } from "..";
import { useCallback, useEffect, useMemo, useState } from "react";
import Track from "../track";
import TimeFormatter from "../time";
import Cell from "../cell";
import * as Constants from "appConstants";
import TimelineClips from "../clips";
import TimelineTranspositions from "../transpositions";
import TimelineBackground from "./TimelineBackground";
import TimelineContextMenu from "./TimelineContextMenu";
import TimelineCursor from "./TimelineCursor";
import useTimelineShortcuts from "../hooks/useTimelineShortcuts";
import "./Timeline.css";
import { TrackId } from "types";

export function Timeline(props: TimelineProps) {
  const [timeline, setTimeline] = useState<DataGridHandle>();

  const dependencyMap = JSON.parse(props.dependencyMap);
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

  // Create a memoized list of rows for the DataGrid
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
        rows.push({
          ...child,
          trackId,
          index: trackIndex++,
        });
        addChildren(child.trackIds);
      });
    };

    // Add the scale tracks from the top level
    let trackIndex = 0;
    for (const trackId of topLevelIds) {
      const track = trackMap[trackId];
      if (!track) continue;
      // Add the row
      rows.push({
        ...track,
        trackId,
        index: trackIndex++,
      });
      // Add the children tracks
      const children = trackMap[trackId].trackIds;
      addChildren(children);
    }

    // Add the track button
    rows.push({
      index: trackIndex++,
      lastRow: true,
      type: "defaultTrack",
      depth: 0,
    });

    // Add the remaining rows
    const remainingRows = Constants.INITIAL_MAX_ROWS - trackIndex++;
    for (let i = 0; i < remainingRows; i++) {
      rows.push({ index: trackIndex++, type: "defaultTrack", depth: 0 });
    }

    return rows;
  }, [props.dependencyMap]);

  const trackRowMap = useMemo(() => {
    const trackRowMap: Record<TrackId, Row> = {};
    rows.forEach((row) => {
      if (!row.trackId) return;
      trackRowMap[row.trackId] = row;
    });
    return trackRowMap;
  }, [rows]);

  // Create the track column for the DataGrid
  const trackColumn = useMemo(
    (): Column<Row> => ({
      key: "tracks",
      name: "Tracks",
      width: Constants.TRACK_WIDTH,
      frozen: true,
      formatter: (formatterProps: FormatterProps<Row>) => {
        // Return a button to add a new track on the last row
        if (formatterProps.row.lastRow) {
          return <AddTrackButton {...props} />;
        }
        // Return a track on all other rows if they exist
        if (!formatterProps.row.trackId) return null;
        return <Track {...formatterProps} />;
      },
      // Return the top-left corner cell
      headerRenderer: () => (
        <div className="rdg-corner bg-zinc-900 h-full border-b border-b-slate-50/10">
          <div className="h-full bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-md pl-3"></div>
        </div>
      ),
      cellClass() {
        return "bg-gradient-to-r from-indigo-900 to-zinc-900";
      },
    }),
    []
  );

  // Create a memoized column for the DataGrid
  const column = useCallback(
    (key: string) => ({
      key,
      name: key,
      width: props.cellWidth,
      minWidth: 1,
      formatter(formatterProps: FormatterProps<Row, unknown>) {
        return <Cell {...formatterProps} rows={rows} />;
      },
      headerRenderer(props: HeaderRendererProps<Row, unknown>) {
        return <TimeFormatter {...props} />;
      },
      cellClass() {
        return "bg-transparent";
      },
    }),
    [rows, props.cellWidth]
  );

  // Create the body cell columns for the DataGrid
  const columns = useMemo((): Column<Row>[] => {
    const columns: Column<Row>[] = [];
    const beatCount = Constants.MEASURE_COUNT * 128;
    // Add the body cells
    for (let i = 1; i <= beatCount; i++) {
      columns.push(column(`${i}`));
    }
    return columns;
  }, [column]);

  // Columns with the track column prepended
  const trackedColumns = useMemo((): Column<Row>[] => {
    return [trackColumn, ...columns];
  }, [trackColumn, columns]);

  // Scroll to the beginning of the timeline when stopped
  useEffect(() => {
    if (!timeline?.element) return;
    if (props.state === "stopped") {
      timeline.element.scrollTo({
        left: 0,
        behavior: "smooth",
      });
      return;
    }
  }, [timeline, props.state]);

  useTimelineShortcuts({ ...props, rows });

  const TimelineElements = useMemo(() => {
    if (!timeline?.element) return () => null;
    return () => (
      <>
        <TimelineBackground rows={rows} columns={columns} timeline={timeline} />
        <TimelineCursor timeline={timeline} />
        <TimelineClips
          timeline={timeline}
          rows={rows}
          trackRowMap={trackRowMap}
        />
        <TimelineTranspositions
          timeline={timeline}
          rows={rows}
          trackRowMap={trackRowMap}
          backgroundWidth={
            columns.length * props.cellWidth + Constants.TRACK_WIDTH
          }
        />
      </>
    );
  }, [timeline, rows, trackRowMap, columns, props.cellWidth]);

  return (
    <div id="timeline" className="relative w-full h-full">
      <TimelineContextMenu rows={rows} />
      <DataGrid
        className="data-grid w-full h-full bg-transparent"
        ref={gridRef}
        columns={trackedColumns}
        rows={rows}
        rowHeight={Constants.CELL_HEIGHT}
        headerRowHeight={Constants.HEADER_HEIGHT}
        enableVirtualization={true}
      />
      <TimelineElements />
    </div>
  );
}

const AddTrackButton = (props: TimelineProps) => {
  return (
    <div
      className={`rdg-track flex w-full h-full justify-center items-center bg-sky-600/50 hover:bg-sky-800/80 cursor-pointer`}
      onClick={props.createScaleTrack}
    >
      <h4 className="text-white text-lg font-light">Add a Scale Track</h4>
    </div>
  );
};
