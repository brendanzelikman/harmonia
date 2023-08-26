import { connect, ConnectedProps } from "react-redux";
import {
  selectCellWidth,
  selectClipDuration,
  selectClipPattern,
  selectMixerByTrackId,
  selectRoot,
} from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Clip, ClipId } from "types/clips";
import { ClipsProps } from ".";
import * as Constants from "appConstants";
import { useClipDrag } from "./dnd";

import * as RootSlice from "redux/slices/root";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import Stream from "./Stream";
import { selectTransforms } from "redux/selectors/transforms";
import useEventListeners from "hooks/useEventListeners";
import { TransformNoId } from "types/transform";
import { rotatePattern, transposePattern } from "redux/slices/patterns";
import { createTransforms } from "redux/slices/transforms";
import { isHoldingOption, isHoldingShift } from "appUtil";

interface OwnClipProps extends ClipsProps {
  clip: Clip;
}

const mapStateToProps = (state: RootState, ownProps: OwnClipProps) => {
  const { rows, clip } = ownProps;
  const index = rows.findIndex((row) => row.trackId === clip.trackId);
  const duration = selectClipDuration(state, clip.id);
  const name = selectClipPattern(state, clip.id)?.name ?? "";
  const muted = selectMixerByTrackId(state, clip.trackId)?.mute ?? false;
  const cellWidth = selectCellWidth(state);

  const width = cellWidth * Math.max(duration, 1);
  const top = Constants.HEADER_HEIGHT + index * Constants.CELL_HEIGHT;
  const left = Constants.TRACK_WIDTH + cellWidth * clip.startTime;

  const pattern = selectClipPattern(state, clip.id);
  const transforms = selectTransforms(state);
  const root = selectRoot(state);
  const { timelineState, draggingClip, toolkit, selectedClipIds } = root;
  const isSelected = selectedClipIds.includes(clip.id);

  return {
    ...ownProps,
    index,
    name,
    muted,
    duration,
    width,
    top,
    left,
    isSelected,
    transforms,
    pattern,
    transposingClip: timelineState === "transposing",
    draggingClip,
    ...toolkit,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    selectClip: (clipId: ClipId, another = false) => {
      if (another) {
        dispatch(RootSlice.selectAnotherClip(clipId));
      } else {
        dispatch(RootSlice.selectClip(clipId));
      }
    },
    setSelectedPattern: (patternId: string) => {
      dispatch(RootSlice.setSelectedPattern(patternId));
    },
    selectClips: (clipIds: ClipId[]) => {
      dispatch(RootSlice.selectClips(clipIds));
    },
    deselectClip: (clipId: ClipId) => {
      dispatch(RootSlice.deselectClip(clipId));
    },
    startDraggingClip: () => {
      dispatch(RootSlice.startDraggingClip());
    },
    stopDraggingClip: () => {
      dispatch(RootSlice.stopDraggingClip());
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
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type ClipProps = ConnectedProps<typeof connector>;

export default connector(TimelineClip);

function TimelineClip(props: ClipProps) {
  if (props.index === -1) return null;
  const { clip, rows, selectedClipIds } = props;
  const { draggingClip, transposingClip } = props;
  const { top, left, width, duration, name, isSelected, muted } = props;

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
    if (muted) return 0.8;
    if (isDragging) return 0.5;
    if (draggingClip) return 0.8;
    return 1;
  }, [muted, isDragging, draggingClip]);

  const [eyedropping, setEyedropping] = useState(false);

  useEventListeners(
    {
      i: {
        keydown: (e) => {
          if ((e as KeyboardEvent).key === "i") {
            setEyedropping(true);
          }
        },
        keyup: (e) => {
          if ((e as KeyboardEvent).key === "i") {
            setEyedropping(false);
          }
        },
      },
    },
    [isSelected]
  );

  const onClipClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

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

    // Get the last selected clip
    const lastId = selectedClipIds.at(-1);
    const lastClip = props.clips.find((c) => c.id === lastId);
    if (!lastClip) return;

    // Get the start and end index of the selection
    const startIndex = rows.findIndex(
      (row) => row.trackId === lastClip?.trackId
    );
    const targetIndex = rows.findIndex((row) => row.trackId === clip.trackId);

    // Get the trackIds of the selection
    const trackIds = rows
      .slice(
        Math.min(startIndex, targetIndex),
        Math.max(startIndex, targetIndex) + 1
      )
      .map((row) => row.trackId);

    // Get the clipIds of the selection
    const clipIds = props.clips
      .filter((c) => trackIds.includes(c.trackId))
      .map((c) => c.id);

    // Compute the start and end time of the selection
    const startTime = lastClip.startTime || 0;
    const endTime = clip.startTime + duration - 1;

    // Filter the clipIds to only include clips in the selection
    const newClipIds = clipIds.filter((id) => {
      const clip = props.clips.find((c) => c.id === id);
      if (!clip) return false;
      return clip.startTime >= startTime && clip.startTime <= endTime;
    });

    // Select the clips
    props.selectClips(newClipIds);
  };

  const ClipName = useMemo(() => {
    return () => (
      <div
        className={`shrink-0 text-xs text-white/80 font-medium bg-[#072c4f] p-1 border-b border-b-white/20 whitespace-nowrap overflow-ellipsis`}
      >
        {name}
      </div>
    );
  }, [name]);

  return (
    <div
      className={`cursor-pointer rdg-clip absolute bg-sky-800/70 border ${
        isSelected ? "border-white" : "border-slate-200/50"
      } ${
        transposingClip ? "hover:ring-4 hover:ring-fuchsia-500" : ""
      } rounded-lg overflow-hidden`}
      ref={drag}
      style={{
        top: top + Constants.TRANSPOSE_HEIGHT,
        left,
        width,
        height: Constants.CELL_HEIGHT - Constants.TRANSPOSE_HEIGHT,
        opacity,
        pointerEvents: isDragging || draggingClip || muted ? "none" : "auto",
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
