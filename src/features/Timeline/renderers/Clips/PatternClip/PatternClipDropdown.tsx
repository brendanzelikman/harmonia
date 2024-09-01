import { use, useDeep, useProjectDispatch } from "types/hooks";
import { NoteCallback, useOSMD } from "lib/opensheetmusicdisplay";
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
import {
  addPatternNote,
  removePatternBlock,
  updatePattern,
} from "types/Pattern/PatternSlice";
import { addClip, updateClip } from "types/Clip/ClipSlice";
import { clearPattern, copyPattern } from "types/Pattern/PatternThunks";
import { BsEraser, BsPencil, BsRainbow, BsXCircle } from "react-icons/bs";
import { createPose } from "types/Pose/PoseThunks";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import {
  addClipIdsToSelection,
  removeClipIdsFromSelection,
} from "types/Timeline/thunks/TimelineSelectionThunks";
import {
  GiArrowCursor,
  GiCrystalWand,
  GiDramaMasks,
  GiHand,
  GiMusicalKeyboard,
  GiMusicalNotes,
  GiMusicSpell,
  GiPencilBrush,
  GiSprout,
  GiThorHammer,
} from "react-icons/gi";
import classNames from "classnames";
import { PatternClipRendererProps } from "./usePatternClipRenderer";
import { createUndoType } from "lib/redux";
import { nanoid } from "@reduxjs/toolkit";
import { useCallback, useMemo, useState } from "react";
import {
  streamTransformations,
  durationTransformations,
  Transformation,
  pitchTransformations,
  velocityTransformations,
} from "features/Editor/PatternEditor/tabs/PatternEditorTransformTab";
import { FaRuler } from "react-icons/fa";
import { EditorPiano } from "features/Editor/components/EditorPiano";
import { EighthNoteTicks } from "utils/durations";
import { DEFAULT_VELOCITY } from "utils/constants";
import { Sampler } from "tone";
import { showEditor } from "types/Editor/EditorThunks";
import {
  selectScaleTrackById,
  selectTrackById,
  selectTrackMidiScale,
} from "types/Track/TrackSelectors";
import { getDegreeOfNoteInTrack } from "types/Track/TrackThunks";
import {
  isScaleTrackId,
  ScaleTrackId,
} from "types/Track/ScaleTrack/ScaleTrackTypes";

export interface PatternClipDropdownProps extends PatternClipRendererProps {
  poseClipId?: PoseClipId;
}

