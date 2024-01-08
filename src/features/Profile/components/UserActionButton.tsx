import classNames from "classnames";
import { useSubscription } from "providers/subscription";
import { IconType } from "react-icons";

interface ActionButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon: IconType;
  text: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const UserActionButton = (props: ActionButtonProps) => {
  const { isVirtuoso } = useSubscription();
  return (
    <div
      className={classNames(
        "relative w-full min-w-36 h-36 p-4",
        isVirtuoso ? "basis-1/4" : "basis-1/3"
      )}
    >
      {props.children}
      <button
        className={classNames(
          `size-full flex flex-col gap-3 text-md ring-2 font-bold total-center rounded-xl`,
          props.className
        )}
        onClick={props.disabled ? undefined : props.onClick}
      >
        <props.icon className="size-12 flex total-center" />
        {props.text}
      </button>
    </div>
  );
};
