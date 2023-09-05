import { MainButton } from "./LandingPage";
import { Splash, Background } from "./Logo";

export default function ErrorPage() {
  return (
    <div className="relative font-nunito fade-in flex flex-col w-full h-screen overflow-scroll">
      <a
        href="/harmonia/"
        className="w-full h-full text-7xl text-slate-50 font-nunito"
      >
        <div className="w-full h-full flex flex-col justify-center items-center">
          <Background />
          <Splash />
          <MainButton href="/harmonia/playground" text="Visit the Playground" />
        </div>
      </a>
    </div>
  );
}
