import { BsMagic } from "react-icons/bs";
import { blurOnEnter } from "utils";
import { ControlButton } from ".";
import {
  NavbarFormGroup,
  NavbarFormLabel,
  NavbarFormInput,
  NavbarTooltip,
  NavbarTooltipMenu,
} from "../components";
import { formatOffsets, getChromaticOffset } from "types/Transposition";
import { getScaleName, getTransposedScale } from "types/Scale";
import {
  useAppDispatch,
  useAppSelector,
  useDeepEqualSelector,
} from "redux/hooks";
import {
  selectScaleMap,
  selectScaleTrackMap,
  selectTimeline,
  selectTrackParents,
  selectSelectedTrack,
  selectDraftedTransposition,
} from "redux/selectors";
import { getScaleTrackScale } from "types/ScaleTrack";
import { isAddingTranspositions } from "types/Timeline";
import { toggleAddingTranspositions, updateMediaDraft } from "redux/Timeline";

/**
 * Start adding transpositions with the given offsets.
 */
export const ToolkitTransposeButton = () => {
  const dispatch = useAppDispatch();
  const timeline = useAppSelector(selectTimeline);
  const isAdding = isAddingTranspositions(timeline);
  const transposition = useAppSelector(selectDraftedTransposition);
  const { offsets, duration } = transposition;

  // Selected track info
  const selectedTrack = useDeepEqualSelector(selectSelectedTrack);
  const scaleMap = useAppSelector(selectScaleMap);
  const scaleTrackMap = useAppSelector(selectScaleTrackMap);
  const onScaleTrack = selectedTrack?.type === "scaleTrack";
  const scaleTracks = useDeepEqualSelector((_) =>
    selectTrackParents(_, selectedTrack?.id)
  );
  const parents = onScaleTrack ? scaleTracks.slice(0, -1) : scaleTracks;
  const scales = parents.map((t) => getScaleTrackScale(t, scaleTrackMap));
  const chromaticTranspose = getChromaticOffset(offsets);
  const selectedOffsets = {
    ...parents.reduce(
      (acc, t) => ({ ...acc, [t.id]: offsets?.[t.id] || 0 }),
      {}
    ),
  };

  // Transposition offsets
  const transposedScales = parents.map((scale) => {
    const trackScale = getScaleTrackScale(scale, scaleTrackMap, scaleMap);
    return getTransposedScale(trackScale, chromaticTranspose);
  });
  const scaleNames = transposedScales.map((transposedScale, i) => {
    const trackName = parents[i].name;
    if (trackName?.length) return trackName;
    return getScaleName(transposedScale || scales[i]);
  });

  /** Handlers for updating transposition offsets */
  const setTranspositionValue = (key: string, value: number) => {
    dispatch(
      updateMediaDraft({
        transposition: { offsets: { ...offsets, [key]: value } },
      })
    );
  };

  /** An input element for a given offset ID */
  const OffsetInput = (id: string) => {
    const value = isNaN(offsets?.[id] || NaN) ? "" : offsets?.[id];
    return (
      <NavbarFormInput
        value={value}
        onChange={(e) => setTranspositionValue(id, parseInt(e.target.value))}
        type="text"
        placeholder="0"
        className="focus:bg-fuchsia-600 h-7 ml-4 w-16"
        onKeyDown={blurOnEnter}
      />
    );
  };

  /** The chromatic offset input */
  const ChromaticOffsetInput = () => (
    <NavbarFormGroup>
      <NavbarFormLabel className="w-32">Chromatic Offset:</NavbarFormLabel>
      {OffsetInput("_chromatic")}
    </NavbarFormGroup>
  );

  /** The chordal offset input */
  const ChordalOffsetInput = () => (
    <NavbarFormGroup>
      <NavbarFormLabel className="w-32">Chordal Offset:</NavbarFormLabel>
      {OffsetInput("_self")}
    </NavbarFormGroup>
  );

  /** The scalar offset inputs */
  const ScalarOffsetInputs = () => {
    return parents.map(({ id }, i) => (
      <NavbarFormGroup key={`scalar-offset-${id}`}>
        <NavbarFormLabel className="w-32">
          <span className="text-gray-300">({i + 1})</span> {scaleNames[i]}:{" "}
        </NavbarFormLabel>
        {OffsetInput(id)}
      </NavbarFormGroup>
    ));
  };

  /** The duration input */
  const DurationInput = () => {
    return (
      <NavbarFormGroup>
        <NavbarFormLabel className="w-32">Duration (Ticks):</NavbarFormLabel>
        <NavbarFormInput
          value={duration}
          onChange={(e) =>
            dispatch(
              updateMediaDraft({
                transposition: { duration: e.target.valueAsNumber },
              })
            )
          }
          type="number"
          placeholder={Infinity.toLocaleString()}
          className="focus:bg-fuchsia-600 h-7 ml-4 w-16"
          onKeyDown={blurOnEnter}
        />
      </NavbarFormGroup>
    );
  };

  /** The Transpose Button toggles the dropdown menu */
  const TransposeButton = () => {
    const buttonClass = isAdding
      ? "bg-fuchsia-700 ring-2 ring-offset-2 ring-fuchsia-700/80 ring-offset-black"
      : "bg-fuchsia-700/80";
    return (
      <ControlButton
        label="Transpose Clip"
        onClick={() => dispatch(toggleAddingTranspositions())}
        className={buttonClass}
      >
        <BsMagic className="-rotate-90 p-0.5" />
      </ControlButton>
    );
  };

  /** The Transpose Tooltip displays the dropdown menu. */
  const TransposeTooltip = () => {
    return (
      <NavbarTooltip
        className="-left-[6rem] bg-fuchsia-700 min-w-[15rem] px-3"
        show={!!isAdding}
        content={
          <NavbarTooltipMenu>
            <div className="pb-2 mb-1 w-full text-center font-bold border-b">
              Transposing by {formatOffsets({ ...offsets, ...selectedOffsets })}
            </div>
            <div className="w-full h-full py-2 space-y-2">
              {ChromaticOffsetInput()}
              {ScalarOffsetInputs()}
              {ChordalOffsetInput()}
              {DurationInput()}
            </div>
          </NavbarTooltipMenu>
        }
      />
    );
  };

  return (
    <div className="flex flex-col relative">
      <TransposeButton />
      {TransposeTooltip()}
    </div>
  );
};
