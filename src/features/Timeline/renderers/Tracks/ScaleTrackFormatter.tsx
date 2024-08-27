import { TrackButton } from "./components/TrackButton";
import { TrackName } from "./components/TrackName";
import { TrackDropdownMenu } from "./components/TrackDropdownMenu";
import { TrackDropdownButton } from "./components/TrackDropdownButton";
import { BiCopy } from "react-icons/bi";
import { BsArrowsCollapse, BsEraser, BsPencil, BsTrash } from "react-icons/bs";
import { cancelEvent } from "utils/html";
import { useCallback, useRef } from "react";
import { useTrackDrag, useTrackDrop } from "./hooks/useTrackDnd";
import {
  useProjectSelector as use,
  useProjectDeepSelector as useDeep,
  useProjectDispatch,
} from "types/hooks";
import { useTransportTick } from "hooks";
import { TrackFormatterProps } from "./TrackFormatter";
import classNames from "classnames";
import { GiBreakingChain, GiMusicalKeyboard } from "react-icons/gi";
import { TooltipButton } from "components/TooltipButton";
import { FaAnchor } from "react-icons/fa";
import { useTourId } from "features/Tour";
import { isScaleEditorOpen } from "types/Editor/EditorFunctions";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import { selectEditor } from "types/Editor/EditorSelectors";
import { selectCellHeight } from "types/Timeline/TimelineSelectors";
import {
  selectTrackDepthById,
  selectTrackDescendants,
} from "types/Track/TrackSelectors";
import { selectTrackScaleNameAtTick } from "types/Arrangement/ArrangementTrackSelectors";
import { createPatternTrack } from "types/Track/PatternTrack/PatternTrackThunks";
import { createScaleTrack } from "types/Track/ScaleTrack/ScaleTrackThunks";
import { toggleTrackScaleEditor } from "types/Editor/EditorThunks";
import {
  insertScaleTrack,
  expandTracks,
  collapseTracks,
  expandTrackChildren,
  collapseTrackChildren,
  duplicateTrack,
  clearTrack,
  deleteTrack,
} from "types/Track/TrackThunks";
import { ScaleTrack } from "types/Track/ScaleTrack/ScaleTrackTypes";

interface ScaleTrackProps extends TrackFormatterProps {
  track: ScaleTrack;
}

