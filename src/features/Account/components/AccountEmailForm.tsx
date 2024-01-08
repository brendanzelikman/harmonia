import classNames from "classnames";
import isElectron from "is-electron";

interface AccountEmailFormProps {
  email: string;
  setEmail: (email: string) => void;
  isValidEmail: boolean;
}

export const AccountEmailForm = (props: AccountEmailFormProps) => {
  return (
    <input
      className={classNames(
        isElectron() ? "w-96 p-4 text-2xl" : "w-80 p-2 px-4 text-xl",
        "transition-colors duration-300 font-extralight bg-slate-800/50 border rounded-lg border-slate-200/50 text-white placeholder-slate-400",
        props.isValidEmail ? "focus:border-blue-600" : "focus:border-indigo-500"
      )}
      type="email"
      placeholder="Email Address"
      value={props.email}
      onChange={(e) => props.setEmail(e.target.value)}
    />
  );
};
