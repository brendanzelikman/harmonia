import { Link } from "react-router-dom";
import { LandingSection } from "../components/LandingSection";
import { m } from "framer-motion";
import { CALCULATOR } from "app/router";

const variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
};

export const LandingDetail = () => {
  return (
    <LandingSection className="bg-slate-950 px-4">
      <m.div
        variants={{
          hidden: { opacity: 0, translateY: 20 },
          show: { opacity: 1, translateY: 0 },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        transition={{
          delay: 0.2,
          duration: 0.5,
          delayChildren: 0.2,
          staggerChildren: 0.1,
        }}
        className="py-8 max-sm:p-0 flex gap-24 max-sm:gap-12 justify-evenly flex-wrap *:w-lg *:flex *:flex-col *:gap-5 *:*:first:text-3xl max-sm:*:*:first:text-center max-sm:*:*:first:text-2xl *:*:first:font-bold *:*:last:text-xl max-sm:*:*:last:text-base text-pretty *:*:last:font-light *:*:last:text-gray-300"
      >
        <m.div variants={variants}>
          <div>What is Harmonia?</div>
          <div>
            Harmonia is a musical tool that can be used for precise calculation
            and expressive performance. Whereas most tools constrain you to one
            scale at a time, Harmonia lets you model structures of scales,
            chords, subscales, subchords, and so on—unlocking access to
            challenging musical operations that were previously impossible to
            notate, schedule, and compute.
          </div>
        </m.div>
        <m.div variants={variants}>
          <div>How Do I Use Harmonia?</div>
          <div>
            Harmonia has a workflow based on three kinds of musical objects.
            First, you create a set of <b>trees</b>—tracks that relate your
            scales and samplers together. Then, you write <b>patterns</b>—
            sequences of notes that can be related to your scales. Finally, you
            schedule <b> poses</b>
            —transformations that develop your scales and patterns with robust
            logic. Of course, you can also do whatever you want.
          </div>
        </m.div>
        <m.div variants={variants}>
          <div>Can I Use Harmonia?</div>
          <div>
            Although classical, jazz, and electronica may frequently come up as
            examples, Harmonia is not limited to any particular genre or style.
            It is a versatile tool that is designed to be used by musicians of
            all backgrounds and skill levels. Whether you are a composer,
            performer, hobbyist, or simply someone who enjoys experimenting with
            cool sounds, Harmonia can be an invaluable addition to your digital
            workflow.
          </div>
        </m.div>
        <m.div variants={variants}>
          <div>How Can I Use Harmonia?</div>
          <div>
            Harmonia is a web-based editor that can be used in many different
            ways. You can write and perform standalone music. You can export to
            JSON and collaborate with others. You can export to MIDI and load
            notes in other software. You can export to WAV and listen to audio
            elsewhere. You can record an improvisation to MIDI and/or WAV.
            Whenever you are ready, you can go to the{" "}
            <Link to={CALCULATOR} className="text-blue-400 hover:underline">
              Calculator
            </Link>{" "}
            to start making music.
          </div>
        </m.div>
      </m.div>
    </LandingSection>
  );
};
