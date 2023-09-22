import { connect, ConnectedProps } from "react-redux";
import {
  selectClipDuration,
  selectRoot,
  selectTimeline,
  selectTimelineTickOffset,
  selectClipWidth,
  selectClipName,
  selectSelectedClips,
  selectSelectedTranspositions,
  selectClipPattern,
} from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Clip, ClipId, getClipTheme } from "types/clip";
import { ClipsProps } from ".";
import { CELL_HEIGHT, TRANSPOSITION_HEIGHT, HEADER_HEIGHT } from "appConstants";
import { useClipDrag } from "./dnd";
import * as Root from "redux/slices/root";
import { MouseEvent, useCallback, useMemo } from "react";
import Stream from "./Stream";
import {
  getChordalTranspose,
  getChromaticTranspose,
  getScalarTranspose,
  TranspositionNoId,
} from "types/transposition";
import { rotatePattern, transposePattern } from "redux/slices/patterns";
import { createTranspositions } from "redux/slices/transpositions";
import { isHoldingOption, isHoldingShift } from "utils";
import { selectRangeOfClips } from "redux/thunks";
import { Row } from "..";
import useKeyHolder from "hooks/useKeyHolder";
import { PatternId } from "types";
import { showEditor } from "redux/slices/editor";

interface OwnClipProps extends ClipsProps {
  clip: Clip;
}

