import useEventListeners from "hooks/useEventListeners";
import { InstrumentEditorProps, getCategoryInstruments } from "..";
import { INSTRUMENT_CATEGORIES } from "types/instrument";

interface InstrumentShortcutProps extends InstrumentEditorProps {}

export default function useInstrumentShortcuts(props: InstrumentShortcutProps) {
  const { track, instruments, setTrackInstrument } = props;
  const { instrumentKey, instrumentCategory } = props;
  useEventListeners(
    {
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
