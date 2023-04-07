import { BsScissors } from "react-icons/bs";
import { BiGitMerge } from "react-icons/bi";
import { GiClockwork, GiCrystalWand, GiPaintBrush } from "react-icons/gi";
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
import { selectRoot } from "redux/selectors";

import {
  setActivePattern,
  toggleTransposingClip,
  toggleCuttingClip,
  toggleAddingClip,
  hideEditor,
  setScalarTranspose,
  setChordalTranspose,
  setRepeatCount,
  toggleRepeatingClips,
  toggleMergingClips,
  setMergeName,
  toggleRepeatTransforms,
  toggleMergeTransforms,
} from "redux/slices/root";
import { PatternId } from "types/patterns";
import PatternListbox from "./PatternListbox";
import { ClipId } from "types/clips";
import { mergeClips, repeatClips } from "redux/slices/clips";
import { useEffect, useState } from "react";
import { blurOnEnter } from "appUtil";

const mapStateToProps = (state: RootState) => {
  const root = selectRoot(state);
  return {
    ...root,
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
      dispatch(toggleMergingClips());
      dispatch(mergeClips(ids));
    },
    repeatClips: (ids: ClipId[]) => {
      dispatch(toggleRepeatingClips());
      dispatch(repeatClips(ids));
    },
    setScalarTranspose: (value: number) => {
      dispatch(setScalarTranspose(value));
    },
    setChordalTranspose: (value: number) => {
      dispatch(setChordalTranspose(value));
    },
    setRepeatCount: (value: number) => {
      dispatch(setRepeatCount(value));
    },
    setMergeName: (value: string) => {
      dispatch(setMergeName(value));
    },
    toggleAdding: () => {
      dispatch(toggleAddingClip());
      dispatch(hideEditor());
    },
    toggleCutting: () => {
      dispatch(toggleCuttingClip());
      dispatch(hideEditor());
    },
    toggleTransposing: () => {
      dispatch(toggleTransposingClip());
      dispatch(hideEditor());
    },
    toggleRepeating: () => {
      dispatch(toggleRepeatingClips());
      dispatch(hideEditor());
    },
    toggleRepeatTransforms: () => {
      dispatch(toggleRepeatTransforms());
    },
    toggleMerging: () => {
      dispatch(toggleMergingClips());
      dispatch(hideEditor());
    },
    toggleMergeTransforms: () => {
      dispatch(toggleMergeTransforms());
    },
    setActivePatternId: (id: PatternId) => {
      dispatch(setActivePattern(id));
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
}) => (
  <NavButton
    className={`border border-slate-400/80 rounded-full flex flex-col justify-center items-center w-12 h-12 text-3xl whitespace-nowrap ${
      props.className ?? ""
    }`}
    onClick={props.onClick}
  >
    {props.children}
  </NavButton>
);

function PatternControl(props: Props) {
  return (
    <>
      <div className="hidden md:block">
        <PatternListbox />
      </div>
      <div className="flex space-x-2 ml-4">
        <div className="relative">
          <ControlButton
            className={`${
              props.addingClip ? "animate-pulse" : ""
            } bg-gradient-to-b from-teal-500/90 to-slate-800/80 `}
            onClick={props.toggleAdding}
          >
            <GiPaintBrush className="rotate-90" />
          </ControlButton>
          <NavbarTooltip
            className="bg-gradient-to-t from-zinc-900/90 to-cyan-800/90 backdrop-blur"
            show={!!props.addingClip}
            content="Adding Clip"
          />
        </div>
        <div className="relative">
          <ControlButton
            className={`bg-gradient-to-b from-gray-500/90 to-slate-800/80 ${
              props.cuttingClip ? "animate-pulse ring-2 ring-slate-500/50" : ""
            }`}
            onClick={props.toggleCutting}
          >
            <BsScissors />
          </ControlButton>
          <NavbarTooltip
            className="bg-gradient-to-t from-zinc-900/90 to-slate-600/90 backdrop-blur"
            show={!!props.cuttingClip}
            content="Cutting Clip"
          />
        </div>

        <div className="flex flex-col relative h-full">
          <ControlButton
            onClick={props.toggleMerging}
            className={`bg-gradient-to-b from-purple-500/90 to-slate-800/80 ${
              props.mergingClips
                ? "animate-pulse ring-2 ring-purple-500/50"
                : ""
            }`}
          >
            <BiGitMerge />
          </ControlButton>
          <NavbarTooltip
            className="bg-gradient-to-t from-zinc-900/90 to-purple-500/50 backdrop-blur"
            show={!!props.mergingClips}
            content={<MergeTooltipContent {...props} />}
          />
        </div>

        <div className="flex flex-col relative h-full">
          <ControlButton
            onClick={props.toggleRepeating}
            className={`bg-gradient-to-b from-emerald-500/90 to-slate-800/80 ${
              props.repeatingClips
                ? "animate-pulse ring-2 ring-emerald-500/50"
                : ""
            }`}
          >
            <GiClockwork />
          </ControlButton>
          <NavbarTooltip
            className="bg-gradient-to-t from-zinc-900/90 to-emerald-600/80 backdrop-blur"
            show={!!props.repeatingClips}
            content={<RepeatTooltipContent {...props} />}
          />
        </div>
        <div className="flex flex-col relative h-full">
          <ControlButton
            onClick={props.toggleTransposing}
            className={`bg-gradient-to-b from-fuchsia-500/90 to-slate-800/80 ${
              props.transposingClip
                ? "animate-pulse ring-2 ring-fuchsia-500/50"
                : ""
            }`}
          >
            <GiCrystalWand className="-rotate-90" />
          </ControlButton>
          <NavbarTooltip
            className="bg-gradient-to-t from-zinc-900/90 to-fuchsia-700/80 backdrop-blur"
            show={!!props.transposingClip}
            content={<TransposeTooltipContent {...props} />}
          />
        </div>
      </div>
    </>
  );
}

