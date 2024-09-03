import { PresetScaleList } from "assets/scales";
import {
  DocsList,
  DocsParagraph,
  DocsSection,
  DocsTerm,
} from "../../components";

export function ScaleDocsContent() {
  return (
    <>
      <DocsSection
        question="What is a Scale?"
        answer={
          <>
            <DocsParagraph>
              A Scale is a collection of 1–12 unique pitch classes defined in
              two ways:
            </DocsParagraph>
            <DocsList
              items={[
                {
                  title: "MIDI Scales",
                  description: `An array of MIDI note values, stored as numbers or objects.`,
                  examples: [
                    `C Major Scale = [0, 2, 4, 5, 7, 9, 11] => (C, D, E, F, G, A, B)`,
                    `C Minor Chord = [{ MIDI: 60 }, { MIDI: 63 }, { MIDI: 67 }] => (C, Eb, G)`,
                  ],
                },
                {
                  title: "Nested Scales",
                  description: `An array of scale degrees defined in relation to a parent scale`,
                  examples: [
                    `If C Major Scale = [60, 62, 64, 65, 67, 69, 71], then C Major Chord = [{ degree: 1 }, { degree: 3 }, { degree: 5 }]`,
                    `If C Minor Scale = [0, 2, 3, 5, 7, 8, 10], then Eb Major Chord = [{ degree: 3 }, { degree: 5 }, { degree: 7 } ]`,
                  ],
                },
              ]}
            />
            <DocsParagraph>
              A <DocsTerm>Scale Chain</DocsTerm> is an array of scales where
              every scale is the parent of the next scale in the chain. A Nested
              Scale with no parent will be interpreted in relation to the
              chromatic scale, and MIDI notes will override scale degrees.
            </DocsParagraph>
            <DocsParagraph>
              There are {PresetScaleList.length} preset scales to choose from,
              but you can always create your own!
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="How do I use a Scale?"
        answer={
          <>
            <DocsParagraph>
              A Scale is like a path that takes you along a specific journey,
              with special relationships between different stops and various
              proximities to other routes. When composers create fancy-sounding
              voice leadings and chord progressions, they are essentially
              starting at one location and hopping between various paths
              available to them, choosing different steps that play into and
              against the listener's expectations. Though the music might sound
              quite complex, it can often be deconstructed into a simple number
              of steps along a couple of routes.
            </DocsParagraph>

            <DocsParagraph>
              With a scale, we can create any kind of harmonic terrain for our
              music and define various paths for our notes to walk along.
              Usually, the scale will not be heard on its own, but rather it
              will be used to shape the direction of the music and organize
              different thematic ideas. For example, we might compose one
              section in C Major and then alternate to B Minor to create a
              dramatic shift in tonality and mood. Or, we might compose an
              atonal section with no stable key to disorient the listener and
              create a highly dissonant texture. By making these clear
              associations with specific scales (or the lack thereof), we can
              develop a lot of structure and continuity in our compositions.
            </DocsParagraph>
          </>
        }
      />
      <DocsSection
        question="Do chords have scales?"
        answer={
          <DocsParagraph>
            In general, any set of notes—melodic or harmonic—has an intrinsic
            scale describing its tonality. Even though a chord can feature
            duplicate notes or wide intervals, it can still be reduced into a
            list of unique pitche classes that constitute a scale. For example,
            if a musician plays a C major arpeggio up their keyboard (e.g. C1,
            E1, G1, C2, E2, G2, ...), they will be navigating the scale created
            by a C major chord—following the notes C, E, and G. Even though the
            chord is never heard as a single block, it can still be used to
            describe the underlying terrain that the musician is navigating.
          </DocsParagraph>
        }
      />
      <DocsSection
        question="Why use MIDI notes instead of pitches?"
        answer={
          <>
            <DocsParagraph>
              Even though scales are typically expressed as pitch classes, it is
              useful to define them as MIDI notes so that they can be easily
              summed with numerical offsets and notated as pitches on a score.
              For example, if we wanted to transpose a C Major Scale up a minor
              third, we could simply add 3 to each MIDI note in the scale,
              rather than worry about wrapping around the octave and dealing
              with enharmonic spellings. Additionally, if we wanted to notate a
              C Major Scale as pitches on a score, we would have to specify the
              octave for each pitch class, which would necessitate arbitrary
              decisions of octave wrap and musical register. It is always
              possible to ignore the octave information provided by MIDI notes,
              but it is impossible to add it back in if it is not there in the
              first place.
            </DocsParagraph>
          </>
        }
      />
    </>
  );
}