export const ScaleTrackFormatter: React.FC<ScaleTrackProps> = (props) => {
  const { track, label, isSelected } = props;
  const dispatch = useProjectDispatch();
  const cellHeight = use(selectCellHeight);

  const trackId = track.id;
  const tourId = useTourId();

  // Drag and drop
  const ref = useRef<HTMLDivElement>(null);
  const element = ref.current;
  const [{}, drop] = useTrackDrop({ ...props, element });
  const [{ isDragging }, drag] = useTrackDrag({ ...props, element });
  drag(drop(ref));

  // Editor info
  const editor = use(selectEditor);
  const onScaleEditor = isScaleEditorOpen(editor);

  // Track info
  const depth = use((_) => selectTrackDepthById(_, trackId));
  const tick = useTransportTick();
  const scaleName = useDeep((_) =>
    selectTrackScaleNameAtTick(_, trackId, tick)
  );
  const children = useDeep((_) => selectTrackDescendants(_, trackId));

  /** The Scale Track displays the name of the track or the name of its scale. */
  const ScaleTrackName = useCallback(() => {
    return (
      <TrackName
        id={track.id}
        height={cellHeight}
        value={track.name ?? ""}
        placeholder={`Track ${label} (Scale)`}
        onChange={(e) => props.renameTrack(e.target.value)}
      />
    );
  }, [track, cellHeight, label]);

  /** The Scale Track dropdown menu allows the user to perform general actions on the track. */
  const ScaleTrackDropdownMenu = () => {
    const isChildCollapsed =
      children.length && children.some((track) => track?.collapsed);
    return (
      <TrackDropdownMenu>
        <TrackDropdownButton
          content="Insert Parent"
          icon={<FaAnchor />}
          onClick={() => dispatch(insertScaleTrack(trackId))}
        />
        <TrackDropdownButton
          content={`${track.collapsed ? "Expand " : "Collapse"} Track`}
          icon={<BsArrowsCollapse />}
          onClick={() =>
            dispatch(
              !!track.collapsed
                ? expandTracks({ data: [trackId] })
                : collapseTracks({ data: [trackId] })
            )
          }
        />
        <TrackDropdownButton
          content={`${isChildCollapsed ? "Expand " : "Collapse"} Children`}
          icon={<BsArrowsCollapse />}
          onClick={() =>
            dispatch(
              !!isChildCollapsed
                ? expandTrackChildren(trackId)
                : collapseTrackChildren(trackId)
            )
          }
        />
        <TrackDropdownButton
          content="Duplicate Track"
          icon={<BiCopy />}
          onClick={() => dispatch(duplicateTrack(trackId))}
        />
        <TrackDropdownButton
          content="Clear Track"
          icon={<BsEraser />}
          onClick={() => dispatch(clearTrack(trackId))}
        />
        <TrackDropdownButton
          content="Delete Track"
          icon={<BsTrash />}
          onClick={() => dispatch(deleteTrack({ data: trackId }))}
        />
      </TrackDropdownMenu>
    );
  };

  /** The Scale Track header displays the name and dropdown menu. */
  const ScaleTrackHeader = useCallback(
    () => (
      <div
        className="w-full flex relative justify-end"
        draggable
        onDragStart={cancelEvent}
      >
        {ScaleTrackName()}
        <div className="flex flex-col w-12 mr-1 items-end">
          {ScaleTrackDropdownMenu()}
        </div>
      </div>
    ),
    [ScaleTrackName, ScaleTrackDropdownMenu]
  );

  /** The Scale Editor button toggles the scale editor. */
  const ScaleEditorButton = useCallback(() => {
    const buttonClass = classNames(
      "scale-track-scale-button",
      "relative px-2 border-sky-400",
      {
        "bg-gradient-to-r from-sky-600 to-sky-600/50 background-pulse":
          isSelected && onScaleEditor,
      }
    );
    return (
      <TrackButton
        className={buttonClass}
        onClick={(e) => {
          cancelEvent(e);
          dispatch(toggleTrackScaleEditor(trackId));
        }}
      >
        <BsPencil className="mr-2 flex-shrink-0" />
        <span className="truncate">{scaleName}</span>
      </TrackButton>
    );
  }, [trackId, isSelected, onScaleEditor, scaleName]);

  /** The Pattern Track button creates a nested pattern track. */
  const PatternTrackButton = useCallback(() => {
    return (
      <TooltipButton
        className={`size-7 text-2xl border rounded-full border-emerald-500 active:bg-emerald-500 select-none`}
        label="Nest A Pattern Track"
      >
        <GiMusicalKeyboard
          onClick={(e) => {
            cancelEvent(e);
            dispatch(createPatternTrack({ parentId: trackId }));
          }}
        />
      </TooltipButton>
    );
  }, [trackId]);

  /** The Scale Track button creates a nested scale track. */
  const ScaleTrackButton = useCallback(() => {
    return (
      <TooltipButton
        className={`size-7 text-2xl flex items-center justify-center border rounded-full border-indigo-400 active:bg-indigo-500 select-none`}
        label="Nest a Scale Track"
      >
        <GiBreakingChain
          onClick={(e) => {
            cancelEvent(e);
            dispatch(createScaleTrack({ parentId: trackId }));
          }}
        />
      </TooltipButton>
    );
  }, [trackId]);

  /** The Scale Track buttons include the scale editor button, pattern track button, and scale track button. */
  const ScaleTrackButtons = useCallback(
    () =>
      !track.collapsed && (
        <div
          className={`w-full flex items-center mt-2`}
          draggable
          onDragStart={cancelEvent}
          onDoubleClick={cancelEvent}
        >
          <div className="w-full flex items-center space-x-1 justify-self-end">
            {ScaleEditorButton()}
            <ScaleTrackButton />
            <PatternTrackButton />
          </div>
        </div>
      ),
    [track.collapsed, ScaleEditorButton, PatternTrackButton, ScaleTrackButton]
  );

  // Render the Scale Track
  return (
    <div
      className={classNames(
        "rdg-track size-full p-2 bg-indigo-700 text-white border-b border-b-slate-300",
        "animate-in fade-in slide-in-from-top-8",
        cellHeight < 100 ? "text-xs" : "text-sm",
        isDragging ? "opacity-50" : "opacity-100",
        "brightness-150 transition-all"
      )}
      ref={ref}
      style={{
        paddingLeft: depth * 8,
        filter: `hue-rotate(${(depth - 1) * 8}deg)${
          [
            "tour-step-the-pattern-track",
            "tour-step-instrument-editor-prompt",
            "tour-step-instrument-editor-intro",
          ].includes(tourId ?? "")
            ? " grayscale(90%)"
            : ""
        }`,
      }}
      onClick={() => dispatch(setSelectedTrackId({ data: trackId }))}
    >
      <div
        className={classNames(
          "w-full h-full flex items-center bg-gradient-to-r from-sky-900 to-indigo-800 border-2 rounded transition-all duration-300",
          { "border-sky-500": isSelected && onScaleEditor },
          { "border-blue-400": isSelected && !onScaleEditor },
          { "border-sky-950": !isSelected }
        )}
      >
        <div className="min-w-0 h-full flex flex-1 flex-col items-start justify-evenly p-2 duration-150">
          {ScaleTrackHeader()}
          {ScaleTrackButtons()}
        </div>
      </div>
    </div>
  );
};
