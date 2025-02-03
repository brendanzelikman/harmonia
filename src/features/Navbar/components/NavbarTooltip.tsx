import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { omit } from "lodash";

export const NavbarTooltip = (props: any) => (
  <Transition
    as="div"
    show={!!props.show}
    className={`absolute top-[3rem] p-1 px-3 font-bold font-nunito text-sm rounded border border-slate-50/50 whitespace-nowrap backdrop-blur-lg ${
      props.className ?? ""
    }`}
    enter="transition-all ease-out duration-75"
    enterFrom="transform opacity-0 scale-50"
    enterTo="transform opacity-100 scale-100"
    leave="transition-all ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-75"
  >
    {props.content}
  </Transition>
);

interface NavbarHoverTooltipProps extends React.HTMLProps<HTMLDivElement> {
  padding?: string;
  top?: string;
  bgColor?: string;
  borderColor?: string;
  group?: string;
}

const defaultHoverTooltipProps: NavbarHoverTooltipProps = {
  group: "group-hover/tooltip:block",
  top: "top-8",
  padding: "py-2 px-3",
  bgColor: "bg-slate-900",
  borderColor: "border-slate-500",
};

export const NavbarHoverTooltip = (props: NavbarHoverTooltipProps) => {
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
        "absolute font-normal text-sm hidden animate-in fade-in"
      )}
    >
      <div
        className={classNames(
          `size-full relative mt-4 rounded border`,
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
