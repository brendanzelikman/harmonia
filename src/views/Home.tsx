import { Transition } from "@headlessui/react";
import { Demos } from "features/demos";
import { Profile } from "features/profile";
import { Projects } from "features/projects";
import { BsArrowLeft } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";

type View = "projects" | "demos" | "profile";

export function HomeView(props: { view: View }) {
  const { view } = props;
  const navigate = useNavigate();
  const linkClass = (v: View) =>
    view === v ? "text-slate-200" : "text-slate-500";

  // Display the header of the home page.
  const Header = () => {
    return (
      <div className="w-full flex items-center h-20 flex-shrink-0 bg-slate-900/90 text-slate-500 shadow-2xl backdrop-blur p-4 rounded-lg ring-4 ring-sky-600/50 text-5xl overflow-scroll">
        <BsArrowLeft
          className="p-3 mr-4 bg-slate-900/50 hover:bg-slate-900 border border-slate-500 rounded-full cursor-pointer"
          onClick={() => navigate("/")}
        />
        <Link to="/projects" className={linkClass("projects")}>
          Projects
        </Link>
        <span className="mx-4">|</span>
        <Link to="/demos" className={linkClass("demos")}>
          Demos
        </Link>
        <span className="mx-4">|</span>
        <Link to="/profile" className={linkClass("profile")}>
          Profile
        </Link>
      </div>
    );
  };

  return (
    <Transition
      show={true}
      appear
      enter="transition-opacity duration-500"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-500"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="p-8 w-full flex flex-col items-center text-white font-nunito overflow-scroll"
    >
      <Header />
      <div className="w-full min-h-0 h-full flex-1 px-4 py-2 mb-8">
        {view === "projects" && <Projects />}
        {view === "demos" && <Demos />}
        {view === "profile" && <Profile />}
      </div>
    </Transition>
  );
}
