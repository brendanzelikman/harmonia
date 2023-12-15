import { useState, useEffect, useCallback } from "react";
import { selectEditor } from "redux/Editor";
import { createGlobalInstrument, selectInstrumentById } from "redux/Instrument";
import { selectPatternTrackById, setPatternTrackInstrument } from "redux/Track";
import { selectSelectedPattern, selectSelectedTrackId } from "redux/Timeline";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import {
  isInstrumentEditorOpen,
  isPatternEditorOpen,
  isScaleEditorOpen,
} from "types/Editor";
import { InstrumentKey, LIVE_AUDIO_INSTANCES } from "types/Instrument";
import { DEFAULT_INSTRUMENT_KEY } from "utils/constants";

export function useEditorInstrument() {
  const dispatch = useProjectDispatch();
  const trackId = useProjectSelector(selectSelectedTrackId);
  const pattern = useProjectSelector(selectSelectedPattern);
  const editor = useProjectSelector(selectEditor);
  const onInstrumentEditor = isInstrumentEditorOpen(editor);
  const onPatternEditor = isPatternEditorOpen(editor);
  const onScaleEditor = isScaleEditorOpen(editor);

  /** The instrument is the selected pattern track's instrument or the global instrument. */
  const track = useProjectSelector((_) => selectPatternTrackById(_, trackId));
  const id = track ? track.instrumentId : "global";
  const instrument = useProjectSelector((_) => selectInstrumentById(_, id));
  const [instance, _setInstance] = useState(LIVE_AUDIO_INSTANCES[id]);

  /** Any tab can only change the instrument by key. */
  const setInstrument = useCallback(
    (instrumentKey: InstrumentKey) => {
      // Change the global instrument if not on the instrument editor
      if (!onInstrumentEditor) {
        const instrument = createGlobalInstrument(instrumentKey);
        if (!instrument) return;
        _setInstance(instrument);
      } else {
        _setInstance(LIVE_AUDIO_INSTANCES[id]);
      }
      // Change the pattern track instrument if on the instrument editor
      if (onInstrumentEditor && track?.id) {
        dispatch(setPatternTrackInstrument(track?.id, instrumentKey));
      }
    },
    [onInstrumentEditor, onPatternEditor, onScaleEditor, track?.id, pattern, id]
  );

  /** Update the instance when the instrument ID or key changes. */
  useEffect(() => {
    _setInstance(LIVE_AUDIO_INSTANCES[id]);
  }, [id, LIVE_AUDIO_INSTANCES[id]]);

  useEffect(() => {
    // Set the instrument to the live instrument's key on the instrument editor
    if (onInstrumentEditor && track?.instrumentId) {
      setInstrument(LIVE_AUDIO_INSTANCES[track.instrumentId]?.key);
    }

    // Set the instrument to the pattern's instrument key on the pattern editor
    if (onPatternEditor && pattern?.instrumentKey) {
      if (pattern.instrumentKey === instance?.key) return;
      setInstrument(pattern.instrumentKey);
    }

    // Set the instrument to piano by default on the scale editor
    if (onScaleEditor && instance?.key !== DEFAULT_INSTRUMENT_KEY) {
      setInstrument(DEFAULT_INSTRUMENT_KEY);
    }
  }, [onInstrumentEditor, onPatternEditor, onScaleEditor, pattern, track]);

  return { instrument, setInstrument, instance };
}
