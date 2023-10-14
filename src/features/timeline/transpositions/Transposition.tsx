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
  selectMediaDragState,
  selectSelectedTrackId,
  selectTimeline,
  selectTrackParents,
  selectTranspositionById,
} from "redux/selectors";
import { cancelEvent } from "utils";
import { useTranspositionDrag } from "./hooks/useTranspositionDnd";
import {
  onTranspositionClick,
  onTranspositionDragEnd,
  updateMediaDragState,
} from "redux/Timeline";
import { useDeepEqualSelector } from "redux/hooks";
import { useTranspositionStyles } from "./hooks/useTranspositionStyles";
import { pick } from "lodash";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import {
  isAddingClips,
  isAddingTranspositions,
  isSlicingMedia,
} from "types/Timeline";

const mapStateToProps = (
  state: RootState,
  ownProps: { id: TranspositionId }
) => {
  const transposition = selectTranspositionById(state, ownProps.id);
  const selectedTrackId = selectSelectedTrackId(state);
  const cellWidth = selectCellWidth(state);
  const timeline = selectTimeline(state);
  const { subdivision } = timeline;
  const isAdding = isAddingClips(timeline);
  const isSlicing = isSlicingMedia(timeline);
  const isTransposing = isAddingTranspositions(timeline);
  const { draggingClip } = selectMediaDragState(state);

  return {
    ...ownProps,
    transposition,
    subdivision,
    isTransposing,
    isAdding,
    isSlicing,
    selectedTrackId,
    cellWidth,
    draggingClip,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    onClick: (e: MouseEvent<HTMLDivElement>, transposition?: Transposition) => {
      dispatch(onTranspositionClick(e, transposition));
    },
    onDragStart: () => {
      dispatch(updateMediaDragState({ draggingTransposition: true }));
    },
    onDragEnd: (item: any, monitor: any) => {
      dispatch(onTranspositionDragEnd(item, monitor));
      dispatch(updateMediaDragState({ draggingTransposition: false }));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type TranspositionProps = ConnectedProps<typeof connector>;

export default connector(TimelineTransposition);

function TimelineTransposition(props: TranspositionProps) {
  const { transposition, isTransposing, isSlicing } = props;
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
    isSlicing,
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
    <span className={styles.chromaticClass}>N{chromatic}</span>
  );

  /**
   * The chordal label displays the chordal offset as tX.
   */
  const chordalLabel = <span className={styles.chordalClass}>t{chordal}</span>;

  /**
   * The scalar labels correspond to each parent track, displayed as T(X, Y, Z).
   */
  const ScalarLabels = useMemo(() => {
    if (!scalars.length) return null;
    return (
      <span>
        <label className={`${styles.scalarTLabel}`}>T</label>(
        {scalars.map(scalarLabel)})
      </span>
    );
  }, [scalars, styles.scalarTLabel]);

  /**
   * The transposition label contains the chromatic, scalar, and chordal labels,
   * displayed as Nx • T(X, Y, Z) • tX. The labels are vertically stacked if the
   * transposition is small.
   */
  const TranspositionLabel = () => (
    <div
      className={`flex relative h-full items-center whitespace-nowrap z-20 ${styles.labelColor}`}
      draggable
      onDragStart={cancelEvent}
    >
      {styles.Icon}
      {styles.isSmall ? (
        <div
          className="absolute flex px-2 border border-slate-200/50 flex-col rounded"
          style={{ top: -(scalars.length ? 3 : 2) * 22 - 5 }}
        >
          {chromaticLabel}
          {ScalarLabels}
          {chordalLabel}
        </div>
      ) : (
        <div className="flex space-x-1">
          {chromaticLabel}
          <span>{" • "}</span>
          {ScalarLabels}
          {scalars.length ? <span>{" • "}</span> : null}
          {chordalLabel}
        </div>
      )}
    </div>
  );

  /**
   * The transposition header sits above a clip and contains the transposition label.
   */
  const TranspositionHeader = () => {
    return (
      <div
        className={`${styles.headerDisplay} ${styles.background}`}
        style={{ height: styles.height }}
      >
        <TranspositionLabel />
      </div>
    );
  };

  /**
   * The transposition body is filled in behind a clip.
   */
  const TranspositionBody = () => (
    <div className={`w-full h-full ${styles.background}`} />
  );

  /**
   * The transposition hues change with the offsets.
   */
  const TranspositionHues = () => {
    return (
      <div className="absolute inset-0">
        <div
          className={`${styles.hueClass} bg-fuchsia-400`}
          style={{ opacity: styles.chromaticUpOpacity }}
        />
        <div
          className={`${styles.hueClass} bg-fuchsia-700`}
          style={{ opacity: styles.chromaticDownOpacity }}
        />
        <div
          className={`${styles.hueClass} bg-rose-400`}
          style={{ opacity: styles.scalarUpOpacity }}
        />
        <div
          className={`${styles.hueClass} bg-rose-600`}
          style={{ opacity: styles.scalarDownOpacity }}
        />
        <div
          className={`${styles.hueClass} bg-pink-400`}
          style={{ opacity: styles.chordalUpOpacity }}
        />
        <div
          className={`${styles.hueClass} bg-pink-700`}
          style={{ opacity: styles.chordalDownOpacity }}
        />
      </div>
    );
  };

  // Assemble the class name and style
  const className = `${styles.position} ${styles.border} ${styles.font} ${styles.cursor} ${styles.transition} ${styles.pointerEvents}`;
  const style = pick(styles, ["top", "left", "width", "opacity"]);

  // Render the transposition
  return (
    <div
      ref={drag}
      className={className}
      style={{ ...style, height: styles.cellHeight }}
      onClick={(e) => props.onClick(e, transposition)}
    >
      {TranspositionHeader()}
      {TranspositionBody()}
      <TranspositionHues />
    </div>
  );
}
