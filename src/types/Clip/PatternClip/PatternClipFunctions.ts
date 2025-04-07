import { getPatternBlockDuration } from "types/Pattern/PatternFunctions";
import {
  PatternClipTheme,
  DEFAULT_PATTERN_CLIP_THEME,
  DEFAULT_PATTERN_CLIP_COLOR,
  PATTERN_CLIP_THEMES,
  PatternClipColor,
} from "./PatternClipThemes";
import { PatternClip } from "./PatternClipTypes";
import { Pattern } from "types/Pattern/PatternTypes";
import { getValueByKey } from "utils/objects";

// Get the starting block of a pattern clip using its offset and reference pattern
export const getPatternClipStartingBlock = (
  clip: PatternClip,
  pattern: Pattern
) => {
  let block = 0;
  let offset = 0;
  if (!pattern.stream) return block;

  // Iterate over the stream
  const streamLength = pattern.stream.length;
  for (let i = 0; i < streamLength; i++) {
    // If the current offset is at least the clip's offset, then break
    if (offset >= (clip.offset ?? 0)) break;

    // Otherwise, add the duration of the current block
    const duration = getPatternBlockDuration(pattern.stream[i]);
    offset += duration;

    // Increment the current block
    block++;
  }

  // Return the starting block
  return block;
};

// ------------------------------------------------------------
// Clip Properties
// ------------------------------------------------------------

/** Get the theme of a `Clip`. */
export const getPatternClipTheme = (clip?: PatternClip): PatternClipTheme => {
  return (
    PATTERN_CLIP_THEMES[clip?.color ?? DEFAULT_PATTERN_CLIP_COLOR] ??
    DEFAULT_PATTERN_CLIP_THEME
  );
};

/** Get the headerColor of a `Clip`. */
export const getPatternClipHeaderColor = (clip?: PatternClip) => {
  return getPatternClipTheme(clip).headerColor;
};
