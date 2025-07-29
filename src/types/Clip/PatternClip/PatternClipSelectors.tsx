import { Project } from "types/Project/ProjectTypes";
import { isMidiNote, isScaleId } from "types/Scale/ScaleTypes";
import { getMidiPitch } from "utils/midi";
import { getVectorNonzeroKeys } from "utils/vector";
import { CHROMATIC_KEY, OCTAVE_KEY } from "utils/constants";
import {
  selectScaleToTrackMap,
  selectTrackLabelMap,
} from "types/Track/TrackSelectors";
import { getPatternBlockNotes } from "types/Pattern/PatternUtils";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { isPatternRest, PatternId } from "types/Pattern/PatternTypes";

/** Select the label of a pattern note */
export const selectPatternNoteLabel = (
  project: Project,
  id: PatternId,
  index?: number
) => {
  if (index === undefined) return null;
  const pattern = selectPatternById(project, id);
  const trackMap = selectScaleToTrackMap(project);
  const labelMap = selectTrackLabelMap(project);
  const degree = index % pattern.stream.length;
  const block = pattern.stream[degree];
  if (isPatternRest(block)) return "Rest";
  const chord = getPatternBlockNotes(block);
  return chord
    .map((n) => {
      if (!n) return "";

      // If the note is a MIDI note, return its pitch
      if (isMidiNote(n)) return getMidiPitch(n);

      // Get the scale and degree of the note
      const trackId = n.scaleId ? trackMap[n.scaleId]?.id : undefined;
      const scale = trackId ? labelMap[trackId] ?? n.scaleId : n.scaleId;
      const degree = (n.degree ?? 0) + 1;

      // Unwrap the offsets of the note
      const offset = n.offset ?? {};
      const keys = getVectorNonzeroKeys(offset);
      const offsets = keys
        .map((k) => {
          const value = offset[k] ?? 0;
          let key = `*${k}`;
          if (k === "chromatic") {
            key = CHROMATIC_KEY;
          } else if (k === "octave") {
            key = OCTAVE_KEY;
          } else if (isScaleId(k)) {
            const trackId = trackMap[k]?.id;
            key = trackId ? labelMap[trackId] ?? k : `*${k}`;
          }
          return ` + ${key}${value}`;
        })
        .join("");

      return `\{ ${scale}${degree}${offsets} \}`;
    })
    .join(", ");
};
