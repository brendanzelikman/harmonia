import { DocsList, DocsParagraph, DocsSection } from "../../components";

export function ClipDocsContent() {
  return (
    <>
      <DocsSection
        question="What is a Clip?"
        answer={
          <>
            <DocsParagraph>
              A Clip is a timed event that is placed in a Track to enact a
              musical idea at a specific tick, additionally containing optional
              information like name, duration, color, and offset. Currently,
              there are three kinds of Clips:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Pattern Clips",
                  description: "Plays a Pattern in a Pattern Track.",
                  examples: [
                    `"Starting Arpeggio" Pattern Clip = {tick: 0, trackId: "piano-track", patternId: "c-major-arpeggio", ... }`,
                    `"Riff Fragment" Pattern Clip = {tick: 12, trackId: "guitar-track", patternId: "riff", offset: 24, duration: 15, ... }`,
                  ],
                },
                {
                  title: "Scale Clips",
                  description:
                    "Changes the Scale of a Track (if the original scale is the same length).",
                  examples: [
                    `"C Minor" Scale Clip = {tick: 0, trackId: "c-major-scale-track", scaleId: "c-minor-scale", ... }`,
                    `"0-1-7" Scale Clip = {tick: 120, duration: 120, trackId: "0-2-5-pattern-track", scaleId: "0-1-7-scale", ... }`,
                  ],
                },
                {
                  title: "Pose Clips",
                  description:
                    "Shifts the notes of a Scale Track's Scale or a Pattern Track's Pattern.",
                  examples: [
                    `"Octave Drop" Pose Clip = {tick: 500, duration: 200, trackId: "scale-track", poseId: "octave-drop", ... }`,
                    `"Chord Inversion" Pose Clip = {tick: 0, trackId: "pattern-track", poseId: "chord-inversion", ... }`,
                  ],
                },
              ]}
            />
          </>
        }
      />
      <DocsSection
        question="What is a Clip used for?"
        answer={
          <DocsParagraph>
            Clips are used to arrange and rearrange musical ideas at large in a
            Track with a consistent reference to a single idea. This allows for
            easy experimentation and exploration without fear of overwriting or
            losing any data. Arranging Pattern Clips within Pattern Tracks is
            essential for scheduling audio, whereas the use of Scale Clips and
            Pose Clips is entirely optional and offers additional functionality.
            Pattern Clips can also be exported to MIDI and MusicXML files or
            recorded as WAV files for further composition, playback, and
            analysis.
          </DocsParagraph>
        }
      />
    </>
  );
}