export function PatternClipDropdown(props: PatternClipDropdownProps) {
  const { clip, portaledClip, isSelected, isLive, poseClipId } = props;
  const { id, trackId, tick } = clip;
  const dispatch = useProjectDispatch();
  const isPosed = !!poseClipId;
  const [transform, setTransform] = useState(0);

  // Get the pattern, stream, and score
  const pattern = useDeep((_) => selectPatternById(_, clip.patternId));
  const stream = useDeep((_) =>
    selectPatternClipMidiStream(_, portaledClip?.id)
  );
  const track = useDeep((_) => selectTrackById(_, trackId));
  const xml = use((_) => selectPatternClipXML(_, portaledClip));
  const [editState, setEditState] = useState(0);
  const isAdding = editState === 1;
  const isRemoving = editState === 2;
  const noteClasses = useMemo(() => ["cursor-pointer"], []);

  const toggleAdding = () => setEditState((prev) => (prev !== 1 ? 1 : 0));
  const toggleRemoving = () => setEditState((prev) => (prev !== 2 ? 2 : 0));
  const onNoteClick = useCallback<NoteCallback>(
    (_, index) => {
      if (isRemoving) {
        dispatch(removePatternBlock({ id: pattern.id, index }));
      }
    },
    [isRemoving]
  );
  const scale = useDeep((_) => selectTrackMidiScale(_, trackId));
  const scaleId = use(
    (_) =>
      selectScaleTrackById(
        _,
        isScaleTrackId(trackId) ? trackId : (track?.parentId as ScaleTrackId)
      )?.scaleId
  );
  const playNote = useCallback(
    (_: Sampler, MIDI: number) => {
      if (isAdding) {
        const note = {
          duration: EighthNoteTicks,
          MIDI,
          velocity: DEFAULT_VELOCITY,
        };
        const degree = dispatch(getDegreeOfNoteInTrack(trackId, note));
        if (degree < 0) {
          dispatch(addPatternNote({ data: { id: pattern.id, note } }));
        } else {
          const octave = Math.floor(MIDI - scale[degree]) / 12;
          dispatch(
            addPatternNote({
              data: {
                id: pattern.id,
                note: {
                  degree,
                  offset: { octave },
                  scaleId,
                  duration: EighthNoteTicks,
                  velocity: DEFAULT_VELOCITY,
                },
              },
            })
          );
        }
      }
    },
    [isAdding]
  );
  const { score } = useOSMD({
    id: `pattern_clip_${id}_score`,
    xml,
    className: "size-full",
    stream,
    noteClasses,
    noteColor: isRemoving ? "fill-red-500" : "fill-black",
    onNoteClick,
  });

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
    return <ScoreButton label="Copy" onClick={onClick} icon={<GiSprout />} />;
  };

  // Each pattern clip can have its editor opened
  const [editing, setEditing] = useState(false);
  const EditButton = () => {
    const onClick = () => {
      if (editing) setEditState(0);
      setEditing(!editing);
    };
    return (
      <ScoreButton
        label={editing ? "Close" : "Sketch"}
        buttonClass={editing ? "bg-emerald-500/80 border-emerald-200/50" : ""}
        onClick={onClick}
        icon={editing ? <BsXCircle /> : <BsPencil />}
      />
    );
  };

  const EditorButton = () => {
    const onClick = () => dispatch(showEditor({ data: { view: "pattern" } }));
    return (
      <ScoreButton
        label="Edit"
        buttonClass="active:bg-emerald-400/50 active:border-emerald-300"
        onClick={onClick}
        icon={<BsRainbow />}
      />
    );
  };

  const ClearButton = () => {
    const onClick = () => dispatch(clearPattern(pattern.id));
    return (
      <ScoreButton
        label="Clear"
        buttonClass="active:bg-slate-400/50 active:border-slate-300"
        onClick={onClick}
        icon={<BsEraser />}
      />
    );
  };

  // Each pattern clip can be transformed through a dropdown button
  const [transforming, setTransforming] = useState(false);
  const TransformButton = () => {
    const onClick = () => {
      if (transforming) setTransform(0);
      setTransforming(!transforming);
    };
    return (
      <ScoreButton
        label={transforming ? "Close" : "Transform"}
        buttonClass={
          transforming ? "bg-emerald-500/80 border-emerald-200/50" : ""
        }
        onClick={onClick}
        icon={transforming ? <BsXCircle /> : <GiPencilBrush />}
      />
    );
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

    const label = isLive ? "Posing" : isPosed ? "Pose" : "Stage";
    const Icon = isLive ? GiCrystalWand : isPosed ? GiHand : GiDramaMasks;
    return (
      <ScoreButton
        label={label}
        buttonClass={isLive ? "bg-fuchsia-400/80 border-fuchsia-200/80" : ""}
        onClick={onClick}
        icon={<Icon />}
      />
    );
  };

  // Compile the classname
  const className = classNames(
    "w-full max-w-[635px] cursor-default z-20 font-thin backdrop-blur whitespace-nowrap",
    "bg-teal-950/50 border-2 animate-in fade-in p-4 gap-6 flex flex-col rounded-b-lg",
    isSelected ? "border-slate-100" : "border-teal-500"
  );

  const AddButton = () => (
    <ScoreButton
      label={isAdding ? "Adding" : "Add"}
      buttonClass={isAdding ? "bg-emerald-500/80 border-emerald-200/80" : ""}
      onClick={toggleAdding}
      icon={<GiMusicalKeyboard />}
    />
  );

  const RemoveButton = () => (
    <ScoreButton
      label={isRemoving ? "Removing" : "Remove"}
      buttonClass={isRemoving ? "bg-red-400/80 border-red-200/80" : ""}
      onClick={toggleRemoving}
      icon={<GiArrowCursor />}
    />
  );

  // Render the score dropdown
  return (
    <div className={className} onClick={cancelEvent}>
      <div className="flex gap-16 text-xs text-white">
        <div className="relative flex flex-col gap-2">{PatternName}</div>
        <div className="flex gap-3 px-3">
          <>
            {!transforming ? (
              <>
                {EditButton()}
                {!editing ? (
                  <>
                    {CopyButton()}
                    {EditorButton()}
                    {PoseButton()}
                  </>
                ) : (
                  <>
                    {AddButton()}
                    {RemoveButton()}
                    {ClearButton()}
                  </>
                )}
              </>
            ) : (
              <>
                <Transformations
                  label="Stream"
                  icon={<GiMusicalNotes />}
                  transformations={streamTransformations(pattern?.id)}
                  show={transform === 2}
                  toggle={() => setTransform((prev) => (prev !== 2 ? 2 : 0))}
                />
                <Transformations
                  label="Pitch"
                  icon={<GiMusicSpell />}
                  transformations={pitchTransformations(pattern?.id)}
                  show={transform === 3}
                  toggle={() => setTransform((prev) => (prev !== 3 ? 3 : 0))}
                />
                <Transformations
                  label="Velocity"
                  icon={<GiThorHammer />}
                  transformations={velocityTransformations(pattern?.id)}
                  show={transform === 4}
                  toggle={() => setTransform((prev) => (prev !== 4 ? 4 : 0))}
                />
                <Transformations
                  label="Duration"
                  icon={<FaRuler />}
                  transformations={durationTransformations(pattern?.id)}
                  show={transform === 5}
                  toggle={() => setTransform((prev) => (prev !== 5 ? 5 : 0))}
                />
              </>
            )}
            {TransformButton()}
          </>
        </div>
      </div>
      <div className="bg-white overflow-scroll min-h-[100px] max-h-full rounded-lg border-2 border-teal-200">
        {score}
      </div>
      {editing && (
        <div className="animate-in fade-in slide-in-from-top-10 slide-in-from-left-12">
          <EditorPiano
            show
            noteRange={["C2", "C8"]}
            playNote={playNote}
            className={classNames(
              "border-t-8",
              isAdding ? "border-t-emerald-500" : "border-t-emerald-500/0"
            )}
          />
        </div>
      )}
    </div>
  );
}

const ScoreButton = (props: {
  label?: React.ReactNode;
  labelClass?: string;
  onClick?: (e: ButtonMouseEvent) => void;
  buttonClass?: string;
  dropdown?: React.ReactNode;
  icon?: React.ReactNode;
  show?: boolean;
}) => {
  return (
    <div className="flex flex-col min-w-[55px] gap-2 total-center relative">
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
            "p-1 px-3 border border-teal-300 bg-teal-800/80 text-sm rounded-lg text-white"
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

const Transformations = (props: {
  transformations: Transformation[];
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
          {props.transformations.map((props) => (
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
