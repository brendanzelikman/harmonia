import { setSelectedPattern } from "redux/Media";
import { PatternEditorProps } from "../PatternEditor";
import { useEffect } from "react";

export function usePatternEditorDefaultPattern(props: PatternEditorProps) {
  const { pattern } = props;

  // If no pattern is selected, select the major chord.
  useEffect(() => {
    if (!pattern) props.dispatch(setSelectedPattern("major-chord"));
  }, [!!pattern]);
}
