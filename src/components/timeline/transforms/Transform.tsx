import { connect, ConnectedProps } from "react-redux";

import { AppDispatch, RootState } from "redux/store";
import { TransformsProps } from ".";
import * as Constants from "appConstants";

import { useCallback, useMemo } from "react";

import { selectTransforms } from "redux/selectors/transforms";
import { Transform } from "types/transform";
import { selectRoot } from "redux/selectors";
import { BsMagic } from "react-icons/bs";

interface OwnClipProps extends TransformsProps {
  transform: Transform;
}

const mapStateToProps = (state: RootState, ownProps: OwnClipProps) => {
  const { rows, transform } = ownProps;
  const index = rows.findIndex((row) => row.trackId === transform.trackId);

  const width = Constants.CELL_WIDTH;
  const top = Constants.HEADER_HEIGHT + index * Constants.CELL_HEIGHT;
  const left = Constants.TRACK_WIDTH + Constants.CELL_WIDTH * transform.time;

  const transforms = selectTransforms(state);
  const { timelineState } = selectRoot(state);
  const addingClip = timelineState === "adding";

  return {
    ...ownProps,
    index,
    width,
    top,
    left,
    transforms,
    addingClip,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {};
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type TransformProps = ConnectedProps<typeof connector>;

export default connector(TimelineTransform);

function TimelineTransform(props: TransformProps) {
  if (props.index === -1) return null;
  const { transform } = props;
  const { top, left, width } = props;

  const Transform = useMemo(() => {
    return () => (
      <>
        <div
          className="bg-fuchsia-500/80 rounded-t group relative flex flex-col justify-center items-center text-xs select-none"
          style={{ height: Constants.TRANSPOSE_HEIGHT }}
        >
          <BsMagic className="text-md" />
          <label
            className={`group-hover:visible invisible absolute ${
              left === Constants.TRACK_WIDTH ? "left-0" : "left-7"
            } w-fit whitespace-nowrap px-2 z-30 flex items-center justify-center bg-gradient-to-t from-fuchsia-700/80 to-zinc-800 rounded border border-white/50`}
          >
            T{transform.scalarTranspose} • t{transform.chordalTranspose}
          </label>
        </div>
        <div
          className="border border-fuchsia-500 border-top-0 rounded-b"
          style={{ height: Constants.CELL_HEIGHT - Constants.TRANSPOSE_HEIGHT }}
        ></div>
      </>
    );
  }, [transform]);

  const onClick = useCallback(() => {
    props.deleteTransform(transform);
  }, [transform]);

  return (
    <div
      className={`absolute rdg-transform border-t border-t-white/20 text-white w-full h-full cursor-pointer`}
      style={{
        top,
        left,
        width,
        height: Constants.CELL_HEIGHT,
        pointerEvents: props.draggingClip || props.addingClip ? "none" : "auto",
      }}
      onClick={onClick}
    >
      <Transform />
    </div>
  );
}
