import { connect, ConnectedProps } from "react-redux";
import {
  selectClipTicks,
  selectClipPattern,
  selectRoot,
  selectTimeline,
  selectTimelineTickOffset,
  selectClipWidth,
} from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Clip, ClipId } from "types/clip";
import { ClipsProps } from ".";
import * as Constants from "appConstants";
import { useClipDrag } from "./dnd";
import * as Root from "redux/slices/root";
import * as Timeline from "redux/slices/timeline";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import Stream from "./Stream";
import { TransformNoId } from "types/transform";
import { rotatePattern, transposePattern } from "redux/slices/patterns";
import { createTransforms } from "redux/slices/transforms";
import { isHoldingOption, isHoldingShift } from "utils";
import { selectRangeOfClips } from "redux/thunks";
import { Row } from "..";
import useKeyHolder from "hooks/useKeyHolder";

interface OwnClipProps extends ClipsProps {
  clip: Clip;
}

const mapStateToProps = (state: RootState, ownProps: OwnClipProps) => {
  const { rows, clip } = ownProps;
  const timeline = selectTimeline(state);

  const index = rows.findIndex((row) => row.trackId === clip.trackId);
  const duration = selectClipTicks(state, clip.id);
  const name = selectClipPattern(state, clip.id)?.name ?? "";

  const top = Constants.HEADER_HEIGHT + index * Constants.CELL_HEIGHT;
  const left = selectTimelineTickOffset(state, clip.tick);
  const width = selectClipWidth(state, clip.id);

  const pattern = selectClipPattern(state, clip.id);
  const root = selectRoot(state);
  const { toolkit, selectedClipIds } = root;
  const isSelected = selectedClipIds.includes(clip.id);

  return {
    ...ownProps,
    index,
    name,
    duration,
    width,
    top,
    left,
    subdivision: timeline.subdivision,
    isSelected,
    pattern,
    transposingClip: timeline.state === "transposing",
    draggingClip: timeline.draggingClip,
    ...toolkit,
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
    startDraggingClip: () => {
      dispatch(Timeline.startDraggingClip());
    },
    stopDraggingClip: () => {
      dispatch(Timeline.stopDraggingClip());
    },
    createTransforms: (transforms: Partial<TransformNoId>[]) => {
      dispatch(createTransforms(transforms));
    },
    transformPattern: (
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
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type ClipProps = ConnectedProps<typeof connector>;

export default connector(TimelineClip);

function TimelineClip(props: ClipProps) {
  if (props.index === -1) return null;
  const { clip, rows, selectedClipIds } = props;
  const { draggingClip, transposingClip } = props;
  const { top, left, width, name, isSelected } = props;

  const [{ isDragging }, drag] = useClipDrag(props);

  // Update the dragging state after react-dnd
  useEffect(() => {
    if (!clip) return;
    if (isDragging) {
      props.startDraggingClip();
    } else if (!isDragging) {
      props.stopDraggingClip();
    }
  }, [clip, isDragging]);

  const opacity = useMemo(() => {
    if (isDragging) return 0.5;
    if (draggingClip) return 0.8;
    return 1;
  }, [isDragging, draggingClip]);

  const eyedropping = useKeyHolder("i").i;

  const onClipClick = (e: MouseEvent) => {
    if (transposingClip) {
      const { chromaticTranspose, scalarTranspose, chordalTranspose } = props;
      if (isNaN(scalarTranspose)) return;
      if (isNaN(chromaticTranspose)) return;
      if (isNaN(chordalTranspose)) return;

      props.transformPattern(
        clip.patternId,
        chromaticTranspose,
        scalarTranspose,
        chordalTranspose
      );
      return;
    }
    // Eyedrop the pattern if the user is holding the eyedrop key
    if (eyedropping) {
      props.setSelectedPattern(clip.patternId);
      return;
    }
    // Deselect the clip if it is selected
    if (isSelected) {
      props.deselectClip(clip.id);
      return;
    }

    const nativeEvent = e.nativeEvent as Event;
    const holdingShift = isHoldingShift(nativeEvent);

    // Select the clip if the user is not holding shift
    if (!holdingShift) {
      const holdingAlt = isHoldingOption(nativeEvent);
      props.selectClip(clip.id, holdingAlt);
      return;
    }

    // Just select the clip if there are no other selected clips
    if (selectedClipIds.length === 0) {
      props.selectClip(clip.id);
      return;
    }

    // Select a range of clips if the user is holding shift
    props.selectRangeOfClips(clip, rows);
  };

  const ClipName = useMemo(() => {
    return () => (
      <div
        className={`h-6 flex items-center shrink-0 text-xs text-white/80 font-medium p-1 border-b border-b-white/20 bg-sky-950 whitespace-nowrap overflow-ellipsis`}
      >
        {name}
      </div>
    );
  }, [name]);

  return (
    <div
      className={`transition-all duration-75 ease-in-out cursor-pointer rdg-clip absolute border ${
        isSelected ? "border-white" : "border-slate-200/50"
      } ${
        transposingClip ? "hover:ring-4 hover:ring-fuchsia-500" : ""
      } bg-sky-800/70 rounded-lg overflow-hidden`}
      ref={drag}
      style={{
        top: top + Constants.TRANSFORM_HEIGHT,
        left,
        width,
        height: Constants.CELL_HEIGHT - Constants.TRANSFORM_HEIGHT,
        opacity,
        pointerEvents: isDragging || draggingClip ? "none" : "auto",
        animation: "fadeIn 0.1s ease-in-out",
      }}
      onClick={onClipClick}
    >
      <div className="w-full h-full relative">
        <div className="w-full h-full flex flex-col overflow-hidden">
          <ClipName />
          <Stream clip={clip} />
        </div>
      </div>
    </div>
  );
}
