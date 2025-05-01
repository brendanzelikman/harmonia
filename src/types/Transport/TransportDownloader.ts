import {
  selectLastArrangementTick,
  selectMidiChordsByTicks,
} from "types/Arrangement/ArrangementSelectors";
import { _removeOfflineInstrument } from "types/Instrument/InstrumentSlice";
import { createInstrument } from "types/Instrument/InstrumentThunks";
import { InstrumentId } from "types/Instrument/InstrumentTypes";
import { selectProjectName } from "types/Meta/MetaSelectors";
import { playPatternChord } from "types/Pattern/PatternThunks";
import { Project, Thunk } from "types/Project/ProjectTypes";
import {
  selectTrackMap,
  selectTrackAudioInstanceMap,
} from "types/Track/TrackSelectors";
import { TrackId, isPatternTrack } from "types/Track/TrackTypes";
import { ticksToSeconds, PPQ } from "utils/duration";
import { selectTransportBPM } from "./TransportSelectors";
import { loaded, Offline, Sampler } from "tone";
import encodeWAV from "audiobuffer-to-wav";
import { downloadBlob } from "utils/event";
import { dispatchOpen, dispatchClose } from "hooks/useToggle";
import { dispatchDownloadTickEvent } from "./TransportTick";

// --------------------------------------------------------------
// Events
// --------------------------------------------------------------

export const DOWNLOAD_TRANSPORT = "downloadTransport";

/** Dispatch an event to start downloading the transport. */
export const startDownloadingTransport = () => {
  dispatchOpen(DOWNLOAD_TRANSPORT);
  dispatchDownloadTickEvent(0);
};

/** Dispatch an event to stop downloading the transport. */
export const stopDownloadingTransport = () => {
  dispatchClose(DOWNLOAD_TRANSPORT);
  dispatchDownloadTickEvent(0);
};

// --------------------------------------------------------------
// Thunks
// --------------------------------------------------------------

export type TransportDownloadOptions = {
  download: boolean;
  filename: string;
};
export const defaultDownloadOptions: TransportDownloadOptions = {
  download: true,
  filename: "Harmonia Project",
};

/** Download the transport into a WAV file using an offline audio context */
export const downloadTransport =
  (
    _project?: Project,
    options: Partial<TransportDownloadOptions> = defaultDownloadOptions
  ): Thunk<Promise<Blob>> =>
  async (dispatch, getProject) => {
    const project = _project || getProject();

    const bpm = selectTransportBPM(project);
    const ticks = selectLastArrangementTick(project);

    // Get the samplers
    const trackMap = selectTrackMap(project);
    const samplers = selectTrackAudioInstanceMap(project);

    // Calculate the duration and pulse
    const duration = ticksToSeconds(ticks, bpm);
    const tail = 1;
    const pulse = ticksToSeconds(1, bpm);

    // Start downloading
    startDownloadingTransport();

    // Start the offline transport
    const offlineInstrumentIds: InstrumentId[] = [];
    const offlineSamplers: Record<string, Sampler> = {};

    // Create new samplers for the offline transport
    const offlineBuffer = await Offline(async (offlineContext) => {
      for (const trackId in samplers) {
        const track = trackMap[trackId as TrackId];
        if (!isPatternTrack(track)) continue;
        const options = { offline: true, downloading: true };
        const data = { track, options };
        const { instance } = dispatch(createInstrument({ data }));
        if (!instance) continue;

        // Store the sampler and instrument id
        offlineSamplers[track.instrumentId] = instance.sampler;
        offlineInstrumentIds.push(instance.id);
      }

      // Wait for the samplers to load!
      await loaded();

      // Sync the BPM and PPQ
      offlineContext.transport.bpm.value = bpm;
      offlineContext.transport.PPQ = PPQ;

      // Schedule the offline transport
      const chordsByTick = selectMidiChordsByTicks(project);

      // Keep track of the last tick to avoid duplicates
      let lastTick = -1;
      offlineContext.transport.scheduleRepeat((time) => {
        let tick = Math.round(offlineContext.transport.ticks - 1); // Starts from 1

        // Skip the tick if it's the same as the last one
        if (tick === lastTick) tick = lastTick + 1;
        lastTick = tick;

        // Dispatch the tick update
        dispatchDownloadTickEvent(tick);

        // Get the chord record at the current tick
        const chords = chordsByTick[tick] ?? {};
        const instrumentIds = Object.keys(chords);

        // Iterate over the instruments that are to be played at the current tick
        for (const instrumentId of instrumentIds) {
          const chord = chords[instrumentId];
          const sampler = offlineSamplers[instrumentId];
          playPatternChord(sampler, chord, time);
        }
      }, pulse);

      // Start the transport
      offlineContext.transport.start();
    }, duration + tail);

    // Delete all offline instruments
    offlineInstrumentIds.forEach((id) => {
      dispatch(_removeOfflineInstrument(id));
    });

    // Get the data from the buffer
    const buffer = offlineBuffer.get();
    if (!buffer) throw new Error("The buffer is empty!");

    // Encode the buffer into a WAV file
    const wav = encodeWAV(buffer);
    const blob = new Blob([wav], { type: "audio/wav" });

    // Download the file if specified
    if (options?.download) {
      const projectName = selectProjectName(project);
      const name = `${options?.filename ?? projectName}.wav`;
      downloadBlob(blob, name);
    }

    // Stop the download
    stopDownloadingTransport();
    return blob;
  };
