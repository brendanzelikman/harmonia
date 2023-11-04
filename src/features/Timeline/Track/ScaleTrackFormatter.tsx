import { TrackButton } from "./components/TrackButton";
import { TrackName } from "./components/TrackName";
import { TrackDropdownMenu } from "./components/TrackDropdownMenu";
import { TrackDropdownButton } from "./components/TrackDropdownButton";
import {
  selectEditor,
  selectTrackChildren,
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
import { useRef } from "react";
import { useTrackDrag, useTrackDrop } from "./hooks/useTrackDragAndDrop";
import { ScaleTrack } from "types/ScaleTrack";
import { createScaleTrack } from "redux/ScaleTrack";
import {
  useProjectSelector as use,
  useProjectDeepSelector as useDeep,
  useProjectDispatch,
} from "redux/hooks";
import { useTransportTick } from "hooks";
import { isScaleEditorOpen } from "types/Editor";
import { TrackFormatterProps } from "./TrackFormatter";
import {
  createPatternTrack,
  toggleTrackScaleEditor,
  updateTracks,
} from "redux/thunks";
import classNames from "classnames";

interface ScaleTrackProps extends TrackFormatterProps {
  track: ScaleTrack;
}

export const ScaleTrackFormatter: React.FC<ScaleTrackProps> = (props) => {
  const { track, label, isSelected, cell } = props;
  const dispatch = useProjectDispatch();

  // Track drag and drop
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
  const placeholder = use((_) => selectTrackScaleNameAtTick(_, track.id, tick));
  const children = useDeep((_) => selectTrackChildren(_, track.id));

  /** The Scale Track displays the name of the track or the name of its scale. */
  const ScaleTrackName = () => {
    return (
      <TrackName
        id={track.id}
        height={cell.height}
        value={track.name}
        placeholder={`Scale Track (${label})`}
        onChange={(e) =>
          dispatch(updateTracks([{ ...track, name: e.target.value }]))
        }
      />
    );
  };

  /** The Scale Track dropdown menu allows the user to perform general actions on the track. */
  const ScaleTrackDropdownMenu = () => {
    const isChildCollapsed =
      children.length && children.some((track) => track?.collapsed);
    return (
      <TrackDropdownMenu>
        <TrackDropdownButton
          content={`${track.collapsed ? "Expand " : "Collapse"} Track`}
          icon={<BsArrowsCollapse />}
          onClick={track.collapsed ? props.expandTrack : props.collapseTrack}
        />
        <TrackDropdownButton
          content={`${isChildCollapsed ? "Expand " : "Collapse"} Children`}
          icon={<BsArrowsCollapse />}
          onClick={
            isChildCollapsed ? props.expandChildren : props.collapseChildren
          }
        />
        <TrackDropdownButton
          content="Copy Track"
          icon={<BiCopy />}
          onClick={props.duplicateTrack}
        />
        <TrackDropdownButton
          content="Clear Track"
          icon={<BsEraser />}
          onClick={props.clearTrack}
        />
        <TrackDropdownButton
          content="Delete Track"
          icon={<BsTrash />}
          onClick={props.deleteTrack}
        />
      </TrackDropdownMenu>
    );
  };

  /** The Scale Track header displays the name and dropdown menu. */
  const ScaleTrackHeader = (
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
  );

  /** The Scale Editor button toggles the scale editor. */
  const ScaleEditorButton = () => {
    const buttonClass = classNames("px-2 border-sky-400", {
      "bg-gradient-to-r from-sky-600 to-sky-600/50 background-pulse":
        isSelected && onScaleEditor,
    });
    return (
      <TrackButton
        className={buttonClass}
        onClick={() => dispatch(toggleTrackScaleEditor(track.id))}
      >
        <BsPencil className="mr-2 flex-shrink-0" />
        <span className="truncate">{placeholder}</span>
      </TrackButton>
    );
  };

  /** The Pattern Track button creates a nested pattern track. */
  const PatternTrackButton = () => {
    return (
      <button
        className={`w-6 h-6 text-2xl flex items-center justify-center border rounded-full border-emerald-500 active:bg-emerald-500 select-none`}
      >
        <BsPlus
          onClick={() => dispatch(createPatternTrack({ parentId: track.id }))}
        />
      </button>
    );
  };

  /** The Scale Track button creates a nested scale track. */
  const ScaleTrackButton = () => {
    return (
      <button
        className={`w-6 h-6 text-2xl flex items-center justify-center border rounded-full border-indigo-400 active:bg-indigo-500 select-none`}
      >
        <BsPlus
          onClick={() => dispatch(createScaleTrack({ parentId: track.id }))}
        />
      </button>
    );
  };

  /** The Scale Track buttons include the scale editor button, pattern track button, and scale track button. */
  const ScaleTrackButtons = () => (
    <div
      className={`w-full flex items-center mt-2`}
      draggable
      onDragStart={cancelEvent}
    >
      <div className="w-full flex items-center ml-2 space-x-1 justify-self-end">
        <ScaleEditorButton />
        <PatternTrackButton />
        <ScaleTrackButton />
      </div>
    </div>
  );

  /** The Scale Track body stores the track content within some outer padding. */
  const ScaleTrackBody = () => {
    const bodyClass = classNames(
      "w-full h-full flex items-center bg-gradient-to-r from-sky-900 to-indigo-800 border-2 rounded",
      { "border-sky-500": isSelected && onScaleEditor },
      { "border-blue-400": isSelected && !onScaleEditor },
      { "border-sky-950": !isSelected }
    );
    return (
      <div
        className={bodyClass}
        onDoubleClick={() => dispatch(toggleTrackScaleEditor(track.id))}
      >
        <div className="min-w-0 h-full flex flex-1 flex-col items-start justify-evenly p-2 duration-150">
          {ScaleTrackHeader}
          {!track.collapsed && <ScaleTrackButtons />}
        </div>
      </div>
    );
  };

  // Assemble the class name
  const trackClass = classNames(
    "rdg-track w-full h-full p-2 bg-indigo-700 text-white border-b border-b-slate-300",
    cell.height < 100 ? "text-xs" : "text-sm",
    isDragging ? "opacity-50" : "opacity-100"
  );

  // Render the Scale Track
  return (
    <div className={trackClass} ref={ref} onClick={props.selectTrack}>
      {ScaleTrackBody()}
    </div>
  );
};
