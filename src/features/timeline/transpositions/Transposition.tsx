import { connect, ConnectedProps } from "react-redux";
import { AppDispatch, RootState } from "redux/store";
import { MouseEvent, useMemo } from "react";
import {
  getChordalOffset,
  getChromaticOffset,
  getScalarOffset,
  Transposition,
  TranspositionId,
} from "types/Transposition";
import {
  selectCellWidth,
  selectSelectedTrackId,
  selectTimeline,
  selectTrackParents,
  selectTranspositionById,
} from "redux/selectors";
import { cancelEvent } from "utils";
import { useTranspositionDrag } from "./hooks/useTranspositionDrag";
import { onTranspositionClick, onTranspositionDragEnd } from "redux/Timeline";
import { useDeepEqualSelector } from "redux/hooks";
import { useTranspositionStyles } from "./hooks/useTranspositionStyles";
import { pick } from "lodash";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";

const mapStateToProps = (
  state: RootState,
  ownProps: { id: TranspositionId }
) => {
  const transposition = selectTranspositionById(state, ownProps.id);
  const selectedTrackId = selectSelectedTrackId(state);
  const cellWidth = selectCellWidth(state);
  const timeline = selectTimeline(state);
  const { subdivision } = timeline;
  const isAdding = timeline.state === "adding";
  const isTransposing = timeline.state === "transposing";
  return {
    ...ownProps,
    transposition,
    subdivision,
    isTransposing,
    isAdding,
    selectedTrackId,
    cellWidth,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    onClick: (e: MouseEvent, transposition?: Transposition) => {
      dispatch(onTranspositionClick(e, transposition));
    },
    onDragEnd: (item: any, monitor: any) => {
      dispatch(onTranspositionDragEnd(item, monitor));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type TranspositionProps = ConnectedProps<typeof connector>;

export default connector(TimelineTransposition);

function TimelineTransposition(props: TranspositionProps) {
  const { transposition, isTransposing } = props;
  const parents = useDeepEqualSelector((_) =>
    selectTrackParents(_, transposition?.trackId)
  );

  // Transposition properties
  const heldKeys = useHeldHotkeys(["k", "q", "w", "s", "x", "e", "f", "z"]);
  const [{ isDragging }, drag] = useTranspositionDrag(props);
  const onScaleTrack = parents.at(-1)?.id === transposition?.trackId;

  // Derive further styles
  const styles = useTranspositionStyles({
    ...props,
    isTransposing,
    isDragging,
    isHoldingKey: (key) => heldKeys[key],
  });

  // Transposition offset values
  const chromatic = getChromaticOffset(transposition?.offsets);
  const chordal = getChordalOffset(transposition?.offsets);
  const scalars = parents
    .map((track) => getScalarOffset(transposition?.offsets, track?.id))
    .slice(0, onScaleTrack ? parents.length - 1 : undefined);

  /**
   * Create a scalar label based on the offset and index (only first 3 are shown)
   * @param offset The scalar offset
   * @param index The index of the scalar
   * @return A rendered scalar label.
   */
  const scalarLabel = (offset: number, index: number) => {
    const className = styles.scalarClass(index);
    return (
      <span key={`${offset}-${index}`} className={className}>
        {offset}
        {index < scalars.length - 1 ? ", " : ""}
      </span>
    );
  };

  /**
   * The chromatic label displays the chromatic offset as Nx.
   */
  const chromaticLabel = (
    <span className={`mr-1 ${styles.chromaticClass}`}>N{chromatic}</span>
  );

  /**
   * The chordal label displays the chordal offset as tX.
   */
  const chordalLabel = (
    <span className={`ml-1 ${styles.chordalClass}`}>t{chordal}</span>
  );

  /**
   * The scalar labels correspond to each parent track, displayed as T(X, Y, Z).
   */
  const ScalarLabels = useMemo(() => {
    if (!scalars.length) return null;
    return (
      <span className={`mx-1`}>
        <label className={`${styles.scalarTLabel}`}>T</label>(
        {scalars.map(scalarLabel)})
      </span>
    );
  }, [scalars, styles.scalarTLabel]);

  /**
   * The transposition label contains the chromatic, scalar, and chordal labels,
   * displayed as Nx • T(X, Y, Z) • tX.
   */
  const TranspositionLabel = (
    <div
      className={`flex h-full items-center whitespace-nowrap pl-1 pt-0.5 ${styles.labelColor}`}
      draggable
      onDragStart={cancelEvent}
    >
      {styles.Icon}
      {chromaticLabel}
      {" • "}
      {ScalarLabels}
      {scalars.length ? " • " : ""}
      {chordalLabel}
    </div>
  );

  /**
   * The transposition header sits above a clip and contains the transposition label.
   */
  const TranspositionHeader = (
    <div
      className={`${styles.headerDisplay} ${styles.headerBorder} ${styles.background}`}
      style={{ height: styles.height }}
    >
      {TranspositionLabel}
    </div>
  );

  /**
   * The transposition body is filled in behind a clip.
   */
  const TranspositionBody = (
    <div
      className={`w-full h-full ${styles.background} ${styles.bodyBorder}`}
    />
  );

  // Assemble the class name and style
  const className = `${styles.position} ${styles.font} ${styles.cursor} ${styles.transition} ${styles.pointerEvents}`;
  const style = pick(styles, ["top", "left", "width", "opacity"]);

  // Render the transposition
  return (
    <div
      ref={drag}
      className={className}
      style={{ ...style, height: styles.cellHeight }}
      onClick={(e) => props.onClick(e, transposition)}
    >
      {TranspositionHeader}
      {TranspositionBody}
    </div>
  );
}
