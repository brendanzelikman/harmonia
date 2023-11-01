import { useNavigate } from "react-router-dom";
import { Background, Splash } from "../components/Logo";
import TimelineImage from "assets/images/timeline.png";
import ScaleEditorImage from "assets/images/scaleEditor.png";
import PatternEditorImage from "assets/images/patternEditor.png";
import ReactImage from "assets/lib/react.png";
import TypescriptImage from "assets/lib/typescript.png";
import ReduxImage from "assets/lib/redux.png";
import ToneImage from "assets/lib/tone.png";
import TailwindImage from "assets/lib/tailwind.png";
import { useAuthenticationStatus } from "hooks";
import { setAuthenticatedStatus } from "indexedDB";

export const MainButton = (props: { onClick?: () => void }) => {
  return (
    <button
      onClick={props.onClick}
      className="border py-5 px-8 text-slate-100 bg-slate-800/20 hover:bg-sky-950/90 hover:shadow-[0px_0px_10px_5px_rgb(15,150,200)] transition-all duration-300 border-slate-500 rounded-xl backdrop-blur drop-shadow-xl sm:text-4xl text-sm font-light"
    >
      Make Music Now!
    </button>
  );
};

export function LandingView() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthenticationStatus();

  const onClick = async () => {
    if (isAuthenticated) {
      return navigate("/projects");
    } else {
      const password = prompt("Enter the password to continue.");
      if (password === import.meta.env.VITE_PASSWORD) {
        await setAuthenticatedStatus(true);
        alert("Password accepted!");
        navigate("/projects");
      } else {
        await setAuthenticatedStatus(false);
        alert("Incorrect password.");
      }
    }
  };

  const SplashScreen = () => (
    <Section>
      <Splash />
      <MainButton onClick={onClick} />
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
      className="w-1/2 border-2 border-indigo-400/25 drop-shadow-2xl shadow-xl shadow-sky-600/50 rounded-xl"
    />
  );

  const Section = (props: { children: React.ReactNode }) => (
    <section className="flex flex-col items-center justify-center w-full h-screen shrink-0">
      {props.children}
    </section>
  );

  const TimelineHero = () => (
    <Section>
      <HeroImage src={TimelineImage} />
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

  const ScaleHero = () => (
    <Section>
      <HeroImage src={ScaleEditorImage} />
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

  const PatternHero = () => (
    <Section>
      <HeroImage src={PatternEditorImage} />
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
          text="Import and export your projects to and from other music notation programs with ease."
        />
      </div>
    </Section>
  );

  const LibraryHero = () => (
    <Section>
      <div className="w-full items-center justify-center flex flex-row flex-wrap px-4 space-x-6 [&>a>img]:drop-shadow-2xl [&>a]:md:w-1/6 [&>a]:w-[100px] [&>a>img]:max-w-[200px] [&>a>img]:w-full">
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
      <div className="text-center mt-16 font-bold lg:text-6xl md:text-4xl text-2xl text-slate-100 drop-shadow-2xl">
        Powered by Cutting-Edge Libraries
      </div>
      <div className="lg:mt-8 md:mt-4 mt-2 font-semibold lg:text-3xl md:text-xl text-md text-slate-400">
        Built with React, Typescript, Redux, Tone.js, Tailwind, et al.
      </div>
    </Section>
  );

  const ContactHero = () => (
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

  return (
    <main className="relative font-nunito fade-in flex flex-col w-full h-screen overflow-scroll">
      <Background />
      <SplashScreen />
      {!!isAuthenticated && (
        <>
          <TimelineHero />
          <ScaleHero />
          <PatternHero />
          <LibraryHero />
          <ContactHero />
        </>
      )}
    </main>
  );
}
