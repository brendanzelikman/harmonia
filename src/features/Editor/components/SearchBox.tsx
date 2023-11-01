import { BsSearch } from "react-icons/bs";
import { blurOnEnter } from "utils/html";

export const EditorSearchBox = (props: {
  query: string;
  setQuery: (query: string) => void;
}) => {
  return (
    <div className="relative pr-2">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
        <BsSearch />
      </div>
      <input
        className="text-white w-full rounded m-2 p-2 pl-8 outline-none bg-transparent border border-gray-500 focus:border-transparent focus:ring-2"
        placeholder="Quick Search"
        value={props.query}
        onChange={(e) => props.setQuery(e.target.value)}
        onKeyDown={blurOnEnter}
      />
    </div>
  );
};
