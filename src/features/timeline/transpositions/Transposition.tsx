import { connect, ConnectedProps } from "react-redux";
import { AppDispatch, RootState } from "redux/store";
import { TranspositionsProps } from ".";
import { CELL_HEIGHT, HEADER_HEIGHT, TRANSPOSITION_HEIGHT } from "appConstants";
import * as Root from "redux/slices/root";
import { MouseEvent, useMemo } from "react";
import {
  getChordalTranspose,
  getChromaticTranspose,
  getScalarTranspose,
  Transposition,
} from "types/transposition";
import {
  selectTimeline,
  selectTimelineTickOffset,
  selectTrackParents,
} from "redux/selectors";
import { BsMagic } from "react-icons/bs";
import { cancelEvent, ticksToColumns } from "utils";
import { ClipId } from "types/clip";
import { useTranspositionDrag } from "./dnd";
import useKeyHolder from "hooks/useKeyHolder";
import { onTranspositionClick } from "redux/thunks/transpositions";

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

  // Transposition properties
  const isSelected = selectedTranspositions?.some((t) => t.id === id);
  const index = trackRowMap[transposition.trackId].index;

  // Transposition values
  const parents = selectTrackParents(state, transposition.trackId);
  const chromatic = getChromaticTranspose(transposition);
  const scalars = parents
    .map((track) => getScalarTranspose(transposition, track?.id))
    .slice(parents.at(-1)?.id === transposition.trackId ? 1 : 0);
  const chordal = getChordalTranspose(transposition);

  // CSS properties
  const top = HEADER_HEIGHT + index * CELL_HEIGHT;
  const left = selectTimelineTickOffset(state, transposition.tick);

  const width = transposition.duration
    ? ticksToColumns(transposition.duration, subdivision) * cellWidth
    : ownProps.backgroundWidth - left;
  const height = CELL_HEIGHT;

  return {
    ...ownProps,
    subdivision,
    transposing,
    addingClip,
    isSelected,
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
      dispatch(onTranspositionClick(e, ownProps.transposition, ownProps.rows));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type TranspositionProps = ConnectedProps<typeof connector>;

export default connector(TimelineTransposition);

function TimelineTransposition(props: TranspositionProps) {
  const { top, left, width, height, isSelected } = props;
  const { chromatic, scalars, chordal } = props;
  const heldKeys = useKeyHolder(["k", "q", "w", "s", "x", "e", "f"]);

  // Transposition drag hook with react-dnd
  const [{ isDragging }, drag] = useTranspositionDrag(props);
  const opacity = isDragging ? 0.5 : 1;
  const pointerEvents = isDragging || props.addingClip ? "none" : "auto";
  const style = { top, left, height, opacity, pointerEvents };
  const canTransposeScale = isSelected && props.canTransposeScale;

  // Transposition label
  const TranspositionLabel = () => (
    <div
      className={`absolute flex items-center whitespace-nowrap`}
      draggable
      onDragStart={cancelEvent}
    >
      <BsMagic className="text-md mr-2" />
      <label className="pointer-events-none">
        <span
          className={`mr-0.5 ${heldKeys.q && isSelected ? "font-bold" : ""}`}
        >
          N{chromatic}
        </span>
        {scalars.length ? (
          <span className={`mx-0.5`}>
            {" • "}
            <span className={`${canTransposeScale ? "font-bold" : ""}`}>T</span>
            (
            {scalars.map((s, i) => (
              <span
                key={`${s}-${i}`}
                className={`${
                  canTransposeScale &&
                  ((i === 0 && heldKeys.w) ||
                    (i === 1 && heldKeys.s) ||
                    (i === 2 && heldKeys.x))
                    ? "font-bold"
                    : ""
                }`}
              >
                {s}
                {i < scalars.length - 1 ? <span className="mr-1">,</span> : ""}
              </span>
            ))}
            )
          </span>
        ) : null}
        {" • "}
        <span
          className={`ml-0.5 ${heldKeys.e && isSelected ? "font-bold" : ""}`}
        >
          t{chordal}
        </span>
      </label>
    </div>
  );

  // Transposition header (icon + label)
  const TranspositionHeader = useMemo(() => {
    return () => (
      <div
        className={`absolute`}
        style={{ width, height: TRANSPOSITION_HEIGHT }}
      >
        <div
          className={`relative w-full h-full group rounded-t-lg  ${
            isSelected ? `border border-b-0` : ``
          } flex pl-1 items-center bg-fuchsia-500/70 pointer-events-none ${
            !isSelected ? "overflow-hidden" : ""
          }`}
        >
          {TranspositionLabel()}
        </div>
      </div>
    );
  }, [width, isSelected, TranspositionLabel]);

  // Transposition body
  const TranspositionBody = useMemo(() => {
    return () => (
      <div
        className={`bg-fuchsia-500/70 ${
          isSelected ? `border border-t-0` : ``
        } absolute rounded-b pointer-events-none`}
        style={{
          width,
          height: CELL_HEIGHT - TRANSPOSITION_HEIGHT,
          top: TRANSPOSITION_HEIGHT,
        }}
      ></div>
    );
  }, [width, isSelected]);

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
