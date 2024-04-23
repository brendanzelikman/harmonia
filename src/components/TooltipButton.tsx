import classNames from "classnames";
import { useState } from "react";
import { selectTimeline } from "redux/Timeline";
import { useProjectSelector } from "redux/hooks";

interface TooltipButtonProps {
  className?: string;
  children: any;
  onClick?: (e: React.MouseEvent<Element, MouseEvent>) => void;
  label?: string;
  disabled?: boolean;
  disabledClass?: string;
  direction?: "vertical" | "horizontal";
  keepTooltipOnClick?: boolean;
}

export const NavbarTooltipButton = (props: TooltipButtonProps) => (
  <TooltipButton
    {...props}
    className={classNames(
      props.className,
      `xl:min-w-9 xl:min-h-9 min-w-8 min-h-8 xl:text-2xl text-xl`
    )}
    direction="vertical"
  />
);

export const TooltipButton = ({
  className,
  children,
  onClick,
  label,
  disabled,
  disabledClass,
  keepTooltipOnClick,
  direction,
}: TooltipButtonProps) => {
  const { showingTooltips } = useProjectSelector(selectTimeline);
  const canShowTooltip = !!showingTooltips && !!label;

  const [shouldShowTooltip, setShouldShowTooltip] = useState(true);
  const showTooltip = () => setShouldShowTooltip(canShowTooltip);
  const hideTooltip = () => setShouldShowTooltip(false);

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
  };

  // Create the button first
  const Button = (
    <div
      className={classNames("rounded-full text-xl xl:text-2xl", {
        "duration-200 transition-all group-hover:ring-2 group-hover:ring-slate-50/80":
          shouldShowTooltip,
      })}
    >
      <button
        onClick={(e) => {
          if (!keepTooltipOnClick) hideTooltip();
          if (!disabled) onClick?.(e);
        }}
        className={`${className} ${
          disabled ? disabledClass : ""
        } flex total-center rounded-full active:opacity-80 opacity-100`}
        aria-label={label}
      >
        {children}
      </button>
    </div>
  );

  // The label displays the tooltip below the button
  const Label = (
    <div
      className={classNames(
        alignment,
        "select-none pointer-events-none",
        "transition-opacity opacity-0 group-hover:opacity-100 duration-200",
        "absolute p-3 py-1 w-max max-w-80 rounded-lg",
        direction === "vertical" ? "top-12" : "ml-10",
        "border-2 border-indigo-500/70 rounded bg-zinc-900 text-sm z-[50] capitalize"
      )}
    >
      {label}
    </div>
  );

  return (
    <div
      className="relative group"
      onMouseEnter={onMouseEnter}
      onMouseLeave={showTooltip}
    >
      {shouldShowTooltip && Label}
      {Button}
    </div>
  );
};
