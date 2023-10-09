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
  selectRoot,
  selectScaleTrackMap,
  selectSelectedClips,
  selectSelectedPattern,
  selectSelectedTrack,
  selectSelectedTranspositions,
  selectTimeline,
  selectTrackParents,
} from "redux/selectors";
import * as Root from "redux/Root";
import * as Timeline from "redux/Timeline";
import { Clip } from "types/Clip";
import { mergeClips, repeatClips } from "redux/Media";
import { useMemo, useState } from "react";
import { hideEditor } from "redux/Editor";
import { Toolkit } from "types/Root";
import { Transition } from "@headlessui/react";
import { getChromaticOffset } from "types/Transposition";
import { getScaleTrackScale } from "types/ScaleTrack";
import {
  getTransposedScale,
  getScaleName,
  getScaleTag,
  Scale,
} from "types/Scale";
import { sanitizeNumber } from "utils";
import { useDeepEqualSelector } from "redux/hooks";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";

const mapStateToProps = (state: RootState) => {
  const root = selectRoot(state);
  const editor = selectEditor(state);
  const timeline = selectTimeline(state);
  const scaleTrackMap = selectScaleTrackMap(state);

  // Selected timeline objects
  const selectedTrack = selectSelectedTrack(state);
  const selectedPattern = selectSelectedPattern(state);
  const onScaleTrack = selectedTrack?.type === "scaleTrack";

  //Transposition offsets
  const { toolkit } = root;
  const offsets = Root.selectTranspositionOffsets(state);
  return {
    ...root,
    scaleTrackMap,
    selectedTrack,
    selectedPattern,
    toolkit,
    offsets,
    onScaleTrack,
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
    repeatClips: (clips: Clip[]) => {
      dispatch(Timeline.toggleRepeatingClips());
      dispatch(repeatClips(clips));
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

function PatternControl(props: Props) {
  const { selectedTrack, offsets, scaleTrackMap } = props;
  const {
    mergeName,
    mergeTranspositions,
    repeatCount,
    repeatTranspositions,
    repeatWithTransposition,
    transpositionDuration,
  } = props.toolkit;

  // Selected track info
  const parents = useDeepEqualSelector((state) =>
    selectTrackParents(state, selectedTrack?.id).slice(
      props.onScaleTrack ? 1 : 0
    )
  );
  const scales = parents.map((t) => getScaleTrackScale(t, scaleTrackMap));
  const scaleIds = parents.map((t) => t?.id);
  const chromaticTranspose = getChromaticOffset(offsets);

  // Transposition offsets
  const transposedScales = parents.map((scale) => {
    const trackScale = getScaleTrackScale(scale, scaleTrackMap);
    return getTransposedScale(trackScale, chromaticTranspose);
  });
  const scaleNames = transposedScales.map((transposedScale, i) => {
    const trackName = parents[i].name;
    if (trackName?.length) return trackName;
    return getScaleName(transposedScale || scales[i]);
  });

  const selectedClips = useDeepEqualSelector(selectSelectedClips);
  const selectedTranspositions = useDeepEqualSelector(
    selectSelectedTranspositions
  );
  const isLive = !!selectedTranspositions.length;

  const heldKeys = useHeldHotkeys(["q", "w", "s", "x", "e"]);
  // Handlers for updating transposition offsets
  const setTranspositionValue = (key: string) => (value: number) => {
    props.setToolkitValue("transpositionOffsets", {
      ...offsets,
      [key]: value,
    });
  };

  const setChromatic = setTranspositionValue("_chromatic");
  const setScalar = setTranspositionValue;
  const setChordal = setTranspositionValue("_self");

  // Add a clip of the selected pattern to the timeline
  const { addingClip, selectedPattern } = props;

  const AddClipButton = useMemo(
    () => (
      <div className="relative" id="add-pattern-button">
        <ControlButton
          label="Add Pattern Clip"
          className={`${
            addingClip
              ? "bg-cyan-700 ring-2 ring-offset-2 ring-cyan-600/80 ring-offset-black"
              : "bg-cyan-700/80"
          }`}
          onClick={props.toggleAdding}
        >
          <BsBrush className="p-0.5" />
        </ControlButton>
        <NavbarTooltip
          className="left-[-3rem] bg-cyan-700/80 px-2 backdrop-blur"
          show={!!addingClip}
          content={`Adding ${selectedPattern?.name ?? "Pattern"}`}
        />
      </div>
    ),
    [addingClip, selectedPattern]
  );

  // Cut the selected clip from the timeline
  const { cuttingClip } = props;

  const CutClipButton = useMemo(
    () => (
      <div className="relative">
        <ControlButton
          label="Cut Pattern Clip"
          className={`${
            cuttingClip
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
          show={!!cuttingClip}
        />
      </div>
    ),
    [cuttingClip]
  );

  // Merge the selected clips/transpositions into a new clip
  const { mergingClips } = props;

  const MergeClipsButton = useMemo(() => {
    // Name of the new merged clip
    const NameGroup = () => (
      <NavbarFormGroup>
        <NavbarFormLabel className="pr-2">Name</NavbarFormLabel>
        <NavbarFormInput
          className="mx-1 w-36 text-sm border-slate-400 focus:border-slate-200 focus:bg-indigo-800/80"
          placeholder="New Pattern"
          type="text"
          value={mergeName}
          onChange={(e) => props.setToolkitValue("mergeName", e.target.value)}
        />
      </NavbarFormGroup>
    );
    // True = include transpositions, false = only clips
    const MergeTranspositions = () => (
      <NavbarFormGroup>
        <NavbarFormLabel>Merge Transpositions?</NavbarFormLabel>
        <NavbarFormInput
          className="mx-1 w-6 h-[24px] rounded-full focus:border-slate-200 focus:outline-none"
          type="checkbox"
          checked={!!mergeTranspositions}
          onChange={() => props.toggleToolkitValue("mergeTranspositions")}
        />
      </NavbarFormGroup>
    );

    // Merge if at least one clip selected
    const MergeButton = () => (
      <NavbarFormGroup className="p-1">
        <button
          className={`w-full border px-3 py-1 rounded-lg appearance-none text-sm ${
            !selectedClips.length
              ? "opacity-50 cursor-default"
              : "opacity-100 cursor-pointer animate-pulse bg-purple-600"
          }`}
          disabled={!selectedClips.length}
          onClick={() => props.mergeClips(selectedClips)}
        >
          {!selectedClips.length ? "Select 1+ Clips" : "Merge Selected Clips"}
        </button>
      </NavbarFormGroup>
    );

    return (
      <div className="flex flex-col relative h-full">
        <ControlButton
          label="Merge Pattern Clips"
          onClick={props.toggleMerging}
          className={`${
            mergingClips
              ? "bg-purple-700 ring-2 ring-offset-2 ring-purple-700/80 ring-offset-black"
              : "bg-purple-700/80"
          }`}
        >
          <BsLink45Deg />
        </ControlButton>
        <NavbarTooltip
          className="left-[-6rem] bg-purple-800/90 backdrop-blur-lg w-[16rem]"
          show={!!mergingClips}
          content={
            <div className="flex flex-col justify-center items-center pt-1">
              <label className="h-7">Merging Pattern Clips</label>
              {NameGroup()}
              {MergeTranspositions()}
              {MergeButton()}
            </div>
          }
        />
      </div>
    );
  }, [mergingClips, mergeName, mergeTranspositions, selectedClips]);

  // Repeat the selected clips/transpositions
  const { repeatingClips } = props;

  const RepeatClipsButton = useMemo(() => {
    // How many times to repeat the clips
    const RepeatCount = () => (
      <NavbarFormGroup>
        <NavbarFormLabel>Count</NavbarFormLabel>
        <NavbarFormInput
          className="mx-1 w-16 border-slate-400 focus:border-slate-200 focus:bg-emerald-700/80"
          type="number"
          placeholder="0"
          value={repeatCount}
          onChange={(e: any) =>
            props.setToolkitValue("repeatCount", e.target.value)
          }
        />
      </NavbarFormGroup>
    );

    // True = include transpositions, false = only clips
    const RepeatTranspositions = () => (
      <NavbarFormGroup>
        <NavbarFormLabel>Copy Transpositions?</NavbarFormLabel>
        <NavbarFormInput
          className="mx-1 w-6 h-[24px] rounded-full border-slate-400 focus:ring-0 focus:outline-none"
          type="checkbox"
          checked={!!repeatTranspositions}
          onChange={() => {
            props.toggleToolkitValue("repeatTranspositions");
            if (repeatWithTransposition) {
              props.toggleToolkitValue("repeatWithTransposition");
            }
          }}
        />
      </NavbarFormGroup>
    );

    // True = increment each repeated transposition with toolkit value
    const IncrementTranspositions = () => (
      <NavbarFormGroup>
        <NavbarFormLabel
          className={`${
            !repeatTranspositions ? "opacity-50 cursor-default" : ""
          }`}
        >
          Transpose Incrementally?
        </NavbarFormLabel>
        <NavbarFormInput
          className={`mx-1 w-6 h-[24px] rounded-full border-slate-400 focus:ring-0 focus:outline-none`}
          type="checkbox"
          checked={!!repeatWithTransposition}
          onChange={() => props.toggleToolkitValue("repeatWithTransposition")}
          disabled={!repeatTranspositions}
        />
      </NavbarFormGroup>
    );

    // Repeat if at least one clip selected
    const RepeatButton = () => (
      <NavbarFormGroup className="p-1">
        <button
          className={`w-full border px-3 py-1 rounded-lg appearance-none text-sm ${
            !selectedClips.length
              ? "opacity-50 cursor-default border-slate-400"
              : "opacity-100 cursor-pointer bg-emerald-600 animate-pulse"
          }`}
          disabled={!selectedClips.length}
          onClick={() => {
            props.repeatClips(selectedClips);
            props.toggleRepeating();
          }}
        >
          {!selectedClips.length ? "Select 1+ Clips" : "Repeat Selected Clips"}
        </button>
      </NavbarFormGroup>
    );
    return (
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
          show={!!repeatingClips}
          content={
            <div className="flex flex-col justify-center items-center pt-1">
              <label className="w-full text-center h-7">
                Repeating Pattern Clips
              </label>
              {RepeatCount()}
              {RepeatTranspositions()}
              {IncrementTranspositions()}
              {RepeatButton()}
            </div>
          }
        />
      </div>
    );
  }, [
    repeatingClips,
    repeatCount,
    repeatTranspositions,
    repeatWithTransposition,
    selectedClips,
  ]);

  // Add a transposition to the timeline
  const { transposingClip } = props;

  const TransposeButton = useMemo(() => {
    // The chromatic offset
    const ChromaticOffset = () => (
      <NavbarFormGroup>
        <NavbarFormLabel className="inline-flex items-center">
          <NavbarInfoTooltip
            content="Steps along the chromatic scale"
            className="mr-2"
          />
          Chromatic Scale Offset
        </NavbarFormLabel>
        <NavbarFormInput
          className="w-16 focus:border-slate-200 border-slate-400"
          type="number"
          value={offsets._chromatic}
          placeholder={"0"}
          onChange={(e) => setChromatic(sanitizeNumber(e.target.valueAsNumber))}
        />
      </NavbarFormGroup>
    );

    // The scalar offsets
    const ScalarOffset = (_: any, i: number) => {
      const scaleTrack = parents[i];
      const scale = scales[i];
      const name = scaleNames[i];
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
            <NavbarFormInput
              className="w-16 focus:border-slate-200 border-slate-400"
              type="number"
              value={value}
              placeholder={"0"}
              onChange={(e) =>
                setScalar(scaleTrack.id)(sanitizeNumber(e.target.valueAsNumber))
              }
            />
          </NavbarFormGroup>
        </Transition>
      );
    };
    const ScalarOffsets = () => parents.map(ScalarOffset);

    // The chordal offset
    const ChordalOffset = () => (
      <NavbarFormGroup>
        <NavbarFormLabel className="inline-flex items-center">
          <NavbarInfoTooltip content="Steps along the chord" className="mr-2" />
          Pattern Scale Offset
        </NavbarFormLabel>
        <NavbarFormInput
          className="w-16 focus:border-slate-200 border-slate-400"
          type="number"
          value={offsets._self}
          placeholder={"0"}
          onChange={(e) => setChordal(sanitizeNumber(e.target.valueAsNumber))}
        />
      </NavbarFormGroup>
    );

    // The duration of the transposition (0 = continuous)
    const TranspositionDuration = () => (
      <NavbarFormGroup>
        <NavbarFormLabel className="inline-flex items-center">
          Duration
        </NavbarFormLabel>
        <NavbarFormInput
          className="w-16 focus:border-slate-200 border-slate-400"
          type="number"
          value={transpositionDuration}
          placeholder={"0"}
          onChange={(e) =>
            props.setToolkitValue(
              "transpositionDuration",
              e.target.valueAsNumber || 0
            )
          }
        />
      </NavbarFormGroup>
    );

    return (
      <div className="flex flex-col relative">
        <ControlButton
          label="Transpose Clip"
          onClick={props.toggleTransposing}
          className={`${
            transposingClip
              ? "bg-fuchsia-700 ring-2 ring-offset-2 ring-fuchsia-700/80 ring-offset-black"
              : "bg-fuchsia-700/80"
          }`}
        >
          <BsMagic className="-rotate-90 p-0.5" />
        </ControlButton>
        <NavbarTooltip
          className="-left-[9rem] bg-fuchsia-800/90 backdrop-blur-lg min-w-[20rem]"
          show={!!transposingClip}
          content={
            <div className="flex flex-col justify-center items-center pt-1 pr-2">
              <label className="w-full text-center h-7 text-md">
                Adding Transpositions
              </label>
              {ChromaticOffset()}
              {ScalarOffsets()}
              {ChordalOffset()}
              {TranspositionDuration()}
            </div>
          }
        />
      </div>
    );
  }, [
    parents,
    scales,
    scaleNames,
    offsets,
    transposingClip,
    transpositionDuration,
  ]);

  // The chromatic label
  const ChromaticLabel = (
    <>
      <span className={`${heldKeys.q ? "text-slate-50" : "text-slate-500"}`}>
        N
      </span>
      <span className="w-2">•</span>
    </>
  );

  // The scalar labels
  const ScalarLabel = (scale: Scale, i: number) => {
    const isHoldingW = i === 0 && heldKeys.w;
    const isHoldingS = i === 1 && heldKeys.s;
    const isHoldingX = i === 2 && heldKeys.x;
    const isHoldingKey = isHoldingW || isHoldingS || isHoldingX;
    const textColor = isHoldingKey ? "text-slate-50" : "text-slate-500";
    return (
      <span key={getScaleTag(scale)} className={`inline ${textColor}`}>
        T{scales.length > 1 ? i + 1 : ""} {i < scales.length - 1 ? "•" : ""}
      </span>
    );
  };
  const ScalarLabels = scales.length ? (
    <>
      {scales.map(ScalarLabel)}
      <span className="w-2">•</span>
    </>
  ) : null;

  const ChordalLabel = (
    <span className={`${heldKeys.e ? "text-slate-50" : "text-slate-500"}`}>
      t
    </span>
  );
  const LiveLabel = (
    <Transition
      show={isLive}
      enter="transition-all duration-300"
      enterFrom="opacity-0 scale-0"
      enterTo="opacity-100 scale-100"
      leave="transition-all duration-300"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-0"
      as="div"
      className="flex flex-col justify-center items-center pl-2 h-9 font-nunito font-light rounded-lg text-sm"
    >
      <label className="text-sm p-0 text-fuchsia-400">Live</label>
      <div className="flex text-xs space-x-1 text-slate-400 whitespace-nowrap">
        {ChromaticLabel}
        {ScalarLabels}
        {ChordalLabel}
      </div>
    </Transition>
  );

  return (
    <div className="flex space-x-2">
      {AddClipButton}
      {CutClipButton}
      {MergeClipsButton}
      {RepeatClipsButton}
      {TransposeButton}
      {LiveLabel}
    </div>
  );
}
