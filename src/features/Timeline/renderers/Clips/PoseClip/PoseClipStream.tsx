// --------------------------------------------------------
// Order Effects
// --------------------------------------------------------

import { use, useProjectDispatch } from "types/hooks";
import { isPoseStreamModule, PoseBlock } from "types/Pose/PoseTypes";
import {
  PoseClipDropdownContainer,
  PoseClipDropdownEffectProps,
  PoseClipDropdownItem,
} from "./PoseClipDropdown";
import { PoseClipBaseEffect } from "./PoseClipStore";
import {
  addPoseBlock,
  removePoseBlock,
  swapPoseBlock,
  updatePoseBlock,
} from "types/Pose/PoseSlice";
import classNames from "classnames";
import { blurOnEnter, cancelEvent } from "utils/html";
import { numberToLower, sanitize } from "utils/math";
import { BsArrowLeft, BsArrowRight, BsTrash } from "react-icons/bs";
import { Menu } from "@headlessui/react";
import { useMemo, useState } from "react";
import { isFiniteNumber } from "types/util";
import { convertStringToTicks } from "types/Transport/TransportThunks";
import { omit } from "lodash";
import { PoseClipView } from "./usePoseClipRenderer";
import { selectPoseById } from "types/Pose/PoseSelectors";

export interface PoseClipStreamProps extends PoseClipDropdownEffectProps {
  block?: PoseBlock;
  index: number;
  setIndex: (index: number) => void;
  depths: number[];
  setDepths: React.Dispatch<React.SetStateAction<number[]>>;
  field: PoseClipView;
  setField: (field: PoseClipView) => void;
}

export const PoseClipStream = (props: PoseClipStreamProps) => {
  const { block, depths, setDepths, setField } = props;
  const dispatch = useProjectDispatch();
  const pose = use((_) => selectPoseById(_, props.clip.poseId));
  const stream = pose?.stream ?? [];
  const blockCount = stream.length;
  const depthCount = depths.length;

  // The idea here is we want to unfold the stream so that each block's
  // state persists and users have custom inputs for duration.
  // With that being said, we first mark the active blocks in the stream
  // that are found using the indices in the depths array.
  // Then, we attach a duration to the block so that users can edit it.
  // We then render the active blocks with the duration input.
  // We also need to account for the depth of the stream so that we can
  // render the correct block.

  const activeStream = useMemo(() => {
    let result = stream;
    if (!depths.length) return result;
    depths.forEach((index) => {
      if (!isFiniteNumber(index)) return;
      const newBlock = result[index];
      if (!newBlock || !("stream" in newBlock)) return;
      result = newBlock.stream;
    }, stream);

    return result;
  }, [depths, stream, block]);

  const activeLength = !!activeStream.length;
  const onStream =
    activeLength &&
    activeStream[props.index] &&
    "stream" in activeStream[props.index];

  return (
    <div className="flex gap-2 total-center">
      <PoseClipBaseEffect border="border-fuchsia-400">
        <PoseClipDropdownContainer>
          <PoseClipDropdownItem
            background={block ? "bg-fuchsia-500/60" : "opacity-50"}
            disabled={!block}
          >
            <div onClick={() => block && setField("vector")}>Edit Vector</div>
          </PoseClipDropdownItem>

          <PoseClipDropdownItem
            onClick={() =>
              dispatch(
                addPoseBlock({
                  id: props.clip.poseId,
                  block: { vector: {} },
                  index: props.index,
                  depths: props.depths,
                })
              )
            }
          >
            Add Vector
          </PoseClipDropdownItem>
          <PoseClipDropdownItem
            onClick={() => {
              if (onStream) {
                setDepths((prev) => [...prev, props.index]);
                props.setIndex(0);
              } else {
                dispatch(
                  updatePoseBlock({
                    id: props.clip.poseId,
                    depths: props.depths,
                    index: props.index,
                    block: { ...props.block, stream: [] },
                  })
                );
              }
            }}
          >
            {onStream ? "Edit Stream" : "Nest Vector"}
          </PoseClipDropdownItem>
          <PoseClipDropdownItem
            disabled={!depthCount}
            className={!depthCount ? "text-slate-400" : undefined}
            background={!!depthCount ? "bg-fuchsia-500/60" : undefined}
          >
            <div
              onClick={() => {
                if (depthCount && props.depths.length) {
                  setDepths((prev) => prev.slice(0, -1));
                }
              }}
            >
              {!!depthCount ? "Go Back" : "On Root Stream"}
            </div>
          </PoseClipDropdownItem>
        </PoseClipDropdownContainer>
      </PoseClipBaseEffect>
      {activeStream.map((block, i) =>
        !!activeLength ? (
          <PoseClipBlock
            key={i}
            {...props}
            block={block}
            streamIndex={i}
            blockCount={blockCount}
            onBlock={props.index === i}
            selectBlock={props.setIndex}
            depths={depths}
            streamDepth={depthCount}
            addDepth={(n) => setDepths((prev) => [...prev, n])}
            removeDepth={() => setDepths((prev) => prev.slice(0, -1))}
          />
        ) : (
          <PoseClipBaseEffect className="bg-slate-900 opacity-80 min-h-16 total-center">
            Empty Stream
          </PoseClipBaseEffect>
        )
      )}
    </div>
  );
};

