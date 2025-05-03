import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import classNames from "classnames";
import { Hotkey } from "lib/hotkeys";
import { ReactNode, useEffect, useRef, useState } from "react";
import { cancelEvent } from "utils/event";

interface TooltipButtonProps {
  className?: string;
  cursorClass?: string;
  borderWidth?: string;
  borderColor?: string;
  backgroundColor?: string;
  children: any;
  onClick?: (e: React.MouseEvent<Element, MouseEvent>) => void;
  onMouseEnter?: (e: React.MouseEvent<Element, MouseEvent>) => void;
  onMouseLeave?: (e: React.MouseEvent<Element, MouseEvent>) => void;
  active?: boolean;
  override?: boolean;
  activeLabel?: ReactNode;
  freezeInside?: boolean;
  label?: ReactNode;
  hotkey?: Hotkey;
  disabled?: boolean;
  disabledClass?: string;
  direction?: "vertical" | "horizontal";
  marginTop?: number;
  marginLeft?: number;
  width?: number;
  passiveWidth?: number;
  keepTooltipOnClick?: boolean;
  hideRing?: boolean;
  hideTooltip?: boolean;
  rounding?: string;
  options?: { onClick: () => void; label: string }[];
  notRounded?: boolean;
  notClickable?: boolean;
  normalCase?: boolean;
}

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
  borderWidth,
  borderColor,
  backgroundColor,
  onClick,
  onMouseEnter: _onMouseEnter,
  onMouseLeave: _onMouseLeave,
  active,
  override,
  activeLabel,
  freezeInside,
  label,
  hotkey,
  disabled,
  disabledClass,
  keepTooltipOnClick,
  direction,
  marginTop,
  marginLeft,
  width,
  passiveWidth,
  rounding,
  hideRing,
  options,
  notClickable,
  normalCase,
  hideTooltip: _hideTooltip,
}: TooltipButtonProps) => {
  const canShowTooltip = (label || hotkey) && !disabled;

  const [shouldShowTooltip, setShouldShowTooltip] = useState(canShowTooltip);
  const showTooltip = () => setShouldShowTooltip(canShowTooltip);
  const hideTooltip = () => setShouldShowTooltip(false);
  useEffect(() => {
    if (disabled || _hideTooltip) hideTooltip();
    else if (!disabled && !_hideTooltip) showTooltip();
  }, [disabled, _hideTooltip]);

  // Store positioning to properly align tooltip
  const [isIn, setIsIn] = useState(false);
  const [overshootsLeft, setOvershootsLeft] = useState(true);
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
    const padding = 300;
    setIsIn(true);
    setOvershootsLeft(event.clientX - padding < 0);
    setOvershootsRight(event.clientX + padding > window.innerWidth);
    setShouldLeftAlign(event.clientX < window.innerWidth - padding);
    _onMouseEnter?.(event);
  };

  // Determine if the tooltip should be displayed
  const onMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsIn(false);
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
        active && !hideRing ? "ring-2 ring-slate-50/80" : "",
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
        className={`w-full flex total-center opacity-100 pointer-events-none`}
      >
        {children}
      </div>
    </div>
  );

  const [shown, setShown] = useState(activeLabel);
  const timerRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (freezeInside && !override) {
      setShown(isIn ? null : activeLabel);
      return;
    }
    if (active && !override) {
      setShown(activeLabel);
    } else {
      if (isIn) {
        setShown(null);
        return;
      } else {
        timerRef.current = setTimeout(() => {
          setShown(null);
        }, 300);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, activeLabel, freezeInside, isIn, override]);

  const Label = (
    <div
      style={{
        marginTop,
        marginLeft,
        width: isIn ? width : passiveWidth ?? width,
      }}
      className={classNames(
        alignment,
        "select-none pointer-events-none",
        active ? "opacity-100" : "opacity-0",
        isIn ? "transition-opacity" : "transition-all",
        "group-hover:opacity-100 duration-200",
        rounding ?? "rounded-lg",
        "absolute p-3 py-1 w-max shrink-0",
        direction === "vertical" ? "top-12" : "-ml-12 -top-9",
        borderWidth ?? "border",
        borderColor ?? "border-indigo-400/90",
        backgroundColor ?? "bg-zinc-900",
        "text-sm z-[999]"
      )}
    >
      {shown ?? label ?? (
        <>
          {hotkey?.name}{" "}
          {!!hotkey?.shortcut && (
            <span className="font-light text-slate-400">
              ({hotkey?.shortcut})
            </span>
          )}
        </>
      )}
    </div>
  );

  const Tooltip = (
    <div
      className={`relative group ${normalCase ? "normal-case" : "capitalize"}`}
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
          <MenuButton
            as="div"
            className="flex justify-center"
            onClick={disabled ? cancelEvent : undefined}
          >
            {Tooltip}
          </MenuButton>
          <MenuItems className="absolute flex flex-col top-8 px-2 whitespace-nowrap -mr-5 py-2 bg-slate-900/90 backdrop-blur border border-slate-400 text-sm rounded animate-in fade-in zoom-in-50 duration-100">
            {options.map((option, i) => (
              <div
                key={i}
                className="hover:bg-slate-600/80 px-2 py-half rounded cursor-pointer select-none"
                onClick={() => {
                  option.onClick();
                  close();
                }}
              >
                {option.label}
              </div>
            ))}
          </MenuItems>
        </>
      )}
    </Menu>
  );
};