function MergeTooltipContent(props: Props) {
  const [mergeNameInput, setMergeNameInput] = useState<string>("");
  useEffect(() => {
    props.setMergeName(mergeNameInput);
  }, [mergeNameInput]);

  return (
    <div className="flex flex-col justify-center items-center">
      <label className="pb-2">Merging Clips</label>
      <NavbarFormGroup className="pb-2">
        <NavbarFormLabel>Name</NavbarFormLabel>
        <NavbarFormInput
          className="ml-auto w-36"
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
      <NavbarFormGroup>
        <button
          className={`w-full border px-3 py-1 rounded-lg appearance-none text-sm ${
            props.selectedClipIds.length < 2
              ? "opacity-50 cursor-default"
              : "opacity-100 cursor-pointer"
          }`}
          disabled={props.selectedClipIds.length < 2}
          onClick={() => props.mergeClips(props.selectedClipIds)}
        >
          {props.selectedClipIds.length < 2
            ? "Select 2+ Clips"
            : "Merge Selected Clips"}
        </button>
      </NavbarFormGroup>
    </div>
  );
}

function RepeatTooltipContent(props: Props) {
  return (
    <div className="flex flex-col justify-center items-center">
      <label className="pb-2">Repeating Clips</label>
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
          onChange={props.toggleRepeatTransforms}
        />
      </NavbarFormGroup>
      <NavbarFormGroup>
        <button
          className={`w-full border px-3 py-1 rounded-lg appearance-none text-sm ${
            props.selectedClipIds.length < 1
              ? "opacity-50 cursor-default"
              : "opacity-100 cursor-pointer"
          }`}
          disabled={props.selectedClipIds.length < 1}
          onClick={() => props.repeatClips(props.selectedClipIds)}
        >
          {props.selectedClipIds.length < 1
            ? "Select 1+ Clips"
            : "Repeat Selected Clips"}
        </button>
      </NavbarFormGroup>
    </div>
  );
}

function TransposeTooltipContent(props: Props) {
  const [scalarTransposeInput, setScalarTransposeInput] = useState<string>(
    `${props.scalarTranspose ?? ""}`
  );
  useEffect(() => {
    const value = parseInt(scalarTransposeInput);
    if (!isNaN(value)) {
      props.setScalarTranspose(value);
    }
  }, [scalarTransposeInput]);

  const [chordalTransposeInput, setChordalTransposeInput] = useState<string>(
    `${props.chordalTranspose ?? ""}`
  );
  useEffect(() => {
    const value = parseInt(chordalTransposeInput);
    if (!isNaN(value)) {
      props.setChordalTranspose(value);
    }
  }, [chordalTransposeInput]);

  return (
    <div className="flex flex-col justify-center items-center">
      <label className="pb-2">Transposing Clips</label>
      <NavbarFormGroup>
        <NavbarFormLabel className="inline-flex items-center">
          <NavbarInfoTooltip
            content="Number of notes in the scale to transpose by"
            className="mr-2"
          />
          Scalar (T)
        </NavbarFormLabel>
        <NavbarFormInput
          className="w-16"
          value={scalarTransposeInput}
          type="text"
          onChange={(e: any) => setScalarTransposeInput(e.target.value)}
          onKeyDown={blurOnEnter}
        />
      </NavbarFormGroup>
      <NavbarFormGroup>
        <NavbarFormLabel className="inline-flex items-center">
          <NavbarInfoTooltip
            content="Number of notes in the chord to transpose by"
            className="mr-2"
          />{" "}
          Chordal (t)
        </NavbarFormLabel>
        <NavbarFormInput
          className="w-16"
          value={chordalTransposeInput}
          type="text"
          onChange={(e: any) => setChordalTransposeInput(e.target.value)}
          onKeyDown={blurOnEnter}
        />
      </NavbarFormGroup>
    </div>
  );
}
