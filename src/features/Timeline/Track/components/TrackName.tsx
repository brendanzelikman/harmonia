import { InputHTMLAttributes } from "react";
import { selectCell } from "redux/Timeline";
import { useProjectSelector } from "redux/hooks";
import { blurOnEnter } from "utils/html";

interface TrackNameProps extends InputHTMLAttributes<HTMLInputElement> {}

export const TrackName: React.FC<TrackNameProps> = (props) => {
  const cell = useProjectSelector(selectCell);
  const isSmall = cell.height < 100;
  const size = isSmall ? "text-xs h-6" : "text-sm h-7";
  return (
    <input
      {...props}
      className={`${size} flex-auto font-nunito bg-zinc-800 px-1 w-full mr-2 caret-white outline-none focus:ring-0 rounded-md overflow-scroll text-gray-300 border-2 border-zinc-800 focus:border-indigo-500`}
      onKeyDown={blurOnEnter}
    />
  );
};
