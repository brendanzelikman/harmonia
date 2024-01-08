import logo from "assets/images/logo.png";
import { getUserData } from "../hooks/getUserData";

export const UserAvatar = () => {
  const { name, email } = getUserData();

  // Create a user photo
  const Photo = () => {
    return (
      <img
        src={logo}
        draggable={false}
        className="size-48 active:animate-[card-flip_30s_infinite] active:cursor-wand cursor-pointer rounded-full shadow-[0_0_30px_5px_rgba(255,255,255,0.3)] select-none active:shadow-[0_0_20px_5px_#d946ef]"
      />
    );
  };

  // Create a user name
  const Name = () => {
    return <h1 className={"mt-8 font-bold text-4xl"}>{name}</h1>;
  };

  // Create a user email
  const Email = () => {
    return (
      <h3 className={"mt-2 font-light text-xl italic text-gray-300"}>
        {email}
      </h3>
    );
  };

  // Return the user avatar
  return (
    <div className="flex flex-col total-center py-4">
      <Photo />
      <Name />
      <Email />
    </div>
  );
};
