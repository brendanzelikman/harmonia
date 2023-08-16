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
import { selectPattern, selectRoot } from "redux/selectors";

import * as Root from "redux/slices/root";
import { PatternId } from "types/patterns";
import { ClipId } from "types/clips";
import { mergeClips, repeatClips } from "redux/thunks/clips";
import { useEffect, useRef, useState } from "react";
import { blurOnEnter, isInputEvent } from "appUtil";
import useEventListeners from "hooks/useEventListeners";

const mapStateToProps = (state: RootState) => {
  const root = selectRoot(state);
  const selectedPattern = root.activePatternId
    ? selectPattern(state, root.activePatternId)
    : undefined;
  return {
    ...root,
    selectedPattern,
    onEditor: root.editorState !== "hidden",
    onPatterns: root.editorState === "patterns",
    addingClip: root.timelineState === "adding",
    cuttingClip: root.timelineState === "cutting",
    transposingClip: root.timelineState === "transposing",
    repeatingClips: root.timelineState === "repeating",
    mergingClips: root.timelineState === "merging",
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    mergeClips: (ids: ClipId[]) => {
      dispatch(Root.toggleMergingClips());
      dispatch(mergeClips(ids));
    },
    repeatClips: (ids: ClipId[]) => {
      dispatch(Root.toggleRepeatingClips());
      dispatch(repeatClips(ids));
    },
    setScalarTranspose: (value: number) => {
      dispatch(Root.setScalarTranspose(value));
    },
    setChordalTranspose: (value: number) => {
      dispatch(Root.setChordalTranspose(value));
    },
    setChromaticTranspose: (value: number) => {
      dispatch(Root.setChromaticTranspose(value));
    },
    setRepeatCount: (value: number) => {
      dispatch(Root.setRepeatCount(value));
    },
    setMergeName: (value: string) => {
      dispatch(Root.setMergeName(value));
    },
    toggleAdding: () => {
      dispatch(Root.toggleAddingClip());
      dispatch(Root.hideEditor());
    },
    toggleCutting: () => {
      dispatch(Root.toggleCuttingClip());
      dispatch(Root.hideEditor());
    },
    toggleTransposing: () => {
      dispatch(Root.toggleTransposingClip());
      dispatch(Root.hideEditor());
    },
    toggleRepeating: () => {
      dispatch(Root.toggleRepeatingClips());
      dispatch(Root.hideEditor());
    },
    toggleRepeatTransforms: () => {
      dispatch(Root.toggleRepeatTransforms());
    },
    toggleRepeatWithTranspose: () => {
      dispatch(Root.toggleRepeatWithTranspose());
    },
    toggleMerging: () => {
      dispatch(Root.toggleMergingClips());
      dispatch(Root.hideEditor());
    },
    toggleMergeTransforms: () => {
      dispatch(Root.toggleMergeTransforms());
    },
    toggleMergeWithNewPattern: () => {
      dispatch(Root.toggleMergeWithNewPattern());
    },
    setActivePatternId: (id: PatternId) => {
      dispatch(Root.setActivePattern(id));
    },
    hideEditor: () => {
      dispatch(Root.hideEditor());
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
  const [transpose, setTranspose] = useState<TransposeState>({
    scalar: props.scalarTranspose ?? 0,
    chordal: props.chordalTranspose ?? 0,
    chromatic: props.chromaticTranspose ?? 0,
  });
  const setScalar = (value: number) =>
    setTranspose((prev) => ({ ...prev, scalar: value }));
  const setChordal = (value: number) =>
    setTranspose((prev) => ({ ...prev, chordal: value }));
  const setChromatic = (value: number) =>
    setTranspose((prev) => ({ ...prev, chromatic: value }));

  useEffect(() => {
    const { scalar, chordal, chromatic } = transpose;
    if (scalar !== props.scalarTranspose) {
      props.setScalarTranspose(scalar);
    }
    if (chordal !== props.chordalTranspose) {
      props.setChordalTranspose(chordal);
    }
    if (chromatic !== props.chromaticTranspose) {
      props.setChromaticTranspose(chromatic);
    }
  }, [transpose]);

  useEventListeners(
    {
      t: {
        keydown: (e) => {
          if (isInputEvent(e as KeyboardEvent)) return;
          props.toggleTransposing();
        },
      },
    },
    []
  );

  const AddPatternButton = () => (
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
        className="bg-cyan-700/80 px-2 backdrop-blur"
        show={!!props.addingClip}
        content={`Adding ${props.selectedPattern?.name ?? "Pattern"}`}
      />
    </div>
  );

  const CutPatternButton = () => (
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
        className="bg-slate-600/80 px-2 backdrop-blur"
        show={!!props.cuttingClip}
      />
    </div>
  );

  return (
    <div className="flex space-x-2">
      <AddPatternButton />
      <CutPatternButton />
      {/* Merge Clips */}
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
          className="bg-purple-800/70 backdrop-blur"
          show={!!props.mergingClips}
          content={<MergeTooltipContent {...props} />}
        />
      </div>
      {/* Repeat Clips */}
      <div className="flex flex-col relative h-full">
        <ControlButton
          label="Repeat Clips"
          onClick={props.toggleRepeating}
          className={`bg-emerald-700 ${
            props.repeatingClips
              ? "bg-emerald-600 ring-2 ring-offset-2 ring-emerald-600/80 ring-offset-black"
              : "bg-emerald-600/80"
          }`}
        >
          <BsClock className="p-0.5" />
        </ControlButton>
        <NavbarTooltip
          className="bg-emerald-700/80 backdrop-blur"
          show={!!props.repeatingClips}
          content={<RepeatTooltipContent {...props} />}
        />
      </div>
      {/* Transpose Clips/Patterns */}
      <div className="flex flex-col relative h-full">
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
          className="bg-fuchsia-800/80 backdrop-blur"
          show={!!props.transposingClip}
          content={
            <div className="flex flex-col justify-center items-center space-y-1">
              <label className="pb-1">Transposing Tracks/Clips</label>
              <NavbarFormGroup>
                <NavbarFormLabel className="inline-flex items-center">
                  <NavbarInfoTooltip
                    content="Steps along the chromatic scale"
                    className="mr-2"
                  />
                  Chromatic (N)
                </NavbarFormLabel>
                <NavbarFormInput
                  className="w-16 text-sm"
                  value={transpose.chromatic}
                  type="number"
                  onChange={(e: any) => setChromatic(e.target.value)}
                  onKeyDown={blurOnEnter}
                />
              </NavbarFormGroup>
              <NavbarFormGroup>
                <NavbarFormLabel className="inline-flex items-center">
                  <NavbarInfoTooltip
                    content="Steps along the track scale"
                    className="mr-2"
                  />
                  Scalar (T)
                </NavbarFormLabel>
                <NavbarFormInput
                  className="w-16 text-sm"
                  value={transpose.scalar}
                  type="number"
                  onChange={(e: any) => setScalar(e.target.value)}
                  onKeyDown={blurOnEnter}
                />
              </NavbarFormGroup>
              <NavbarFormGroup>
                <NavbarFormLabel className="inline-flex items-center">
                  <NavbarInfoTooltip
                    content="Steps along the chord"
                    className="mr-2"
                  />{" "}
                  Chordal (t)
                </NavbarFormLabel>
                <NavbarFormInput
                  className="w-16 text-sm"
                  value={transpose.chordal}
                  type="number"
                  onChange={(e: any) => setChordal(e.target.value)}
                  onKeyDown={blurOnEnter}
                />
              </NavbarFormGroup>
            </div>
          }
        />
      </div>
    </div>
  );
}

function MergeTooltipContent(props: Props) {
  const [mergeNameInput, setMergeNameInput] = useState<string>("");
  useEffect(() => {
    props.setMergeName(mergeNameInput);
  }, [mergeNameInput]);

  return (
    <div className="flex flex-col justify-center items-center">
      <label className="pb-2">Merging Pattern Clips</label>
      <NavbarFormGroup className="pb-2">
        <NavbarFormLabel className="pr-2">Name</NavbarFormLabel>
        <NavbarFormInput
          className="ml-auto w-36 text-sm"
          placeholder="New Pattern"
          type="text"
          value={`${mergeNameInput}` ?? ""}
          onChange={(e: any) => setMergeNameInput(e.target.value)}
          onKeyDown={blurOnEnter}
        />
      </NavbarFormGroup>
      <NavbarFormGroup className="pb-3">
        <NavbarFormLabel>Merge Transpositions?</NavbarFormLabel>
        <NavbarFormInput
          className="w-6 h-[24px] rounded-full focus:ring-0 focus:outline-none"
          type="checkbox"
          checked={props.mergeTransforms}
          onChange={props.toggleMergeTransforms}
        />
      </NavbarFormGroup>
      {/* <NavbarFormGroup className="pb-3">
        <NavbarFormLabel>Create New Pattern?</NavbarFormLabel>
        <NavbarFormInput
          className="w-6 h-[24px] rounded-full focus:ring-0 focus:outline-none"
          type="checkbox"
          checked={props.mergeWithNewPattern}
          onChange={props.toggleMergeWithNewPattern}
        />
      </NavbarFormGroup> */}
      <NavbarFormGroup>
        <button
          className={`w-full border px-3 py-1 rounded-lg appearance-none text-sm ${
            !props.selectedClipIds.length
              ? "opacity-50 cursor-default"
              : "opacity-100 cursor-pointer animate-pulse bg-purple-600"
          }`}
          disabled={!props.selectedClipIds.length}
          onClick={() => props.mergeClips(props.selectedClipIds)}
        >
          {!props.selectedClipIds.length
            ? "Select 1+ Clips"
            : "Merge Selected Clips"}
        </button>
      </NavbarFormGroup>
    </div>
  );
}

function RepeatTooltipContent(props: Props) {
  return (
    <div className="flex flex-col justify-center items-center">
      <label className="pb-2">Repeating Pattern Clips</label>
      <NavbarFormGroup className="pb-2">
        <NavbarFormLabel>Count</NavbarFormLabel>
        <NavbarFormInput
          className="w-16"
          type="number"
          value={props.repeatCount}
          onChange={(e: any) => props.setRepeatCount(e.target.value)}
        />
      </NavbarFormGroup>
      <NavbarFormGroup className="pb-3">
        <NavbarFormLabel>Copy Transpositions?</NavbarFormLabel>
        <NavbarFormInput
          className="w-6 h-[24px] rounded-full focus:ring-0 focus:outline-none"
          type="checkbox"
          checked={!!props.repeatTransforms}
          onChange={() => {
            props.toggleRepeatTransforms();
            if (props.repeatWithTranspose) {
              props.toggleRepeatWithTranspose();
            }
          }}
        />
      </NavbarFormGroup>
      <NavbarFormGroup className="pb-3">
        <NavbarFormLabel
          className={`${
            !props.repeatTransforms ? "opacity-50 cursor-default" : ""
          }`}
        >
          Transpose Incrementally?
        </NavbarFormLabel>
        <NavbarFormInput
          className={`w-6 h-[24px] rounded-full focus:ring-0 focus:outline-none`}
          type="checkbox"
          checked={!!props.repeatWithTranspose}
          onChange={props.toggleRepeatWithTranspose}
          disabled={!props.repeatTransforms}
        />
      </NavbarFormGroup>
      <NavbarFormGroup>
        <button
          className={`w-full border px-3 py-1 rounded-lg appearance-none text-sm ${
            !props.selectedClipIds.length
              ? "opacity-50 cursor-default"
              : "opacity-100 cursor-pointer  bg-emerald-600 animate-pulse"
          }`}
          disabled={!props.selectedClipIds.length}
          onClick={() => props.repeatClips(props.selectedClipIds)}
        >
          {!props.selectedClipIds.length
            ? "Select 1+ Clips"
            : "Repeat Selected Clips"}
        </button>
      </NavbarFormGroup>
    </div>
  );
}

interface TransposeState {
  scalar: number;
  chordal: number;
  chromatic: number;
}
