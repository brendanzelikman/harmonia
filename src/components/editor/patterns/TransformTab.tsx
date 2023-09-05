import { PatternEditorCursorProps } from ".";
import * as Editor from "../Editor";

interface TransformTabProps extends PatternEditorCursorProps {}

export default function TransformTab(props: TransformTabProps) {
  const ScalarTransposeButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Scalar Transpose`}>
      <Editor.MenuButton
        className={`px-1 active:bg-fuchsia-400/80`}
        onClick={() => {
          const input = prompt("Transpose chromatically by N semitones:");
          const sanitizedInput = parseInt(input ?? "");
          if (sanitizedInput) {
            props.transposePattern(props.pattern, sanitizedInput);
          }
        }}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1"
      >
        Transpose
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ChordalTransposeButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content={`Chordal Transpose`}>
      <Editor.MenuButton
        className={`px-1 active:bg-fuchsia-400/80`}
        onClick={() => {
          const input = prompt("Transpose along the chord by N steps:");
          const sanitizedInput = parseInt(input ?? "");
          if (sanitizedInput) {
            props.rotatePattern(props.pattern, sanitizedInput);
          }
        }}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1"
      >
        Invert
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RepeatButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Repeat Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-emerald-600"
        onClick={() => {
          const input = prompt("Repeat this pattern N times:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.repeatPattern(props.pattern, sanitizedInput);
          }
        }}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1"
      >
        Repeat
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ContinueButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Continue Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-emerald-600"
        onClick={() => {
          const input = prompt("Continue this pattern for N notes:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.lengthenPattern(props.pattern, sanitizedInput);
          }
        }}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1"
      >
        Continue
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const PhaseButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Phase Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-emerald-600"
        onClick={() => {
          const input = prompt("Phase this pattern by N notes:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.phasePattern(props.pattern, sanitizedInput);
          }
        }}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1"
      >
        Phase
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const DiminishButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Diminish Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-sky-600"
        onClick={() => props.diminishPattern(props.pattern)}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1"
      >
        Diminish
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const AugmentButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Augment Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-sky-600"
        onClick={() => props.augmentPattern(props.pattern)}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1"
      >
        Augment
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ReverseButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Reverse Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-sky-600"
        onClick={() => props.reversePattern(props.pattern)}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1"
      >
        Reverse
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const ShuffleButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Shuffle Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-sky-600"
        onClick={() => props.shufflePattern(props.pattern)}
        disabled={!props.isCustom || props.isEmpty}
        disabledClass="px-1"
      >
        Shuffle
      </Editor.MenuButton>
    </Editor.Tooltip>
  );

  const RandomizeButton = () => (
    <Editor.Tooltip show={props.showingTooltips} content="Randomize Pattern">
      <Editor.MenuButton
        className="px-1 active:bg-emerald-600"
        onClick={() => {
          const input = prompt("Randomize this pattern for N notes:");
          const sanitizedInput = parseInt(input ?? "");
          if (!!sanitizedInput) {
            props.randomizePattern(props.pattern, sanitizedInput);
          }
        }}
        disabled={!props.isCustom}
        disabledClass="px-1"
      >
        Randomize
      </Editor.MenuButton>
    </Editor.Tooltip>
  );
  return (
    <div className="flex">
      <Editor.MenuGroup border={true}>
        <ScalarTransposeButton />
        <ChordalTransposeButton />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={true}>
        <RepeatButton />
        <ContinueButton />
        <PhaseButton />
        <RandomizeButton />
      </Editor.MenuGroup>
      <Editor.MenuGroup border={false}>
        <DiminishButton />
        <AugmentButton />
        <ReverseButton />
        <ShuffleButton />
      </Editor.MenuGroup>
    </div>
  );
}
