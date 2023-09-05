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
  selectTimeline,
} from "redux/selectors";

import * as Root from "redux/slices/root";
import * as Timeline from "redux/slices/timeline";
import { ClipId } from "types/clips";
import { RepeatOptions, mergeClips, repeatClips } from "redux/thunks/clips";
import { forwardRef, useEffect, useRef, useState } from "react";
import { blurOnEnter, isInputEvent } from "appUtil";
import useEventListeners from "hooks/useEventListeners";
import { hideEditor } from "redux/slices/editor";
import { Toolkit } from "types/root";

const mapStateToProps = (state: RootState) => {
  const root = selectRoot(state);
  const editor = selectEditor(state);
  const timeline = selectTimeline(state);
  const { toolkit } = root;
  const selectedPattern = root.selectedPatternId
    ? selectPattern(state, root.selectedPatternId)
    : undefined;
  return {
    ...root,
    ...toolkit,
    selectedClipIds: root.selectedClipIds,
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
    mergeClips: (ids: ClipId[]) => {
      dispatch(Timeline.toggleMergingClips());
      dispatch(mergeClips(ids));
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

const RefInput = forwardRef(function RefInput(props: any, ref) {
  return (
    <input
      {...props}
      className="h-8 block px-2 bg-transparent rounded-lg default:text-sm focus:outline-none focus:ring-0 appearance-none w-16 mx-1 text-sm border-slate-400 focus:border-slate-200 focus:bg-fuchsia-700/80"
      onKeyDown={blurOnEnter}
      ref={ref}
      type="number"
    />
  );
});

function PatternControl(props: Props) {
  const chromaticTranspose = props.chromaticTranspose ?? 0;
  const scalarTranspose = props.scalarTranspose ?? 0;
  const chordalTranspose = props.chordalTranspose ?? 0;

  const [transpose, setTranspose] = useState<TransposeState>({
    scalar: `${scalarTranspose ?? 0}`,
    chordal: `${chordalTranspose ?? 0}`,
    chromatic: `${chromaticTranspose ?? 0}`,
  });

  const setScalar = (value: string) =>
    setTranspose((prev) => ({ ...prev, scalar: value }));
  const setChordal = (value: string) =>
    setTranspose((prev) => ({ ...prev, chordal: value }));
  const setChromatic = (value: string) =>
    setTranspose((prev) => ({ ...prev, chromatic: value }));

  useEffect(() => {
    const { chromatic, scalar, chordal } = transpose;
    if (parseInt(chromatic) !== chromaticTranspose) {
      if (chromatic === "e") return;
      const value = parseInt(chromatic);
      if (isNaN(value)) return;
      props.setToolkitValue("chromaticTranspose", value);
    }
    if (parseInt(scalar) !== scalarTranspose) {
      if (scalar === "e") return;
      const value = parseInt(scalar);
      if (isNaN(value)) return;
      props.setToolkitValue("scalarTranspose", value);
    }
    if (parseInt(chordal) !== chordalTranspose) {
      if (chordal === "e") return;
      const value = parseInt(chordal);
      if (isNaN(value)) return;
      props.setToolkitValue("chordalTranspose", value);
    }
  }, [
    transpose,
    chromaticTranspose,
    scalarTranspose,
    chordalTranspose,
    props.setToolkitValue,
  ]);

  const [holdingAlt, setHoldingAlt] = useState(false);

  const chromaticRef = useRef<HTMLInputElement>(null);
  const scalarRef = useRef<HTMLInputElement>(null);
  const chordalRef = useRef<HTMLInputElement>(null);

  useEventListeners(
    {
      Alt: {
        keydown: () => setHoldingAlt(true),
        keyup: () => setHoldingAlt(false),
      },
      // 1 = Focus Chromatic Input
      1: {
        keydown: (e) => {
          if (isInputEvent(e as KeyboardEvent)) return;
          setTimeout(() => {
            if (chromaticRef.current) {
              chromaticRef.current.focus();
              chromaticRef.current.select();
            }
          }, 10);
        },
      },
      // 2 = Focus Scalar Input
      2: {
        keydown: (e) => {
          if (isInputEvent(e as KeyboardEvent)) return;
          setTimeout(() => {
            if (scalarRef.current) {
              scalarRef.current.focus();
              scalarRef.current.select();
            }
          }, 10);
        },
      },
      // 3 = Focus Chordal Input
      3: {
        keydown: (e) => {
          if (isInputEvent(e as KeyboardEvent)) return;
          setTimeout(() => {
            if (chordalRef.current) {
              chordalRef.current.focus();
              chordalRef.current.select();
            }
          }, 10);
        },
      },
    },
    [chromaticRef, scalarRef, chordalRef]
  );

  const [mergeNameInput, setMergeNameInput] = useState("");
  useEffect(() => {
    props.setToolkitValue("mergeName", mergeNameInput);
  }, [mergeNameInput]);

  const values = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <div className="flex space-x-2">
      {/* Add Pattern Button */}
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
          className="left-[-2rem] bg-cyan-700/80 px-2 backdrop-blur"
          show={!!props.addingClip}
          content={`Adding ${props.selectedPattern?.name ?? "Pattern"}`}
        />
      </div>
      {/* Cut Pattern Button */}
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
          className="left-[-4rem] bg-purple-800/70 backdrop-blur"
          show={!!props.mergingClips}
          content={
            <div className="flex flex-col justify-center items-center">
              <label className="pb-2">Merging Pattern Clips</label>
              <NavbarFormGroup className="pb-2">
                <NavbarFormLabel className="pr-2">Name</NavbarFormLabel>
                <NavbarFormInput
                  className="ml-2 w-36 text-sm border-slate-400 focus:border-slate-200 focus:bg-indigo-800/80"
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
                  className="w-6 h-[24px] rounded-full focus:border-slate-200 focus:outline-none"
                  type="checkbox"
                  checked={!!props.mergeTransforms}
                  onChange={() => props.toggleToolkitValue("mergeTransforms")}
                />
              </NavbarFormGroup>
              <NavbarFormGroup className="p-1 pt-0">
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
          }
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
          className="left-[-8rem] bg-emerald-700/80 backdrop-blur w-[20rem]"
          show={!!props.repeatingClips}
          content={
            <div className="flex flex-col justify-center items-center">
              <label className="pt-1 pb-2">Repeating Pattern Clips</label>
              <NavbarFormGroup className="pb-2">
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
              <NavbarFormGroup className="pb-2">
                <NavbarFormLabel>Copy Transpositions?</NavbarFormLabel>
                <NavbarFormInput
                  className="mx-1 w-6 h-[24px] rounded-full border-slate-400 focus:ring-0 focus:outline-none"
                  type="checkbox"
                  checked={!!props.repeatTransforms}
                  onChange={() => {
                    props.toggleToolkitValue("repeatTransforms");
                    if (props.repeatWithTranspose) {
                      props.toggleToolkitValue("repeatWithTranspose");
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
                  className={`mx-1 w-6 h-[24px] rounded-full border-slate-400 focus:ring-0 focus:outline-none`}
                  type="checkbox"
                  checked={!!props.repeatWithTranspose}
                  onChange={() =>
                    props.toggleToolkitValue("repeatWithTranspose")
                  }
                  disabled={!props.repeatTransforms}
                />
              </NavbarFormGroup>
              <NavbarFormGroup className="p-1 pt-0">
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
      {/* Transpose Clips/Patterns */}
      <div className="flex flex-col relative h-full ">
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
          className="-left-[8rem] bg-fuchsia-700 backdrop-blur-lg w-[20rem]"
          show={!!props.transposingClip}
          content={
            <div className="flex flex-col justify-center items-center pb-1">
              <label className="w-full text-center pt-1 pb-2 mb-1 text-md">
                Transposing Tracks/Clips
              </label>
              <NavbarFormGroup className="w-full">
                <NavbarFormLabel className="inline-flex items-center">
                  <NavbarInfoTooltip
                    content="Steps along the chromatic scale"
                    className="mr-2"
                  />
                  Chromatic Offset (N)
                </NavbarFormLabel>
                <RefInput
                  ref={chromaticRef}
                  value={transpose.chromatic}
                  onChange={(e: any) => setChromatic(e.target.value)}
                />
              </NavbarFormGroup>
              <NavbarFormGroup className="my-1.5">
                <NavbarFormLabel className="inline-flex items-center">
                  <NavbarInfoTooltip
                    content="Steps along the track scale"
                    className="mr-2"
                  />
                  Scalar Offset (T)
                </NavbarFormLabel>
                <RefInput
                  ref={scalarRef}
                  value={transpose.scalar}
                  onChange={(e: any) => setScalar(e.target.value)}
                />
              </NavbarFormGroup>
              <NavbarFormGroup>
                <NavbarFormLabel className="inline-flex items-center">
                  <NavbarInfoTooltip
                    content="Steps along the chord"
                    className="mr-2"
                  />
                  Chordal Offset (t)
                </NavbarFormLabel>
                <RefInput
                  ref={chordalRef}
                  value={transpose.chordal}
                  onChange={(e: any) => setChordal(e.target.value)}
                />
              </NavbarFormGroup>
              {holdingAlt ? (
                <>
                  <NavbarFormGroup className="p-1 pt-3 flex flex-col w-full">
                    <label className="pb-1 text-sm">Chromatic Offset</label>
                    <input
                      className="w-full h-5 text-white bg-slate-200"
                      type="range"
                      min={-48}
                      max={48}
                      value={parseInt(transpose.chromatic)}
                      onChange={(e: any) =>
                        setChromatic(e.target.value.toString())
                      }
                      onDoubleClick={() => setChromatic("0")}
                    />
                  </NavbarFormGroup>
                  <NavbarFormGroup className="p-1 pt-3 flex flex-col w-full">
                    <label className="pb-1 text-sm">Scalar Offset</label>
                    <input
                      className="w-full h-5 text-white bg-slate-200"
                      type="range"
                      min={-48}
                      max={48}
                      value={parseInt(transpose.scalar)}
                      onChange={(e: any) =>
                        setScalar(e.target.value.toString())
                      }
                      onDoubleClick={() => setScalar("0")}
                    />
                  </NavbarFormGroup>
                  <NavbarFormGroup className="p-1 pt-3 flex flex-col w-full">
                    <label className="pb-1 text-sm">Chordal Offset</label>
                    <input
                      className="w-full h-5 text-white bg-slate-200"
                      type="range"
                      min={-48}
                      max={48}
                      value={parseInt(transpose.chordal)}
                      onChange={(e: any) =>
                        setChordal(e.target.value.toString())
                      }
                      onDoubleClick={() => setChordal("0")}
                    />
                  </NavbarFormGroup>
                </>
              ) : null}
            </div>
          }
        />
      </div>
    </div>
  );
}

interface TransposeState {
  scalar: string;
  chordal: string;
  chromatic: string;
}
