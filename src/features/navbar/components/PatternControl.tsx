import {
  BsBrush,
  BsClock,
  BsLink45Deg,
  BsMagic,
  BsScissors,
} from "react-icons/bs";
import { connect, ConnectedProps } from "react-redux";
import { RootState, AppDispatch } from "redux/store";
import {
  NavButton,
  NavbarFormGroup,
  NavbarFormInput,
  NavbarFormLabel,
  NavbarInfoTooltip,
  NavbarTooltip,
} from "./Navbar";
import {
  selectEditor,
  selectPattern,
  selectRoot,
  selectScaleTrackMap,
  selectSelectedClips,
  selectTimeline,
  selectTrackParents,
} from "redux/selectors";

import * as Root from "redux/slices/root";
import * as Timeline from "redux/slices/timeline";
import { Clip, ClipId } from "types/clip";
import { RepeatOptions, mergeClips, repeatClips } from "redux/thunks/clips";
import { FormEvent, forwardRef, useEffect, useMemo, useState } from "react";
import { blurOnEnter } from "utils";
import { hideEditor } from "redux/slices/editor";
import { Toolkit } from "types/root";
import { Transition } from "@headlessui/react";
import useKeyHolder from "hooks/useKeyHolder";
import {
  TranspositionOffsetRecord,
  getChromaticTranspose,
  getScalarTranspose,
} from "types/transposition";
import { getScaleName, getScaleTrackScale, transposeScale } from "types";

