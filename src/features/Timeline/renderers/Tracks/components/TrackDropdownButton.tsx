import { Menu } from "@headlessui/react";

export const TrackDropdownButton = (props: {
  className?: string;
  onClick?: () => void;
  content: string;
  icon: JSX.Element;
}) => {
  return (
    <Menu.Item>
      {({ active }) => (
        <div
          className="flex text-left items-center hover:bg-zinc-500/60 cursor-pointer px-4 py-2"
          onClick={(e) => {
            props.onClick?.();
            e.currentTarget.blur();
          }}
        >
          <div className="text-xl">{props.icon}</div>
          <button
            className={`${
              props.className ?? ""
            } text-right rounded pl-4 font-light`}
          >
            {props.content}
          </button>
        </div>
      )}
    </Menu.Item>
  );
};
