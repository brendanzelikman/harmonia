import { useEffect, useState } from "react";
import { PatternEditorProps } from "../PatternEditor";

export function usePatternEditorChordIndex(props: PatternEditorProps) {
  const [chordIndex, setChordIndex] = useState(0);

  // Reset the chord index when the cursor moves
  useEffect(() => {
    setChordIndex(0);
  }, [props.cursor.index]);

  return { chordIndex, setChordIndex };
}
