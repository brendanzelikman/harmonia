import { InputHTMLAttributes } from "react";
import { blurOnEnter } from "utils/html";

interface TrackNameProps extends InputHTMLAttributes<HTMLInputElement> {
  height: number;
}

export const TrackName: React.FC<TrackNameProps> = (props) => {
  const { height, ...rest } = props;
  const isSmall = height < 100;
  const size = isSmall ? "text-xs h-6" : "text-sm h-7";
  return (
    <input
      {...rest}
      className={`${size} flex-auto font-nunito bg-zinc-800 px-1 w-full mr-2 caret-white outline-none focus:ring-0 rounded-md overflow-scroll text-gray-300 border-2 border-zinc-800 focus:border-indigo-500`}
      onKeyDown={blurOnEnter}
    />
  );
};
