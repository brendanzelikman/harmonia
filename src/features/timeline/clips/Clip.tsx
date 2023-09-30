import { connect, ConnectedProps } from "react-redux";
import {
  selectClipDuration,
  selectTimelineTickOffset,
  selectClipWidth,
  selectClipName,
  selectClipPattern,
  selectCellHeight,
  selectTimelineTrackOffset,
  selectTrack,
} from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Clip, ClipId, getClipTheme } from "types/clip";
import { ClipsProps } from ".";
import { TRANSPOSITION_HEIGHT, COLLAPSED_TRACK_HEIGHT } from "appConstants";
import { useClipDrag } from "./dnd";
import * as Root from "redux/slices/root";
import { MouseEvent, useCallback, useMemo } from "react";
import Stream from "./Stream";
import { TranspositionNoId } from "types/transposition";
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
  const { clip, trackRowMap, selectedClips } = ownProps;

  // Clip properties
  const track = selectTrack(state, clip.trackId);
  const index = trackRowMap[clip.trackId].index;
  const name = selectClipName(state, clip.id);
  const duration = selectClipDuration(state, clip.id);
  const pattern = selectClipPattern(state, clip.id);

  // Timeline properties
  const isSelected = selectedClips.some(({ id }) => id === clip.id);
  const isCollapsed = track.collapsed;

  // CSS properties
  const cellHeight = selectCellHeight(state);
  const top = selectTimelineTrackOffset(state, clip) + TRANSPOSITION_HEIGHT;
  const left = selectTimelineTickOffset(state, clip.tick);
  const width = selectClipWidth(state, clip.id);
  const height =
    (!!track.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight) -
    TRANSPOSITION_HEIGHT;

  const { headerColor, bodyColor } = getClipTheme(clip);

  return {
    ...ownProps,
    isSelected,
    isCollapsed,
    index,
    name,
    duration,
    pattern,
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
  const { clip, top, left, width, height, addingClip, isSelected } = props;
  const { name, headerColor, bodyColor } = props;
  const heldKeys = useKeyHolder("i");
  const eyedropping = heldKeys.i;

  // Clip drag hook with react-dnd
  const [{ isDragging }, drag] = useClipDrag(props);
  const opacity = isDragging ? 0.5 : 1;
  const pointerEvents = isDragging ? "none" : "auto";
  const style = { top, left, width, height, opacity };

  // Clip name
  const ClipName = useMemo(() => {
    return () => (
      <label
        className={`h-6 flex items-center shrink-0 text-xs text-white/80 p-1 border-b border-b-white/20 ${
          props.headerColor
        } whitespace-nowrap overflow-ellipsis ${
          isSelected ? "font-bold" : "font-medium"
        } select-none ${
          addingClip
            ? "cursor-paintbrush"
            : eyedropping
            ? "cursor-eyedropper"
            : ""
        }`}
      >
        {name}
      </label>
    );
  }, [name, headerColor, addingClip, eyedropping, isSelected]);

  // Clip body
  const ClipBody = useMemo(() => {
    return () => (
      <div className="w-full h-full relative">
        <div className="w-full h-full flex flex-col overflow-hidden">
          {ClipName()}
          {!props.isCollapsed && <Stream {...props} />}
        </div>
      </div>
    );
  }, [clip, props.isCollapsed, ClipName]);

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
          addingClip
            ? "hover:ring-4 hover:ring-teal-500 cursor-paintbrush"
            : eyedropping
            ? "hover:ring-4 hover:ring-slate-300 cursor-eyedropper"
            : ""
        } ${bodyColor}`}
        style={{ ...style, pointerEvents }}
        onClick={onClick}
        onDoubleClick={() => props.showPatternEditor(props.pattern?.id)}
      >
        {ClipBody()}
      </div>
    );
  }, [
    style,
    isSelected,
    addingClip,
    eyedropping,
    bodyColor,
    onClick,
    ClipBody,
  ]);

  if (props.index === -1) return null;
  return Clip;
}

interface ClipClickProps extends ClipProps {
  e: MouseEvent;
  eyedropping: boolean;
}
const onClipClick = (props: ClipClickProps) => {
  // Change the pattern if the user is adding a clip
  if (props.addingClip && props.selectedPatternId) {
    props.updateClips([
      { id: props.clip.id, patternId: props.selectedPatternId },
    ]);
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
