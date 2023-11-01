import classNames from "classnames";
import { EditorButton as Button } from "./Button";
import { EditorNumericField as NumericField } from "./Field";
import { EditorHeader as Header } from "./Header";
import { EditorList as List, EditorListItem as ListItem } from "./List";
import {
  EditorListbox as CustomListbox,
  DurationListbox,
  InstrumentListbox,
} from "./Listbox";
import { EditorPiano as Piano } from "./Piano";
import { EditorScore as Score } from "./Score";
import { EditorSearchBox as SearchBox } from "./SearchBox";
import {
  EditorSidebar as Sidebar,
  EditorSidebarHeader as SidebarHeader,
} from "./Sidebar";
import { EditorTabGroup as TabGroup, EditorTab as Tab } from "./Tab";
import { EditorTooltip as Tooltip } from "./Tooltip";

const Container: React.FC<React.HTMLProps<HTMLDivElement>> = (props) => {
  return (
    <div
      {...props}
      className={classNames(
        props.className,
        `flex fade-in-300 flex-col w-full h-full text-white`
      )}
    >
      {props.children}
    </div>
  );
};

const Body: React.FC<React.HTMLProps<HTMLDivElement>> = (props) => {
  return (
    <div
      {...props}
      className={classNames(
        props.className,
        `p-2 flex w-full h-full overflow-scroll`
      )}
    >
      {props.children}
    </div>
  );
};

const Content: React.FC<React.HTMLProps<HTMLDivElement>> = (props) => {
  return (
    <div
      {...props}
      className={classNames(
        props.className,
        `w-full min-h-0 h-full px-8 flex flex-col overflow-hidden`
      )}
    >
      {props.children}
    </div>
  );
};

const Editor = {
  Container,
  Header,
  Body,
  NumericField,
  Content,
  Sidebar,
  SidebarHeader,
  List,
  ListItem,
  Score,
  Button,
  Tab,
  TabGroup,
  SearchBox,
  Tooltip,
  CustomListbox,
  DurationListbox,
  InstrumentListbox,
  Piano,
};

export { Editor };
