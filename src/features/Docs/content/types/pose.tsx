import { PPQ } from "utils/durations";
import { PresetPoseList } from "assets/poses";
import { DocsList, DocsParagraph, DocsSection } from "../../components";

export function PoseDocsContent() {
  return (
    <>
      <DocsSection
        question="What is a Pose?"
        answer={
          <>
            <DocsParagraph>
              A Pose (short for "Transposition") is defined as a sequential
              stream of "modules" that can each be interpreted as a vector of
              scalar offsets or a nested stream of their own. Each module can
              have a duration expressed in ticks and any other respective
              properties:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Vector Module",
                  description: `A vector of scalar offsets with an optionally finite duration.`,
                  examples: [
                    `Up by Semitone Forever = { vector: { chromaticScale: 1 } }`,
                    `Down by Octave for a Quarter Note = { vector: { majorScale: -7 }, duration: ${PPQ} }`,
                  ],
                },
                {
                  title: "Stream Module",
                  description:
                    "A collection of vectors and streams with an optionally finite duration.",
                  examples: [
                    `Bass Intro = { stream: [{ vector: { chromatic: -12 }, duration: ${PPQ} } }, { vector: { chromatic: 0 } }] }`,
                    `Octave Whammy = { stream: [{ vector: { chromatic: 12 }, duration: 1 } }, { vector: { chromatic: 0 }, duration: 1 } }], duration: ${PPQ} }`,
                  ],
                },
              ]}
            />
            <DocsParagraph>
              If the duration of a module is not specified, it will be treated
              as infinite and persist until the duration of its parent module or
              indefinitely. Otherwise, a module will only be played for a finite
              duration and any stream will be repeated as necessary to match the
              duration of its parent. In general, the duration of a module will
              override the duration of any nested modules.
            </DocsParagraph>
            <DocsParagraph>
              <DocsParagraph>
                There are {PresetPoseList.length} preset poses to choose from,
                but you can always create your own!
              </DocsParagraph>
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="What do Poses do?"
        answer={
          <>
            <DocsParagraph>
              If a Scale is like terrain and a Pattern is like a hike, then a
              Pose is like a force that shifts the route of the path or the
              terrain of the hike. These forces can be permanent or temporary,
              and they can describe intricately scheduled systems or immediate
              transformations:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Arpeggiations, Rotations, and Chord Inversions",
                  examples: [
                    `C, C, C => C, E, G = { stream: [{ chromatic: 0 }, { chromatic: 4 }, { chromatic: 7 }] }`,
                    `C, E, G => E, G, C = { vector: { self: 1 } }`,
                    `C, C, C => C, C/E, C/G = { stream: [{ self: 0 }, { self: 1 }, { self: 2 }] }`,
                  ],
                },
                {
                  title: "Leading Tones, Neighbor Notes, and Enclosures",
                  examples: [
                    `C, C, C => C, B, C = { stream: [{ chromatic: 0}, { chromatic: -1 }, { chromatic: 0 }] }`,
                    `C, C, C => C, D, C = { stream: [{ major: 0 }, { major: 1 }, { major: 0 }] }`,
                    `C, C, C => D, B, C = { stream: [{ major: 1 }, { chromatic: -1 }, { major: 0, chromatic: 0 }] }`,
                  ],
                },
                {
                  title: "Modulation, Modes, and Borrowed Chords",
                  examples: [
                    `C Major => D Major = { vector: { chromatic: 2 } }`,
                    `C Major => F Lydian = { vector: { self: 3 } }`,
                    `C Major => C Minor = { vector: { self: -2, chromatic: 3 } }`,
                  ],
                },
                {
                  title:
                    "Voice Leadings, Chord Progressions, and Musical Forms",
                  examples: [
                    `C, E, G => B, D, G  = { vector: { major: 4, self: -2 } }`,
                    `C Major => D Dorian - G Mixolydian - C Major (ii - V - I) = { stream: [{ self: 1 }, { self: 4 }, { self: 0 }] }`,
                    `A => A' = { vector: { thisScale: 2, thatChord: -1 } }`,
                  ],
                },
              ]}
            />
          </>
        }
      />
      <DocsSection
        question={`What's with the word "Pose"?`}
        answer={
          <>
            <DocsParagraph>
              What is music if not just a bunch of hand and finger poses!
              Although we precisely distinguish between individual techniques
              like arpeggiation, modulation, and voice leading, we should really
              be thinking about the overarching concept of musical motion that
              emerges from our current understanding of transposition. By
              generalizing motion along a scale to encompass any kind of musical
              movement along a discrete axis, we expand the notion of
              transposition into a broader phenomenon of "posing" our music
              between different states.
            </DocsParagraph>
            <DocsParagraph>
              In case you aren't convinced, it's also easier to say, faster to
              read, and takes up 69% less storage space. With a simpler word, we
              can not only save time and space, but also make these concepts
              less intimidating and more accessible to everyone!
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