export interface PoseClipBlockProps extends PoseClipStreamProps {
  block: PoseBlock | undefined;
  blockCount: number;
  streamIndex: number;
  streamDepth: number;
  onBlock: boolean;
  selectBlock: (index: number) => void;
  depths: number[];
  addDepth: (value: number) => void;
  removeDepth: (value: number) => void;
}

export const PoseClipBlock = (props: PoseClipBlockProps) => {
  const dispatch = useProjectDispatch();
  const { block } = props;

  const label = !!props.streamDepth
    ? `${props.depths[0] + 1}${props.depths
        .slice(1)
        .map(numberToLower)
        .join("")}${block ? numberToLower(props.streamIndex) : ""}`
    : `${props.streamIndex + 1}`;

  const [duration, setDuration] = useState(
    block?.customDuration ??
      (isFiniteNumber(block?.duration) ? String(block?.duration) : "")
  );

  if (!block) return null;
  return (
    <PoseClipBaseEffect
      className={"flex total-center gap-1 justify-evenly cursor-pointer"}
      onClick={() => {
        props.selectBlock(props.streamIndex);
      }}
      border={props.onBlock ? "border-fuchsia-500" : undefined}
    >
      <div className="capitalize">
        {(props.blockCount > 1 || !!props.depths.length) && `(${label}) `}
        {isPoseStreamModule(props.block) ? "Stream" : "Vector"}
      </div>
      <input
        className={classNames(
          "w-24 text-center rounded-lg border-none bg-white/5 h-5 text-sm/6 text-white placeholder:text-slate-500",
          "focus:outline-none focus:outline-2 focus:-outline-offset-2 focus:-outline-white/25"
        )}
        value={duration}
        placeholder="Infinite"
        onKeyDown={blurOnEnter}
        onChange={(e) => {
          const string = e.currentTarget.value;
          const ticks = dispatch(convertStringToTicks(string));
          setDuration(string);
          if (ticks !== undefined) {
            dispatch(
              updatePoseBlock({
                id: props.clip.poseId,
                index: props.streamIndex,
                depths: props.depths,
                block: !isFiniteNumber(ticks)
                  ? omit(block, "duration")
                  : { ...block, duration: ticks, customDuration: string },
              })
            );
          }
        }}
      />
      <div
        className="flex size-full px-1 gap-4 items-center"
        onClick={cancelEvent}
      >
        <Menu>
          {({ close }) => (
            <>
              <Menu.Button className="mr-auto rounded-full size-5 text-fuchsia-300 total-center flex border border-white/10 ring-0 outline-none">
                {block.repeat || 1}
              </Menu.Button>
              <Menu.Items className="absolute top-28 border border-slate-300 bg-slate-800 rounded flex total-center gap-2 p-2">
                Repeat:{" "}
                <input
                  type="number"
                  className="bg-transparent rounded p-0 px-1 max-w-24 text-sm"
                  value={block.repeat || 1}
                  onChange={(e) => {
                    dispatch(
                      updatePoseBlock({
                        id: props.clip.poseId,
                        index: props.streamIndex,
                        depths: props.depths,
                        block: {
                          ...block,
                          repeat: sanitize(e.currentTarget.valueAsNumber),
                        },
                      })
                    );
                  }}
                  placeholder="Repeat"
                  onKeyDown={(e) => {
                    blurOnEnter(e);
                    if (e.key === "Enter") {
                      close();
                    }
                  }}
                />
              </Menu.Items>
            </>
          )}
        </Menu>
        {props.blockCount > 1 && (
          <>
            <BsArrowLeft
              className={
                props.index === 0
                  ? "opacity-25"
                  : "cursor-pointer active:opacity-75"
              }
              onClick={(e) => {
                cancelEvent(e);
                dispatch(
                  swapPoseBlock({
                    id: props.clip.poseId,
                    index: props.streamIndex,
                    newIndex: props.streamIndex - 1,
                    depths: props.depths,
                  })
                );
              }}
            />
            <BsArrowRight
              className={
                props.index === props.blockCount - 1
                  ? "opacity-25"
                  : "cursor-pointer active:opacity-75"
              }
              onClick={(e) => {
                cancelEvent(e);
                dispatch(
                  swapPoseBlock({
                    id: props.clip.poseId,
                    index: props.streamIndex,
                    newIndex: props.streamIndex + 1,
                    depths: props.depths,
                  })
                );
              }}
            />
          </>
        )}
        <BsTrash
          className="ml-auto cursor-pointer active:opacity-75"
          onClick={(e) => {
            cancelEvent(e);
            dispatch(
              removePoseBlock({
                id: props.clip.poseId,
                index: props.index,
                depths: props.depths,
              })
            );
          }}
        />
      </div>
    </PoseClipBaseEffect>
  );
};
