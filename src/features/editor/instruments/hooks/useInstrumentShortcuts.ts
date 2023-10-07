import useEventListeners from "hooks/useEventListeners";
import { InstrumentEditorProps } from "..";
import {
  INSTRUMENT_CATEGORIES,
  getCategoryInstruments,
} from "types/Instrument";
import {
  cancelEvent,
  isHoldingCommand,
  isHoldingModifier,
  isHoldingShift,
  isInputEvent,
} from "utils";

interface InstrumentShortcutProps extends InstrumentEditorProps {}

export default function useInstrumentShortcuts(props: InstrumentShortcutProps) {
  const { track, instruments, setTrackInstrument, isTransportStarted } = props;
  const { instrumentKey, instrumentCategory } = props;
  useEventListeners(
    {
      //  R = Add Reverb
      r: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addInstrumentEffect(track.instrumentId, "reverb");
        },
      },
      // C = Add Chorus
      c: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addInstrumentEffect(track.instrumentId, "chorus");
        },
      },
      // P = Add Phaser
      p: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addInstrumentEffect(track.instrumentId, "phaser");
        },
      },
      // T = Add Tremolo
      t: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addInstrumentEffect(track.instrumentId, "tremolo");
        },
      },
      // V = Add Vibrato
      v: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addInstrumentEffect(track.instrumentId, "vibrato");
        },
      },

      // F = Add Filter
      f: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addInstrumentEffect(track.instrumentId, "filter");
        },
      },
      // E = Add Equalizer
      e: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addInstrumentEffect(track.instrumentId, "equalizer");
        },
      },
      // D = Add Distortion
      d: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addInstrumentEffect(track.instrumentId, "distortion");
        },
      },
      // B = Add Bitcrusher
      b: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addInstrumentEffect(track.instrumentId, "bitcrusher");
        },
      },
      // Shift + D = Add Feedback Delay
      D: {
        keydown: (e) => {
          if (!track || isHoldingCommand(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addInstrumentEffect(track.instrumentId, "feedbackDelay");
        },
      },
      // Shift + P = Add Ping Pong Delay
      P: {
        keydown: (e) => {
          if (!track || isHoldingCommand(e)) return;
          if (props.isTransportStarted) return;
          props.addInstrumentEffect(track.instrumentId, "pingPongDelay");
        },
      },
      // Shift + C = Add Compressor
      C: {
        keydown: (e) => {
          if (!track || isHoldingCommand(e)) return;
          if (props.isTransportStarted) return;
          props.addInstrumentEffect(track.instrumentId, "compressor");
        },
      },
      // G = Add Gain
      g: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          props.addInstrumentEffect(track.instrumentId, "gain");
        },
      },
      // L = Add Limiter
      l: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          props.addInstrumentEffect(track.instrumentId, "limiter");
        },
      },
      // W = Add Warp
      w: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          props.addInstrumentEffect(track.instrumentId, "warp");
        },
      },
      // Delete = Remove last effect
      // Shift + Delete = Remove all effects
      Backspace: {
        keydown: (e) => {
          if (!track || isInputEvent(e)) return;
          if (!isHoldingShift(e)) {
            if (!props.instrument) return;
            const lastEffect = props.instrument.effects.at(-1);
            if (!lastEffect) return;
            props.removeInstrumentEffect(props.instrument.id, lastEffect.id);
            return;
          }
          props.removeAllInstrumentEffects(track.instrumentId);
        },
      },
      ArrowLeft: {
        keydown: () => {
          if (!track) return;
          const index = instruments.findIndex(
            ({ key }: { key: any }) => key === instrumentKey
          );
          const prevInstrument = instruments[index - 1] || instruments.at(-1);
          if (prevInstrument) {
            setTrackInstrument(track.id, prevInstrument.key);
          }
        },
      },
      ArrowRight: {
        keydown: () => {
          if (!track) return;
          const index = instruments.findIndex(
            ({ key }: { key: any }) => key === instrumentKey
          );
          const nextInstrument = instruments[index + 1] || instruments[0];
          if (nextInstrument) {
            setTrackInstrument(track.id, nextInstrument.key);
          }
        },
      },
      ArrowUp: {
        keydown: () => {
          if (!track) return;
          const index = INSTRUMENT_CATEGORIES.findIndex(
            (category) => category === instrumentCategory
          );
          const prevCategory =
            INSTRUMENT_CATEGORIES[index - 1] || INSTRUMENT_CATEGORIES.at(-1);
          if (prevCategory) {
            const prevInstrument = getCategoryInstruments(prevCategory)[0];
            setTrackInstrument(track.id, prevInstrument.key);
          }
        },
      },
      ArrowDown: {
        keydown: () => {
          if (!track) return;
          const index = INSTRUMENT_CATEGORIES.findIndex(
            (category) => category === instrumentCategory
          );
          const nextCategory =
            INSTRUMENT_CATEGORIES[index + 1] || INSTRUMENT_CATEGORIES[0];
          if (nextCategory) {
            const nextInstrument = getCategoryInstruments(nextCategory)[0];
            setTrackInstrument(track.id, nextInstrument.key);
          }
        },
      },
    },
    [track, instrumentKey, instruments, instrumentCategory]
  );
}