const mapStateToProps = (state: RootState, ownProps: OwnClipProps) => {
  const { rows, clip } = ownProps;
  const { toolkit } = selectRoot(state);
  const selectedClips = selectSelectedClips(state);
  const selectedTranspositions = selectSelectedTranspositions(state);

  // Timeline properties
  const timeline = selectTimeline(state);
  const { subdivision } = timeline;
  const transposing = timeline.state === "transposing";

  // Clip properties
  const isSelected = selectedClips.some(({ id }) => id === clip.id);
  const index = rows.findIndex((row) => row.trackId === clip.trackId);
  const name = selectClipName(state, clip.id);
  const duration = selectClipDuration(state, clip.id);
  const pattern = selectClipPattern(state, clip.id);

  // Transposition values
  const { transpositionOffsets } = toolkit;
  const chromatic = getChromaticTranspose(transpositionOffsets);
  const scalar = getScalarTranspose(transpositionOffsets);
  const chordal = getChordalTranspose(transpositionOffsets);

  // CSS properties
  const top = HEADER_HEIGHT + index * CELL_HEIGHT + TRANSPOSITION_HEIGHT;
  const left = selectTimelineTickOffset(state, clip.tick);
  const width = selectClipWidth(state, clip.id);
  const height = CELL_HEIGHT - TRANSPOSITION_HEIGHT;
  const { headerColor, bodyColor } = getClipTheme(clip);

  return {
    ...ownProps,
    selectedClips,
    selectedTranspositions,
    subdivision,
    transposing,
    isSelected,
    index,
    name,
    duration,
    pattern,
    chromatic,
    scalar,
    chordal,
    top,
    left,
    width,
    height,
    headerColor,
    bodyColor,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    selectClip: (clipId: ClipId, another = false) => {
      if (another) {
        dispatch(Root.addSelectedClip(clipId));
      } else {
        dispatch(Root.setSelectedClips([clipId]));
      }
    },
    setSelectedPattern: (patternId: string) => {
      dispatch(Root.setSelectedPattern(patternId));
    },
    selectClips: (clipIds: ClipId[]) => {
      dispatch(Root.setSelectedClips(clipIds));
    },
    deselectClip: (clipId: ClipId) => {
      dispatch(Root.deselectClip(clipId));
    },
    createTranspositions: (transpositions: Partial<TranspositionNoId>[]) => {
      dispatch(createTranspositions(transpositions));
    },
    transposePattern: (
      patternId: string,
      chromaticTranspose: number,
      scalarTranspose: number,
      chordalTranspose: number
    ) => {
      dispatch(
        transposePattern({
          id: patternId,
          transpose: chromaticTranspose + scalarTranspose,
        })
      );
      dispatch(rotatePattern({ id: patternId, transpose: chordalTranspose }));
    },
    selectRangeOfClips(clip: Clip, rows: Row[]) {
      dispatch(selectRangeOfClips(clip, rows));
    },
    showPatternEditor: (patternId?: PatternId) => {
      if (!patternId) return;
      dispatch(Root.setSelectedPattern(patternId));
      dispatch(showEditor({ id: "patterns" }));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type ClipProps = ConnectedProps<typeof connector>;

export default connector(TimelineClip);

function TimelineClip(props: ClipProps) {
  const { clip, top, left, width, height, isSelected } = props;
  const { name, headerColor, bodyColor, transposing } = props;
  const heldKeys = useKeyHolder("i");

  // Clip drag hook with react-dnd
  const [{ isDragging }, drag] = useClipDrag(props);
  const opacity = isDragging ? 0.5 : 1;
  const pointerEvents = isDragging ? "none" : "auto";
  const style = { top, left, width, height, opacity, pointerEvents };

  // Clip name
  const ClipName = useMemo(() => {
    return () => (
      <label
        className={`h-6 flex items-center shrink-0 text-xs text-white/80 font-medium p-1 border-b border-b-white/20 ${props.headerColor} whitespace-nowrap overflow-ellipsis`}
      >
        {name}
      </label>
    );
  }, [name, headerColor]);

  // Clip body
  const ClipBody = useMemo(() => {
    return () => (
      <div className="w-full h-full relative">
        <div className="w-full h-full flex flex-col overflow-hidden">
          {ClipName()}
          <Stream {...props} />
        </div>
      </div>
    );
  }, [clip, ClipName]);

  const onClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) =>
      onClipClick({ ...props, e, eyedropping: heldKeys.i }),
    [props, heldKeys]
  );

  // Assembled clip
  const Clip = useMemo(() => {
    return (
      <div
        ref={drag}
        className={`transition-all duration-75 ease-in-out rdg-clip border rounded-lg ${
          isSelected ? "border-white" : "border-slate-200/50"
        } ${
          transposing ? "hover:ring-4 hover:ring-fuchsia-500" : ""
        } ${bodyColor}`}
        style={{ ...style, pointerEvents }}
        onClick={onClick}
        onDoubleClick={() => props.showPatternEditor(props.pattern?.id)}
      >
        {ClipBody()}
      </div>
    );
  }, [style, isSelected, transposing, bodyColor, onClick, ClipBody]);

  if (props.index === -1) return null;
  return Clip;
}

interface ClipClickProps extends ClipProps {
  e: MouseEvent;
  eyedropping: boolean;
}
const onClipClick = (props: ClipClickProps) => {
  // Transpose the clip if transposing
  if (props.transposing) {
    const { chromatic, scalar, chordal } = props;
    if ([chromatic, scalar, chordal].some(isNaN)) return;
    props.transposePattern(props.clip.patternId, chromatic, scalar, chordal);
    return;
  }
  // Eyedrop the pattern if the user is holding the eyedrop key
  if (props.eyedropping) {
    props.setSelectedPattern(props.clip.patternId);
    return;
  }
  // Deselect the clip if it is selected
  if (props.isSelected) {
    props.deselectClip(props.clip.id);
    return;
  }

  const nativeEvent = props.e.nativeEvent as Event;
  const holdingShift = isHoldingShift(nativeEvent);

  // Select the clip if the user is not holding shift
  if (!holdingShift) {
    const holdingAlt = isHoldingOption(nativeEvent);
    props.selectClip(props.clip.id, holdingAlt);
    return;
  }

  // Just select the clip if there are no other selected clips
  if (props.selectedClipIds.length === 0) {
    props.selectClip(props.clip.id);
    return;
  }

  // Select a range of clips if the user is holding shift
  props.selectRangeOfClips(props.clip, props.rows);
};
