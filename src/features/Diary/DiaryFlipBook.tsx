import React, { forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import {
  IEventProps,
  IFlipSetting,
} from "react-pageflip/build/html-flip-book/settings";

export interface FlipBookProps extends IFlipSetting, IEventProps {
  width: number;
  height: number;
  className: string;
  style: React.CSSProperties;
  children: React.ReactNode;
  renderOnlyPageLengthChange?: boolean;
}

export const defaultFlipBookProps: FlipBookProps = {
  width: 600,
  minWidth: 0,
  maxWidth: 1000,

  height: 600,
  minHeight: 0,
  maxHeight: 1000,

  size: "fixed",
  autoSize: true,
  showCover: true,

  className: "bg-transparent relative size-full resize-none",
  style: {},
  children: null,

  startPage: 0,
  flippingTime: 1000,
  swipeDistance: 10,
  showPageCorners: false,
  disableFlipByClick: true,

  startZIndex: 0,
  drawShadow: false,
  maxShadowOpacity: 0,

  usePortrait: false,
  mobileScrollSupport: false,
  clickEventForward: false,
  useMouseEvents: false,
};

export const FlipBook = forwardRef<HTMLDivElement, Partial<FlipBookProps>>(
  (props, ref) => {
    const flipBookProps = { ...defaultFlipBookProps, ...props };
    return <HTMLFlipBook ref={ref} {...flipBookProps} />;
  }
);

export interface FlipBookPageProps {
  index?: number;
  children?: React.ReactNode;
  className?: string;
}

export const FlipBookPage = forwardRef<HTMLDivElement, FlipBookPageProps>(
  (props, ref) => {
    return (
      <div className={props.className} ref={ref}>
        {props.children}
      </div>
    );
  }
);
