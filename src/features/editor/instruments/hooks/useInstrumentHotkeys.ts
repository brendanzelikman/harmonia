import { InstrumentEditorProps } from "..";
import { useHotkeys } from "react-hotkeys-hook";

interface InstrumentShortcutProps extends InstrumentEditorProps {}

export default function useInstrumentShortcuts(props: InstrumentShortcutProps) {
  const { track, setTrackInstrument } = props;

  // Meta + 1 = Set Track Instrument to Grand Piano
  useHotkeys(
    "meta+1",
    () => {
      if (!track) return;
      setTrackInstrument(track.id, "grand_piano");
    },
    [track]
  );

  // Meta + 2 = Set Track Instrument to Wurly Piano
  useHotkeys(
    "meta+2",
    () => {
      if (!track) return;
      setTrackInstrument(track.id, "wurly_piano");
    },
    [track]
  );

  // Meta + 3 = Set Track Instrument to Electric Guitar
  useHotkeys(
    "meta+3",
    () => {
      if (!track) return;
      setTrackInstrument(track.id, "electric_guitar");
    },
    [track]
  );

  // Meta + 4 = Set Track Instrument to Electric Bass
  useHotkeys(
    "meta+4",
    () => {
      if (!track) return;
      setTrackInstrument(track.id, "electric_bass");
    },
    [track]
  );

  // Meta + 5 = Set Track Instrument to Analog Kick
  useHotkeys(
    "meta+5",
    () => {
      if (!track) return;
      setTrackInstrument(track.id, "analog_kick");
    },
    [track]
  );

  // Meta + 6 = Set Track Instrument to Build Snare
  useHotkeys(
    "meta+6",
    () => {
      if (!track) return;
      setTrackInstrument(track.id, "build_snare");
    },
    [track]
  );

  // Meta + 7 = Set Track Instrument to Build Clap
  useHotkeys(
    "meta+7",
    () => {
      if (!track) return;
      setTrackInstrument(track.id, "build_clap");
    },
    [track]
  );

  // Meta + 8 = Set Track Instrument to Build Closed Hat
  useHotkeys(
    "meta+8",
    () => {
      if (!track) return;
      setTrackInstrument(track.id, "acoustic_closed_hat");
    },
    [track]
  );

  // Meta + 9 = Set Track Instrument to Build Open Hat
  useHotkeys(
    "meta+9",
    () => {
      if (!track) return;
      setTrackInstrument(track.id, "acoustic_open_hat");
    },
    [track]
  );

  // R = Add Reverb Effect
  useHotkeys(
    "r",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "reverb");
    },
    [track]
  );

  // C = Add Chorus Effect
  useHotkeys(
    "c",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "chorus");
    },
    [track]
  );

  // P = Add Phaser Effect
  useHotkeys(
    "p",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "phaser");
    },
    [track]
  );

  // T = Add Tremolo Effect
  useHotkeys(
    "t",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "tremolo");
    },
    [track]
  );

  // V = Add Vibrato Effect
  useHotkeys(
    "v",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "vibrato");
    },
    [track]
  );

  // F = Add Filter Effect
  useHotkeys(
    "f",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "filter");
    },
    [track]
  );

  // E = Add Equalizer Effect
  useHotkeys(
    "e",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "equalizer");
    },
    [track]
  );

  // D = Add Distortion Effect
  useHotkeys(
    "d",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "distortion");
    },
    [track]
  );

  // B = Add Bitcrusher Effect
  useHotkeys(
    "b",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "bitcrusher");
    },
    [track]
  );

  // Shift + D = Add Feedback Delay Effect
  useHotkeys(
    "shift+d",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "feedbackDelay");
    },
    [track]
  );

  // Shift + P = Add Ping Pong Delay Effect
  useHotkeys(
    "shift+p",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "pingPongDelay");
    },
    [track]
  );

  // Shift + C = Add Compressor Effect
  useHotkeys(
    "shift+c",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "compressor");
    },
    [track]
  );

  // Shift + G = Add Gain Effect
  useHotkeys(
    "g",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "gain");
    },
    [track]
  );

  // Shift + L = Add Limiter Effect
  useHotkeys(
    "l",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "limiter");
    },
    [track]
  );

  // Shift + W = Add Warp Effect
  useHotkeys(
    "w",
    () => {
      if (!track) return;
      if (props.isTransportStarted) return;
      props.addInstrumentEffect(track.instrumentId, "warp");
    },
    [track]
  );

  // Backspace = Remove Last Effect
  useHotkeys(
    "backspace",
    () => {
      if (!track) return;
      if (!props.instrument) return;
      const lastEffect = props.instrument.effects.at(-1);
      if (!lastEffect) return;
      props.removeInstrumentEffect(props.instrument.id, lastEffect.id);
    },
    [track]
  );

  // Shift + Backspace = Remove All Effects
  useHotkeys(
    "shift+backspace",
    () => {
      if (!track) return;
      props.removeAllInstrumentEffects(track.instrumentId);
    },
    [track]
  );
}
