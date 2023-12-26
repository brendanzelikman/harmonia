import { TooltipProps } from "@radix-ui/react-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/Tooltip";

export interface EditorTooltipProps extends TooltipProps {
  show?: boolean;
  content: string;
}

export function EditorTooltip(props: EditorTooltipProps) {
  const { children, show } = props;
  return !!show ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="my-auto w-full h-full flex items-center justify-center">
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-950">
          {props.content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <div className="w-full my-auto h-full flex items-center justify-center">
      {children}
    </div>
  );
}
