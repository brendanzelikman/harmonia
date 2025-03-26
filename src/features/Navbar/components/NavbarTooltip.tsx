import classNames from "classnames";
import { omit } from "lodash";

interface NavbarHoverTooltipProps extends React.HTMLProps<HTMLDivElement> {
  padding?: string;
  top?: string;
  bgColor?: string;
  borderColor?: string;
  group?: string;
  rounded?: string;
}

const defaultHoverTooltipProps: NavbarHoverTooltipProps = {
  group: "group-hover/tooltip:block",
  top: "top-8",
  padding: "py-2 px-3",
  bgColor: "bg-slate-900",
  borderColor: "border-slate-500",
  rounded: "rounded",
};

export const NavbarHoverTooltip = (props: NavbarHoverTooltipProps) => {
  const rounded = props.rounded ?? defaultHoverTooltipProps.rounded;
  const padding = props.padding ?? defaultHoverTooltipProps.padding;
  const bgColor = props.bgColor ?? defaultHoverTooltipProps.bgColor;
  const borderColor = props.borderColor ?? defaultHoverTooltipProps.borderColor;
  const group = props.group ?? defaultHoverTooltipProps.group;
  const top = props.top ?? defaultHoverTooltipProps.top;
  return (
    <div
      {...omit(props, ["padding", "bgColor", "borderColor"])}
      className={classNames(
        props.className,
        group,
        top,
        "absolute font-normal text-sm hidden animate-in fade-in select-none"
      )}
    >
      <div
        className={classNames(
          `size-full relative mt-4 border`,
          rounded,
          padding,
          bgColor,
          borderColor
        )}
      >
        {props.children}
      </div>
    </div>
  );
};
