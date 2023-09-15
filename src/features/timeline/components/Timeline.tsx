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
import TimelineTransforms from "../transforms";
import TimelineBackground from "./TimelineBackground";
import TimelineContextMenu from "./TimelineContextMenu";
import TimelineCursor from "./TimelineCursor";
import useTimelineShortcuts from "../hooks/useTimelineShortcuts";
import "./Timeline.css";

export function Timeline(props: TimelineProps) {
  const [timeline, setTimeline] = useState<DataGridHandle>();

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
    const scaleTrackIds = props.trackMap.allIds;

    // Make sure there are at least the initial number of rows
    let trackIndex = 0;
    for (const scaleTrackId of scaleTrackIds) {
      // Add the scale track row
      rows.push({
        index: trackIndex++,
        trackId: scaleTrackId,
        type: "scaleTrack",
      });

      // Add the pattern track rows
      const patternTrackIds =
        props.trackMap.byId[scaleTrackId]?.patternTrackIds;
      if (!patternTrackIds) continue;
      patternTrackIds.forEach((patternTrackId) => {
        rows.push({
          index: trackIndex++,
          trackId: patternTrackId,
          type: "patternTrack",
        });
      });
    }
    // Add the track button
    rows.push({
      index: trackIndex++,
      lastRow: true,
      type: "defaultTrack",
    });

    // Add the remaining rows
    const remainingRows = Constants.INITIAL_MAX_ROWS - trackIndex++;
    for (let i = 0; i < remainingRows; i++) {
      rows.push({ index: trackIndex++, type: "defaultTrack" });
    }

    return rows;
  }, [props.trackMap]);

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
  }, [column, props.trackMap]);

  // Columns with the track column prepended
  const trackedColumns = useMemo((): Column<Row>[] => {
    return [trackColumn, ...columns];
  }, [trackColumn, columns]);

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
      {timeline ? (
        <TimelineBackground rows={rows} columns={columns} timeline={timeline} />
      ) : null}
      {timeline ? <TimelineCursor timeline={timeline} /> : null}
      {timeline ? <TimelineClips timeline={timeline} rows={rows} /> : null}
      {timeline ? <TimelineTransforms timeline={timeline} rows={rows} /> : null}
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
