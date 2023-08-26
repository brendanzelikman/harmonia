import { connect, ConnectedProps } from "react-redux";

import { AppDispatch, RootState } from "redux/store";
import { TransformsProps } from ".";
import * as Constants from "appConstants";
import * as RootSlice from "redux/slices/root";

import { MouseEvent, useEffect, useMemo, useState } from "react";

import { selectTransforms } from "redux/selectors/transforms";
import { Transform, TransformId } from "types/transform";
import { selectCellWidth, selectRoot } from "redux/selectors";
import { BsMagic } from "react-icons/bs";
import useEventListeners from "hooks/useEventListeners";
import { isHoldingOption, isHoldingShift, isInputEvent } from "appUtil";
import { ClipId } from "types/clips";
import { useTransformDrag } from "./dnd";

interface OwnClipProps extends TransformsProps {
  transform: Transform;
}

const mapStateToProps = (state: RootState, ownProps: OwnClipProps) => {
  const { rows, transform } = ownProps;
  const cellWidth = selectCellWidth(state);
  const index = rows.findIndex((row) => row.trackId === transform.trackId);

  const top = Constants.HEADER_HEIGHT + index * Constants.CELL_HEIGHT;
  const left = Constants.TRACK_WIDTH + cellWidth * transform.time;

  const transforms = selectTransforms(state);
  const root = selectRoot(state);
  const { timelineState, toolkit, draggingTransform } = root;
  const addingClip = timelineState === "adding";
  const transposing = timelineState === "transposing";

  const isSelected = ownProps.selectedTransformIds?.includes(transform.id);

  return {
    ...ownProps,
    ...toolkit,
    index,
    cellWidth,
    top,
    left,
    transforms,
    addingClip,
    transposing,
    draggingTransform,
    isSelected,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    selectTransform: (transformId: TransformId, another = false) => {
      if (another) {
        dispatch(RootSlice.selectAnotherTransform(transformId));
      } else {
        dispatch(RootSlice.selectTransform(transformId));
      }
    },
    selectClips: (clipIds: ClipId[]) => {
      dispatch(RootSlice.selectClips(clipIds));
    },
    selectTransforms: (transforms: TransformId[]) => {
      dispatch(RootSlice.selectTransforms(transforms));
    },
    deselectTransform: (transformId: TransformId) => {
      dispatch(RootSlice.deselectTransform(transformId));
    },
    startDraggingTransform: () => {
      dispatch(RootSlice.startDraggingTransform());
    },
    stopDraggingTransform: () => {
      dispatch(RootSlice.stopDraggingTransform());
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type TransformProps = ConnectedProps<typeof connector>;

export default connector(TimelineTransform);

function TimelineTransform(props: TransformProps) {
  if (props.index === -1) return null;
  const { transform } = props;

  const { top, left, cellWidth, selectedTransformIds } = props;

  const [{ isDragging }, drag] = useTransformDrag(props);

  // Update the dragging state after react-dnd
  useEffect(() => {
    if (!transform) return;
    if (isDragging) {
      props.startDraggingTransform();
    } else if (!isDragging) {
      props.stopDraggingTransform();
    }
  }, [transform, isDragging]);

  const opacity = useMemo(() => {
    if (isDragging) return 0.5;
    if (props.draggingTransform) return 0.8;
    return 1;
  }, [isDragging, props.draggingTransform]);

  const [holdingK, setHoldingK] = useState(false);

  useEventListeners(
    {
      k: {
        keydown: (e) => {
          if (isInputEvent(e)) return;
          setHoldingK(true);
        },
        keyup: (e) => {
          if (isInputEvent(e)) return;
          setHoldingK(false);
        },
      },
    },
    [holdingK]
  );

  const Transform = useMemo(() => {
    const chromaticTranspose = transform.chromaticTranspose || 0;
    const scalarTranspose = transform.scalarTranspose || 0;
    const chordalTranspose = transform.chordalTranspose || 0;
    return () => (
      <>
        <div
          className={`group rounded-t group relative flex flex-col justify-center items-center text-xs select-none bg-fuchsia-500`}
          style={{ height: Constants.TRANSPOSE_HEIGHT }}
        >
          <BsMagic className="text-md" />
          <label
            className={`absolute left-7 ${
              holdingK
                ? "visible"
                : props.isSelected
                ? "invisible group-hover:visible"
                : "hidden"
            } w-fit whitespace-nowrap px-2 z-20 flex items-center justify-center bg-fuchsia-700/80 backdrop-blur rounded-lg border`}
          >
            N{chromaticTranspose} • T{scalarTranspose} • t{chordalTranspose}
            {/* T{scalarTranspose} • t{chordalTranspose} */}
          </label>
        </div>
        <div
          className="bg-fuchsia-500/50 rounded-b"
          style={{ height: Constants.CELL_HEIGHT - Constants.TRANSPOSE_HEIGHT }}
        ></div>
      </>
    );
  }, [transform, holdingK, props.isSelected]);

  const onTransformClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (!transform) return;

    if (props.isSelected) {
      props.deselectTransform(transform.id);
      return;
    }

    const nativeEvent = e.nativeEvent as Event;
    const holdingShift = isHoldingShift(nativeEvent);

    // Select the transform if the user is not holding shift
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      props.selectTransform(transform.id, holdingOption);
      return;
    }

    // Just select the transform if there are no other selected transforms
    if (selectedTransformIds.length === 0) {
      props.selectTransform(transform.id);
      return;
    }

    // Get the last selected transform
    const lastId = selectedTransformIds.at(-1);
    const lastTransform = props.transforms.find((c) => c.id === lastId);
    if (!lastTransform) return;

    // Get the start and end index of the selection
    const startIndex = props.rows.findIndex(
      (row) => row.trackId === lastTransform?.trackId
    );
    const targetIndex = props.rows.findIndex(
      (row) => row.trackId === transform.trackId
    );

    // Get the trackIds of the selection
    const trackIds = props.rows
      .slice(
        Math.min(startIndex, targetIndex),
        Math.max(startIndex, targetIndex) + 1
      )
      .map((row) => row.trackId);

    // Get the transformIds of the selection
    const transformIds = props.transforms
      .filter((c) => trackIds.includes(c.trackId))
      .map((c) => c.id);

    // Compute the start and end time of the selection
    const startTime = lastTransform.time;
    const endTime = transform.time;

    // Filter the transformIds to only include transforms in the selection
    const newTransformIds = transformIds.filter((id) => {
      const transform = props.transforms.find((t) => t.id === id);
      if (!transform) return false;
      return transform.time >= startTime && transform.time <= endTime;
    });

    // Select the transforms
    props.selectTransforms(newTransformIds);
  };

  return (
    <div
      ref={drag}
      className={`absolute rdg-transform ${
        props.isSelected ? "ring-1 ring-white" : ""
      } rounded text-white w-full h-full cursor-pointer`}
      style={{
        top,
        left,
        width: cellWidth,
        height: Constants.CELL_HEIGHT,
        pointerEvents: props.draggingClip || props.addingClip ? "none" : "auto",
        opacity,
      }}
      onClick={onTransformClick}
    >
      <Transform />
    </div>
  );
}
