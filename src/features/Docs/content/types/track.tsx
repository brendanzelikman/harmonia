import { DocsParagraph } from "../../components";
import { DocsList } from "../../components/DocsList";
import { DocsSection } from "../../components/DocsSection";

export function TrackDocsContent() {
  return (
    <>
      <DocsSection
        question="What is a Track?"
        answer={
          <>
            <DocsParagraph>
              A Track is a wrapper that lets us schedule events throughout a
              project and group them together with any additional information
              provided. Currently, there are two types of Tracks in Harmonia:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Scale Tracks",
                  description:
                    "A wrapper for a Scale that can nest other Scale Tracks and Pattern Tracks.",
                  examples: [
                    `"C Major" Scale Track = { parentId: "chromatic-scale-track", scaleId: "c-major-scale", ...}`,
                    `"Minor Drumkit" Scale Track = { scaleId: "minor-scale", trackIds: ["kick-track", "snare-track", "hihat-track"], ... }`,
                  ],
                },
                {
                  title: "Pattern Tracks",
                  description:
                    "A wrapper for an Instrument that can be nested within a Scale Track.",
                  examples: [
                    `"Grand Piano" Pattern Track = { parentId: "default-scale-track", instrumentId: "piano-sampler", ...}`,
                    `"Major Guitar" Pattern Track = { parentId: "major-scale-track", instrumentId: "guitar-sampler", , ...}`,
                  ],
                },
              ]}
            />
            <DocsParagraph>
              A Track and all of its children are collectively referred to as a{" "}
              <strong className="text-slate-300">Track Hierarchy</strong>. Every
              Scale Track will be initialized with a copy of its parent scale or
              the chromatic scale by default, so you can opt-in to using scales
              as you need. Once created, a Track can be freely rearranged within
              the project and moved between different parents as desired.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="Why are there specifically two kinds of tracks?"
        answer={
          <DocsParagraph>
            Scale Tracks contextualize the notes played by Pattern Tracks, so
            you should think of Scale Tracks not as separate entities from
            Pattern Tracks but more like a wrapper that provides additional
            information about the notes being played. By introducing Scale
            Tracks into the equation, we can not only arrange and organize our
            music within a clearly-defined architecture but we can also produce
            cascading changes that affect multiple tracks at once. This allows
            us to unravel the layers of our music and clearly express our ideas,
            rather than juggling chords and scales around in our heads.
          </DocsParagraph>
        }
      />
      <DocsSection
        question="Why is this not used in other software?"
        answer={
          <>
            <DocsParagraph>
              The contemporary DAW has an instantly recognizable interface that
              has remained largely unchanged for the past 40 years. This
              interface is based on traditional recording techniques from the
              20th century when musicians would record their parts separately
              and then layer them together in post-production, with one track
              dedicated to each part. This workflow is great for composers who
              want to work with audio, but it is fundamentally incompatible with
              the architecture of tonal music, which typically requires several
              layers of abstraction.
            </DocsParagraph>
            <DocsParagraph>
              Over time, DAWs have naturally skewed towards the needs of audio
              producers, opting to preserve their original design while fleshing
              out the functionality of the software in other ways. Although
              there have been some attempts to accomodate tonal music (e.g.
              scale highlighting, score preview, and chord detection), these
              techniques are still largely based on the traditional workflow and
              demand a high level of musical literacy and abstraction from the
              composer. Whether out of fear of change or simply out of habit,
              the conventional use of tracks has never been questioned.
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
