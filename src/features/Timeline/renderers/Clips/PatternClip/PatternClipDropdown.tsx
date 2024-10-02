import { useDeep, useProjectDispatch } from "types/hooks";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { PortaledPoseClipId } from "types/Clip/ClipTypes";
import {
  blurOnEnter,
  ButtonMouseEvent,
  cancelEvent,
  isHoldingShift,
} from "utils/html";
import { updatePattern } from "types/Pattern/PatternSlice";
import { BsPencil, BsXCircle } from "react-icons/bs";
import {
  GiCrystalWand,
  GiHand,
  GiMusicalNotes,
  GiMusicSpell,
  GiPencilBrush,
  GiSprout,
  GiThorHammer,
} from "react-icons/gi";
import classNames from "classnames";
import { PatternClipRendererProps } from "./usePatternClipRenderer";
import { useState } from "react";
import {
  streamTransformations,
  durationTransformations,
  DropdownOption,
  pitchTransformations,
  velocityTransformations,
} from "features/Editor/PatternEditor/tabs/PatternEditorTransformTab";
import { FaRuler } from "react-icons/fa";
import {
  inputPatternStream,
  migrateClip,
  preparePatternClip,
} from "types/Clip/ClipThunks";
import { PatternClipScore } from "./PatternClipScore";
import { PatternClipPiano } from "./PatternClipPiano";
import { BiEraser, BiPencil } from "react-icons/bi";
import { clearPattern } from "types/Pattern/PatternThunks";

export interface PatternClipDropdownProps extends PatternClipRendererProps {
  poseClipId?: PortaledPoseClipId;
}

export function PatternClipDropdown(props: PatternClipDropdownProps) {
  const { clip, portaledClip, isSelected, isLive, poseClipId } = props;
  const dispatch = useProjectDispatch();
  const isPosed = !!poseClipId;
  const pattern = useDeep((_) => selectPatternById(_, clip.patternId));
  const isEmpty = !pattern.stream.length;

  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transform, setTransform] = useState(0);

  // Compile the classname
  const className = classNames(
    "w-full max-w-[635px] cursor-default z-20 font-thin backdrop-blur whitespace-nowrap",
    "bg-teal-950/50 border-2 animate-in fade-in p-4 gap-6 flex flex-col rounded-b-lg",
    isSelected ? "border-slate-100" : "border-teal-500"
  );

  // Render the score dropdown
  return (
    <div className={className} onClick={cancelEvent}>
      <div className="flex gap-16 text-xs text-white">
        <div className="relative flex flex-col gap-2">
          <div>Pattern Name:</div>
          <input
            className="bg-teal-700/25 px-2 placeholder:text-slate-400 border border-teal-300 focus:border-sky-300 focus:ring-sky-300 rounded-lg p-0 text-base text-center"
            value={pattern?.name ?? ""}
            placeholder={"Pattern Name"}
            onChange={(e) => {
              const data = { id: pattern?.id, name: e.target.value };
              dispatch(updatePattern({ data }));
            }}
            onClick={cancelEvent}
            onDoubleClick={cancelEvent}
            onKeyDown={blurOnEnter}
          />
        </div>
        <div className="flex gap-3 px-3">
          <>
            {!isTransforming ? (
              <>
                <ScoreButton
                  label={isAdding ? "Play a Note" : "Write"}
                  backgroundColor={isAdding ? "bg-emerald-400/80" : undefined}
                  borderColor={isAdding ? "border-emerald-200/80" : undefined}
                  onClick={(e) =>
                    isHoldingShift(e)
                      ? dispatch(inputPatternStream(pattern.id))
                      : setIsAdding((prev) => !prev)
                  }
                  icon={<BiPencil />}
                />
                <ScoreButton
                  label={isRemoving ? "Click a Note" : "Erase"}
                  buttonClass={isEmpty ? "cursor-default opacity-50" : ""}
                  backgroundColor={isRemoving ? "bg-red-400/80" : undefined}
                  borderColor={isRemoving ? "border-red-200/80" : undefined}
                  onClick={(e) =>
                    !isEmpty &&
                    (isHoldingShift(e)
                      ? dispatch(clearPattern(pattern.id))
                      : setIsRemoving((prev) => !prev))
                  }
                  icon={<BiEraser />}
                />

                <ScoreButton
                  label={isLive ? "Posing" : isPosed ? "Pose" : "Stage"}
                  backgroundColor={isLive ? "bg-fuchsia-400/80" : undefined}
                  borderColor={isLive ? "border-fuchsia-200/80" : undefined}
                  onClick={() =>
                    dispatch(preparePatternClip({ data: portaledClip }))
                  }
                  icon={isPosed ? <GiCrystalWand /> : <GiHand />}
                />
                <ScoreButton
                  label="Copy"
                  backgroundColor={"bg-teal-800/80 active:bg-teal-400/80"}
                  onClick={() => dispatch(migrateClip({ data: clip }))}
                  icon={<GiSprout />}
                />
              </>
            ) : (
              <>
                <DropdownButton
                  label="Stream"
                  icon={<GiMusicalNotes />}
                  options={streamTransformations(pattern?.id)}
                  show={transform === 2}
                  toggle={() => setTransform((prev) => (prev !== 2 ? 2 : 0))}
                />
                <DropdownButton
                  label="Pitch"
                  icon={<GiMusicSpell />}
                  options={pitchTransformations(pattern?.id)}
                  show={transform === 3}
                  toggle={() => setTransform((prev) => (prev !== 3 ? 3 : 0))}
                />
                <DropdownButton
                  label="Velocity"
                  icon={<GiThorHammer />}
                  options={velocityTransformations(pattern?.id)}
                  show={transform === 4}
                  toggle={() => setTransform((prev) => (prev !== 4 ? 4 : 0))}
                />
                <DropdownButton
                  label="Duration"
                  icon={<FaRuler />}
                  options={durationTransformations(pattern?.id)}
                  show={transform === 5}
                  toggle={() => setTransform((prev) => (prev !== 5 ? 5 : 0))}
                />
              </>
            )}
            <ScoreButton
              label={isTransforming ? "Close" : "Transform"}
              backgroundColor={isTransforming ? "bg-emerald-500/80" : undefined}
              borderColor={isTransforming ? "border-emerald-200/50" : undefined}
              onClick={() => {
                if (isTransforming) setTransform(0);
                setIsTransforming(!isTransforming);
              }}
              icon={isTransforming ? <BsXCircle /> : <GiPencilBrush />}
            />
          </>
        </div>
      </div>
      <PatternClipScore
        {...props}
        isRemoving={isRemoving}
        stopRemoving={() => setIsRemoving(false)}
      />
      {isAdding && <PatternClipPiano {...props} isAdding={isAdding} />}
    </div>
  );
}

