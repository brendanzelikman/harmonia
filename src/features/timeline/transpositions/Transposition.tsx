import { connect, ConnectedProps } from "react-redux";
import { AppDispatch, RootState } from "redux/store";
import { TranspositionsProps } from ".";
import { COLLAPSED_TRACK_HEIGHT, TRANSPOSITION_HEIGHT } from "appConstants";
import * as Root from "redux/Root";
import { MouseEvent, useMemo } from "react";
import {
  getChordalOffset,
  getChromaticOffset,
  getScalarOffset,
  Transposition,
} from "types/Transposition";
import {
  selectCellHeight,
  selectTimeline,
  selectTimelineTickLeft,
  selectTimelineObjectTop,
  selectTrackById,
  selectTrackParents,
} from "redux/selectors";
import { BsMagic } from "react-icons/bs";
import { SlMagicWand } from "react-icons/sl";
import { cancelEvent, ticksToColumns } from "utils";
import { ClipId } from "types/Clip";
import { useTranspositionDrag } from "./dnd";
import useKeyHolder from "hooks/useKeyHolder";
import { onTranspositionClick } from "redux/Timeline";

interface OwnClipProps extends TranspositionsProps {
  transposition: Transposition;
}

const mapStateToProps = (state: RootState, ownProps: OwnClipProps) => {
  const { trackRowMap, transposition, selectedTranspositions, cellWidth } =
    ownProps;
  const { id } = transposition;

  // Timeline properties
  const timeline = selectTimeline(state);
  const { subdivision } = timeline;
  const transposing = timeline.state === "transposing";
  const addingClip = timeline.state === "adding";

  // Transposition track
  const parents = selectTrackParents(state, transposition.trackId);
  const track = selectTrackById(state, transposition.trackId);
  const onScaleTrack = parents.at(-1)?.id === transposition.trackId;

  // Transposition values;
  const { offsets } = transposition;
  const chromatic = getChromaticOffset(offsets);
  const scalars = parents
    .map((track) => getScalarOffset(offsets, track?.id))
    .slice(0, onScaleTrack ? parents.length - 1 : undefined);
  const chordal = getChordalOffset(offsets);

  // Transposition properties
  const isSelected = selectedTranspositions?.some((t) => t.id === id);
  const isCollapsed = !!track?.collapsed;
  const index = trackRowMap[transposition.trackId].index;

  // CSS properties
  const cellHeight = selectCellHeight(state);
  const height = isCollapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
  const top = selectTimelineObjectTop(state, transposition);
  const left = selectTimelineTickLeft(state, transposition.tick);

  const width = transposition.duration
    ? ticksToColumns(transposition.duration, subdivision) * cellWidth
    : ownProps.backgroundWidth - left;

  return {
    ...ownProps,
    subdivision,
    transposing,
    addingClip,
    isSelected,
    isCollapsed,
    index,
    chromatic,
    scalars,
    chordal,
    top,
    left,
    width,
    height,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch, ownProps: OwnClipProps) => {
  return {
    selectClips: (clipIds: ClipId[]) => {
      dispatch(Root.setSelectedClips(clipIds));
    },
    onTranspositionClick: (e: MouseEvent) => {
      dispatch(onTranspositionClick(e, ownProps.transposition));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type TranspositionProps = ConnectedProps<typeof connector>;

export default connector(TimelineTransposition);

function TimelineTransposition(props: TranspositionProps) {
  const { top, left, width, height, isSelected, isCollapsed } = props;
  const { chromatic, scalars, chordal, selectedTrackParents } = props;
  const heldKeys = useKeyHolder(["k", "q", "w", "s", "x", "e", "f", "z"]);

  // Transposition drag hook with react-dnd
  const [{ isDragging }, drag] = useTranspositionDrag(props);
  const opacity = isDragging ? 0.5 : 1;
  const pointerEvents = isDragging || props.addingClip ? "none" : "auto";
  const style = { top, left, height, opacity, pointerEvents };
  const canTransposeScale = isSelected && props.canTransposeScale;

  // Transposition label
  const TranspositionLabel = useMemo(() => {
    const chromaticLabel = (
      <span
        className={`mr-0.5 ${
          (heldKeys.q || heldKeys.z) && isSelected ? "text-shadow-lg" : ""
        } ${isSelected ? "font-bold" : ""}`}
      >
        N{chromatic}
      </span>
    );
    const chordalLabel = (
      <span
        className={`ml-0.5 ${
          (heldKeys.e || heldKeys.z) && isSelected ? "text-shadow-lg" : ""
        } ${isSelected ? "font-bold" : ""}`}
      >
        t{chordal}
      </span>
    );
    const scalarLabel = (offset: number, index: number) => {
      const isBeforeLast = index < scalars.length - 1;
      const hasParent = index < selectedTrackParents.length;
      const isHoldingW = index === 0 && heldKeys.w;
      const isHoldingS = index === 1 && heldKeys.s;
      const isHoldingX = index === 2 && heldKeys.x;
      const isHoldingKey = isHoldingW || isHoldingS || isHoldingX || heldKeys.z;
      return (
        <span
          key={`${offset}-${index}`}
          className={`${
            canTransposeScale && hasParent && isHoldingKey
              ? "text-shadow-lg"
              : ""
          } ${canTransposeScale && hasParent ? "font-bold" : ""}`}
        >
          {offset}
          {isBeforeLast ? <span className="mr-1">,</span> : ""}
        </span>
      );
    };
    const scalarLabels = scalars.length ? (
      <>
        <span className={`mx-0.5`}>
          <label
            className={`${canTransposeScale ? "font-bold" : ""} ${
              canTransposeScale &&
              (heldKeys.w || heldKeys.s || heldKeys.x || heldKeys.z)
                ? "text-shadow-lg"
                : ""
            }`}
          >
            T
          </label>
          ({scalars.map((s, i) => scalarLabel(s, i))})
        </span>
        {" • "}
      </>
    ) : null;
    return (
      <div
        className={`flex items-center whitespace-nowrap ${
          isSelected ? "text-slate-100" : "text-slate-200"
        }`}
        draggable
        onDragStart={cancelEvent}
      >
        {isSelected ? (
          <SlMagicWand className="text-md mr-2" />
        ) : (
          <BsMagic className={`text-md mr-2`} />
        )}
        <div className="pointer-events-none">
          {chromaticLabel}
          {" • "}
          {scalarLabels}
          {chordalLabel}
        </div>
      </div>
    );
  }, [
    chromatic,
    scalars,
    chordal,
    isSelected,
    heldKeys,
    canTransposeScale,
    selectedTrackParents,
  ]);

  // Transposition header (icon + label)
  const TranspositionHeader = useMemo(() => {
    return () => (
      <div
        className={`absolute`}
        style={{ width, height: TRANSPOSITION_HEIGHT }}
      >
        <div
          className={`relative w-full h-full group rounded-t-lg border border-b-0 ${
            isSelected
              ? `border-white bg-fuchsia-500/80`
              : `border-white/0 bg-fuchsia-500/70`
          } flex pl-1 items-center pointer-events-none ${
            !isSelected ? "overflow-hidden" : ""
          }`}
        >
          {TranspositionLabel}
        </div>
      </div>
    );
  }, [width, isSelected, TranspositionLabel, isCollapsed]);

  // Transposition body
  const TranspositionBody = useMemo(() => {
    return () => (
      <div
        className={`border border-t-0 ${
          isSelected
            ? `border-white bg-fuchsia-500/80`
            : `border-white/0 bg-fuchsia-500/70`
        } absolute rounded-b pointer-events-none`}
        style={{
          width,
          height: height - TRANSPOSITION_HEIGHT,
          top: TRANSPOSITION_HEIGHT,
        }}
      ></div>
    );
  }, [width, height, isSelected]);

  // Assembled transposition
  const Transposition = useMemo(() => {
    return (
      <div
        ref={drag}
        className={`transition-all duration-75 ease-in-out absolute rdg-transform rounded text-white w-full h-full cursor-pointer font-light`}
        style={{ ...style, width: props.cellWidth, pointerEvents }}
        onClick={props.onTranspositionClick}
      >
        <div className="relative w-full h-full">
          {TranspositionHeader()}
          {TranspositionBody()}
        </div>
      </div>
    );
  }, [TranspositionHeader, TranspositionBody, style, isSelected]);

  if (props.index === -1) return null;
  return Transposition;
}
