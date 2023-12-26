import classNames from "classnames";
import { Link, Navigate, useParams } from "react-router-dom";
import * as Content from "./content";
import { DocsContainer } from "./components/DocsContainer";
import { DocsGradient } from "./components/DocsGradient";

type Topic = { name: string; path: string };

const docTree = {
  "Core Types": [
    { name: "Scale", path: "types/scale" },
    { name: "Pattern", path: "types/pattern" },
    { name: "Pose", path: "types/pose" },
    { name: "Instrument", path: "types/instrument" },
    { name: "Track", path: "types/track" },
    { name: "Clip", path: "types/clip" },
    { name: "Portal", path: "types/portal" },
    { name: "Project", path: "types/project" },
  ],
  "Website Interfaces": [
    { name: "Transport", path: "interfaces/transport" },
    { name: "Timeline", path: "interfaces/timeline" },
    { name: "Editor", path: "interfaces/editor" },
    { name: "Navbar", path: "interfaces/navbar" },
  ],
  "Project Workflow": [
    {
      name: "Creating A Project",
      path: "workflow/creating-a-project",
    },
    {
      name: "1. Organize Your Tracks",
      path: "workflow/organize-your-tracks",
    },
    {
      name: "2. Choose Your Instruments",
      path: "workflow/choose-your-instruments",
    },
    {
      name: "3. Prepare Your Scales",
      path: "workflow/prepare-your-scales",
    },
    {
      name: "4. Write Your Patterns",
      path: "workflow/write-your-patterns",
    },
    {
      name: "5. Design Your Poses",
      path: "workflow/design-your-poses",
    },
    {
      name: "6. Arrange Your Clips",
      path: "workflow/arrange-your-clips",
    },
    {
      name: "7. Export Your Music",
      path: "workflow/export-your-music",
    },
  ],
  "Advanced Techniques": [
    { name: "Keyboard Shortcuts", path: "techniques/keyboard-shortcuts" },
    {
      name: "Using a MIDI Controller",
      path: "techniques/using-midi-controllers",
    },
    {
      name: "Efficient Voice Leadings",
      path: "techniques/efficient-voice-leadings",
    },
    {
      name: "Live Mixing and Posing",
      path: "techniques/live-mixing-and-posing",
    },
  ],
  "Core Libraries": [
    { name: "React", path: "react" },
    { name: "Redux", path: "redux" },
    { name: "Typescript", path: "typescript" },
    { name: "Tone.js", path: "tone.js" },
    { name: "WebMIDI", path: "webmidi" },
    { name: "OpenSheetMusicDisplay", path: "opensheetmusicdisplay" },
    { name: "Tailwind CSS", path: "tailwind-css" },
    { name: "Headless UI", path: "headless-ui" },
  ],
} as const;

type TopicGroup = keyof typeof docTree;
const topicGroups = Object.keys(docTree) as TopicGroup[];

const libraryTree: Record<string, string> = {
  typescript: "https://www.typescriptlang.org/",
  react: "https://react.dev/",
  redux: "https://redux.js.org/",
  webmidi: "https://webmidijs.org/",
  "tone.js": "https://tonejs.github.io/",
  "tailwind-css": "https://tailwindcss.com/",
  "headless-ui": "https://headlessui.com/",
  opensheetmusicdisplay: "https://opensheetmusicdisplay.org/",
};

export const getTopicName = (topic: Topic) => topic.name;

export const getTopicPath = (topic: Topic) =>
  topic.path.toLowerCase().replace(/\s/g, "-");

