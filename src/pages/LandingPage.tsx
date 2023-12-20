import { useNavigate } from "react-router-dom";

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
import { setAuthenticatedStatus } from "indexedDB";
import LogoImage from "assets/images/logo.png";
import LandingBackground from "assets/images/landing-background.png";
import classNames from "classnames";
import { promptModal } from "components/Modal";

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthenticationStatus();

  const onClick = async () => {
    if (isAuthenticated) {
      return navigate("/projects");
    } else {
      const password = await promptModal(
        "Welcome to Harmonia!",
        "Please enter the password to proceed."
      );
      if (password === import.meta.env.VITE_PASSWORD) {
        setAuthenticatedStatus(true);
        navigate("/projects");
      } else {
        setAuthenticatedStatus(false);
      }
    }
  };

  const SplashScreen = () => (
    <Section>
      <div className="relative flex flex-col pt-16 items-center font-nunito text-slate-50">
        <img
          src={LogoImage}
          className={`w-2/3 max-w-[300px] rounded-full transition-all shadow-[0_0_50px_50px_#01bcfa30]`}
        />
        <h1 className="my-2 font-bold sm:text-9xl text-6xl drop-shadow-xl">
          Harmonia
        </h1>
        <p className="font-normal sm:text-4xl text-xl drop-shadow-xl">
          Illuminate the Geometry of Music
        </p>
      </div>

      <button
        onClick={onClick}
        className="mt-16 py-6 px-9 text-slate-100 bg-sky-500/60 hover:bg-sky-950/90 hover:shadow-[0px_0px_10px_5px_rgb(15,150,200)] active:animate-pulse transition-all duration-300 ring-2 ring-slate-900/20 hover:ring-slate-100/20 rounded-2xl backdrop-blur-xl shadow-2xl drop-shadow-2xl sm:text-4xl text-2xl font-light"
      >
        Make Music Now!
      </button>
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

  const HeroImage = (props: { src: string }) => (
    <img
      src={props.src}
      className="w-[66%] max-w-[800px] border-8 border-gray-900/80 backdrop-blur shadow-[0_0_30px_0_rgb(15,170,200)] rounded-lg"
    />
  );

  const Section = (props: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <section
      className={classNames(
        props.className,
        "relative flex flex-col items-center w-full min-h-screen py-5 shrink-0"
      )}
    >
      {props.children}
    </section>
  );

  const TimelineHero = () => (
    <Section>
      <HeroImage src={TimelineImage} />
      <div className="w-full flex flex-row flex-wrap justify-center gap-x-8 px-8 my-4 mt-8">
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
      </div>
    </Section>
  );

  const ScaleHero = () => (
    <Section>
      <HeroImage src={ScaleEditorImage} />
      <div className="w-full flex flex-row flex-wrap justify-center gap-x-8 px-8 my-4 mt-8">
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
      </div>
    </Section>
  );

  const PatternHero = () => (
    <Section>
      <HeroImage src={PatternEditorImage} />
      <div className="w-full flex flex-row flex-wrap justify-center gap-x-8 px-8 my-4 mt-8">
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
      </div>
    </Section>
  );

  const PoseHero = () => (
    <Section>
      <HeroImage src={PoseImage} />
      <div className="w-full flex flex-row flex-wrap justify-center gap-x-8 px-8 my-4 mt-8">
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
      </div>
    </Section>
  );

  const LibraryHero = () => (
    <Section className="justify-center">
      <div className="w-full items-center justify-center flex flex-row flex-wrap px-4 space-x-6 [&>a]:md:w-1/6 [&>a]:w-[100px] [&>a>img]:max-w-[200px] [&>a>img]:w-full">
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
      </div>
      <div className="text-center mt-16 font-bold lg:text-6xl md:text-4xl text-2xl text-slate-100">
        Powered by Cutting-Edge Libraries
      </div>
      <div className="lg:mt-8 md:mt-4 mt-2 font-normal lg:text-3xl md:text-xl text-md text-slate-400">
        Built with React, Typescript, Redux, Tone.js, Tailwind, et al.
      </div>
    </Section>
  );

  return (
    <main className="relative font-nunito animate-in fade-in duration-75 flex flex-col w-full h-screen overflow-scroll">
      <img
        src={LandingBackground}
        className="fixed opacity-50 h-screen landing-background"
      />
      <SplashScreen />
      {!!isAuthenticated && (
        <>
          <TimelineHero />
          <ScaleHero />
          <PatternHero />
          <PoseHero />
          <LibraryHero />
        </>
      )}
    </main>
  );
}
