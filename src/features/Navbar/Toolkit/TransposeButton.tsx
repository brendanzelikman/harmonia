import { BsMagic } from "react-icons/bs";
import { blurOnEnter } from "utils/html";
import { ControlButton } from ".";
import {
  NavbarFormGroup,
  NavbarFormLabel,
  NavbarFormInput,
  NavbarTooltip,
  NavbarTooltipMenu,
} from "../components";
import {
  getTranspositionVectorAsString,
  getChromaticOffset,
} from "types/Transposition";
import { getScaleName, getTransposedScale } from "types/Scale";
import {
  useProjectDispatch,
  useProjectSelector,
  useProjectDeepSelector,
} from "redux/hooks";
import {
  selectTimeline,
  selectTrackChain,
  selectSelectedTrack,
  selectDraftedTransposition,
  selectTrackMidiScale,
} from "redux/selectors";
import { isTimelineAddingTranspositions } from "types/Timeline";
import { toggleAddingTranspositions, updateMediaDraft } from "redux/Timeline";

/**
 * Start adding transpositions with the given offsets.
 */
export const ToolkitTransposeButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const isAdding = isTimelineAddingTranspositions(timeline);
  const transposition = useProjectSelector(selectDraftedTransposition);
  const { vector, duration } = transposition;

  // Selected track info
  const selectedTrack = useProjectDeepSelector(selectSelectedTrack);
  const trackChain = useProjectDeepSelector((_) =>
    selectTrackChain(_, selectedTrack?.id)
  );
  const scales = useProjectSelector((_) =>
    trackChain.map((t) => selectTrackMidiScale(_, t.id))
  );
  const chromaticTranspose = getChromaticOffset(vector);
  const selectedOffsets = {
    ...trackChain.reduce(
      (acc, t) => ({ ...acc, [t.id]: vector?.[t.id] || 0 }),
      {}
    ),
  };

  // Transposition offsets
  const transposedScales = useProjectSelector((_) =>
    trackChain.map((scale) => {
      const trackScale = selectTrackMidiScale(_, scale.id);
      return getTransposedScale(trackScale, chromaticTranspose);
    })
  );
  const scaleNames = transposedScales.map((transposedScale, i) => {
    const trackName = trackChain[i].name;
    if (trackName?.length) return trackName;
    return getScaleName(transposedScale || scales[i]);
  });

  /** Handlers for updating transposition offsets */
  const setTranspositionValue = (key: string, value: number) => {
    dispatch(
      updateMediaDraft({
        transposition: { vector: { ...vector, [key]: value } },
      })
    );
  };

  /** An input element for a given offset ID */
  const OffsetInput = (id: string) => {
    const value = isNaN(vector?.[id] || NaN) ? "" : vector?.[id];
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
      {OffsetInput("chromatic")}
    </NavbarFormGroup>
  );

  /** The chordal offset input */
  const ChordalOffsetInput = () => (
    <NavbarFormGroup>
      <NavbarFormLabel className="w-32">Chordal Offset:</NavbarFormLabel>
      {OffsetInput("chordal")}
    </NavbarFormGroup>
  );

  /** The scalar offset inputs */
  const ScalarOffsetInputs = () => {
    return trackChain.map(({ id }, i) => (
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
    const buttonClass = `bg-transposition ring-2 ring-offset-2 ${
      isAdding
        ? "ring-transposition/80 ring-offset-black"
        : "ring-transparent ring-offset-transparent"
    }`;
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
        className="-left-[6rem] bg-fuchsia-600 min-w-[15rem] px-3"
        show={!!isAdding}
        content={
          <NavbarTooltipMenu>
            <div className="pb-2 mb-2 w-full text-center font-bold border-b">
              Transposing by{" "}
              {getTranspositionVectorAsString({
                ...vector,
                ...selectedOffsets,
              })}
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
