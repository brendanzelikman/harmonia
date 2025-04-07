import { nanoid } from "@reduxjs/toolkit";
import { NoteCallback, useOSMD } from "lib/opensheetmusicdisplay";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { createUndoType } from "lib/redux";
import { useCallback, useMemo, useState } from "react";
import { selectPortaledPatternClipXML } from "types/Arrangement/ArrangementClipSelectors";
import { selectPortaledPatternClipStream } from "types/Arrangement/ArrangementSelectors";
import { PortaledPatternClip } from "types/Clip/ClipTypes";
import { useStore, useDispatch } from "types/hooks";
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
import { selectTrackMidiScale } from "types/Track/TrackSelectors";
import { autoBindNoteToTrack } from "types/Track/TrackUtils";
import { selectTransportBPM } from "types/Transport/TransportSelectors";
import { isFiniteNumber } from "types/util";
import {
  getDurationTicks,
  getStraightDuration,
  getTickDuration,
  ticksToSeconds,
} from "utils/durations";
import { format, mod } from "utils/math";

export const usePatternClipScore = (clip: PortaledPatternClip) => {
  const dispatch = useDispatch();
  const bpm = useStore(selectTransportBPM);
  const scale = useStore((_) => selectTrackMidiScale(_, clip.trackId));
  const midi = useStore((_) => selectPortaledPatternClipStream(_, clip.id));
  const stream = midi.flatMap((n) => n.notes.filter((n) => "velocity" in n));
  const xml = useStore((_) => selectPortaledPatternClipXML(_, clip));
  const staves = useMemo(() => getMidiStreamStaves(stream), [stream]);
  const onGrandStaff = staves === "grand";

  // The hook stores an input duration for editing notes
  const holding = useHeldHotkeys(["shift", "/", ",", ".", "-", "`"]);
  const [_duration, setDuration] = useState(getDurationTicks("16th"));
  const isTriplet = holding["/"];
  const isDotted = holding["."];
  const isNegative = holding["-"] || holding["`"];
  const asRest = holding[","];
  const asChord = holding["shift"];
  const modifier = isTriplet ? "Triplet" : isDotted ? "Dotted" : "Straight";
  const ratio = isTriplet ? 2 / 3 : isDotted ? 3 / 2 : 1;
  const duration = _duration * ratio;
  const type = getStraightDuration(getTickDuration(duration));
  const ticks = format(ticksToSeconds(duration, bpm), 4);
  const object = asRest ? "Rest" : asChord ? "Chord" : "Note";
  const input = `${modifier} ${type} ${object} (${ticks}s)`;

  // The score zooms out with a bigger stream range
  const { min, max } = useMemo(() => getMidiStreamMinMax(stream), [stream]);
  const spread = isFiniteNumber(max) ? max - min : 0;
  const decay = onGrandStaff ? 1 / 220 : 1 / 150;
  const initial = onGrandStaff ? 0.9 : 0.8;
  const zoom = initial - spread * decay;

  // Toggle the visibility and index on click
  const onNoteClick = useCallback<NoteCallback>((cursor, index) => {
    if (cursor.hidden) cursor.show();
    else if (cursor.index === index) cursor.hide();
    cursor.setIndex(index);
  }, []);

  const { score, cursor } = useOSMD({
    id: `${clip.id}_score`,
    xml,
    className: "size-full",
    stream,
    zoom,
    noteColor: "fill-black",
    onNoteClick,
  });
  const index = cursor.hidden ? undefined : cursor.index;

  const Score = useMemo(
    () => (
      <div
        className="bg-white max-w-xl -ml-0.5 -mr-0.5 overflow-scroll shrink"
        style={{ height: onGrandStaff ? 150 : 74 }}
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
    (MIDI = 60, useScale = false, degree: number | undefined = undefined) => {
      if (asRest || MIDI === undefined) return playRest();
      const id = clip.patternId;
      const size = scale?.length ?? 0;
      let note: PatternNote = { duration, MIDI, velocity: 100 };
      if (useScale && size && degree !== undefined) {
        degree = mod(degree, scale.length);
        if (isNegative) degree = -1 + size - degree;
        const offset = Math.floor((isNegative ? -1 - degree : degree) / size);
        note.MIDI = scale.at(degree)! + offset * 12;
      } else if (useScale) {
        note = dispatch(autoBindNoteToTrack(clip.trackId, note));
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
    [clip, scale, index, duration, asRest, asChord, isNegative, playRest]
  );

  return { Score, index, playNote, setDuration, duration, input };
};
