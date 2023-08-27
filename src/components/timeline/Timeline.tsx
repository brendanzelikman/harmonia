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
import DataGridBackground from "./Background";
import useEventListeners from "hooks/useEventListeners";
import { cancelEvent, isHoldingCommand, isInputEvent } from "appUtil";
import TimelineContextMenu from "./ContextMenu";

export function Timeline(props: TimelineProps) {
  const { selectedTrackId, trackMap, cellWidth } = props;

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

  useEventListeners(
    {
      b: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          e.preventDefault();
          if (timeline?.element)
            timeline.element.scroll({
              left: props.time * cellWidth,
              behavior: "smooth",
            });
        },
      },
    },
    [timeline, timeline?.element, props.time, cellWidth]
  );

  // Create a memoized list of rows for the DataGrid
  const rows: Row[] = useMemo((): Row[] => {
    const rows: Row[] = [];
    const scaleTrackIds = trackMap.allIds;

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
      const patternTrackIds = trackMap.byId[scaleTrackId]?.patternTrackIds;
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
  }, [trackMap]);

  useEventListeners(
    {
      ArrowUp: {
        keydown: (e) => {
          if (isInputEvent(e) || !selectedTrackId || props.showingEditor)
            return;
          cancelEvent(e);
          const trackIds = rows.map((row) => row.trackId).filter(Boolean);
          const selectedIndex = trackIds.indexOf(selectedTrackId);
          if (selectedIndex === -1) return;
          const newIndex = selectedIndex - 1;
          if (newIndex < 0) return;
          const newTrackId = trackIds[newIndex];
          if (!newTrackId) return;
          props.setSelectedTrack(newTrackId);
        },
      },
      ArrowDown: {
        keydown: (e) => {
          if (isInputEvent(e) || !selectedTrackId || props.showingEditor)
            return;
          cancelEvent(e);
          const trackIds = rows.map((row) => row.trackId).filter(Boolean);
          const selectedIndex = trackIds.indexOf(selectedTrackId);
          if (selectedIndex === -1) return;
          const newIndex = selectedIndex + 1;
          if (newIndex >= trackIds.length) return;
          const newTrackId = trackIds[newIndex];
          if (!newTrackId) return;
          props.setSelectedTrack(newTrackId);
        },
      },
      v: {
        keydown: (e) => {
          if (isInputEvent(e) || !isHoldingCommand(e) || props.showingEditor)
            return;
          cancelEvent(e);
          props.pasteClipsAndTransforms(rows);
        },
      },
    },
    [selectedTrackId, rows, props.showingEditor]
  );

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
      width: cellWidth,
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
    [rows, cellWidth]
  );

  // Create the body cell columns for the DataGrid
  const columns = useMemo((): Column<Row>[] => {
    const columns: Column<Row>[] = [];
    const beatCount = Constants.MEASURE_COUNT * Constants.TIMELINE_SUBDIVISION;
    // Add the body cells
    for (let i = 1; i <= beatCount; i++) {
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

  useEffect(() => {
    if (!timeline?.element) return;
    if (props.state === "stopped" && props.time === 0) {
      timeline.element.scrollTo({
        left: 0,
        behavior: "smooth",
      });
      return;
    }
  }, [props.time, timeline, props.state]);

  return (
    <div id="timeline" className="relative w-full h-full">
      <TimelineContextMenu rows={rows} />
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
