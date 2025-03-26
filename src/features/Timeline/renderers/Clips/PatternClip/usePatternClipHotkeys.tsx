import { useHotkeys } from "react-hotkeys-hook";
import { getDurationTicks } from "utils/durations";

interface PatternClipHotkeyProps {
  playNote: (note?: number, useScale?: boolean) => void;
  setDuration: (duration: number) => void;
}

export const usePatternClipHotkeys = (props: PatternClipHotkeyProps) => {
  const { playNote, setDuration } = props;

  // Input scale degrees to play notes
  useHotkeys("a+0", () => playNote(), [playNote]);
  useHotkeys("a+1", () => playNote(0, true), [playNote]);
  useHotkeys("a+2", () => playNote(1, true), [playNote]);
  useHotkeys("a+3", () => playNote(2, true), [playNote]);
  useHotkeys("a+4", () => playNote(3, true), [playNote]);
  useHotkeys("a+5", () => playNote(4, true), [playNote]);
  useHotkeys("a+6", () => playNote(5, true), [playNote]);
  useHotkeys("a+7", () => playNote(6, true), [playNote]);
  useHotkeys("a+8", () => playNote(7, true), [playNote]);
  useHotkeys("a+9", () => playNote(8, true), [playNote]);

  // Change the selected duration
  useHotkeys("d+1", () => setDuration(getDurationTicks("whole")));
  useHotkeys("d+2", () => setDuration(getDurationTicks("half")));
  useHotkeys("d+3", () => setDuration(getDurationTicks("quarter")));
  useHotkeys("d+4", () => setDuration(getDurationTicks("eighth")));
  useHotkeys("d+5", () => setDuration(getDurationTicks("16th")));
  useHotkeys("d+6", () => setDuration(getDurationTicks("32nd")));
  useHotkeys("d+7", () => setDuration(getDurationTicks("64th")));
};
