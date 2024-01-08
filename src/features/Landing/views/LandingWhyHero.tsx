import { m } from "framer-motion";
import { Link } from "react-router-dom";
import { LandingSection } from "../components";
import Background from "assets/images/landing-background.png";

export const LandingWhyHero = () => (
  <LandingSection className="flex flex-col py-10 px-5 justify-center text-white">
    <m.div
      className="relative p-12 overflow-hidden prose prose-lg prose-invert bg-blue-900/50 rounded-2xl border-4 backdrop-blur border-slate-50/50"
      initial={{ opacity: 0, y: 50, rotate: -5 }}
      whileInView={{
        opacity: 1,
        y: 0,
        rotate: 0,
      }}
      transition={{ delay: 0.1, damping: 1, duration: 0.3, stiffness: 100 }}
    >
      <img
        className="absolute inset-0 w-full h-full object-cover -z-10 opacity-20"
        src={Background}
      />
      <h1 className="whitespace-nowrap">If We're Being Honest...</h1>
      <m.p
        initial={{ opacity: 0, skewX: 5, x: -10 }}
        whileInView={{
          opacity: 1,
          skewX: 0,
          x: 0,
        }}
        transition={{ delay: 0.1 }}
      >
        Music can be intimidating, confusing, and downright frustrating. It's a
        language that anyone can understand, but few can confidently say they
        speak it fluently. There has been a long history of gatekeeping and
        elitism within music, which has unfortunately convinced many people that
        they are not "good enough" to participate. I believe that this is
        fundamentally wrong—music is a universal language that everyone should
        have the opportunity to learn. We just need to find a better way to
        teach it.{" "}
      </m.p>
      <m.p
        initial={{ opacity: 0, skewX: 5, x: -10 }}
        whileInView={{
          opacity: 1,
          skewX: 0,
          x: 0,
        }}
        transition={{ delay: 0.2 }}
      >
        Harmona is my attempt to level the playing field by redesigning our
        musical tools from the ground up to be more intuitive and accessible.
        It's time we moved away from thinking about music as a series of notes
        and start focusing on the larger structures that make it work. I want to
        demystify the secret of tonality and empower musicians to make their own
        decisions, rather than force-feeding them the same tired rules. There is
        so much untapped potential in the world of music software, and I believe
        that we can accelerate the future of music by making it easier for
        everyone to express themselves. With that being said,{" "}
        <Link to="/playground" className="italic no-underline cursor-pointer">
          go build!
        </Link>
      </m.p>
      <m.p
        className="text-right"
        initial={{ opacity: 0, x: 10 }}
        whileInView={{
          opacity: 1,
          x: 0,
        }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        - Brendan Zelikman
      </m.p>
    </m.div>
  </LandingSection>
);
