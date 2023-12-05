import { Transition } from "@headlessui/react";
import { useDatabaseCallback } from "hooks";
import { getUserFromDB, updateUserInDB } from "indexedDB";
import { ReactNode, memo, useCallback, useState } from "react";
import { BsX } from "react-icons/bs";
import { GiAura, GiSoundWaves } from "react-icons/gi";
import Moment from "react-moment";
import { Name, User, UserUpdate } from "types/User";
import { blurOnEnter, cancelEvent } from "utils/html";
import BeethovenImage from "assets/images/beethoven.jpg";
import { UserCard } from "./UserCard";
import { isArray } from "lodash";

export function UserProfile() {
  const [user, setUser] = useState<User>();
  const fetchUser = async () => setUser(await getUserFromDB());
  useDatabaseCallback(fetchUser);

  const updateUser = async (user: UserUpdate) => {
    if (!user) return;
    await updateUserInDB(user);
    await fetchUser();
  };

  const Avatar = memo(() => {
    const image = user?.photo ?? BeethovenImage;
    return (
      <div
        className={`relative w-60 h-60 rounded-full border-4 border-slate-900`}
      >
        <div className="rounded-full pointer-events-none absolute inset-0" />
        <input
          type="image"
          src={image}
          draggable={false}
          className={`w-full h-full rounded-full cursor-pointer active:cursor-wand active:animate-[spin_1s_linear_1s_infinite] shadow-[0px_0px_20px_10px_rgb(14,120,170)] active:shadow-[0px_0px_15px_5px_rgb(150,40,120)] animate-[pulse_5s_cubic-bezier(0.4,0.2,0.8)_infinite] transition-all duration-500`}
          onClick={(e) => {
            cancelEvent(e);
            if (!user) return;
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";

            // Read the file and convert it into a base64 string
            fileInput.addEventListener("change", (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.addEventListener("load", () => {
                const base64 = reader.result as string;
                updateUser({ id: user.id, photo: base64 });
              });
              reader.readAsDataURL(file);
            });
            fileInput.click();
          }}
        />
      </div>
    );
  });

  const Bio = () => {
    return (
      <div className="flex-1 flex flex-col">
        <input
          className="w-full text-center text-2xl px-4 py-2 font-bold shadow-xl bg-slate-900/50 border border-slate-600 rounded-lg truncate"
          placeholder="Your Name Goes Here!"
          onKeyDown={blurOnEnter}
          value={user?.name}
          onChange={(e) => {
            if (!user) return;
            updateUser({ id: user.id, name: e.target.value });
          }}
        />
        <div className="mt-4 flex flex-col text-slate-400">
          <div className="m-4 flex flex-col items-center">
            <h3 className="text-slate-100 mb-2">Birthday:</h3>
            <input
              className="bg-transparent rounded-lg"
              type="date"
              value={user?.birthday?.slice(0, 10)}
              onChange={(e) => {
                if (!user) return;
                const date = new Date(e.target.value).toISOString();
                updateUser({ id: user.id, birthday: date });
              }}
            />
          </div>
          <div className="m-4 flex flex-col items-center">
            <h3 className="text-slate-100 mb-2">Account Created:</h3>
            <label>
              {!!user?.dateCreated && (
                <Moment fromNow date={user.dateCreated} />
              )}
            </label>
          </div>
        </div>
      </div>
    );
  };

  const AvatarPanel = () => (
    <div className="px-4 py-8 w-96 h-full flex flex-col items-center justify-between space-y-8 rounded-lg bg-slate-900/90 backdrop-blur border-4 border-slate-900/50 truncate">
      <Avatar />
      {Bio()}
    </div>
  );

  type Card = {
    title: string;
    type: string;
    icon: ReactNode;
    field: keyof User;
  };

  const renderCard = useCallback(
    (props: Card, button: boolean, name?: string, index?: number) => {
      const card = { ...props, name, index };
      return (
        <UserCard
          card={card}
          user={user}
          setUser={setUser}
          updateUser={updateUser}
          button={button}
        />
      );
    },
    [user]
  );

  const CardList = useCallback(
    (props: Card) => {
      const userField = user?.[props.field];
      const cards = isArray(userField) ? userField : [];
      return (
        <div
          key={`${props.field}-${props.type}`}
          className="flex flex-col bg-slate-800/40 border-4 border-slate-950/80 rounded-lg overflow-hidden"
        >
          <h2 className="backdrop-blur p-2 py-1 bg-slate-950/70 text-lg font-bold">
            {props.title}
          </h2>
          <div className="w-full p-4 flex space-x-6 bg-slate-700/10 backdrop-blur">
            {cards.map((name, index) => renderCard(props, false, name, index))}
            {renderCard(props, true)}
          </div>
        </div>
      );
    },
    [renderCard, user]
  );

  return (
    <Transition
      show={!!user}
      appear
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="w-full h-full flex py-4 space-x-16"
    >
      {AvatarPanel()}
      <div className="flex flex-1 flex-col justify-between overflow-scroll space-y-2">
        {CardList({
          field: "favoriteWorks",
          title: "Favorite Works",
          type: "Musical Work",
          icon: <GiAura className="text-6xl" />,
        })}
        {CardList({
          field: "favoriteComposers",
          title: "Favorite Composers",
          type: "Composer",
          icon: <GiAura className="text-6xl" />,
        })}
        {CardList({
          field: "favoriteGenres",
          title: "Favorite Genres",
          type: "Genre",
          icon: <GiSoundWaves className="text-6xl" />,
        })}
      </div>
    </Transition>
  );
}
