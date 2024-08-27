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
import { useTimelineHotkeys } from "./hooks/useTimelineHotkeys";
import { useTimelineLiveHotkeys } from "./hooks/useTimelineLiveHotkeys";
import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  MEASURE_COUNT,
  TRACK_WIDTH,
} from "utils/constants";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import "lib/react-data-grid.css";
import "react-data-grid/lib/styles.css";
import {
  GiBreakingChain,
  GiFamilyTree,
  GiMusicalKeyboard,
} from "react-icons/gi";
import classNames from "classnames";
import { PresetScaleList } from "presets/scales";
import { sample } from "lodash";
import { INSTRUMENT_KEYS } from "types/Instrument/InstrumentTypes";
import { TrackId } from "types/Track/TrackTypes";
import { CellFormatter } from "./renderers/Cells/CellFormatter";
import { TimelineClips } from "./renderers/Clips/TimelineClips";
import { TimelinePortals } from "./renderers/Portals/TimelinePortals";
import { TimelineHeaderRenderer } from "./renderers/Header/TimelineHeaderRenderer";
import {
  selectCellWidth,
  selectCellHeight,
  selectSubdivision,
  selectSelectedTrackId,
} from "types/Timeline/TimelineSelectors";
import {
  selectOrderedTrackIds,
  selectTrackMap,
} from "types/Track/TrackSelectors";
import { createPatternTrack } from "types/Track/PatternTrack/PatternTrackThunks";
import {
  createScaleTrack,
  createRandomHierarchy,
  createDrumTracks,
} from "types/Track/ScaleTrack/ScaleTrackThunks";
import { createTrackTree } from "types/Track/TrackThunks";
import { TrackFormatter } from "./renderers/Tracks/TrackFormatter";
import { isPatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";
import { getSubdivisionTicks } from "utils/durations";
import { convertTicksToFormattedTime } from "types/Transport/TransportFunctions";
import {
  selectTransportBPM,
  selectTransportTimeSignature,
} from "types/Transport/TransportSelectors";

export type Row = {
  index: number;
  id?: TrackId;
  onTrack?: boolean;
  onPatternTrack?: boolean;
  trackButton?: boolean;
};
export type TimelinePortalElement = { timeline?: DataGridHandle };

export function Timeline() {
  const dispatch = useProjectDispatch();
  const cellWidth = use(selectCellWidth);
  const cellHeight = use(selectCellHeight);
  const subdivision = use(selectSubdivision);
  const trackIds = useDeep(selectOrderedTrackIds);
  const trackMap = useDeep(selectTrackMap);
  const selectedTrackId = use(selectSelectedTrackId);
  const heldKeys = useHeldHotkeys(["alt", "meta", "d"]);
  const [timeline, setTimeline] = useState<DataGridHandle>();
  const bpm = use(selectTransportBPM);
  const timeSignature = use(selectTransportTimeSignature);
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
    rows.push(
      ...trackIds.map((id, i) => ({
        index: i,
        id,
        onTrack: selectedTrackId === id,
        onPatternTrack: !!isPatternTrackId(id),
      }))
    );
    rows.push({ trackButton: true, index: rows.length });
    return rows;
  }, [trackIds, selectedTrackId]);

  /** The Add Track button is located directly under the last track, appearing on hover. */
  const shouldRandomize = heldKeys.alt;
  const shouldCreateDrums = heldKeys.d;

  const AddTrackButton = useMemo(
    () => (
      <div
        className={classNames(
          "rdg-track group size-full flex total-center text-xs",
          "hover:bg-indigo-500/30",
          "transition-all rounded cursor-pointer"
        )}
      >
        <div className="hidden group-hover:flex group-hover:animate-in group-hover:fade-in group-hover:duration-300 gap-6 *:rounded-full text-slate-100">
          <div
            className="flex flex-col gap-2 pt-1 items-center"
            onClick={() =>
              dispatch(
                createScaleTrack(
                  {},
                  shouldRandomize ? sample(PresetScaleList) : undefined
                )
              )
            }
          >
            <div
              className={`size-14 flex total-center rounded-full border-2 border-sky-400 ${
                shouldRandomize
                  ? "hover:border-fuchsia-400"
                  : "hover:border-white"
              }`}
            >
              <GiBreakingChain className="text-4xl" />
            </div>
            Scale Track
          </div>
          <div
            className="flex flex-col gap-2 pt-1 items-center"
            onClick={() =>
              dispatch(
                createPatternTrack(
                  {},
                  shouldRandomize ? sample(INSTRUMENT_KEYS) : undefined
                )
              )
            }
          >
            <div
              className={`size-14 flex total-center rounded-full border-2 border-emerald-400 ${
                shouldRandomize
                  ? "hover:border-fuchsia-400"
                  : "hover:border-white"
              }`}
            >
              <GiMusicalKeyboard className="text-4xl" />
            </div>
            Pattern Track
          </div>
          <div
            className="flex flex-col gap-2 pt-1 items-center"
            onClick={() =>
              dispatch(
                shouldCreateDrums
                  ? createDrumTracks()
                  : shouldRandomize
                  ? createRandomHierarchy()
                  : createTrackTree()
              )
            }
          >
            <div
              className={`size-14 flex total-center rounded-full border-2 border-purple-400 ${
                shouldRandomize
                  ? "hover:border-fuchsia-400"
                  : "hover:border-white"
              }`}
            >
              <GiFamilyTree className="text-4xl rotate-180" />
            </div>
            Track Tree
          </div>
        </div>
      </div>
    ),
    [shouldRandomize, shouldCreateDrums]
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
        if (!formatterProps.row.id) return null;
        return <TrackFormatter {...formatterProps} />;
      },
      cellClass: "bg-transparent",
    }),
    [heldKeys.alt, AddTrackButton]
  );

  /** The column is memoized so that it is not recreated on every render. */
  const column = useCallback(
    (key: string): Column<Row> => ({
      key,
      name: key,
      width: cellWidth,
      minWidth: 1,
      formatter: (props) => {
        const subdivisionTicks = getSubdivisionTicks(subdivision);
        const tick = subdivisionTicks * (parseInt(props.column.key) - 1);
        const time = convertTicksToFormattedTime(tick, { bpm, timeSignature });
        return <CellFormatter {...props} tick={tick} time={time} />;
      },
      headerRenderer: TimelineHeaderRenderer,
      cellClass: `bg-transparent rdg-cell-${key}`,
    }),
    [rows, cellWidth, subdivision, bpm, timeSignature]
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
      if (row.type !== "ROW") return cellHeight;
      if (row.row.id === undefined) return cellHeight;
      if (!trackMap[row.row.id]?.collapsed) return cellHeight;
      return COLLAPSED_TRACK_HEIGHT;
    },
    [cellHeight, trackMap]
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
        className="data-grid w-full h-full bg-transparent focus:outline-none"
        ref={gridRef}
        columns={trackedColumns}
        rows={rows}
        rowHeight={rowHeight}
        headerRowHeight={HEADER_HEIGHT}
        enableVirtualization={true}
        rowClass={() => "rdg-cell-row"}
      />
    );
  }, [trackedColumns, rows, rowHeight, timeline, subdivision]);

  return (
    <div id="timeline" className="flex flex-col relative size-full">
      <TimelineContextMenu />
      {TimelineGrid}
      {TimelineElements}
    </div>
  );
}
