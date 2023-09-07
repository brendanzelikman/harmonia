import { rotatePatternChord, transposePatternChord } from "types";
import { PatternEditorCursorProps } from "..";
import * as Editor from "features/editor";

interface PatternTransformTabProps extends PatternEditorCursorProps {}

export function PatternTransformTab(props: PatternTransformTabProps) {
  const TransposeButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content={`Transpose Pattern`}
    >
      <Editor.MenuButton
        className={`px-1 active:bg-fuchsia-500/80 border border-fuchsia-500`}
        onClick={() => {
          if (!props.pattern) return;
          const input = prompt("Transpose chromatically by N semitones:");
          const sanitizedInput = parseInt(input ?? "");
          if (sanitizedInput) {
            if (props.cursor.hidden) {
              props.transposePattern(props.pattern, sanitizedInput);
            } else {
              const chord = props.pattern.stream[props.cursor.index];
              if (!chord) return;
              const newChord = transposePatternChord(chord, sanitizedInput);
              props.updatePatternChord(
                props.pattern,
                props.cursor.index,
                newChord
              );
            }
          }
        }}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Transpose
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RotateButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content={`Rotate Pattern`}
    >
      <Editor.MenuButton
        className={`px-1 active:bg-fuchsia-500/80 border border-fuchsia-500`}
        onClick={() => {
          if (!props.pattern) return;
          const input = prompt("Invert along the chord by N steps:");
          const sanitizedInput = parseInt(input ?? "");
          if (sanitizedInput) {
            if (props.cursor.hidden) {
              props.rotatePattern(props.pattern, sanitizedInput);
            } else {
              const chord = props.pattern.stream[props.cursor.index];
              if (!chord) return;
              const newChord = rotatePatternChord(chord, sanitizedInput);
              props.updatePatternChord(
                props.pattern,
                props.cursor.index,
                newChord
              );
            }
          }
        }}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Rotate
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const InvertButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content="Invert Pattern"
    >
      <Editor.MenuButton
        className="px-1 active:bg-fuchsia-500 border border-fuchsia-500"
        onClick={() => props.invertPattern(props.pattern)}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Invert
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RepeatButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content="Repeat Pattern"
    >
      <Editor.MenuButton
        className="px-1 active:bg-emerald-600 border border-emerald-600"
        onClick={() => {
          const input = prompt("Repeat this pattern N times:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.repeatPattern(props.pattern, sanitizedInput);
          }
        }}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Repeat
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ContinueButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content="Continue Pattern"
    >
      <Editor.MenuButton
        className="px-1 active:bg-emerald-600 border border-emerald-600"
        onClick={() => {
          const input = prompt("Continue this pattern for N notes:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.lengthenPattern(props.pattern, sanitizedInput);
          }
        }}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Continue
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const PhaseButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content="Phase Pattern"
    >
      <Editor.MenuButton
        className="px-1 active:bg-emerald-600 border border-emerald-600"
        onClick={() => {
          const input = prompt("Phase this pattern by N notes:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.phasePattern(props.pattern, sanitizedInput);
          }
        }}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Phase
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const DiminishButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content="Diminish Pattern"
    >
      <Editor.MenuButton
        className="px-1 active:bg-sky-600 border border-sky-600"
        onClick={() => props.diminishPattern(props.pattern)}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Diminish
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const AugmentButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content="Augment Pattern"
    >
      <Editor.MenuButton
        className="px-1 active:bg-sky-600 border border-sky-600"
        onClick={() => props.augmentPattern(props.pattern)}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Augment
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ReverseButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content="Reverse Pattern"
    >
      <Editor.MenuButton
        className="px-1 active:bg-sky-600 border border-sky-600"
        onClick={() => props.reversePattern(props.pattern)}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Reverse
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ShuffleButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content="Shuffle Pattern"
    >
      <Editor.MenuButton
        className="px-1 active:bg-indigo-500 border border-indigo-500"
        onClick={() => props.shufflePattern(props.pattern)}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Shuffle
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const HarmonizeButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content="Harmonize Pattern"
    >
      <Editor.MenuButton
        className="px-1 active:bg-indigo-500 border border-indigo-500"
        onClick={() => {
          const input = prompt(
            "Harmonize this pattern with an interval of N semitones:"
          );
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.harmonizePattern(props.pattern, sanitizedInput);
          }
        }}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1 border border-slate-500"
      >
        Harmonize
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RandomizeButton = () => (
    <Editor.Tooltip
      placement="bottom"
      show={props.showingTooltips}
      content="Randomize Pattern"
    >
      <Editor.MenuButton
        className="px-1 active:bg-indigo-500 border border-indigo-500"
        onClick={() => {
          const input = prompt("Randomize this pattern for N notes:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.randomizePattern(props.pattern, sanitizedInput);
          }
        }}
        disabled={!props.isCustom}
        disabledClass="px-1 border border-slate-500"
      >
        Randomize
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  return (
    <div className="flex">
      <Editor.MenuGroup border={true}>
        <RepeatButton />
        <ContinueButton />
        <PhaseButton />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={true}>
        <DiminishButton />
        <AugmentButton />
        <ReverseButton />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={true}>
        <TransposeButton />
        <RotateButton />
        <InvertButton />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={false}>
        <ShuffleButton />
        <HarmonizeButton />
        <RandomizeButton />
      </Editor.MenuGroup>
    </div>
  );
}
