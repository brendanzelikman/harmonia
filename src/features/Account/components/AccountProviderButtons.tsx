import {
  appleProvider,
  firebaseAuth,
  googleProvider,
  microsoftProvider,
} from "firebase";
import { BsApple, BsGoogle, BsMicrosoft } from "react-icons/bs";

// Provider types
export const accountProviderTypes = ["google", "apple", "microsoft"] as const;
export type AccountProviderType = (typeof accountProviderTypes)[number];

// Provider interface
export interface AccountProvider {
  src: any;
  name: string;
  icon: any;
}

// Provider record
export const accountProviders: Record<AccountProviderType, any> = {
  google: {
    src: googleProvider,
    name: "Google",
    icon: BsGoogle,
  },
  apple: {
    src: appleProvider,
    name: "Apple",
    icon: BsApple,
  },
  microsoft: {
    src: microsoftProvider,
    name: "Microsoft",
    icon: BsMicrosoft,
  },
};

export const AccountProviderButton = (provider: AccountProvider) => {
  return (
    <button
      className="w-80 p-3 px-4 gap-2 flex items-center bg-slate-800/50 hover:bg-slate-600/50 border text-xl rounded-lg border-slate-200/50 text-white cursor-pointer font-light capitalize"
      type="button"
      onClick={() => firebaseAuth.signInWithRedirect(provider.src)}
    >
      <provider.icon className="mr-4" />
      Continue With {provider.name}
    </button>
  );
};

export const AccountProviderButtons = () => {
  return accountProviderTypes.map((providerType) => (
    <AccountProviderButton
      key={providerType}
      {...accountProviders[providerType]}
    />
  ));
};
