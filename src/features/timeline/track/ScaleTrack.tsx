import { connect, ConnectedProps } from "react-redux";
import { AppDispatch, RootState } from "redux/store";
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
  selectTransport,
  selectEditor,
  selectTrackChildren,
} from "redux/selectors";
import { getScaleName } from "types/Scale";
import { BiCopy } from "react-icons/bi";
import {
  BsArrowsCollapse,
  BsEraser,
  BsPencil,
  BsPlusCircle,
  BsTrash,
} from "react-icons/bs";
import { cancelEvent } from "utils";
import { useRef } from "react";
import { useTrackDrag, useTrackDrop } from "./hooks/useTrackDragAndDrop";
import { isEditorOn } from "types/Editor";
import { ScaleTrack as ScaleTrackType } from "types/ScaleTrack";
import { createPatternTrack } from "redux/PatternTrack";
import {
  createScaleTrack,
  moveScaleTrack,
  updateScaleTrack,
} from "redux/ScaleTrack";
import { useAppSelector, useDeepEqualSelector } from "redux/hooks";
import { useScaleTrackStyles } from "./hooks/useScaleTrackStyles";
import { toggleTrackScaleEditor } from "redux/Editor";
import { Transport } from "tone";
import useTransportTick from "hooks/useTransportTick";

const mapStateToProps = (state: RootState, ownProps: TrackProps) => {
  const track = ownProps.track as ScaleTrackType;
  const { selectedTrackId } = ownProps;
  const isSelected = selectedTrackId === track.id;

  // Editor state
  const editor = selectEditor(state);
  const onScaleEditor = isSelected && isEditorOn(editor, "scale");

  return {
    ...ownProps,
    id: track.id,
    track,
    isSelected,
    onScaleEditor,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch, ownProps: TrackProps) => {
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
  const { id, track, toggleScaleEditor } = props;

  const tick = useTransportTick();
  const scale = useAppSelector((state) =>
    selectTrackScaleAtTick(state, track?.id, tick)
  );
  const placeholder = getScaleName(scale);

  // Track properties
  const children = useDeepEqualSelector((_) => selectTrackChildren(_, id));
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
      cell={props.cell}
      value={track.name}
      placeholder={placeholder}
      onChange={(e) => props.setTrackName(e.target.value)}
    />
  );

  /**
   * The Scale Track depth corresponds to the number of parents.
   */
  const ScaleTrackDepth = (
    <label className={styles.depthLabel}>{props.row.depth + 1}</label>
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
   * The Scale Track header displays the name, depth, and dropdown menu.
   */
  const ScaleTrackHeader = (
    <div
      className="w-full flex relative justify-end"
      draggable
      onDragStart={cancelEvent}
    >
      {ScaleTrackName}
      {ScaleTrackDepth}
      {ScaleTrackDropdownMenu}
    </div>
  );

  /**
   * The Scale Track has three main buttons.
   * * The first button toggles the scale editor.
   * * The second button creates a nested pattern track.
   * * The third button creates a nested scale track.
   */
  const ScaleTrackButtons = (
    <div className={`w-full flex mt-2`} draggable onDragStart={cancelEvent}>
      <TrackButton
        className={styles.scaleEditorButton}
        onClick={toggleScaleEditor}
      >
        Scale <BsPencil className="ml-2" />
      </TrackButton>
      <TrackButton
        className={styles.patternTrackButton}
        onClick={props.createPatternTrack}
      >
        Track <BsPlusCircle className="ml-2" />
      </TrackButton>
      <TrackButton
        className={styles.scaleTrackButton}
        onClick={props.createScaleTrack}
      >
        Nest <BsPlusCircle className="ml-2" />
      </TrackButton>
    </div>
  );

  /**
   * The Scale Track body stores the track content with some outer padding.
   */
  const ScaleTrackBody = (
    <div
      className={`${styles.innerTrack} ${styles.innerBorder} ${styles.gradient}`}
      onDoubleClick={toggleScaleEditor}
    >
      {ScaleTrackHeader}
      {!track.collapsed && ScaleTrackButtons}
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
