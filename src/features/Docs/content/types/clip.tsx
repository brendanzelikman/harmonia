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
              there are two kinds of Clips:
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
                  title: "Pose Clips",
                  description:
                    "Applies a Pose to a Scale Track's Scale or a Pattern Clip's Pattern.",
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
            essential for scheduling audio, whereas the use of Pose Clips is
            entirely optional and offers additional functionality. Pattern Clips
            can also be exported to MIDI and MusicXML files or recorded as WAV
            files for further composition, playback, and analysis.
          </DocsParagraph>
        }
      />
      <DocsSection
        question="Why are there no Scale Clips?"
        answer={
          <>
            <DocsParagraph>
              Rather than patching in Scale Clips whenever our harmony changes,
              it would serve us better to define our scales once and then
              methodically develop them, separating unrelated scales into
              distinct structures. With this approach, we can clearly define a
              musical structure that remains consistent throughout our music and
              rely on Pose Clips for transformation. This decision may be
              reconsidered in the future, but for now, we believe that this is
              the best approach for our users.
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
