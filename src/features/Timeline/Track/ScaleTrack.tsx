import { connect, ConnectedProps } from "react-redux";
import { Project, Dispatch } from "types/Project";
import { TrackId } from "types/Track";
import { TrackProps } from ".";
import {
  TrackButton,
  TrackDropdownButton,
  TrackDropdownMenu,
  TrackName,
} from "./Track";
import {
  selectTrackScaleAtTick,
  selectEditor,
  selectTrackChildren,
  selectTrackMidiScale,
  selectTrackScaleNameAtTick,
} from "redux/selectors";
import { getScaleName } from "types/Scale";
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
import { ScaleTrack as ScaleTrackType } from "types/ScaleTrack";
import { createPatternTrack } from "redux/PatternTrack";
import {
  createScaleTrack,
  moveScaleTrack,
  updateScaleTrack,
} from "redux/ScaleTrack";
import { useProjectSelector, useProjectDeepSelector } from "redux/hooks";
import { useScaleTrackStyles } from "./hooks/useScaleTrackStyles";
import { toggleTrackScaleEditor } from "redux/Editor";
import { useTransportTick } from "hooks";
import { isScaleEditorOpen } from "types/Editor";

const mapStateToProps = (project: Project, ownProps: TrackProps) => {
  const track = ownProps.track as ScaleTrackType;
  const { selectedTrackId } = ownProps;
  const isSelected = selectedTrackId === track.id;

  // Editor state
  const editor = selectEditor(project);
  const onScaleEditor = isSelected && isScaleEditorOpen(editor);

  return {
    ...ownProps,
    id: track.id,
    track,
    isSelected,
    onScaleEditor,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: TrackProps) => {
  const trackId = ownProps.track?.id;
  return {
    createScaleTrack: () => {
      dispatch(createScaleTrack({ parentId: trackId }));
    },
    createPatternTrack: () => {
      dispatch(createPatternTrack({ parentId: trackId }));
    },
    toggleScaleEditor: () => {
      dispatch(toggleTrackScaleEditor(trackId));
    },
    setTrackName: (name: string) => {
      dispatch(updateScaleTrack({ id: trackId, name }));
    },
    moveTrack: (props: { dragId: TrackId; hoverId: TrackId }) => {
      return dispatch(moveScaleTrack(props));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type ScaleTrackProps = ConnectedProps<typeof connector>;

export default connector(ScaleTrackComponent);

function ScaleTrackComponent(props: ScaleTrackProps) {
  const { id, track } = props;

  // Get the track scale name at the current tick
  const tick = useTransportTick();
  const scaleName = useProjectSelector((_) =>
    selectTrackScaleNameAtTick(_, id, tick)
  );

  // Get the track children
  const children = useProjectDeepSelector((_) => selectTrackChildren(_, id));
  const isChildCollapsed =
    children.length && children.some((track) => track?.collapsed);

  // Drag and drop scale tracks
  const ref = useRef<HTMLDivElement>(null);
  const [{}, drop] = useTrackDrop({ ...props, element: ref.current });
  const [{ isDragging }, drag] = useTrackDrag({
    ...props,
    element: ref.current,
  });
  drag(drop(ref));

  // CSS properties
  const styles = useScaleTrackStyles({ ...props, isDragging });

  /**
   * The Scale Track name displays the name of the track
   * or the matching scale if no name is provided.
   */
  const ScaleTrackName = (
    <TrackName
      id={track.id}
      cell={props.cell}
      value={track.name}
      placeholder={`Scale Track (${props.label})`}
      onChange={(e) => props.setTrackName(e.target.value)}
    />
  );

  /**
   * The Scale Track dropdown menu allows the user to perform general actions on the track.
   * * Expand/Collapse Track
   * * Expand/Collapse Children
   * * Copy Track
   * * Clear Track
   * * Delete Track
   */
  const ScaleTrackDropdownMenu = (
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

  /**
   * The Scale Track header displays the name and dropdown menu.
   */
  const ScaleTrackHeader = (
    <div
      className="w-full flex relative justify-end"
      draggable
      onDragStart={cancelEvent}
    >
      {ScaleTrackName}
      <div className="flex flex-col w-12 mr-1 items-end">
        {ScaleTrackDropdownMenu}
      </div>
    </div>
  );

  /**
   * The Scale Track has three main buttons.
   * * The first button toggles the scale editor.
   * * The second button creates a nested pattern track.
   * * The third button creates a nested scale track.
   */
  const ScaleTrackButtons = () => (
    <div
      className={`w-full flex items-center mt-2`}
      draggable
      onDragStart={cancelEvent}
    >
      <TrackButton
        className={styles.scaleEditorButton}
        onClick={props.toggleScaleEditor}
      >
        <BsPencil className="mr-2 flex-shrink-0" />
        <span className="truncate">{scaleName}</span>
      </TrackButton>
      <div className="flex ml-2 space-x-1 justify-self-end">
        <button className={styles.patternTrackButton}>
          <BsPlus onClick={props.createPatternTrack} />
        </button>
        <button className={styles.scaleTrackButton}>
          <BsPlus onClick={props.createScaleTrack} />
        </button>
      </div>
    </div>
  );

  /**
   * The Scale Track body stores the track content with some outer padding.
   */
  const ScaleTrackBody = (
    <div
      className={`${styles.innerTrack} ${styles.innerBorder} ${styles.gradient}`}
      onDoubleClick={props.toggleScaleEditor}
    >
      <div className="min-w-0 h-full flex flex-1 flex-col items-start justify-evenly p-2 duration-150">
        {ScaleTrackHeader}
        {!track.collapsed && <ScaleTrackButtons />}
      </div>
    </div>
  );

  // Assemble the class name
  const className = `rdg-track ${styles.outerBorder} ${styles.padding} ${styles.text} ${styles.opacity}`;

  // Render the Scale Track
  return (
    <div className={className} ref={ref} onClick={props.selectTrack}>
      {ScaleTrackBody}
    </div>
  );
}
