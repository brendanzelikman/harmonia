import DataGrid, {
  Column,
  DataGridHandle,
  FormatterProps,
  HeaderRendererProps,
} from "react-data-grid";
import { Row, TimelineProps } from ".";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Track from "components/timeline/track";
import TimeFormatter from "./time";
import "./Timeline.css";
import Cell from "./cell";
import * as Constants from "appConstants";
import TimelineClips from "./clips";
import TimelineTransforms from "./transforms";
import DataGridBackground from "./background";

export function Timeline(props: TimelineProps) {
  const { trackMap, scaleTrackIds } = props;

  const [timeline, setTimeline] = useState<DataGridHandle>();
  const background = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    return () => {
      props.hideEditor();
    };
  }, []);

  // Create a memoized list of rows for the DataGrid
  const rows: Row[] = useMemo((): Row[] => {
    const rows: Row[] = [];

    // Make sure there are at least the initial number of rows
    let trackIndex = 0;
    for (let i = 0; i < scaleTrackIds.length; i++) {
      // Check if the track exists
      const scaleTrackId = scaleTrackIds?.[i];

      // Add the scale track row
      const scaleTrack = {
        index: trackIndex++,
        trackId: scaleTrackId,
      };
      rows.push(scaleTrack);

      if (!scaleTrackId) continue;

      // Add the pattern track rows
      const patternTrackIds = trackMap[scaleTrackId]?.patternTrackIds;
      if (!patternTrackIds) continue;
      patternTrackIds.forEach((trackId) => {
        rows.push({
          index: trackIndex++,
          trackId,
        });
      });
    }
    // Add the track button
    rows.push({
      index: trackIndex++,
      lastRow: true,
    });
    // Add the remaining rows
    const remainingRows = Constants.INITIAL_MAX_ROWS - trackIndex++;
    for (let i = 0; i < remainingRows; i++) {
      rows.push({ index: trackIndex++ });
    }

    return rows;
  }, [trackMap]);

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
          <div className="h-full bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-md"></div>
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
      width: Constants.CELL_WIDTH,
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
    [rows]
  );

  // Create the body cell columns for the DataGrid
  const columns = useMemo((): Column<Row>[] => {
    const columns: Column<Row>[] = [];
    // Add the body cells
    const measureCount =
      Constants.MEASURE_COUNT * Constants.TIMELINE_SUBDIVISION;
    for (let i = 1; i <= measureCount; i++) {
      columns.push(column(`${i}`));
    }
    return columns;
  }, [column, trackMap]);

  // Columns with the track column prepended
  const trackedColumns = useMemo((): Column<Row>[] => {
    return [trackColumn, ...columns];
  }, [trackColumn, columns]);

  const onScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (background.current) {
      background.current.style.top = `-${e.currentTarget.scrollTop}px`;
    }
  };

  return (
    <div className="relative w-full h-full">
      <DataGridBackground {...{ rows, timeline, background }} />
      <DataGrid
        className="data-grid w-full h-full bg-transparent"
        ref={gridRef}
        columns={trackedColumns}
        rows={rows}
        rowHeight={Constants.CELL_HEIGHT}
        headerRowHeight={Constants.HEADER_HEIGHT}
        enableVirtualization={true}
        onScroll={onScroll}
      />
      {timeline ? <TimelineClips timeline={timeline} rows={rows} /> : null}
      {timeline ? <TimelineTransforms timeline={timeline} rows={rows} /> : null}
    </div>
  );
}

export const AddTrackButton = (props: TimelineProps) => {
  return (
    <div
      className={`rdg-track flex w-full h-full justify-center items-center bg-sky-600/50 hover:bg-sky-800/80 cursor-pointer`}
      onClick={props.createScaleTrack}
    >
      <h4 className="text-white text-lg font-light">Add a Scale Track</h4>
    </div>
  );
};
