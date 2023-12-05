import { ReactNode, useCallback, useRef } from "react";
import { BsX } from "react-icons/bs";
import { Name, User } from "types/User";
import { blurOnEnter } from "utils/html";
import { useUserCardDrag, useUserCardDrop } from "./UserCardDragAndDrop";
import classNames from "classnames";

interface UserCard {
  field: keyof User;
  type: string;
  icon: ReactNode;
  name?: Name;
  index?: number;
}

interface UserCardProps {
  card: UserCard;
  user?: User;
  setUser: (user: User) => void;
  updateUser: (user: User) => void;
  button?: boolean;
}

export function UserCard(props: UserCardProps) {
  const { card, button, user, setUser, updateUser } = props;
  const { field, type, icon, name, index } = card;
  const showButton = !!button || card.name === undefined;

  // Drag and drop hooks
  const ref = useRef<HTMLDivElement>(null);
  const moveCard = useCallback(() => {}, []);
  const dragProps = { id: field, type, moveCard };
  const [{ isDragging }, drag] = useUserCardDrag(dragProps);
  const [{}, drop] = useUserCardDrop(dragProps);
  drag(drop(ref));

  const cardClass = classNames(
    "relative w-48 h-full flex flex-col items-center rounded-lg border-4 border-slate-800",
    "truncate cursor-pointer",
    isDragging && "opacity-50",
    !showButton
      ? "[&:has(span:active)]:cursor-wand [&:has(span:active)]:shadow-[0px_0px_15px_5px_rgb(150,40,120)] [&:has(span:active)]:animate-[card-flip_15s_infinite]"
      : "active:shadow-[0px_0px_10px_5px_rgb(15,150,200)]"
  );

  return (
    <div
      ref={ref}
      key={`${field}-${index}`}
      className={cardClass}
      onClick={() => {
        if (!showButton || !user) return;
        const fieldValue = user?.[field];
        if (!Array.isArray(fieldValue)) return;
        const newUser = {
          ...user,
          [field]: [...fieldValue, ""],
        } as User;
        setUser(newUser);
      }}
    >
      {!button && (
        <div
          className="absolute right-0 top-0 w-4 h-4 font-light text-slate-200 bg-slate-800 hover:bg-red-600/50 transition-all duration-300 rounded-full"
          onClick={() => {
            if (!user) return;
            const fieldValue = user?.[field];
            if (!Array.isArray(fieldValue)) return;
            const index = fieldValue.findIndex((name) => name === name);
            if (index === -1) return;
            const newUser = {
              ...user,
              [field]: [
                ...fieldValue.slice(0, index),
                ...fieldValue.slice(index + 1),
              ],
            } as User;
            setUser(newUser);
          }}
        >
          <BsX />
        </div>
      )}
      <span className="p-2 w-full flex justify-center bg-slate-900/50">
        {icon}
      </span>
      {showButton ? (
        <div className="py-2 select-none font-light w-full h-full flex items-center justify-center bg-slate-800/70 border-0 border-t border-t-slate-500 truncate">
          Add a {type}
        </div>
      ) : (
        <input
          value={name}
          placeholder={`${type} Name`}
          className="py-2 select-none font-light capitalize w-full h-full text-center flex items-center justify-center bg-slate-800/70 focus:bg-slate-800 border-0 border-t border-t-slate-500 placeholder-slate-400 truncate"
          onChange={async (e) => {
            if (!user) return;
            const fieldValue = user?.[field];
            if (!Array.isArray(fieldValue)) return;
            const index = fieldValue.findIndex((name) => name === name);
            if (index === -1) return;
            const newName = e.target.value;
            const newUser = {
              ...user,
              [field]: [
                ...fieldValue.slice(0, index),
                newName,
                ...fieldValue.slice(index + 1),
              ],
            };
            updateUser(newUser);
          }}
          onKeyDown={blurOnEnter}
        />
      )}
    </div>
  );
}
