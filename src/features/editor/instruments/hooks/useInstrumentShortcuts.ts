import useEventListeners from "hooks/useEventListeners";
import { InstrumentEditorProps } from "..";
import {
  INSTRUMENT_CATEGORIES,
  getCategoryInstruments,
} from "types/instrument";
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
          props.addMixerEffect(track.mixerId, "reverb");
        },
      },
      // C = Add Chorus
      c: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addMixerEffect(track.mixerId, "chorus");
        },
      },
      // P = Add Phaser
      p: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addMixerEffect(track.mixerId, "phaser");
        },
      },
      // T = Add Tremolo
      t: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addMixerEffect(track.mixerId, "tremolo");
        },
      },
      // V = Add Vibrato
      v: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addMixerEffect(track.mixerId, "vibrato");
        },
      },

      // F = Add Filter
      f: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addMixerEffect(track.mixerId, "filter");
        },
      },
      // E = Add Equalizer
      e: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addMixerEffect(track.mixerId, "equalizer");
        },
      },
      // D = Add Distortion
      d: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addMixerEffect(track.mixerId, "distortion");
        },
      },
      // B = Add Bitcrusher
      b: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addMixerEffect(track.mixerId, "bitcrusher");
        },
      },
      // Shift + D = Add Feedback Delay
      D: {
        keydown: (e) => {
          if (!track || isHoldingCommand(e)) return;
          if (props.isTransportStarted) return;
          cancelEvent(e);
          props.addMixerEffect(track.mixerId, "feedbackDelay");
        },
      },
      // Shift + P = Add Ping Pong Delay
      P: {
        keydown: (e) => {
          if (!track || isHoldingCommand(e)) return;
          if (props.isTransportStarted) return;
          props.addMixerEffect(track.mixerId, "pingPongDelay");
        },
      },
      // Shift + C = Add Compressor
      C: {
        keydown: (e) => {
          if (!track || isHoldingCommand(e)) return;
          if (props.isTransportStarted) return;
          props.addMixerEffect(track.mixerId, "compressor");
        },
      },
      // G = Add Gain
      g: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          props.addMixerEffect(track.mixerId, "gain");
        },
      },
      // L = Add Limiter
      l: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          props.addMixerEffect(track.mixerId, "limiter");
        },
      },
      // W = Add Warp
      w: {
        keydown: (e) => {
          if (!track || isHoldingModifier(e)) return;
          if (props.isTransportStarted) return;
          props.addMixerEffect(track.mixerId, "warp");
        },
      },
      // Delete = Remove last effect
      // Shift + Delete = Remove all effects
      Backspace: {
        keydown: (e) => {
          if (!track || isInputEvent(e)) return;
          if (!isHoldingShift(e)) {
            if (!props.mixer) return;
            const lastEffect = props.mixer.effects.at(-1);
            if (!lastEffect) return;
            props.removeMixerEffect(props.mixer.id, lastEffect.id);
            return;
          }
          props.removeAllMixerEffects(track.mixerId);
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
