import { connect, ConnectedProps } from "react-redux";
import {
  selectCellWidth,
  selectClipDuration,
  selectClipPattern,
  selectMixerByTrackId,
  selectRoot,
  selectSelectedClipIds,
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
  const selectedClipIds = selectSelectedClipIds(state);
  const isSelected = selectedClipIds.includes(clip.id);
  const root = selectRoot(state);
  const { timelineState, draggingClip, repeatCount, repeatTransforms } = root;
  const { chromaticTranspose, scalarTranspose, chordalTranspose } = root;

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
    repeatCount,
    repeatTransforms,
    chromaticTranspose,
    scalarTranspose,
    chordalTranspose,
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
    setActivePattern: (patternId: string) => {
      dispatch(RootSlice.setActivePattern(patternId));
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
  const { clip, rows, selectedIds } = props;
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

  const [holdingAlt, setHoldingAlt] = useState(false);
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
      Alt: {
        keydown: (e) => {
          if ((e as KeyboardEvent).key === "Alt") {
            setHoldingAlt(true);
          }
        },
        keyup: (e) => {
          if ((e as KeyboardEvent).key === "Alt") {
            setHoldingAlt(false);
          }
        },
      },
    },
    [isSelected]
  );

  const onClipClick = (e: MouseEvent) => {
    e.stopPropagation();
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
    if (eyedropping) {
      props.setActivePattern(clip.patternId);
      return;
    }
    if (isSelected) {
      props.deselectClip(clip.id);
    } else if (e.shiftKey) {
      if (selectedIds.length === 0) {
        props.selectClip(clip.id);
      } else {
        const lastId = selectedIds.at(-1);
        const lastClip = props.clips.find((c) => c.id === lastId);
        if (!lastClip) {
          props.selectClip(clip.id);
          return;
        }
        const startIndex = rows.findIndex(
          (row) => row.trackId === lastClip?.trackId
        );
        const targetIndex = rows.findIndex(
          (row) => row.trackId === clip.trackId
        );
        const trackIds = rows
          .slice(
            Math.min(startIndex, targetIndex),
            Math.max(startIndex, targetIndex) + 1
          )
          .map((row) => row.trackId);
        const clipIds = props.clips
          .filter((c) => trackIds.includes(c.trackId))
          .map((c) => c.id);

        const startTime = lastClip.startTime || 0;
        const endTime = clip.startTime + duration - 1;

        const selectedClipIds = clipIds.filter((id) => {
          const clip = props.clips.find((c) => c.id === id);
          if (!clip) return false;
          return clip.startTime >= startTime && clip.startTime <= endTime;
        });
        props.selectClips(selectedClipIds);
      }
    } else {
      props.selectClip(clip.id, holdingAlt);
    }
  };

  const ClipName = useMemo(() => {
    return () => (
      <div
        className={`text-xs text-white/80 font-medium bg-[#072c4f] p-1 border-b border-b-white/20 whitespace-nowrap overflow-ellipsis`}
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
        <div className="w-full h-full overflow-hidden">
          <ClipName />
          <Stream clip={clip} />
          {isSelected ? (
            <div className="w-full bg-zinc-900/70 py-0.5 select-none focus:outline-none"></div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
