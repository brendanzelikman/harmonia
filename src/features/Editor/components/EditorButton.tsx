import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import classNames from "classnames";
import { cancelEvent, promptUserForNumber } from "utils/html";

export interface EditorButtonProps extends React.HTMLProps<HTMLButtonElement> {
  label?: string;
  border?: boolean;
  padding?: boolean;
  active?: boolean;
  disabled?: boolean;
  activeClass?: string;
  disabledClass?: string;
  weakClass?: string;
  promptTitle?: string;
  promptMessage?: string;
  callback?: (value: any) => void;
  options?: { onClick: () => void; label: string }[];
}

export const EditorButton: React.FC<EditorButtonProps> = (props) => {
  const {
    label,
    border,
    active,
    disabled,
    activeClass,
    disabledClass,
    weakClass,
    padding,
    promptTitle,
    promptMessage,
    callback,
    options,
    ...buttonProps
  } = props;

  // Return a button if there are no options provided
  const Button = ({ open }: { open?: boolean }) => (
    <button
      {...buttonProps}
      onClick={
        disabled
          ? undefined
          : !!promptTitle && !!promptMessage && !!callback
          ? promptUserForNumber(promptTitle, promptMessage, callback)
          : buttonProps.onClick
      }
      type="button"
      className={classNames(
        buttonProps.className,
        `flex justify-center my-auto h-6 items-center font-light bg-transparent rounded text-xs truncate select-none`,
        {
          "px-0": !padding,
          "px-2": padding === undefined || !!padding,
          "cursor-default": disabled,
          "border border-slate-500": !!border,
          [weakClass ?? ""]: !active && !disabled,
          [activeClass ?? ""]: !!active,
          [disabledClass ?? ""]: !!disabled,
          "opacity-50": !!open,
        }
      )}
    >
      {buttonProps.children}
    </button>
  );
  if (!options?.length) return <Button />;

  // Return a menu if there are any options provided
  return (
    <Menu as="div" className="relative z-50">
      {({ open }) => (
        <>
          <MenuButton
            as="div"
            className="flex justify-center"
            onClick={disabled ? cancelEvent : undefined}
          >
            <Button open={open} />
          </MenuButton>
          <MenuItems className="absolute flex flex-col top-8 px-2 whitespace-nowrap -mr-5 py-2 bg-slate-900/90 backdrop-blur border border-slate-400 text-sm rounded animate-in fade-in zoom-in-50 duration-100">
            {options.map((option, i) => (
              <div
                key={i}
                className="hover:bg-slate-600/80 px-2 py-0.5 rounded cursor-pointer select-none"
                onClick={option.onClick}
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
