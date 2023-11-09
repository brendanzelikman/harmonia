import { TooltipProps, Tooltip } from "flowbite-react";

export interface EditorTooltipProps extends TooltipProps {
  show?: boolean;
  content: string;
}

export function EditorTooltip(props: EditorTooltipProps) {
  const { children, show, ...rest } = props;
  return !!show ? (
    <Tooltip
      animation={`duration-500`}
      className="z-50 text-xs"
      placement={props.placement ?? "bottom"}
      {...rest}
    >
      <div className="my-auto w-full h-full flex items-center justify-center">
        {children}
      </div>
    </Tooltip>
  ) : (
    <div className="w-full my-auto h-full flex items-center justify-center">
      {children}
    </div>
  );
}
