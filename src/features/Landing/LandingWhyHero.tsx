import { m } from "framer-motion";
import { Link } from "react-router-dom";
import { LandingSection } from "./components";
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
        Music will always have something indescribable to it. No matter how
        descriptively we may write, music can never be perfectly distilled into
        words. Instead, it is a subjective experience that is continually shaped
        by a multitiude of factors—our anatomy, our brain chemistry, our
        worldview, our culture, our education, our speakers, and so on.
        Generative audio may be useful for replicating stock sounds or creating
        coffee shop music, but an algorithm can never completely understand the
        difference between theory and practice.
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
        Harmonia is not only a liberation of the digital composer from the
        constraints of current software but a stand against the trend of
        deconstructing music into data. For in this reduction, we lose the magic
        that comes from crafting a musical landscape that can be sculpted
        entirely from our own choices—with no right or wrong answers. Harmonia
        is a tool for any and every composer seeking to realize their musical
        vision to the fullest extent humanly possible.{" "}
        <Link to="/playground" className="italic no-underline cursor-pointer">
          Go build!
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
