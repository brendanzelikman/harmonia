import { DocsList, DocsParagraph, DocsSection } from "../../components";

export function EfficientVoiceLeadingsDocsContent() {
  return (
    <>
      <DocsSection
        question="What are Efficient Voice Leadings?"
        answer={
          <>
            <DocsParagraph>
              An efficient voice leading is, simply put, a change in harmony
              that minimizes the distance that any note has to move. It is
              perhaps the quintessential technique of Western music theory and
              it allows a composer to create a smooth transition between
              virtually any two chords or scales.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="How can I use them in Harmonia?"
        answer={
          <>
            <DocsParagraph>
              Believe it or not, most efficient voice leadings can be perfectly
              deconstructed into a transposition along a scale and an inversion
              along a chord, making them perfect for use in Harmonia with no
              loss of generality. In fact, the Pose Vector is designed to
              capture this exact phenomenon, allowing you to express any
              efficient voice leading as a single Pose Vector that can be
              applied to any chord or scale.
            </DocsParagraph>
            <DocsParagraph>
              For example, consider a C major triad that moves from C major to G
              major. Instead of just moving every note up by fifth (
              {`i.e. C-E-G => G-B-D`}), we might opt to move the C down to a B
              and the E down to a D ({`i.e. C-E-G => B-D-G`}), creating a
              subtler transition that keeps the notes closer together. This is
              the most efficient voice leading from C major to G major, and it
              results in a more natural-sounding progression between the two
              harmonies that avoids making any leaps between pitches.
            </DocsParagraph>
            <DocsParagraph>
              This efficient voice leading can be notated as (N7 • t-2) with a
              Pose Vector, since every note moves up by perfect fifth (7 steps
              along the chromatic scale) and then the chord is inverted down (2
              steps along the chordal scale). In general, we can move our notes
              along any set of scales, opening up a wide range of possibilities
              for voice leadings, efficient and otherwise.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="Can you give me some examples?"
        answer={
          <>
            <DocsParagraph>
              Of course! You can find many examples in the preset Poses provided
              by Harmonia, but here are some that you can put in your back
              pocket right now:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "Tonic Triad to its Subdominant",
                  description: "(N5 • t-1)",
                  examples: [`(C, E, G) => (F, A, C) => (C, F, A)`],
                },
                {
                  title: "Tonic Triad to its Dominant",
                  description: "(N-5 • t1)",
                  examples: [`(C, E, G) => (G, B, D) => (B, D, G)`],
                },
                {
                  title: "Modulation to Parallel Minor",
                  description: "(N3 • t-2)",
                  examples: [`C Major => Eb Major => C Minor`],
                },
                {
                  title: "Dominant 7th Tritone Substitution",
                  description: "(N6 • t-2) or (N-6 • t2)",
                  examples: [
                    `(C, E, G, Bb) => (F#, A#, C#, E) => (C#, E, F#, A#)`,
                  ],
                },
                {
                  title: "Up The Circle of Fifths",
                  description: "(N-5 • t3), (N-10 • t6), ...",
                  examples: [
                    `C Major => C Lydian (G) => C# Locrian (D) => ...`,
                  ],
                },
                {
                  title: "Down The Circle of Fifths",
                  description: "(N5 • t-3), (N10 • t-6), ...",
                  examples: [
                    `C Major => C Mixolydian (F) => C Dorian (Bb) => ...`,
                  ],
                },
              ]}
            />
            <DocsParagraph>
              It's important to note that, although these voice leadings are
              technically "efficient", they are not "perfect" in the sense that
              they are not your only options! In fact, they might not even be
              the best option if the music calls for a more dramatic shift. No
              matter how long you spend learning about efficient voice leadings,
              don't forget that there are no rules unless you want there to be.
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
