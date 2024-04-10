import { TrackButton } from "./components/TrackButton";
import { TrackName } from "./components/TrackName";
import { TrackDropdownMenu } from "./components/TrackDropdownMenu";
import { TrackDropdownButton } from "./components/TrackDropdownButton";
import {
  selectEditor,
  selectTrackDescendants,
  selectTrackScaleNameAtTick,
} from "redux/selectors";
import { BiCopy } from "react-icons/bi";
import {
  BsArrowsCollapse,
  BsEraser,
  BsPencil,
  BsPlus,
  BsTrash,
} from "react-icons/bs";
import { cancelEvent } from "utils/html";
import { useCallback, useRef } from "react";
import { useTrackDrag, useTrackDrop } from "./hooks/useTrackDragAndDrop";
import {
  useProjectSelector as use,
  useProjectDeepSelector as useDeep,
  useProjectDispatch,
} from "redux/hooks";
import { useTransportTick } from "hooks";
import { isScaleEditorOpen } from "types/Editor";
import { TrackFormatterProps } from "./TrackFormatter";
import {
  clearTrack,
  collapseTrackChildren,
  createPatternTrack,
  createScaleTrack,
  deleteTrack,
  duplicateTrack,
  expandTrackChildren,
  insertScaleTrack,
  toggleTrackScaleEditor,
} from "redux/thunks";
import classNames from "classnames";
import { ScaleTrack } from "types/Track";
import { setSelectedTrackId } from "redux/Timeline";
import { collapseTracks, expandTracks } from "redux/Track";

interface ScaleTrackProps extends TrackFormatterProps {
  track: ScaleTrack;
}

export const ScaleTrackFormatter: React.FC<ScaleTrackProps> = (props) => {
  const { track, label, isSelected, cell } = props;
  const dispatch = useProjectDispatch();

  // Track drag and drop
  const trackId = track.id;
  const ref = useRef<HTMLDivElement>(null);
  const element = ref.current;
  const [{}, drop] = useTrackDrop({ ...props, element });
  const [{ isDragging }, drag] = useTrackDrag({ ...props, element });
  drag(drop(ref));

  // Editor info
  const editor = use(selectEditor);
  const onScaleEditor = isScaleEditorOpen(editor);

  // Track info
  const tick = useTransportTick();
  const placeholder = use((_) => selectTrackScaleNameAtTick(_, trackId, tick));
  const children = useDeep((_) => selectTrackDescendants(_, trackId));

  /** The Scale Track displays the name of the track or the name of its scale. */
  const ScaleTrackName = useCallback(() => {
    return (
      <TrackName
        id={track.id}
        height={cell.height}
        value={track.name ?? ""}
        placeholder={`Scale Track (${label})`}
        onChange={(e) => props.renameTrack(e.target.value)}
      />
    );
  }, [track, cell, label]);

  /** The Scale Track dropdown menu allows the user to perform general actions on the track. */
  const ScaleTrackDropdownMenu = () => {
    const isChildCollapsed =
      children.length && children.some((track) => track?.collapsed);
    return (
      <TrackDropdownMenu>
        <TrackDropdownButton
          content="Insert Parent"
          icon={<BiCopy />}
          onClick={() => dispatch(insertScaleTrack(trackId))}
        />
        <TrackDropdownButton
          content={`${track.collapsed ? "Expand " : "Collapse"} Track`}
          icon={<BsArrowsCollapse />}
          onClick={() =>
            dispatch(
              !!track.collapsed
                ? expandTracks([trackId])
                : collapseTracks([trackId])
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
          onClick={() => dispatch(deleteTrack(trackId))}
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
    const buttonClass = classNames("px-2 border-sky-400", {
      "bg-gradient-to-r from-sky-600 to-sky-600/50 background-pulse":
        isSelected && onScaleEditor,
    });
    return (
      <TrackButton
        className={buttonClass}
        onClick={() => dispatch(toggleTrackScaleEditor(trackId))}
      >
        <BsPencil className="mr-2 flex-shrink-0" />
        <span className="truncate">{placeholder}</span>
      </TrackButton>
    );
  }, [trackId, placeholder, isSelected, onScaleEditor]);

  /** The Pattern Track button creates a nested pattern track. */
  const PatternTrackButton = useCallback(() => {
    return (
      <button
        className={`w-6 h-6 text-2xl flex items-center justify-center border rounded-full border-emerald-500 active:bg-emerald-500 select-none`}
      >
        <BsPlus
          onClick={() => dispatch(createPatternTrack({ parentId: trackId }))}
        />
      </button>
    );
  }, [trackId]);

  /** The Scale Track button creates a nested scale track. */
  const ScaleTrackButton = useCallback(() => {
    return (
      <button
        className={`w-6 h-6 text-2xl flex items-center justify-center border rounded-full border-indigo-400 active:bg-indigo-500 select-none`}
      >
        <BsPlus
          onClick={() => dispatch(createScaleTrack({ parentId: trackId }))}
        />
      </button>
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
            <ScaleEditorButton />
            <PatternTrackButton />
            <ScaleTrackButton />
          </div>
        </div>
      ),
    [track.collapsed, ScaleEditorButton, PatternTrackButton, ScaleTrackButton]
  );

  /** The Scale Track body stores the track content within some outer padding. */
  const ScaleTrackBody = useCallback(() => {
    const bodyClass = classNames(
      "w-full h-full flex items-center bg-gradient-to-r from-sky-900 to-indigo-800 border-2 rounded",
      { "border-sky-500": isSelected && onScaleEditor },
      { "border-blue-400": isSelected && !onScaleEditor },
      { "border-sky-950": !isSelected }
    );
    return (
      <div
        className={bodyClass}
        onDoubleClick={() => dispatch(toggleTrackScaleEditor(trackId))}
      >
        <div className="min-w-0 h-full flex flex-1 flex-col items-start justify-evenly p-2 duration-150">
          {ScaleTrackHeader()}
          {ScaleTrackButtons()}
        </div>
      </div>
    );
  }, [trackId, isSelected, onScaleEditor, ScaleTrackHeader, ScaleTrackButtons]);

  // Assemble the class name
  const trackClass = classNames(
    "rdg-track w-full h-full p-2 bg-indigo-700 text-white border-b border-b-slate-300",
    cell.height < 100 ? "text-xs" : "text-sm",
    isDragging ? "opacity-50" : "opacity-100"
  );

  // Render the Scale Track
  return (
    <div
      className={trackClass}
      ref={ref}
      onClick={() => dispatch(setSelectedTrackId(trackId))}
    >
      {ScaleTrackBody()}
    </div>
  );
};
