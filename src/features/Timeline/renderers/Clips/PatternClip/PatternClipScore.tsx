import { use, useProjectDispatch } from "types/hooks";
import { useOSMD } from "lib/opensheetmusicdisplay";
import {
  selectPatternClipMidiStream,
  selectPatternClipXML,
} from "types/Arrangement/ArrangementSelectors";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { initializePoseClip, PoseClipId } from "types/Clip/ClipTypes";
import {
  blurOnEnter,
  ButtonMouseEvent,
  cancelEvent,
  dispatchCustomEvent,
} from "utils/html";
import { updatePattern } from "types/Pattern/PatternSlice";
import { togglePatternEditor } from "types/Editor/EditorThunks";
import { addClip, updateClip } from "types/Clip/ClipSlice";
import { copyPattern } from "types/Pattern/PatternThunks";
import { BsPencil, BsStack } from "react-icons/bs";
import { createPose } from "types/Pose/PoseThunks";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import {
  addClipIdsToSelection,
  removeClipIdsFromSelection,
} from "types/Timeline/TimelineThunks";
import { GiCrystalWand, GiDramaMasks, GiHand } from "react-icons/gi";
import classNames from "classnames";
import { PatternClipRendererProps } from "../PatternClipRenderer";
import { createUndoType } from "lib/redux";
import { nanoid } from "@reduxjs/toolkit";

export interface PatternClipScoreProps extends PatternClipRendererProps {
  isLive: boolean;
  poseClipId?: PoseClipId;
}

export function PatternClipScore(props: PatternClipScoreProps) {
  const { clip, portaledClip, isSelected, isLive, poseClipId } = props;
  const { id, trackId, tick } = clip;
  const dispatch = useProjectDispatch();
  const isPosed = !!poseClipId;

  // Get the pattern, stream, and score
  const pattern = use((_) => selectPatternById(_, portaledClip.patternId));
  const stream = use((_) => selectPatternClipMidiStream(_, portaledClip?.id));
  const xml = use((_) => selectPatternClipXML(_, portaledClip));
  const { score } = useOSMD({ xml, stream });

  // Each pattern clip can have its pattern name edited
  const PatternName = (
    <>
      <div>Pattern Name:</div>
      <input
        className="bg-teal-700/25 px-2 placeholder:text-slate-400 border border-teal-300 focus:border-sky-300 focus:ring-sky-300 rounded-lg p-0 text-base text-center"
        value={pattern?.name ?? ""}
        placeholder={"Pattern Name"}
        onChange={(e) => {
          if (!pattern) return;
          const data = { id: pattern?.id, name: e.target.value };
          dispatch(updatePattern({ data }));
        }}
        onClick={cancelEvent}
        onDoubleClick={cancelEvent}
        onKeyDown={blurOnEnter}
      />
    </>
  );

  // Each pattern clip can be copied into a new pattern
  const CopyButton = () => {
    const onClick = () => {
      const undoType = createUndoType(`copy_pattern_clip${id}`, nanoid());
      const patternId = dispatch(copyPattern({ data: pattern, undoType }));
      dispatch(updateClip({ data: { id, patternId }, undoType }));
    };
    return <ScoreButton label="Copy" onClick={onClick} icon={<BsStack />} />;
  };

  // Each pattern clip can have its editor opened
  const EditButton = () => {
    if (!pattern) return null;
    const onClick = () => dispatch(togglePatternEditor(pattern.id));
    return <ScoreButton label="Edit" onClick={onClick} icon={<BsPencil />} />;
  };

  // Each pattern clip can be prepared for live posing
  const PoseButton = () => {
    if (!pattern) return null;

    const onClick = () => {
      const undoType = createUndoType(`pose_pattern_clip_${id}`, nanoid());

      // If the clip is live, deselect everything and close the pose dropdown
      if (isLive && poseClipId) {
        dispatch(setSelectedTrackId({ data: null, undoType }));
        dispatch(removeClipIdsFromSelection({ data: [poseClipId], undoType }));
        dispatchCustomEvent(`close_dropdown_${poseClipId}`, {});
        return;
      }

      // If the clip is posed, select the pose clip and open the dropdown
      if (isPosed && poseClipId) {
        dispatch(addClipIdsToSelection({ data: [poseClipId], undoType }));
        dispatch(setSelectedTrackId({ data: clip.trackId, undoType }));
        dispatchCustomEvent(`open_dropdown_${poseClipId}`, {});
        return;
      }

      // Otherwise, create a pose clip for the pattern clip
      const poseName = `${pattern.name ?? "Pattern"} Pose`;
      const poseId = dispatch(createPose({ data: { name: poseName } }));
      const poseClip = initializePoseClip({ trackId, tick, poseId });
      dispatch(addClip({ data: poseClip }));
    };

    const label = isLive ? "Live" : isPosed ? "Play" : "Pose";
    const Icon = isLive ? GiCrystalWand : isPosed ? GiHand : GiDramaMasks;
    return <ScoreButton label={label} onClick={onClick} icon={<Icon />} />;
  };

  // Compile the classname
  const className = classNames(
    "w-full cursor-default z-20 animate-in fade-in font-thin backdrop-blur whitespace-nowrap",
    "bg-teal-950/50 border-2 border-t-0 animate-in fade-in p-4 gap-6 flex flex-col rounded-b-lg",
    isSelected ? "border-slate-100" : "border-teal-500"
  );

  // Render the score dropdown
  return (
    <div className={className} onClick={cancelEvent}>
      <div className="flex gap-8 text-xs text-white">
        <div className="relative flex flex-col gap-2 mr-auto">
          {PatternName}
        </div>
        <div className="flex gap-3">
          <CopyButton />
          <EditButton />
          <PoseButton />
        </div>
      </div>
      <div className="bg-white max-h-full rounded-lg border-2 border-teal-200">
        {score}
      </div>
    </div>
  );
}

const ScoreButton = (props: {
  label: string;
  onClick: (e: ButtonMouseEvent) => void;
  buttonClass?: string;
  icon: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2 total-center">
    <div>{props.label}</div>
    <button
      className={
        props.buttonClass ??
        "p-1 px-3 border border-teal-300 hover:opacity-75 active:opacity-100 bg-teal-800/80 active:bg-teal-600 text-sm rounded-lg text-white"
      }
      onClick={(e) => {
        cancelEvent(e);
        props.onClick(e);
      }}
    >
      {props.icon}
    </button>
  </div>
);