// Remove the leading type up to and including the first slash
export const getTopicTag = (topic: Topic) =>
  getTopicPath(topic).replace(/.*\//, "");

export function Docs() {
  const params = useParams<{ topic: string }>();
  const currentTag = params.topic;

  // Render an individual topic entry link
  const renderTopicLink = (topic: Topic) => {
    const name = getTopicName(topic);
    const tag = getTopicTag(topic);
    const isLibrary = libraryTree[tag] !== undefined;
    const path = isLibrary ? libraryTree[tag] : `/docs/${getTopicPath(topic)}`;
    const isOpen = tag === currentTag;

    return (
      <Link
        draggable={false}
        className={classNames(
          "text-lg text-shadow cursor-pointer",
          "pl-4 border-l-2 whitespace-nowrap",
          "transition-colors duration-150 ease-in-out",
          "active:text-white active:text-shadow-lg active:border-l-sky-400",
          { "text-sky-300/70 hover:text-sky-200": isLibrary },
          { "text-slate-400 hover:text-slate-200": !isOpen && !isLibrary },
          { "text-sky-500 border-l-sky-500": isOpen },
          { "border-l-slate-600/50": !isOpen },
          { "hover:border-l-sky-500": !isLibrary && !isOpen }
        )}
        key={tag}
        to={path}
      >
        {name}
      </Link>
    );
  };

  // Render a topic header and its entries' links
  const renderTopicGroupLinks = (group: TopicGroup) => {
    return (
      <div className="flex flex-col" key={group}>
        <div className="text-xl text-slate-100 text-shadow font-bold py-2">
          {group}
        </div>
        {docTree[group].map(renderTopicLink)}
      </div>
    );
  };

  // Render a topic and its content
  const renderTopicContent = (topic: Topic) => {
    const tag = getTopicTag(topic);

    if (tag !== currentTag) return null;

    // Core Types
    if (tag === "scale") return <Content.ScaleDocsContent />;
    if (tag === "pattern") return <Content.PatternDocsContent />;
    if (tag === "pose") return <Content.PoseDocsContent />;
    if (tag === "instrument") return <Content.InstrumentDocsContent />;
    if (tag === "track") return <Content.TrackDocsContent />;
    if (tag === "clip") return <Content.ClipDocsContent />;
    if (tag === "portal") return <Content.PortalDocsContent />;
    if (tag === "project") return <Content.ProjectDocsContent />;

    // Website Interfaces
    if (tag === "transport") return <Content.TransportDocsContent />;
    if (tag === "timeline") return <Content.TimelineDocsContent />;
    if (tag === "editor") return <Content.EditorDocsContent />;
    if (tag === "navbar") return <Content.NavbarDocsContent />;

    // Project Workflow
    if (tag === "creating-a-project")
      return <Content.WorkflowIntroductionDocsContent />;
    if (tag === "organize-your-tracks")
      return <Content.WorkflowLesson1DocsContent />;
    if (tag === "choose-your-instruments")
      return <Content.WorkflowLesson2DocsContent />;
    if (tag === "prepare-your-scales")
      return <Content.WorkflowLesson3DocsContent />;
    if (tag === "write-your-patterns")
      return <Content.WorkflowLesson4DocsContent />;
    if (tag === "design-your-poses")
      return <Content.WorkflowLesson5DocsContent />;
    if (tag === "arrange-your-clips")
      return <Content.WorkflowLesson6DocsContent />;
    if (tag === "export-your-music") return <Content.WorkflowLesson7Content />;
    if (tag === "concluding-thoughts") return null;

    if (tag === "keyboard-shortcuts")
      return <Content.KeyboardShortcutsDocsContent />;

    if (tag === "efficient-voice-leadings")
      return <Content.EfficientVoiceLeadingsDocsContent />;

    if (tag === "live-mixing-and-posing")
      return <Content.LiveMixingAndPosingDocsContent />;

    if (tag === "using-midi-controllers")
      return <Content.UsingMidiControllersDocsContent />;
  };

  const getGradient = (topic: Topic) => {
    const tag = getTopicTag(topic);
    if (tag === "scale")
      return "bg-gradient-to-t from-sky-300/10 to-indigo-500/10";
    if (tag === "pattern")
      return "bg-gradient-to-t from-emerald-400/10 to-emerald-500/10";
    if (tag === "pose")
      return "bg-gradient-to-t from-rose-400/10 to-rose-300/10";
    if (tag === "instrument")
      return "bg-gradient-to-t from-orange-300/10 to-orange-200/10";
    if (tag === "track")
      return "bg-gradient-to-b from-sky-400/10 to-emerald-400/10";
    if (tag === "clip")
      return "bg-gradient-to-t from-cyan-400/10 to-fuchsia-400/10";
    if (tag === "portal")
      return "bg-gradient-to-t from-sky-400/10 to-orange-400/10";
    if (tag === "project")
      return "bg-gradient-to-t from-sky-700/5 to-fuchsia-500/5";
    return "bg-gradient-to-t from-sky-500/10 to-sky-300/10";
  };

  const renderTopic = (topic: Topic) => {
    const tag = getTopicTag(topic);
    if (tag !== currentTag) return null;
    return (
      <DocsContainer key={tag}>
        <DocsGradient gradient={getGradient(topic)} />
        {renderTopicContent(topic)}
      </DocsContainer>
    );
  };

  return (
    <div className="flex w-full h-full rounded font-light animate-in fade-in">
      <div className="flex flex-col w-1/4 min-w-[350px] gap-8 px-8 pt-8 pb-8 border-r border-r-slate-500 overflow-scroll">
        {topicGroups.map(renderTopicGroupLinks)}
      </div>
      <div className="flex flex-col flex-1 gap-8">
        {topicGroups.map((group) => (
          <div key={group}>{docTree[group].map(renderTopic)}</div>
        ))}
        {!currentTag && <Navigate to="/docs/types/scale" replace />}
      </div>
    </div>
  );
}
