import classNames from "classnames";
import { EditorButton as Button } from "./EditorButton";
import { EditorNumericField as NumericField } from "./EditorField";
import { EditorHeader as Header } from "./EditorHeader";
import { EditorList as List, EditorListItem as ListItem } from "./EditorList";
import {
  EditorListbox as CustomListbox,
  DurationListbox,
  InstrumentListbox,
} from "./EditorListbox";
import { EditorPiano as Piano } from "./EditorPiano";
import { EditorScore as Score } from "./EditorScore";
import { EditorSearchBox as SearchBox } from "./EditorSearchBox";
import {
  EditorSidebar as Sidebar,
  EditorSidebarHeader as SidebarHeader,
} from "./EditorSidebar";
import { EditorTabGroup as TabGroup, EditorTab as Tab } from "./EditorTab";
import { EditorTooltip as Tooltip } from "./EditorTooltip";

const Container: React.FC<React.HTMLProps<HTMLDivElement>> = (props) => {
  return (
    <div
      {...props}
      className={classNames(
        props.className,
        `flex flex-col w-full h-full text-white`
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
