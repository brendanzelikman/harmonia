import { ScaleEditorProps } from "..";
import { Scale, unpackScale } from "types/Scale";
import { OSMDCursor } from "lib/opensheetmusicdisplay";
import { useHotkeys } from "react-hotkeys-hook";

interface ScaleShortcutProps extends ScaleEditorProps {
  scale: Scale;
  cursor: OSMDCursor;
}

export default function useScaleShortcuts(props: ScaleShortcutProps) {
  const { scaleTrack, scale, cursor } = props;
  const notes = unpackScale(scale);
  const rewindCursor = () => cursor.setIndex(0);
  const forwardCursor = () => cursor.setIndex((notes.length ?? 1) - 1);

  // Shift + Space = Play Scale
  useHotkeys("shift+space", () => props.playScale(scale));

  // C = Toggle Cursor
  useHotkeys("c", cursor.toggle);

  // A = Toggle Adding Notes
  useHotkeys("a", () => props.toggleState("adding"));

  // Shift + Backspace = Clear Scale
  useHotkeys("shift+backspace", props.clearScaleTrack, [scaleTrack]);

  // Backspace = Toggle Removing Notes or Remove Note
  useHotkeys(
    "backspace",
    () => {
      if (cursor.hidden) {
        props.toggleState("removing");
      } else {
        props.removeNoteFromScaleTrack(scaleTrack.id, notes[cursor.index]);
      }
    },
    [notes, cursor, scaleTrack]
  );

  // T = Prompt for Scalar Transposition
  useHotkeys(
    "shift+t",
    () => {
      const input = prompt("Transpose scale by N semitones:");
      const sanitizedInput = parseInt(input ?? "");
      if (isNaN(sanitizedInput)) return;
      props.transposeScaleTrack(scaleTrack.id, sanitizedInput);
    },
    [scaleTrack]
  );

  // R = Prompt for Chordal Transposition
  useHotkeys(
    "shift+r",
    () => {
      const input = prompt("Transpose scale along N steps:");
      const sanitizedInput = parseInt(input ?? "");
      if (isNaN(sanitizedInput)) return;
      props.rotateScaleTrack(scaleTrack.id, sanitizedInput);
    },
    [scaleTrack]
  );

  // Up Arrow = Transpose Up 1 Semitone
  useHotkeys("up", () => props.transposeScaleTrack(scaleTrack.id, 1), [
    scaleTrack,
  ]);

  // Shift + Up Arrow = Transpose Up 12 Semitones
  useHotkeys("shift+up", () => props.transposeScaleTrack(scaleTrack.id, 12), [
    scaleTrack,
  ]);

  // Down Arrow = Transpose Down 1 Semitone
  useHotkeys("down", () => props.transposeScaleTrack(scaleTrack.id, -1), [
    scaleTrack,
  ]);

  // Shift + Down Arrow = Transpose Down 12 Semitones
  useHotkeys(
    "shift+down",
    () => props.transposeScaleTrack(scaleTrack.id, -12),
    [scaleTrack]
  );

  // Left Arrow = Transpose Down 1 Chord Step or Rewind Cursor
  useHotkeys(
    "left",
    () => {
      if (!cursor.hidden && cursor.index > 0) {
        rewindCursor();
      } else {
        props.rotateScaleTrack(scaleTrack.id, -1);
      }
    },
    [cursor, scaleTrack]
  );

  // Shift + Left Arrow = Skip Cursor Left
  useHotkeys("shift+left", () => !cursor.hidden && rewindCursor(), [cursor]);

  // Right Arrow = Transpose Up 1 Chord Step or Advance Cursor
  useHotkeys(
    "right",
    () => {
      if (!cursor.hidden && cursor.index < notes.length - 1) {
        cursor.next();
      } else {
        props.rotateScaleTrack(scaleTrack.id, 1);
      }
    },
    [cursor, notes, scaleTrack]
  );

  // Shift + Right Arrow = Skip Cursor Right
  useHotkeys("shift+right", () => !cursor.hidden && forwardCursor(), [cursor]);
}
