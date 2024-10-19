import { PoseEditorProps } from "../PoseEditor";
import classNames from "classnames";
import { useMemo, useRef, useState } from "react";
import {
  usePoseModuleDrag,
  usePoseModuleDrop,
} from "../hooks/usePoseModuleDnd";
import { BsX } from "react-icons/bs";
import { GiCrystalWand } from "react-icons/gi";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import { usePoseEditorVectorHotkeys } from "../hooks/usePoseEditorVectorHotkeys";
import { PoseEditorDurationMenu } from "./PoseEditorDurationMenu";
import { PoseEditorOffsetMenu } from "./PoseEditorOffsetMenu";
import {
  getPoseVectorModuleAsJSX,
  getPoseBlockDurationAsString,
} from "types/Pose/PoseFunctions";
import { removePoseBlock } from "types/Pose/PoseSlice";
import { PoseOperation, PoseVectorId, Pose } from "types/Pose/PoseTypes";
import { selectTrackMap } from "types/Track/TrackSelectors";

export interface PoseEditorVectorProps extends PoseEditorProps {
  pose: Pose;
  module: PoseOperation;
  index: number;
  vectors: PoseOperation[];
  vectorKeys: PoseVectorId[];
  updateBlock: (block: PoseOperation) => void;
}

/** Display a vector module. */
export function PoseEditorVector(props: PoseEditorVectorProps) {
  const dispatch = useProjectDispatch();
  const { pose, module, index, isCustom } = props;
  const { toggleEditing, onDuration, onOffsets, onModule } = props;
  const trackMap = useProjectSelector(selectTrackMap);
  const isOnOffsets = onOffsets(index);
  const isOnDuration = onDuration(index);
  const isOnModule = onModule(index);

  // Unpack the pose and module
  const id = pose.id;
  const [vectorId, setVectorId] = useState<PoseVectorId>("chromatic");
  const moduleJSX = getPoseVectorModuleAsJSX(module, trackMap);
  const durationString = getPoseBlockDurationAsString(module);
  usePoseEditorVectorHotkeys({ ...props, vectorId, setVectorId });

  // Drag and drop
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = usePoseModuleDrag({ id, index });
  const [{}, drop] = usePoseModuleDrop({ id, index });
  drag(drop(ref));

  // The vector title displays the vector string.
  const Header = useMemo(() => {
    const headerClass = classNames(
      "flex flex-col w-full h-full rounded-lg",
      isOnModule ? "ring-2 ring-white/80" : "border-fuchsia-200/50"
    );
    const titleClass = classNames(
      "flex group items-center p-1 rounded-lg rounded-b-none w-full h-full font-nunito font-bold text-lg",
      "bg-gradient-to-t border border-slate-400 text-white",
      "cursor-pointer shadow whitespace-nowrap select-none",
      isOnOffsets ? "from-pink-600 to-pink-400" : "from-pink-500 to-pink-400"
    );
    const nameClass = classNames(
      "text-center text-sm text-white text-shadow-sm mr-2 font-semibold rounded-lg whitespace-nowrap"
    );
    const durationClass = classNames(
      "w-full text-slate-200/80 text-sm px-2 py-1 font-semibold border border-slate-400 border-t-0 rounded-lg rounded-t-none cursor-pointer",
      isOnDuration
        ? "bg-gradient-to-t from-slate-800 to-slate-950"
        : "bg-slate-900"
    );
    return (
      <div className={headerClass} ref={ref}>
        <div
          className={titleClass}
          onClick={() => toggleEditing({ index, type: "offsets" })}
        >
          <GiCrystalWand className="flex-shrink-0 mr-2" />
          <span className={nameClass}>{moduleJSX}</span>

          {!!isCustom && (
            <button
              className="border border-slate-300 hover:border-slate-50 opacity-0 group-hover:opacity-100 hover:text-slate-50 rounded-full text-slate-300 ml-auto flex-shrink-0 text-sm"
              onClick={() => id && dispatch(removePoseBlock({ id, index }))}
            >
              <BsX />
            </button>
          )}
        </div>
        <span
          className={durationClass}
          onClick={() => toggleEditing({ index, type: "duration" })}
        >
          {durationString}
        </span>
      </div>
    );
  }, [index, moduleJSX, durationString, isCustom]);

  // The body displays the pop up menus
  const bodyClass = classNames("size-full flex total-center rounded-lg", {
    "animate-in fade-in bg-slate-900/50": isOnModule,
  });
  const Body = (
    <div className={bodyClass}>
      {!isOnDuration && !isOnOffsets && (
        <div className="space-x-4 p-2 w-full h-full flex total-center group-hover:opacity-100 opacity-0 transition-opacity duration-300">
          <button
            className="flex-auto h-full text-center border border-slate-200/50 rounded"
            onClick={() => toggleEditing({ index, type: "offsets" })}
          >
            Edit Offsets
          </button>
          <button
            className="flex-auto h-full text-center border border-slate-200/50 rounded"
            onClick={() => toggleEditing({ index, type: "duration" })}
          >
            Edit Duration
          </button>
        </div>
      )}
      {isOnDuration && <PoseEditorDurationMenu {...props} />}
      {isOnOffsets && (
        <PoseEditorOffsetMenu
          {...props}
          vectorId={vectorId}
          setVectorId={setVectorId}
        />
      )}
    </div>
  );

  const className = classNames(
    "animate-in fade-in flex flex-1 group items-center duration-300 min-w-fit h-full gap-4 rounded text-xs",
    { "opacity-50": isDragging },
    isOnModule ? "z-40" : "z-30"
  );

  return (
    <div className={className}>
      {Header}
      {Body}
    </div>
  );
}
