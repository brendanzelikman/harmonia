import { Menu } from "@headlessui/react";
import classNames from "classnames";
import { ReactNode, useEffect, useState } from "react";
import { use } from "types/hooks";
import { selectHideTooltips } from "types/Meta/MetaSelectors";
import { cancelEvent } from "utils/html";

interface TooltipButtonProps {
  className?: string;
  cursorClass?: string;
  borderColor?: string;
  backgroundColor?: string;
  children: any;
  onClick?: (e: React.MouseEvent<Element, MouseEvent>) => void;
  onMouseEnter?: (e: React.MouseEvent<Element, MouseEvent>) => void;
  onMouseLeave?: (e: React.MouseEvent<Element, MouseEvent>) => void;
  label?: ReactNode;
  disabled?: boolean;
  disabledClass?: string;
  direction?: "vertical" | "horizontal";
  marginTop?: number;
  marginLeft?: number;
  width?: number;
  keepTooltipOnClick?: boolean;
  hideRing?: boolean;
  options?: { onClick: () => void; label: string }[];
  notRounded?: boolean;
  notClickable?: boolean;
}

export const EditorTooltipButton = (props: TooltipButtonProps) => (
  <TooltipButton
    {...props}
    className={classNames(
      props.className,
      `min-w-7 min-h-7 my-1 ${props.disabled ? "text-slate-500" : ""}`
    )}
    direction="vertical"
    marginTop={-5}
    marginLeft={20}
  />
);

export const PoseTooltipButton = (props: TooltipButtonProps) => (
  <TooltipButton
    {...props}
    className={classNames(
      props.className,
      `min-w-7 min-h-7 my-1 px-2 text-sm ${
        props.disabled ? "text-slate-500" : ""
      }`
    )}
    direction="vertical"
    marginTop={-5}
    marginLeft={20}
  />
);

export const NavbarTooltipButton = (props: TooltipButtonProps) => (
  <TooltipButton
    {...props}
    className={classNames(
      props.className,
      `rounded-full min-w-8 min-h-8 shrink-0 transition-all`
    )}
    direction="vertical"
  />
);

export const TooltipButton = ({
  className,
  children,
  cursorClass,
  borderColor,
  backgroundColor,
  onClick,
  onMouseEnter: _onMouseEnter,
  onMouseLeave: _onMouseLeave,
  label,
  disabled,
  disabledClass,
  keepTooltipOnClick,
  direction,
  marginTop,
  marginLeft,
  width,
  hideRing,
  options,
  notClickable,
}: TooltipButtonProps) => {
  const hideTooltips = use(selectHideTooltips);
  const canShowTooltip = !hideTooltips && !!label && !disabled;

  const [shouldShowTooltip, setShouldShowTooltip] = useState(canShowTooltip);
  const showTooltip = () => setShouldShowTooltip(canShowTooltip);
  const hideTooltip = () => setShouldShowTooltip(false);
  useEffect(() => {
    if (hideTooltips || disabled) hideTooltip();
  }, [hideTooltips, disabled]);

  // Store positioning to properly align tooltip
  const [overshootsLeft, setOvershootsLeft] = useState(false);
  const [overshootsRight, setOvershootsRight] = useState(false);
  const [shouldLeftAlign, setShouldLeftAlign] = useState(false);

  // Align tooltip based on button position
  const alignment = overshootsLeft
    ? "left-0"
    : overshootsRight
    ? "right-0"
    : shouldLeftAlign
    ? "left-0 -translate-x-1/3"
    : "right-0 translate-x-1/3";

  // Update positioning when moused over
  const onMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    setOvershootsLeft(event.clientX - 320 < 0);
    setOvershootsRight(event.clientX + 320 > window.innerWidth);
    setShouldLeftAlign(event.clientX < window.innerWidth - 320);
    _onMouseEnter?.(event);
  };

  // Determine if the tooltip should be displayed
  const onMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    showTooltip();
    _onMouseLeave?.(event);
  };

  // Create the button first
  const Button = (
    <div
      className={classNames(
        "flex shrink-0 total-center",
        cursorClass ??
          (disabled
            ? `${disabledClass} cursor-default`
            : notClickable
            ? ""
            : "cursor-pointer active:opacity-60"),
        className,
        {
          "duration-200 transition-all group-hover:ring-2 hover:ring-slate-50/80":
            shouldShowTooltip && !hideRing,
        }
      )}
      onClick={(e) => {
        if (!keepTooltipOnClick) hideTooltip();
        if (!disabled) onClick?.(e);
      }}
    >
      <div
        className={`capitalize w-full flex total-center opacity-100 pointer-events-none`}
      >
        {children}
      </div>
    </div>
  );

  // The label displays the tooltip below the button
  const Label = (
    <div
      style={{ marginTop, marginLeft, width }}
      className={classNames(
        alignment,
        "select-none pointer-events-none",
        "transition-opacity opacity-0 group-hover:opacity-100 duration-200",
        "absolute p-3 py-1 w-max max-w-80 shrink-0 rounded-lg",
        direction === "vertical" ? "top-12" : "ml-10",
        borderColor ?? "border-indigo-500/70",
        backgroundColor ?? "bg-zinc-900",
        "border rounded text-sm z-[999] capitalize"
      )}
    >
      {label}
    </div>
  );

  const Tooltip = (
    <div
      className="relative group"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {shouldShowTooltip && Label}
      {Button}
    </div>
  );

  if (!options?.length) return Tooltip;

  // Return a menu if there are any options provided
  return (
    <Menu as="div" className="relative z-50">
      {({ close }) => (
        <>
          <Menu.Button
            as="div"
            className="flex justify-center"
            onClick={disabled ? cancelEvent : undefined}
          >
            {Tooltip}
          </Menu.Button>
          <Menu.Items className="absolute flex flex-col top-8 px-2 whitespace-nowrap -mr-5 py-2 bg-slate-900/90 backdrop-blur border border-slate-400 text-sm rounded animate-in fade-in zoom-in-50 duration-100">
            {options.map((option, i) => (
              <div
                key={i}
                className="hover:bg-slate-600/80 px-2 py-0.5 rounded cursor-pointer select-none"
                onClick={() => {
                  option.onClick();
                  close();
                }}
              >
                {option.label}
              </div>
            ))}
          </Menu.Items>
        </>
      )}
    </Menu>
  );
};