const mapStateToProps = (state: RootState) => {
  const root = selectRoot(state);
  const editor = selectEditor(state);
  const timeline = selectTimeline(state);
  const scaleTracks = selectScaleTrackMap(state);
  const selectedPattern = selectPattern(state, root.selectedPatternId);
  const selectedScaleTracks = selectTrackParents(state, root.selectedTrackId);
  const selectedTrackScales = selectedScaleTracks.map((track) =>
    getScaleTrackScale(track, { scaleTracks })
  );
  const selectedClips = selectSelectedClips(state);
  const { toolkit } = root;
  const { transpositionOffsets } = toolkit;
  const chromaticTranspose = getChromaticTranspose(transpositionOffsets);
  const scalarTransposes = selectedTrackScales.map((scale) =>
    getScalarTranspose(transpositionOffsets, scale?.id)
  );
  const chordalTranspose = getChromaticTranspose(transpositionOffsets);
  return {
    ...root,
    ...toolkit,
    selectedScaleTracks,
    selectedTrackScales,
    chromaticTranspose,
    scalarTransposes,
    chordalTranspose,
    selectedClipIds: root.selectedClipIds,
    selectedClips,

    selectedPattern,
    onEditor: editor.id !== "hidden",
    onPatterns: editor.id === "patterns",
    addingClip: timeline.state === "adding",
    cuttingClip: timeline.state === "cutting",
    transposingClip: timeline.state === "transposing",
    repeatingClips: timeline.state === "repeating",
    mergingClips: timeline.state === "merging",
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    setToolkitValue: (key: keyof Toolkit, value: any) => {
      dispatch(Root.setToolkitValue({ key, value }));
    },
    toggleToolkitValue: (key: keyof Toolkit) => {
      dispatch(Root.toggleToolkitValue(key));
    },
    toggleAdding: () => {
      dispatch(Timeline.toggleAddingClip());
      dispatch(hideEditor());
    },
    toggleCutting: () => {
      dispatch(Timeline.toggleCuttingClip());
      dispatch(hideEditor());
    },
    toggleMerging: () => {
      dispatch(Timeline.toggleMergingClips());
      dispatch(hideEditor());
    },
    toggleRepeating: () => {
      dispatch(Timeline.toggleRepeatingClips());
      dispatch(hideEditor());
    },
    toggleTransposing: () => {
      dispatch(Timeline.toggleTransposingClip());
      dispatch(hideEditor());
    },
    mergeClips: (clips: Clip[]) => {
      dispatch(Timeline.toggleMergingClips());
      dispatch(mergeClips(clips));
    },
    repeatClips: (ids: ClipId[], options?: RepeatOptions) => {
      dispatch(Timeline.toggleRepeatingClips());
      dispatch(repeatClips(ids, options));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(PatternControl);

const ControlButton = (props: {
  className?: string;
  children: any;
  onClick?: () => void;
  label?: string;
}) => (
  <NavButton
    {...props}
    className={`border border-slate-400/80 rounded-full flex flex-col justify-center items-center w-9 h-9 text-2xl whitespace-nowrap ${
      props.className ?? ""
    }`}
  >
    {props.children}
  </NavButton>
);

const RefInput = (props: any) => {
  return (
    <input
      {...props}
      className="h-8 block px-2 bg-transparent rounded-lg default:text-sm focus:outline-none focus:ring-0 appearance-none w-16 mx-1 text-sm placeholder:text-slate-400 border-slate-400 focus:border-slate-200 focus:bg-fuchsia-700/80"
      onKeyDown={blurOnEnter}
      type="number"
    />
  );
};

function PatternControl(props: Props) {
  const { selectedScaleTracks, selectedTrackScales } = props;
  const offsets = props.toolkit.transpositionOffsets;
  useEffect(() => {
    const newOffsets = Object.keys(offsets).reduce((acc, id) => {
      const value = offsets[id];
      if (selectedScaleTracks.find((track) => track.id === id)) {
        return { ...acc, [id]: value };
      } else {
        return acc;
      }
    }, {} as TranspositionOffsetRecord);
    if (Object.keys(newOffsets).length !== Object.keys(offsets).length) {
      props.setToolkitValue("transpositionOffsets", newOffsets);
    }
  }, [selectedScaleTracks, offsets]);

  const setChromatic = (value: number) => {
    props.setToolkitValue("transpositionOffsets", {
      ...props.transpositionOffsets,
      _chromatic: value,
    });
  };

  const setChordal = (value: number) => {
    props.setToolkitValue("transpositionOffsets", {
      ...props.transpositionOffsets,
      _self: value,
    });
  };

  const setScalar = (value: number, id: string) => {
    props.setToolkitValue("transpositionOffsets", {
      ...props.transpositionOffsets,
      [id]: value,
    });
  };

  const selectedScaleNames = useMemo(() => {
    if (!selectedTrackScales.length) return [];
    const transposedScales = selectedTrackScales.map((scale) =>
      transposeScale(scale, offsets._chromatic || 0)
    );
    return transposedScales.map((transposedScale, i) => {
      const trackName = selectedScaleTracks[i].name;
      if (trackName?.length) return trackName;
      return getScaleName(transposedScale || selectedTrackScales[i]);
    });
  }, [props.toolkit, selectedScaleTracks, selectedTrackScales]);

  const [mergeNameInput, setMergeNameInput] = useState("");
  useEffect(() => {
    props.setToolkitValue("mergeName", mergeNameInput);
  }, [mergeNameInput]);

  const AddClipButton = () => (
    <div className="relative" id="add-pattern-button">
      <ControlButton
        label="Add Pattern Clip"
        className={`${
          props.addingClip
            ? "bg-cyan-700 ring-2 ring-offset-2 ring-cyan-600/80 ring-offset-black"
            : "bg-cyan-700/80"
        }`}
        onClick={props.toggleAdding}
      >
        <BsBrush className="p-0.5" />
      </ControlButton>
      <NavbarTooltip
        className="left-[-3rem] bg-cyan-700/80 px-2 backdrop-blur"
        show={!!props.addingClip}
        content={`Adding ${props.selectedPattern?.name ?? "Pattern"}`}
      />
    </div>
  );

  const CutClipButton = () => (
    <div className="relative">
      <ControlButton
        label="Cut Pattern Clip"
        className={`${
          props.cuttingClip
            ? "bg-slate-600 ring-2 ring-offset-2 ring-slate-500/80 ring-offset-black"
            : "bg-slate-600/80"
        }`}
        onClick={props.toggleCutting}
      >
        <BsScissors />
      </ControlButton>
      <NavbarTooltip
        content="Cutting Pattern Clips"
        className="left-[-3rem] bg-slate-600/80 px-2 backdrop-blur"
        show={!!props.cuttingClip}
      />
    </div>
  );

  const MergeClipsButton = () => (
    <div className="flex flex-col relative h-full">
      <ControlButton
        label="Merge Pattern Clips"
        onClick={props.toggleMerging}
        className={`${
          props.mergingClips
            ? "bg-purple-700 ring-2 ring-offset-2 ring-purple-700/80 ring-offset-black"
            : "bg-purple-700/80"
        }`}
      >
        <BsLink45Deg />
      </ControlButton>
      <NavbarTooltip
        className="left-[-6rem] bg-purple-800/90 backdrop-blur-lg w-[16rem]"
        show={!!props.mergingClips}
        content={
          <div className="flex flex-col justify-center items-center">
            <label className="h-7">Merging Pattern Clips</label>
            <NavbarFormGroup>
              <NavbarFormLabel className="pr-2">Name</NavbarFormLabel>
              <NavbarFormInput
                className="mx-1 w-36 text-sm border-slate-400 focus:border-slate-200 focus:bg-indigo-800/80"
                placeholder="New Pattern"
                type="text"
                value={`${mergeNameInput}` ?? ""}
                onChange={(e: any) => setMergeNameInput(e.target.value)}
                onKeyDown={blurOnEnter}
              />
            </NavbarFormGroup>
            <NavbarFormGroup>
              <NavbarFormLabel>Merge Transpositions?</NavbarFormLabel>
              <NavbarFormInput
                className="mx-1 w-6 h-[24px] rounded-full focus:border-slate-200 focus:outline-none"
                type="checkbox"
                checked={!!props.mergeTranspositions}
                onChange={() => props.toggleToolkitValue("mergeTranspositions")}
              />
            </NavbarFormGroup>
            <NavbarFormGroup className="p-1">
              <button
                className={`w-full border px-3 py-1 rounded-lg appearance-none text-sm ${
                  !props.selectedClipIds.length
                    ? "opacity-50 cursor-default"
                    : "opacity-100 cursor-pointer animate-pulse bg-purple-600"
                }`}
                disabled={!props.selectedClipIds.length}
                onClick={() => props.mergeClips(props.selectedClips)}
              >
                {!props.selectedClipIds.length
                  ? "Select 1+ Clips"
                  : "Merge Selected Clips"}
              </button>
            </NavbarFormGroup>
          </div>
        }
      />
    </div>
  );

  const RepeatClipsButton = () => (
    <div className="flex flex-col relative">
      <ControlButton
        label="Repeat Clips"
        onClick={props.toggleRepeating}
        className={`${
          props.repeatingClips
            ? "bg-green-600 ring-2 ring-offset-2 ring-green-600/80 ring-offset-black"
            : "bg-green-600"
        }`}
      >
        <BsClock className="p-0.5" />
      </ControlButton>
      <NavbarTooltip
        className="-left-[9rem] bg-green-600/90 backdrop-blur w-[20rem]"
        show={!!props.repeatingClips}
        content={
          <div className="flex flex-col justify-center items-center py-1">
            <label className="w-full text-center h-7">
              Repeating Pattern Clips
            </label>
            <NavbarFormGroup>
              <NavbarFormLabel>Count</NavbarFormLabel>
              <NavbarFormInput
                className="mx-1 w-16 border-slate-400 focus:border-slate-200 focus:bg-emerald-700/80"
                type="number"
                value={props.repeatCount}
                onChange={(e: any) =>
                  props.setToolkitValue("repeatCount", e.target.value)
                }
                onKeyDown={blurOnEnter}
              />
            </NavbarFormGroup>
            <NavbarFormGroup>
              <NavbarFormLabel>Copy Transpositions?</NavbarFormLabel>
              <NavbarFormInput
                className="mx-1 w-6 h-[24px] rounded-full border-slate-400 focus:ring-0 focus:outline-none"
                type="checkbox"
                checked={!!props.repeatTranspositions}
                onChange={() => {
                  props.toggleToolkitValue("repeatTranspositions");
                  if (props.repeatWithTransposition) {
                    props.toggleToolkitValue("repeatWithTransposition");
                  }
                }}
              />
            </NavbarFormGroup>
            <NavbarFormGroup>
              <NavbarFormLabel
                className={`${
                  !props.repeatTranspositions ? "opacity-50 cursor-default" : ""
                }`}
              >
                Transpose Incrementally?
              </NavbarFormLabel>
              <NavbarFormInput
                className={`mx-1 w-6 h-[24px] rounded-full border-slate-400 focus:ring-0 focus:outline-none`}
                type="checkbox"
                checked={!!props.repeatWithTransposition}
                onChange={() =>
                  props.toggleToolkitValue("repeatWithTransposition")
                }
                disabled={!props.repeatTranspositions}
              />
            </NavbarFormGroup>
            <NavbarFormGroup className="p-1">
              <button
                className={`w-full border px-3 py-1 rounded-lg appearance-none text-sm ${
                  !props.selectedClipIds.length
                    ? "opacity-50 cursor-default border-slate-400"
                    : "opacity-100 cursor-pointer bg-emerald-600 animate-pulse"
                }`}
                disabled={!props.selectedClipIds.length}
                onClick={() => {
                  props.repeatClips(props.selectedClipIds);
                  props.toggleRepeating();
                }}
              >
                {!props.selectedClipIds.length
                  ? "Select 1+ Clips"
                  : "Repeat Selected Clips"}
              </button>
            </NavbarFormGroup>
          </div>
        }
      />
    </div>
  );

  const TransposeButton = () => (
    <div className="flex flex-col relative">
      <ControlButton
        label="Transpose Clip"
        onClick={props.toggleTransposing}
        className={`${
          props.transposingClip
            ? "bg-fuchsia-700 ring-2 ring-offset-2 ring-fuchsia-700/80 ring-offset-black"
            : "bg-fuchsia-700/80"
        }`}
      >
        <BsMagic className="-rotate-90 p-0.5" />
      </ControlButton>
      <NavbarTooltip
        className="-left-[9rem] bg-fuchsia-800/90 backdrop-blur-lg w-[20rem]"
        show={!!props.transposingClip}
        content={
          <div className="flex flex-col justify-center items-center py-1">
            <label className="w-full text-center h-7 text-md">
              Adding Transpositions
            </label>
            <NavbarFormGroup>
              <NavbarFormLabel className="inline-flex items-center">
                <NavbarInfoTooltip
                  content="Steps along the chromatic scale"
                  className="mr-2"
                />
                Chromatic Scale Offset
              </NavbarFormLabel>
              <RefInput
                value={offsets._chromatic}
                placeholder={0}
                onChange={(e: FormEvent<HTMLInputElement>) =>
                  setChromatic((e.target as HTMLInputElement).valueAsNumber)
                }
              />
            </NavbarFormGroup>
            {props.selectedScaleTracks.map((_, i) => {
              const scaleTrack = selectedScaleTracks[i];
              const scale = selectedTrackScales[i];
              const name = selectedScaleNames[i];
              const value = offsets[scaleTrack.id];
              if (!scaleTrack || !scale) return null;
              return (
                <Transition
                  key={scaleTrack.id}
                  show={!!scaleTrack}
                  enter="transition-all duration-150"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  as="div"
                  className="w-full"
                >
                  <NavbarFormGroup>
                    <NavbarFormLabel className="inline-flex items-center">
                      <NavbarInfoTooltip
                        content="Steps along the track scale"
                        className="mr-2"
                      />
                      {name} Offset
                    </NavbarFormLabel>
                    <RefInput
                      value={value}
                      placeholder={0}
                      onChange={(e: FormEvent<HTMLInputElement>) =>
                        setScalar(
                          (e.target as HTMLInputElement).valueAsNumber,
                          scaleTrack.id
                        )
                      }
                    />
                  </NavbarFormGroup>
                </Transition>
              );
            })}
            <NavbarFormGroup>
              <NavbarFormLabel className="inline-flex items-center">
                <NavbarInfoTooltip
                  content="Steps along the chord"
                  className="mr-2"
                />
                Pattern Scale Offset
              </NavbarFormLabel>
              <RefInput
                value={offsets._self}
                placeholder={0}
                onChange={(e: FormEvent<HTMLInputElement>) =>
                  setChordal((e.target as HTMLInputElement).valueAsNumber)
                }
              />
            </NavbarFormGroup>
            <NavbarFormGroup>
              <NavbarFormLabel className="inline-flex items-center">
                Duration
              </NavbarFormLabel>
              <RefInput
                value={props.transpositionDuration}
                placeholder={0}
                onChange={(e: FormEvent<HTMLInputElement>) =>
                  props.setToolkitValue(
                    "transpositionDuration",
                    (e.target as HTMLInputElement).valueAsNumber || 0
                  )
                }
              />
            </NavbarFormGroup>
          </div>
        }
      />
    </div>
  );

  const heldKeys = useKeyHolder(["q", "w", "s", "x", "e"]);

  return (
    <div className="flex space-x-2">
      {AddClipButton()}
      {CutClipButton()}
      {MergeClipsButton()}
      {RepeatClipsButton()}
      {TransposeButton()}
      <Transition
        show={
          !props.transposingClip && props.selectedTranspositionIds.length > 0
        }
        enter="transition-all duration-300"
        enterFrom="opacity-0 scale-0"
        enterTo="opacity-100 scale-100"
        leave="transition-all duration-300"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-0"
        as="div"
        className="flex flex-col items-center w-12 h-9 font-nunito font-light rounded-lg text-sm"
      >
        <label className="text-sm p-0 text-fuchsia-400">Live</label>
        <div className="flex text-xs space-x-1 text-slate-400">
          <span
            className={`${heldKeys.q ? "text-slate-50" : "text-slate-500"}`}
          >
            N
          </span>
          <span className="w-1">•</span>
          {selectedTrackScales.map((scale, i) => (
            <span
              key={`scale-${i}-${scale.notes.join(",")}`}
              className={`${
                heldKeys.w && scale ? "text-slate-50" : "text-slate-500"
              }`}
            >
              T
            </span>
          ))}
          <span className="w-1">•</span>
          <span
            className={`${heldKeys.e ? "text-slate-50" : "text-slate-500"}`}
          >
            t
          </span>
        </div>
      </Transition>
    </div>
  );
}
