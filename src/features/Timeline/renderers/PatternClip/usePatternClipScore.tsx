import { nanoid } from "@reduxjs/toolkit";
import { useScore } from "hooks/useScore";
import { createUndoType } from "types/redux";
import { useCallback, useMemo, useState } from "react";
import { selectPortaledPatternClipXML } from "types/Arrangement/ArrangementClipSelectors";
import { selectPortaledPatternClipStream } from "types/Arrangement/ArrangementSelectors";
import { PortaledPatternClip } from "types/Clip/ClipTypes";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import {
  addPatternNote,
  updatePatternNote,
  addPatternBlock,
  updatePatternBlock,
} from "types/Pattern/PatternSlice";
import { PatternNote } from "types/Pattern/PatternTypes";
import {
  getMidiStreamStaves,
  getMidiStreamMinMax,
} from "types/Pattern/PatternUtils";
import { autoBindNoteToTrack } from "types/Track/TrackUtils";
import { selectTransportBPM } from "types/Transport/TransportSelectors";
import { isFinite } from "utils/math";
import {
  getDurationTicks,
  getStraightDuration,
  getTickDuration,
  ticksToSeconds,
} from "utils/duration";
import { format } from "utils/math";
import { getKeyCode, useHeldKeys } from "hooks/useHeldkeys";
import { TrackId } from "types/Track/TrackTypes";
import { ScaleId, ScaleVector } from "types/Scale/ScaleTypes";
import { omit } from "lodash";

export const usePatternClipScore = (clip: PortaledPatternClip) => {
  const dispatch = useAppDispatch();
  const bpm = useAppValue(selectTransportBPM);
  const midi = useAppValue((_) => selectPortaledPatternClipStream(_, clip.id));
  const stream = midi.flatMap((n) => n.notes.filter((n) => "velocity" in n));
  const xml = useAppValue((_) => selectPortaledPatternClipXML(_, clip));
  const staves = useMemo(() => getMidiStreamStaves(stream), [stream]);
  const onGrandStaff = staves === "grand";

  // The hook stores an input duration for editing notes
  const holding = useHeldKeys(["shift", "rightshift", "/", ",", "."], "all");
  const [_duration, setDuration] = useState(getDurationTicks("16th"));
  const isTriplet = holding[getKeyCode("/")];
  const isDotted = holding[getKeyCode(".")];
  const asRest = holding[getKeyCode(",")];
  const asChord =
    holding[getKeyCode("shift")] || holding[getKeyCode("rightshift")];
  const modifier = isTriplet ? "Triplet" : isDotted ? "Dotted" : "Straight";
  const ratio = isTriplet ? 2 / 3 : isDotted ? 3 / 2 : 1;
  const duration = _duration * ratio;
  const type = getStraightDuration(getTickDuration(duration));
  const ticks = format(ticksToSeconds(duration, bpm), 4);
  const object = asRest ? "Rest" : asChord ? "Chord" : "Note";
  const input = `${modifier} ${type} ${object} (${ticks}s)`;

  // The score zooms out with a bigger stream range

  const { min, max } = useMemo(() => getMidiStreamMinMax(stream), [stream]);
  const spread = isFinite(max) ? max - min : 0;
  const decay = onGrandStaff ? 0.015 : 0.008;
  const initial = onGrandStaff ? 0.9 : 0.8;
  const zoom = initial - spread * decay;

  const { score, cursor } = useScore({
    id: `${clip.id}_score`,
    xml,
    className: "size-full",
    stream,
    zoom,
    noteColor: "fill-black",
  });
  const index = cursor.hidden ? undefined : cursor.index;

  const Score = useMemo(
    () => (
      <div
        className="bg-white max-w-[600px] -ml-half -mr-[2px] overflow-scroll shrink"
        style={{ height: onGrandStaff ? 100 : 74 }}
      >
        {score}
      </div>
    ),
    [score, onGrandStaff]
  );

  // Add a rest or update if the cursor is showing
  const playRest = useCallback(() => {
    const id = clip.patternId;
    const block = { duration };
    const undoType = createUndoType("playRest", nanoid());
    if (index === undefined) {
      dispatch(addPatternBlock({ data: { id, block }, undoType }));
    } else {
      dispatch(updatePatternBlock({ data: { id, index, block }, undoType }));
    }
  }, [clip.patternId, index, duration]);

  // Add an auto-bound note or update if the cursor is showing
  const playNote = useCallback(
    (
      options: Partial<{
        MIDI: number;
        trackId: TrackId;
        scaleId: ScaleId;
        degree: number;
        offset: ScaleVector;
      }> = { MIDI: 60 }
    ) => {
      const { trackId, scaleId, degree, offset } = options;
      if (asRest) return playRest();
      const id = clip.patternId;
      let note: PatternNote = {
        duration,
        MIDI: options.MIDI ?? 60,
        velocity: 100,
      };
      if (scaleId && degree !== undefined) {
        note = { ...omit(note, "MIDI"), scaleId, degree, offset };
      } else if (trackId) {
        note = dispatch(autoBindNoteToTrack(trackId, note));
      }
      const undoType = createUndoType("playNote", nanoid());
      if (index === undefined) {
        dispatch(addPatternNote({ data: { id, note, asChord }, undoType }));
      } else {
        dispatch(
          updatePatternNote({ data: { id, note, asChord, index }, undoType })
        );
      }
    },
    [clip.patternId, index, duration, asRest, asChord, playRest]
  );

  return {
    Score,
    index,
    playNote,
    setDuration,
    duration,
    input,
    toggle: cursor.toggle,
  };
};
