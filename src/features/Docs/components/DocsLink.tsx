import { Link } from "react-router-dom";
import { getValueByKey } from "utils/objects";

const libraryLinks: Record<string, string> = {
  react: "https://react.dev/",
  redux: "https://redux.js.org/",
  tailwind: "https://tailwindcss.com/",
  typescript: "https://www.typescriptlang.org/",
  tonejs: "https://tonejs.github.io/",
  reactDataGrid: "https://adazzle.github.io/react-data-grid/",
  openSheetMusicDisplay: "https://opensheetmusicdisplay.org/",
};

export const DocsLink = (props: {
  to?: string;
  type?: string;
  redirect?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <Link
      to={props.to || getValueByKey(libraryLinks, props.type) || ""}
      target={props.redirect ? "" : "_blank"}
      rel="noopener noreferrer"
      className="text-sky-400 hover:text-blue-600 transition-colors duration-300 ease-in-out"
      onClick={(e) => {
        window.scroll({ top: 0, behavior: "smooth" });
        e.currentTarget.scrollIntoView({ behavior: "smooth" });
      }}
    >
      {props.children}
    </Link>
  );
};