const ScoreButton = (props: {
  label?: React.ReactNode;
  labelClass?: string;
  onClick?: (e: ButtonMouseEvent) => void;
  buttonClass?: string;
  borderColor?: string;
  backgroundColor?: string;
  dropdown?: React.ReactNode;
  icon?: React.ReactNode;
  show?: boolean;
}) => {
  return (
    <div className="flex flex-col w-14 gap-2 total-center relative">
      {props.show && props.dropdown ? (
        <div className="absolute animate-in fade-in top-14 z-10 bg-teal-900/90 backdrop-blur border border-teal-500 rounded-lg gap-2">
          {props.dropdown}
        </div>
      ) : null}
      {props.label ? (
        <button
          className={props.labelClass}
          onClick={!props.icon ? props.onClick : cancelEvent}
        >
          {props.label}
        </button>
      ) : null}
      {props.icon ? (
        <button
          className={classNames(
            props.buttonClass,
            props.borderColor ?? "border-teal-300",
            props.backgroundColor ?? "bg-teal-800/80",
            "p-1 px-3 border text-sm rounded-lg text-white"
          )}
          onClick={(e) => {
            cancelEvent(e);
            props.onClick?.(e);
          }}
        >
          {props.icon}
        </button>
      ) : null}
    </div>
  );
};

const DropdownButton = (props: {
  options: DropdownOption[];
  icon?: React.ReactNode;
  label: string;
  show: boolean;
  toggle: () => void;
}) => {
  return (
    <ScoreButton
      label={props.label}
      labelClass="w-full rounded"
      icon={props.icon ?? <BsPencil />}
      onClick={props.toggle}
      show={props.show}
      dropdown={
        <div className="flex flex-col p-2 min-w-20 total-center gap-1">
          {props.options.map((props) => (
            <ScoreButton
              {...props}
              key={props.id}
              labelClass="hover:opacity-50 w-full"
            />
          ))}
        </div>
      }
    />
  );
};
