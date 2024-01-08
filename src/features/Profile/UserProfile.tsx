import { UserAvatar } from "./components/UserAvatar";
import { UserControlPanel } from "./components/UserControlPanel";

export const UserProfile = () => {
  return (
    <div className="size-full flex flex-col p-8 gap-4 items-center animate-in fade-in font-light bg-indigo-950/50 text-white rounded-xl">
      <UserAvatar />
      <UserControlPanel />
    </div>
  );
};
