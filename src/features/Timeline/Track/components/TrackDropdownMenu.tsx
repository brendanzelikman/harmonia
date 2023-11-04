import { Menu, Transition } from "@headlessui/react";
import { BsThreeDots } from "react-icons/bs";
import { Fragment, ReactNode } from "react";

export const TrackDropdownMenu = (props: {
  className?: string;
  content?: string;
  children: ReactNode;
}) => {
  return (
    <Menu
      as="div"
      className="relative inline-block focus:ring-0 active:ring-0 focus:border-0 active:border-0"
    >
      {({ open }) => (
        <>
          <div className="w-full">
            <Menu.Button
              aria-label="Track Dropdown Menu"
              className={`w-full h-full rounded ${
                open ? "text-indigo-400" : "text-white"
              } outline-none`}
            >
              <BsThreeDots className="text-xl" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            show={open}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute top-0 -right-[13.5rem] w-48 bg-zinc-900/80 backdrop-blur rounded text-md py-2 select-none focus:outline-none">
              {props.children}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};
