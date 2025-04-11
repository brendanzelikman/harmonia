import { nanoid } from "@reduxjs/toolkit";
import { PresetScaleNotes } from "assets/scales";
import { promptLineBreak } from "components/PromptModal";
import { PatternScaleNotes } from "types/Pattern/PatternUtils";
import { Thunk } from "types/Project/ProjectTypes";
import { createUndoType } from "types/redux";
import { updateScale } from "types/Scale/ScaleSlice";
import { getTransposedScale } from "types/Scale/ScaleTransformers";
import { promptUserForString } from "lib/prompts/html";
import { MidiScale, getPitchClassDegree } from "utils/midi";
import { unpackScaleName } from "utils/pitch";
import { getScaleName } from "types/Scale/ScaleFinder";
import { selectSelectedTrackId } from "types/Timeline/TimelineSelectors";
import { readMidiScaleFromString } from "types/Track/ScaleTrack/ScaleTrackThunks";
import {
  isScaleTrackId,
  ScaleTrackId,
} from "types/Track/ScaleTrack/ScaleTrackTypes";
import {
  selectTrackById,
  selectTrackMidiScale,
} from "types/Track/TrackSelectors";
import { isScaleTrack } from "types/Track/TrackTypes";
import { convertMidiToNestedNote } from "types/Track/TrackUtils";

/** Prompt the user to input a scale for the selected track */
export const inputScaleTrackScale = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const trackId = selectSelectedTrackId(project);
  if (isScaleTrackId(trackId)) dispatch(promptUserForScale(trackId));
};

/** Update the notes of a track based on an inputted regex string */
export const promptUserForScale =
  (id: ScaleTrackId): Thunk =>
  (dispatch, getProject) =>
    promptUserForString({
      autoselect: true,
      large: true,
      title: "Change Scale",
      description: [
        promptLineBreak,
        <span>
          Rule #1: <span className="text-sky-400">Scales</span> can be specified
          by name or symbol
        </span>,
        <span>Example: "C" or "Db lydian" or "Fmin7" or "G7#9"</span>,
        promptLineBreak,
        <span>
          Rule #2: <span className="text-sky-400">Scales</span> can be specified
          by pitch class
        </span>,
        <span>Example: "acoustic scale" or "C, D, E, F#, G, A, Bb"</span>,
        promptLineBreak,
        <span>
          Rule #3: <span className="text-sky-400">Scales</span> can be specified
          by scale degree
        </span>,
        <span>Example: "C major" or "0, 2, 4, 5, 7, 9, 11"</span>,
        promptLineBreak,
        <span className="underline">Please input your scale:</span>,
      ],
      callback: (input) => {
        const undoType = createUndoType("inputScaleTrackScale", nanoid());
        const project = getProject();
        const trackId = id;
        const track = selectTrackById(project, trackId);
        if (!track) return;
        const scaleId = isScaleTrack(track) ? track.scaleId : undefined;
        if (!scaleId) return;

        const parentScale = selectTrackMidiScale(project, track?.parentId);
        let notes = readMidiScaleFromString(input, parentScale);
        if (!notes) {
          // Try to find an array of pitch classes in the name
          const scale = unpackScaleName(input);
          if (!scale || !scale.scaleName.length) return;

          const { scaleName, pitchClass } = scale;

          const preset = [...PresetScaleNotes, ...PatternScaleNotes].find(
            (scale) =>
              getScaleName(scale)
                .toLowerCase()
                .includes(scaleName.toLowerCase())
          ) as MidiScale | undefined;
          if (!preset) return;

          const number = pitchClass ? getPitchClassDegree(pitchClass) : 0;
          notes = getTransposedScale(preset, number);

          if (!preset) return;
        }

        const newScale = notes
          .map((MIDI) =>
            dispatch(convertMidiToNestedNote(MIDI, track?.parentId))
          )
          .filter((n) => n.degree >= 0);
        dispatch(
          updateScale({
            data: { id: scaleId, notes: newScale },
            undoType,
          })
        );
      },
    })();
