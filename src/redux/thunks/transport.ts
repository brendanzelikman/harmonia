import { sleep, ticksToSubdivision } from "appUtil";
import { startTone } from "index";
import {
  selectTransport,
  selectTracks,
  selectPatternTrackSamplers,
  selectChordsByTicks,
} from "redux/selectors";
import {
  _loopTransport,
  _setBPM,
  _setLoopEnd,
  _setLoopStart,
  _setMute,
  _setTimeSignature,
  setLoaded,
  setLoading,
  _setVolume,
  convertTicksToSeconds,
  transportSlice,
} from "redux/slices/transport";
import { AppThunk } from "redux/store";
import { getContext, getDestination, start, Transport } from "tone";
import {
  buildInstruments,
  createGlobalInstrument,
  destroyInstruments,
  getSampler,
  isSamplerLoaded,
} from "types/instrument";
import { MIDI } from "types/midi";
import { Tick, Time } from "types/units";

const { _startTransport, _pauseTransport, _stopTransport, _seekTransport } =
  transportSlice.actions;

export const startTransport = (): AppThunk => (dispatch, getState) => {
  // Make sure the context is started
  if (getContext().state !== "running") return startTone(true);
  const oldState = getState();
  const transport = selectTransport(oldState);
  const pulse = convertTicksToSeconds(transport, 1);

  Transport.PPQ = MIDI.PPQ;
  // Schedule patterns
  if (transport.state === "stopped") {
    let samplers = selectPatternTrackSamplers(oldState);

    // Schedule the transport
    Transport.scheduleRepeat((time) => {
      const state = getState();
      const transport = selectTransport(state);

      // Iterate over the streams at the current tick
      const chordsByTick = selectChordsByTicks(state);
      const chords = chordsByTick[transport.tick] ?? {};

      if (Object.keys(chords).length) {
        for (const { trackId, chord } of chords) {
          // Get the track sampler
          let sampler = samplers[trackId];

          // If not loaded, try to get a new sampler
          if (!isSamplerLoaded(sampler)) {
            const newSampler = getSampler(trackId);
            if (!newSampler?.loaded || newSampler?.disposed) continue;
            // Update the samplers
            samplers = { ...samplers, [trackId]: newSampler };
            sampler = newSampler;
          }

          // Find the notes to play of the clip
          if (!chord || !chord.length) continue;
          if (chord.some((note) => MIDI.isRest(note))) continue;

          // Play the chord
          if (!isSamplerLoaded(sampler)) continue;
          const pitches = chord.map((note) => MIDI.toPitch(note.MIDI));
          const duration = chord[0].duration ?? MIDI.EighthNoteTicks;
          const subdivision = ticksToSubdivision(duration);
          const velocity = chord[0].velocity ?? MIDI.DefaultVelocity;
          const scaledVelocity = velocity / MIDI.MaxVelocity;
          sampler.triggerAttackRelease(
            pitches,
            subdivision,
            time,
            scaledVelocity
          );
        }
      }
      // Schedule the next tick
      if (transport.loop && transport.tick === transport.loopEnd) {
        dispatch(_seekTransport(transport.loopStart));
      } else {
        dispatch(_seekTransport(transport.tick + 1));
      }
    }, pulse);
  }

  Transport.start();
  dispatch(_startTransport());
};

// Stop the transport
export const stopTransport = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  Transport.stop();
  Transport.cancel();
  Transport.position = 0;
  dispatch(_stopTransport());
};

// Pause the transport
export const pauseTransport = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  Transport.pause();
  dispatch(_pauseTransport());
};

// Seek the transport
export const seekTransport =
  (tick: Tick): AppThunk =>
  (dispatch, getState) => {
    if (tick < 0) return;
    const state = getState();
    Transport.seconds = convertTicksToSeconds(state.transport, tick);
    dispatch(_seekTransport(tick));
  };

// Set the loop state
export const setTransportLoop =
  (loop: boolean): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);
    Transport.loop = loop;
    if (loop) {
      const { loopStart, loopEnd } = transport;
      Transport.loopStart = convertTicksToSeconds(transport, loopStart);
      Transport.loopEnd = convertTicksToSeconds(transport, loopEnd);
    }
    dispatch(_loopTransport(loop));
  };

// Toggle the loop state
export const toggleTransportLoop = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const transport = selectTransport(state);
  dispatch(setTransportLoop(!transport.loop));
};

// Set the loop start
export const setTransportLoopStart =
  (tick: Tick): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);
    if (tick >= transport.loopEnd) return;
    Transport.loopStart = convertTicksToSeconds(transport, tick);
    dispatch(_setLoopStart(tick));
  };

// Set the loop end
export const setTransportLoopEnd =
  (tick: Tick): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);
    if (tick <= transport.loopStart) return;
    Transport.loopEnd = convertTicksToSeconds(transport, tick);
    dispatch(_setLoopEnd(tick));
  };

// Set the BPM
export const setTransportBPM =
  (bpm: number): AppThunk =>
  (dispatch) => {
    Transport.bpm.value = bpm;
    dispatch(_setBPM(bpm));
  };

// Set the time signature
export const setTransportTimeSignature =
  (timeSignature: [number, number]): AppThunk =>
  (dispatch) => {
    Transport.timeSignature = timeSignature;
    dispatch(_setTimeSignature(timeSignature));
  };

// Set the volume
export const setTransportVolume =
  (volume: number): AppThunk =>
  (dispatch) => {
    getDestination().volume.value = volume;
    dispatch(_setVolume(volume));
  };

// Set the mute
export const setTransportMute =
  (mute: boolean): AppThunk =>
  (dispatch) => {
    getDestination().mute = mute;
    dispatch(_setMute(mute));
  };

// Load the transport
export const loadTransport = (): AppThunk => async (dispatch, getState) => {
  // Build the instruments
  const state = getState();
  const transport = selectTransport(state);
  const tracks = selectTracks(state);
  try {
    dispatch(setLoaded(false));
    // Wait for the context to start
    await start();
    dispatch(setLoading(true));

    // Build the instruments
    dispatch(buildInstruments(tracks));
    createGlobalInstrument();

    // Copy the transport state
    Transport.loop = transport.loop;
    Transport.loopStart = convertTicksToSeconds(transport, transport.loopStart);
    Transport.loopEnd = convertTicksToSeconds(transport, transport.loopEnd);
    Transport.bpm.value = transport.bpm;
    getDestination().volume.value = transport.volume;
    getDestination().mute = transport.mute;
  } catch (e) {
    console.error(e);
  } finally {
    // Take an extra 0.1 seconds to load :)
    await sleep(100);
    dispatch(setLoaded(true));
    dispatch(setLoading(false));
  }
};

export const unloadTransport = (): AppThunk => (dispatch) => {
  dispatch(_stopTransport());
  dispatch(setLoaded(false));
  dispatch(setLoading(false));
  Transport.cancel();
  Transport.stop();
  destroyInstruments();
};
