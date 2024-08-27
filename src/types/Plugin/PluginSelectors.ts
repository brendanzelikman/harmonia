import { ticksToSeconds } from "utils/durations";
import { createDeepSelector, createValueSelector } from "lib/redux";
import {
  PluginChordMap,
  PluginData,
  PluginDataMap,
  PluginNote,
} from "./PluginTypes";
import { isPatternTrack } from "types/Track/TrackTypes";
import { selectTrackPatternClipStreamMap } from "types/Arrangement/ArrangementSelectors";
import { selectTrackIds, selectTrackMap } from "types/Track/TrackSelectors";
import { selectTransportBPM } from "types/Transport/TransportSelectors";

/** Select the plugin data map for all tracks. */
export const selectPluginDataMap = createDeepSelector(
  [
    selectTrackPatternClipStreamMap,
    selectTrackIds,
    selectTrackMap,
    selectTransportBPM,
  ],
  (streamMap, trackIds, trackMap, bpm) => {
    const result: PluginDataMap = {};

    // Iterate over all tracks
    for (const trackId of trackIds) {
      const track = trackMap[trackId];
      const streams = streamMap[trackId];
      if (!isPatternTrack(track) || !track.port) continue;

      const chordMap: PluginChordMap = {};

      // Iterate over all blocks in all streams
      for (const stream of streams) {
        for (const block of stream) {
          // Calculate the start time of the block
          const { startTick, notes } = block;
          const startInSeconds = ticksToSeconds(startTick, bpm);
          const startInSamples = Math.round(startInSeconds * 44100);

          // Iterate over each note in the chord
          for (const note of notes) {
            const { MIDI, velocity, duration } = note;

            // Calculate the duration and end tick
            const durationInSeconds = ticksToSeconds(duration - 1, bpm);
            const durationInSamples = Math.round(durationInSeconds * 44100);
            const endInSamples = startInSamples + durationInSamples;

            // Add the note on event
            const noteOn: PluginNote = {
              number: MIDI,
              velocity,
              duration: durationInSamples,
              event: 1,
            };
            if (!chordMap[startInSamples]) chordMap[startInSamples] = [];
            chordMap[startInSamples].push(noteOn);

            // Add the note off event
            const noteOff: PluginNote = {
              number: MIDI,
              velocity,
              duration: 0,
              event: 0,
            };
            if (!chordMap[endInSamples]) chordMap[endInSamples] = [];
            chordMap[endInSamples].push(noteOff);
          }
        }
      }

      // Add the plugin data to the result
      const data: PluginData = { bpm, port: track.port, chordMap };
      result[trackId] = data;
    }

    // Return the result
    return result;
  }
);

/** Select the plugin data for a track. */
export const selectPluginData = createValueSelector(selectPluginDataMap);
