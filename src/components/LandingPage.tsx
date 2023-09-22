import useEventListeners from "hooks/useEventListeners";
import { Background, Splash } from "./Logo";

export default function LandingPage() {
  useEventListeners(
    {
      " ": {
        keydown: () => {
          window.location.href = "/harmonia/playground";
        },
      },
    },
    []
  );
  return (
    <main className="relative font-nunito fade-in flex flex-col w-full h-screen overflow-scroll">
      <Background />
      <SplashScreen />
      <TimelineHero />
      <ScaleHero />
      <PatternHero />
      <LibraryHero />
      <ContactHero />
    </main>
  );
}

export const MainButton = (props: { href: string; text: string }) => (
  <a
    href={props.href}
    className="border border-slate-200/50 py-5 px-8 rounded-xl drop-shadow-xl text-slate-50 backdrop-blur bg-sky-700/40 hover:bg-gradient-to-t hover:from-sky-600/50 hover:to-sky-600/80 lg:text-4xl md:text-2xl text-sm"
  >
    {props.text}
  </a>
);

const SplashScreen = () => (
  <Section>
    <Splash />
    <MainButton href="/harmonia/playground" text="Visit the Playground" />
  </Section>
);

const HeroQuote = (props: { title: string; text: string }) => (
  <section className="flex lg:w-2/5 mb-10 md:w-full justify-center items-center">
    <blockquote className="lg:w-[32rem] md:w-full text-center white">
      <h3 className="mb-2 text-slate-50 font-semibold text-2xl whitespace-pre-line">
        {props.title}
      </h3>
      <p className="text-slate-200 font-light text-xl max-h-16">{props.text}</p>
    </blockquote>
  </section>
);

const HeroImage = (props: { src: string }) => (
  <img
    src={props.src}
    className="w-1/2 border-2 border-indigo-400/25 drop-shadow-2xl shadow-xl shadow-sky-600/50 rounded-xl"
  />
);

const Section = (props: { children: React.ReactNode }) => (
  <section className="flex flex-col items-center justify-center w-full h-screen shrink-0">
    {props.children}
  </section>
);

function TimelineHero() {
  return (
    <Section>
      <HeroImage src="timeline.png" />
      <div className="w-full flex flex-row flex-wrap justify-center my-4 mt-8">
        <HeroQuote
          title="Revolutionary Music Notation"
          text="Integrating the digital audio workstation with traditional
            sheet music notation and functional harmony."
        />

        <HeroQuote
          title="Pattern-Based Music Making"
          text="Introducing a unique and powerful approach for composing with musical scales and transpositions."
        />
        <HeroQuote
          title="Innovative and Educational"
          text="Effortlessly learn and embrace music theory through Harmonia's universally-accessible interface."
        />

        <HeroQuote
          title="Unleash Your Creativity"
          text="Explore a universe of musical possibilities with Harmonia's vast library of instruments and effects."
        />
      </div>
    </Section>
  );
}

function ScaleHero() {
  return (
    <Section>
      <HeroImage src="scaleEditor.png" />
      <div className="w-full flex flex-row flex-wrap justify-center my-4 mt-8">
        <HeroQuote
          title="Leverage the Power of Scales"
          text="Pick or craft any scale to upgrade your music with the power of fully-automated, functional harmony."
        />

        <HeroQuote
          title="Explore Countless Harmonies"
          text="Freely transpose your music along any scale or pattern and instantly create new colors with the click of a button."
        />
        <HeroQuote
          title="Carefully Curated Presets"
          text="Harmonia comes with a rich library of various musical scales for you to explore and use in your music."
        />

        <HeroQuote
          title="Hands-On Learning Experience"
          text="Harmonia breaks down the barriers of music theory and empowers you to learn and create at the same time."
        />
      </div>
    </Section>
  );
}

function PatternHero() {
  return (
    <Section>
      <HeroImage src="patternEditor.png" />
      <div className="w-full flex flex-row flex-wrap justify-center my-4 mt-8">
        <HeroQuote
          title="Think in Terms of Patterns"
          text="Focus on the big picture and write your music in terms of chords, melodies, rhythms, progressions, and more."
        />

        <HeroQuote
          title="Compose and Transposition Your Ideas"
          text="Easily create and develop your musical ideas with a streamlined toolkit of operations at your disposal."
        />
        <HeroQuote
          title="The Beauty of Sheet Music"
          text="Say goodbye to the limitations of traditional piano rolls and embrace the power of sheet music notation."
        />

        <HeroQuote
          title="MusicXML and MIDI Support"
          text="Import and export your  to and from other music notation programs with ease."
        />
      </div>
    </Section>
  );
}

function LibraryHero() {
  return (
    <Section>
      <div className="w-full items-center justify-center flex flex-row flex-wrap px-4 space-x-6">
        <a
          href="https://react.dev/"
          target="_blank"
          className="md:w-1/6 w-[100px] flex justify-center my-4"
        >
          <img
            className="max-w-[200px] w-full drop-shadow-2xl"
            src="lib/react.png"
          />
        </a>
        <a
          href="https://www.typescriptlang.org/"
          target="_blank"
          className="md:w-1/6 w-[100px] flex justify-center my-4"
        >
          <img
            className="max-w-[200px] w-full drop-shadow-2xl"
            src="lib/typescript.png"
          />
        </a>
        <a
          href="https://redux.js.org/"
          target="_blank"
          className="md:w-1/6 w-[100px] flex justify-center my-4"
        >
          <img
            className="max-w-[200px] w-full drop-shadow-2xl"
            src="lib/redux.png"
          />
        </a>
        <a
          href="https://tonejs.github.io/"
          target="_blank"
          className="md:w-1/6 w-[100px] flex justify-center my-4"
        >
          <img
            className="max-w-[200px] w-full drop-shadow-2xl"
            src="lib/tone.png"
          />
        </a>
        <a
          href="https://tailwindcss.com/"
          target="_blank"
          className="md:w-1/6 w-[100px] flex justify-center my-4"
        >
          <img
            className="max-w-[200px] w-full drop-shadow-2xl"
            src="lib/tailwind.png"
          />
        </a>
      </div>
      <div className="text-center mt-16 font-bold lg:text-6xl md:text-4xl text-2xl text-slate-100 drop-shadow-2xl">
        Powered by Cutting-Edge Libraries
      </div>
      <div className="lg:mt-8 md:mt-4 mt-2 font-semibold lg:text-3xl md:text-xl text-md text-slate-400">
        Built with React, Typescript, Redux, Tone.js, Tailwind, et al.
      </div>
    </Section>
  );
}

function ContactHero() {
  return (
    <Section>
      <a
        href="mailto:brendanzelikman@gmail.com"
        className="w-full text-center"
        target="_blank"
        rel="noreferrer"
      >
        <input
          className="max-w-[700px] w-2/3 h-20 p-4 bg-slate-300 text-4xl font-light cursor-pointer rounded-xl text-slate-700 dropshadow-2xl ring-2 ring-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:ring-offset-2 focus:ring-offset-indigo-400/50"
          placeholder="I would definitely use Harmonia because..."
          disabled
        />
      </a>
      <div className="mt-16 text-center font-bold md:text-6xl text-4xl text-slate-100 drop-shadow-2xl">
        Contact Us? Contact Us!
      </div>
      <div className="md:mt-8 mt-4 text-center font-semibold md:text-3xl text-lg text-slate-400">
        Please{" "}
        <a href="mailto:brendanzelikman@gmail.com" className="underline">
          email us
        </a>{" "}
        with all of your questions, comments, and concerns.
      </div>
    </Section>
  );
}
