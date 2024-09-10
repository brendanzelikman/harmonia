import { Sampler } from "tone";
import { getMidiPitch } from "utils/midi";
import { PatternEditorProps } from "../PatternEditor";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { getDurationSubdivision, getDurationTicks } from "utils/durations";
import { EditorPiano } from "features/Editor/components/EditorPiano";
import { useDeep, useProjectDispatch } from "types/hooks";
import {
  addPatternNote,
  updatePatternNote,
  insertPatternNote,
} from "types/Pattern/PatternSlice";
import {
  selectTrackChainIds,
  selectTrackMidiScaleMap,
  selectScaleTrackMap,
} from "types/Track/TrackSelectors";
import { getValueByKey } from "utils/objects";
import { PatternNote } from "types/Pattern/PatternTypes";
import {
  autoBindNoteToTrack,
  getDegreeOfNoteInTrack,
} from "types/Track/TrackThunks";
import { useState } from "react";
import classNames from "classnames";
import { isNestedNote } from "types/Scale/ScaleTypes";
import { mod } from "utils/math";
import { createUndoType } from "lib/redux";
import { nanoid } from "@reduxjs/toolkit";

type PatternPianoMode = "midi" | "autobind" | "filter" | "remap";

export function PatternEditorPiano(props: PatternEditorProps) {
  const dispatch = useProjectDispatch();
  const {
    cursor,
    pattern,
    ptId,
    instance,
    isAdding,
    isInserting,
    isActive,
    isCustom,
    setTab,
  } = props;
  const id = pattern?.id;
  const index = cursor.index;
  const asChord = useHeldHotkeys(["shift"]).shift;
  const { duration } = props.settings.note;
  const chainIds = useDeep((_) => selectTrackChainIds(_, ptId));
  const trackScaleMap = useDeep(selectTrackMidiScaleMap);
  const scaleTrackMap = useDeep(selectScaleTrackMap);
  const durationTicks = getDurationTicks(duration);
  const durationSubdivision = getDurationSubdivision(duration);

  const playNoteAsScaleDegree = (sampler: Sampler, midiNumber: number) => {
    if (!id) return;
    const undoType = createUndoType("playScaleNote", nanoid());

    let note: PatternNote = {
      MIDI: midiNumber,
      duration: durationTicks,
      velocity: 100,
    };

    if (chainIds.length) {
      // Get the scale degree relative to middle C if remapping
      if (mode === "remap") {
        const trackId = chainIds[chainIds.length - 1];
        const scale = trackScaleMap[trackId];
        if (!scale) return;
        const scaleSize = scale.length;
        const degree = mod(midiNumber - 60, scaleSize);
        const octave = Math.floor((midiNumber - 60) / scaleSize);
        note = {
          degree,
          offset: { octave },
          duration: durationTicks,
          velocity: 100,
          scaleId: scaleTrackMap[trackId]?.scaleId,
        };

        // Play the scale note
        if (sampler?.loaded) {
          const pitch = getMidiPitch(scale[degree] + octave * 12);
          const subdivision = isCustom ? durationSubdivision : "4n";
          sampler.triggerAttackRelease(pitch, subdivision, undefined, 1);
        }
      }

      // Otherwise, filter out non scale notes
      else {
        for (let i = chainIds.length - 1; i >= 0; i--) {
          const trackId = chainIds[i];
          const scale = trackScaleMap[trackId];
          if (!scale) continue;
          const scaleId = getValueByKey(scaleTrackMap, trackId)?.scaleId;
          const scaleNote = { ...note, scaleId };
          const degree = dispatch(getDegreeOfNoteInTrack(trackId, scaleNote));
          if (degree < 0) continue;
          const octave = Math.floor(midiNumber - scale[degree]) / 12;
          note = {
            degree,
            offset: { octave },
            duration: durationTicks,
            velocity: 100,
            scaleId: scaleTrackMap[trackId]?.scaleId,
          };
          break;
        }
        if (!isNestedNote(note)) return;
      }
    } else {
      note = {
        MIDI: midiNumber,
        duration: durationTicks,
        velocity: 100,
      };
    }

    // Play the note
    if (sampler?.loaded && mode !== "remap") {
      const pitch = getMidiPitch(midiNumber);
      const subdivision = isCustom ? durationSubdivision : "4n";
      sampler.triggerAttackRelease(pitch, subdivision, undefined, 1);
    }

    // Dispatch the appropriate action
    if (isAdding && cursor.hidden) {
      dispatch(addPatternNote({ data: { id, note, asChord }, undoType }));
    } else if (isAdding && !cursor.hidden) {
      dispatch(
        updatePatternNote({ data: { id, index, note, asChord }, undoType })
      );
    } else if (isInserting) {
      dispatch(insertPatternNote({ data: { id, index, note }, undoType }));
    }
  };

  const playNoteAsMidiNote = (sampler: Sampler, midiNumber: number) => {
    const undoType = createUndoType("playMidiNote", nanoid());
    // Play the note
    if (sampler?.loaded) {
      const pitch = getMidiPitch(midiNumber);
      const subdivision = isCustom ? durationSubdivision : "4n";
      sampler.triggerAttackRelease(pitch, subdivision, undefined, 1);
    }
    if (!id) return;

    // Prepare the corresponding note
    let note: PatternNote = {
      MIDI: midiNumber,
      duration: durationTicks,
      velocity: 100,
    };

    // If autobinding, iterate over all tracks to find the best note
    if (mode === "autobind" && ptId) {
      const bestNote = dispatch(autoBindNoteToTrack(ptId, note));
      if (bestNote) note = bestNote;
    }

    // Dispatch the appropriate action
    if (isAdding && cursor.hidden) {
      dispatch(addPatternNote({ data: { id, note, asChord }, undoType }));
    } else if (isAdding && !cursor.hidden) {
      dispatch(
        updatePatternNote({ data: { id, index, note, asChord }, undoType })
      );
    } else if (isInserting) {
      dispatch(insertPatternNote({ data: { id, index, note }, undoType }));
    }
  };

  const [mode, setMode] = useState<PatternPianoMode>("autobind");
  const isChromatic = mode === "midi" || mode === "autobind";

  const playNote =
    !chainIds.length || isChromatic
      ? playNoteAsMidiNote
      : playNoteAsScaleDegree;

  return (
    <>
      <div className="w-full h-16 bg-gradient-to-t from-slate-900 to-slate-950 border-t border-t-slate-600">
        {!isCustom || !isActive ? null : !chainIds.length ? (
          <button
            className="size-full flex total-center text-slate-200 active:text-slate-300"
            onClick={() => setTab(props.tabs[2])}
          >
            Inputting Chromatic Notes Until Track is Bound
          </button>
        ) : (
          <div className="m-auto w-min px-2 flex lg:gap-4 gap-2 h-full animate-in fade-in font-light">
            <div className="my-auto font-bold pr-4 whitespace-nowrap">
              Piano Mode:
            </div>
            <button
              className={classNames(
                mode === "autobind" ? "bg-emerald-800" : "bg-slate-800/50",
                `whitespace-nowrap min-w-48 px-3 py-0.5 rounded-lg border my-auto`
              )}
              onClick={() => setMode("autobind")}
            >
              Chromatic Notes (Autobind)
            </button>
            <button
              className={classNames(
                mode === "midi" ? "bg-emerald-800" : "bg-slate-800/50",
                `whitespace-nowrap min-w-48 px-3 py-0.5 rounded-lg border my-auto`
              )}
              onClick={() => setMode("midi")}
            >
              Chromatic Notes (MIDI)
            </button>

            <button
              className={classNames(
                mode === "filter" ? "bg-emerald-800" : "bg-slate-800/50",
                `whitespace-nowrap min-w-48 px-3 py-0.5 rounded-lg border my-auto`
              )}
              onClick={() => setMode("filter")}
            >
              Scale Notes (Filter)
            </button>
            <button
              className={classNames(
                mode === "remap" ? "bg-emerald-800" : "bg-slate-800/50",
                `whitespace-nowrap min-w-48 px-3 py-0.5 rounded-lg border my-auto`
              )}
              onClick={() => setMode("remap")}
            >
              Scale Notes (Remap)
            </button>
          </div>
        )}
      </div>
      <EditorPiano
        show={props.isShowingPiano}
        sampler={instance?.sampler}
        className={`border-t-[6px] ${
          isAdding
            ? "border-t-emerald-500"
            : isInserting
            ? "border-t-teal-500"
            : "border-t-slate-400"
        }`}
        playNote={playNote}
      />
    </>
  );
}
