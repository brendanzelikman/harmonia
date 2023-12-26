import { Link, useNavigate, useRouteError } from "react-router-dom";

import TimelineImage from "assets/images/timeline1.png";
import ScaleEditorImage from "assets/images/scaleEditor.png";
import PatternEditorImage from "assets/images/patternEditor.png";
import PoseImage from "assets/images/timeline2.png";
import ReactImage from "assets/lib/react.png";

import TypescriptImage from "assets/lib/typescript.png";
import ReduxImage from "assets/lib/redux.png";
import ToneImage from "assets/lib/tone.png";
import TailwindImage from "assets/lib/tailwind.png";
import { useAuthenticationStatus } from "hooks";
import { setAuthenticationStatus } from "indexedDB";
import LogoImage from "assets/images/logo.png";
import LandingBackground from "assets/images/landing-background.png";
import classNames from "classnames";
import { promptModal } from "components/Modal";
import { PriceOption } from "components/PriceOption";
import { useCallback, useMemo, useRef } from "react";
import { useBrowserTitle } from "hooks/useBrowserTitle";
import { unpackError } from "lib/react-router-dom";
import { HTMLMotionProps, motion } from "framer-motion";

export function LandingPage() {
  const navigate = useNavigate();
  const auth = useAuthenticationStatus();

  // Check for an error
  const error = useRouteError();
  const hasError = !!error;
  const ErrorText = unpackError(error);

  // The error stack is displayed below the main view upon scrolling down.
  const ErrorStack = () => (
    <div className="w-full p-4 bg-slate-800 text-slate-50">
      <pre className="text-xs">{ErrorText.stack}</pre>
    </div>
  );

  const browserTitle = useMemo(() => {
    if (auth.isFree) return "Harmonia (Free)";
    if (auth.isPro) return "Harmonia (Pro)";
    if (auth.isVirtuoso) return "Harmonia (Virtuoso)";
    return "Harmonia";
  }, [auth]);

  useBrowserTitle(browserTitle);

  // Prompt the user for the password
  const promptPassword = useCallback(async () => {
    const password = await promptModal(
      "Welcome to Harmonia!",
      "Please enter the password to proceed."
    );
    if (password === import.meta.env.VITE_FREE_PASSWORD) {
      setAuthenticationStatus("free");
      navigate("/demos");
    } else if (password === import.meta.env.VITE_PRO_PASSWORD) {
      setAuthenticationStatus("pro");
      navigate("/projects");
    } else if (password === import.meta.env.VITE_VIRTUOSO_PASSWORD) {
      setAuthenticationStatus("virtuoso");
      navigate("/projects");
    } else {
      setAuthenticationStatus(undefined);
    }
  }, []);

  const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (auth.isAuthenticated && !e.altKey) {
      if (e.shiftKey) return navigate("/playground");
      return navigate(auth.isAtLeastPro ? "/projects" : "/demos");
    } else {
      promptPassword();
    }
  };

  const SplashScreen = () => (
    <Section>
      <div className="relative flex flex-col pt-16 items-center font-nunito text-slate-50">
        <motion.img
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{
            ease: "linear",
            duration: 0.2,
          }}
          src={LogoImage}
          className={`w-2/3 max-w-[300px] rounded-full transition-all shadow-[0_0_50px_50px_#01bcfa30]`}
        />
        <motion.h1
          initial={{ opacity: 0, translateY: 50, scale: 1.5 }}
          whileInView={{ opacity: 1, translateY: 0, scale: 1 }}
          className="my-2 font-bold sm:text-9xl text-6xl drop-shadow-xl"
        >
          Harmonia
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, translateY: 5 }}
          whileInView={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className={classNames(
            { "font-normal sm:text-4xl text-xl drop-shadow-xl": !hasError },
            { "font-light sm:text-2xl text-lg text-red-500": hasError }
          )}
        >
          {hasError ? ErrorText.message : "Illuminate the Geometry of Music"}
        </motion.p>
        <motion.button
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          type="button"
          onClick={onClick}
          className="mt-16 py-6 px-9 text-slate-100 bg-[#00aaff]/70 active:bg-blue-950/90 hover:shadow-[0px_0px_10px_10px_rgb(15,150,200)] ring-2 ring-slate-900/20 hover:ring-slate-100/20 rounded-2xl backdrop-blur-xl shadow-2xl drop-shadow-2xl sm:text-4xl text-2xl font-light"
        >
          Make Music Now!
        </motion.button>
      </div>
    </Section>
  );

  const HeroQuote = (props: { title: string; text: string }) => (
    <section className="flex lg:w-2/5 mb-10 md:w-full justify-center items-center">
      <blockquote className="lg:w-[32rem] md:w-full text-center white">
        <h3 className="mb-2 text-slate-50 font-semibold text-2xl whitespace-pre-line">
          {props.title}
        </h3>
        <p className="text-slate-200 font-light text-xl max-h-16">
          {props.text}
        </p>
      </blockquote>
    </section>
  );

  const HeroImage = (props: HTMLMotionProps<"img">) => (
    <motion.img
      {...props}
      className="w-[66%] max-w-[800px] border-8 border-gray-900/80 backdrop-blur shadow-[0_0_30px_0_rgb(15,170,200)] rounded-lg"
    />
  );

  const Section = (props: {
    children?: React.ReactNode;
    className?: string;
  }) => (
    <section
      className={classNames(
        props.className,
        "relative flex flex-col items-center w-full min-h-screen py-5 shrink-0"
      )}
    >
      {props.children ?? null}
    </section>
  );

  const HeroQuoteContainer = (props: { children?: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="w-full flex flex-row flex-wrap justify-center gap-x-8 px-8 my-4 mt-8"
    >
      {props.children}
    </motion.div>
  );

  const TimelineHero = () => (
    <Section>
      <HeroImage
        src={TimelineImage}
        initial={{ opacity: 0, translateY: 50 }}
        whileInView={{ opacity: 1, translateY: 0 }}
      />
      <HeroQuoteContainer>
        <HeroQuote
          title="Revolutionary Music Notation"
          text="Upgrading the digital audio workstation with the power to create musical structures of infinite complexity."
        />

        <HeroQuote
          title="Effortless Harmonic Development"
          text="Compose your ideas once and transpose them around forever without ever having to worry about losing them."
        />
        <HeroQuote
          title="Innovative and Educational"
          text="Effortlessly learn and navigate the geometry of music through Harmonia's universally-accessible interface."
        />

        <HeroQuote
          title="Unleash Your Creativity"
          text="Explore a universe of musical possibilities that were previously inaccessible to the digital composer."
        />
      </HeroQuoteContainer>
    </Section>
  );

  const ScaleHero = () => (
    <Section>
      <HeroImage
        src={ScaleEditorImage}
        initial={{ opacity: 0, translateX: -50 }}
        whileInView={{ opacity: 1, translateX: 0 }}
      />
      <HeroQuoteContainer>
        <HeroQuote
          title="Freely Shape Your Terrain"
          text="Craft any scales you can imagine and revise them at any moment with the dedicated Scale Editor."
        />
        <HeroQuote
          title="Clearly Design Your Tonality"
          text="Organize and group your musical ideas together with an unprecedented amount of clarity and control."
        />
        <HeroQuote
          title="Recursively Nest Your Structures"
          text="Design scales within scales within scales and find out just how deep the rabbit hole can go."
        />
        <HeroQuote
          title="Easily Bounce Off Presets"
          text="Waste no time and get started right away with carefully curated presets from various genres of music."
        />
      </HeroQuoteContainer>
    </Section>
  );

  const PatternHero = () => (
    <Section>
      <HeroImage
        src={PatternEditorImage}
        initial={{ opacity: 0, translateX: 50 }}
        whileInView={{ opacity: 1, translateX: 0 }}
      />
      <HeroQuoteContainer>
        <HeroQuote
          title="Organically Sketch Your Patterns"
          text="Write out the building blocks of your music and painlessly develop them with the dedicated Pattern Editor."
        />

        <HeroQuote
          title="Rapidly Iterate Your Themes"
          text="Choose from a streamlined toolkit of transformations and compose variations of your music with no problem."
        />
        <HeroQuote
          title="Precisely Express Your Ideas"
          text="Bind the notes of your pattern to any scale and show any degrees or alterations with full transparency."
        />

        <HeroQuote
          title="Avoid the Pain of Revision"
          text="Never lose your ideas again and effortlessly rework your music by making sweeping changes in seconds."
        />
      </HeroQuoteContainer>
    </Section>
  );

  const PoseHero = () => (
    <Section>
      <HeroImage
        src={PoseImage}
        initial={{ opacity: 0, translateY: 100 }}
        whileInView={{ opacity: 1, translateY: 0 }}
      />
      <HeroQuoteContainer>
        <HeroQuote
          title="Model Your Musical Motion"
          text="Clearly express any transpositions, arpeggiations, voice leadings, chord progressions, and even entire song forms."
        />
        <HeroQuote
          title="Navigate the Geometry of Music"
          text="Visualize the relationships between different musical structures and easily move through musical space."
        />
        <HeroQuote
          title="Apply Sweeping Changes"
          text="Stack different layers of transformations and act upon multiple sections of your music with one idea."
        />
        <HeroQuote
          title="Forget About Manual Work"
          text="Let Harmonia do the heavy lifting for you and focus on creatively shaping your music in different ways."
        />
      </HeroQuoteContainer>
    </Section>
  );

  const LibraryHero = () => (
    <Section className="justify-center">
      <motion.div
        className="relative w-full items-center justify-center flex flex-row flex-wrap px-4 space-x-6 [&>a]:md:w-1/6 [&>a]:w-[100px] [&>a>img]:max-w-[200px] [&>a>img]:w-full"
        initial={{ opacity: 0, translateY: 100 }}
        whileInView={{ opacity: 1, translateY: 0 }}
      >
        <a href="https://react.dev/" target="_blank">
          <img src={ReactImage} />
        </a>
        <a href="https://www.typescriptlang.org/" target="_blank">
          <img src={TypescriptImage} />
        </a>
        <a href="https://redux.js.org/" target="_blank">
          <img src={ReduxImage} />
        </a>
        <a href="https://tonejs.github.io/" target="_blank">
          <img src={ToneImage} />
        </a>
        <a href="https://tailwindcss.com/" target="_blank">
          <img src={TailwindImage} />
        </a>
      </motion.div>
      <div className="text-center mt-16 font-bold lg:text-6xl md:text-4xl text-2xl text-slate-100">
        Powered by Cutting-Edge Libraries
      </div>
      <div className="lg:mt-8 md:mt-4 mt-2 font-normal lg:text-3xl md:text-xl text-md text-slate-400">
        Built with React, Typescript, Redux, Tone.js, Tailwind, et al.
      </div>
    </Section>
  );

  const WhyHero = () => (
    <Section className="flex flex-col py-10 px-5 justify-center text-white">
      <motion.div
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
          src={LandingBackground}
        />
        <h1>Why Harmonia?</h1>
        <motion.p
          initial={{ opacity: 0, skewX: 5, x: -10 }}
          whileInView={{
            opacity: 1,
            skewX: 0,
            x: 0,
          }}
          transition={{ delay: 0.1 }}
        >
          Music will always have something indescribable to it. No matter how
          descriptively we may write, music can never be perfectly distilled
          into words. Instead, it is a subjective experience that is continually
          shaped by a multitiude of factors—our anatomy, our brain chemistry,
          our worldview, our culture, our education, our speakers, and so on.
          Generative audio may be useful for replicating stock sounds or
          creating coffee shop music, but an algorithm can never completely
          understand the difference between theory and practice.
        </motion.p>
        <motion.p
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
          deconstructing music into data. For in this reduction, we lose the
          magic that comes from crafting a musical landscape that can be
          sculpted entirely by our own choices—with no right or wrong answers.
          Harmonia is a tool for any and every composer seeking to realize their
          musical vision to the fullest extent humanly possible.{" "}
          <Link to="/playground" className="italic no-underline cursor-pointer">
            Go build.
          </Link>
        </motion.p>
        <motion.p
          className="text-right"
          initial={{ opacity: 0, x: 10 }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          - Brendan Zelikman
        </motion.p>
      </motion.div>
    </Section>
  );

  const PricingHero = () => (
    <Section className="py-10 px-5 justify-center text-white">
      <div className="w-full flex flex-wrap justify-center gap-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{ delay: 0.1 }}
        >
          <PriceOption
            name="free"
            price={0}
            description="Work any time on the web."
            features={[
              "Access to Website",
              "Export to HAM + WAV",
              "Access to Limited Presets",
              "Read/Write Local Projects",
              "All Core Functionality",
              "Full Documentation",
              "Community Support",
            ]}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{ delay: 0.2 }}
        >
          <PriceOption
            name="pro"
            price={10}
            monthly
            description="Unleash the Playground."
            features={[
              "Live Mixing and Posing",
              "Export to MIDI + MusicXML",
              "Access to Extensive Presets",
              "Store Up to 100 Projects",
              "Compatible with MIDI Devices",
              "Developer Gratitude",
              "Email Support",
            ]}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{ delay: 0.3 }}
        >
          <PriceOption
            name="virtuoso"
            price={20}
            monthly
            description="Go even further beyond."
            features={[
              "Desktop Application",
              "Sync With VST Plugin",
              "Access to All Presets",
              "Store Unlimited Projects",
              "Real-Time Collaboration",
              "Developer Love",
              "Request Any Feature",
            ]}
          />
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="mt-20 text-3xl p-4 px-6 rounded-xl font-light bg-slate-950/50 ring-1 ring-gray-500 backdrop-blur"
      >
        Pricing will be implemented soon. Please stay tuned!
      </motion.h1>
    </Section>
  );

  const Observatory = () => (
    <Section className="mt-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="mt-auto text-blue-200/50 select-none"
      >
        Background Credits:{" "}
        <a
          href="https://coolbackgrounds.io/"
          className="hover:text-blue-400 transition-colors duration-200"
          target="_blank"
        >
          CoolBackgrounds.io
        </a>
      </motion.div>
    </Section>
  );

  const showBody = !hasError && !!auth.isAuthenticated;
  const showStack = hasError;

  return (
    <main className="relative font-nunito animate-in fade-in duration-75 flex flex-col w-full h-screen overflow-scroll">
      <img
        src={LandingBackground}
        className="fixed opacity-50 h-screen object-cover landing-background"
      />
      <SplashScreen />
      {showBody && (
        <>
          <PricingHero />
          <LibraryHero />
          <TimelineHero />
          <ScaleHero />
          <PatternHero />
          <PoseHero />
          <WhyHero />
          <Observatory />
        </>
      )}
      {showStack && <ErrorStack />}
    </main>
  );
}
