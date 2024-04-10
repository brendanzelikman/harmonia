import classNames from "classnames";
import {
  appleProvider,
  firebaseApp,
  googleProvider,
  microsoftProvider,
} from "firebase";
import {
  browserPopupRedirectResolver,
  reauthenticateWithRedirect,
} from "firebase/auth";
import { useState } from "react";
import { BsTrash } from "react-icons/bs";
import { FaGithub, FaSadCry } from "react-icons/fa";
import {
  GiRank1,
  GiRank2,
  GiRank3,
  GiTakeMyMoney,
  GiPlug,
  GiExitDoor,
} from "react-icons/gi";
import { SiElectron } from "react-icons/si";
import { getPortalUrl, getCheckoutUrl } from "utils/stripeUrls";
import { UserActionButton } from "./UserActionButton";
import isElectron from "is-electron";
import { useSubscription } from "providers/subscription";
import { useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { useAuthentication } from "providers/authentication";
import { signOut } from "utils/authentication";
import { dispatchCustomEvent } from "utils/html";
import { DESKTOP_URL, PLUGIN_URL, REPO_URL } from "utils/constants";

export const UserControlPanel = () => {
  const { user, isAdmin } = useAuthentication();
  const navigate = useNavigate();
  const { isProdigy, isMaestro, isVirtuoso } = useSubscription();
  const defaultRing = "ring-slate-200/50";

  // Open the link based on the environment
  const openLink = (link: string) =>
    isElectron()
      ? window.electronAPI.openExternal(link)
      : window.open(link, "_blank");

  // Create a delete user button
  const deleteUser = async () => {
    try {
      await user?.delete();
      navigate("/login");
    } catch (error) {
      if (!user || !(error instanceof FirebaseError)) return;

      // Reauthenticate the user if they need to
      if (error.code === "auth/requires-recent-login") {
        let provider;
        switch (user.providerData[0]?.providerId) {
          case "google.com":
            provider = googleProvider;
            break;
          case "apple.com":
            provider = appleProvider;
            break;
          case "microsoft.com":
            provider = microsoftProvider;
            break;
          default:
            return;
        }
        reauthenticateWithRedirect(
          user,
          provider,
          browserPopupRedirectResolver
        );
      }
    }
  };

  // The prodigy button sends the user to cancel their subscription
  const ProdigyButton = () => {
    const text = isProdigy ? "Activated Prodigy" : "Become a Prodigy";
    const buttonClass = classNames(
      "bg-prodigy-dark/80",
      isProdigy
        ? "cursor-default ring-4 ring-prodigy saturate-150"
        : `hover:bg-prodigy-dark ${defaultRing}`
    );

    // Direct the user to the cancel
    const onClick = async () => {
      const prodigyUrl = await getPortalUrl(firebaseApp, "prodigy");
      openLink(prodigyUrl);
    };
    return (
      <UserActionButton
        className={buttonClass}
        disabled={isProdigy}
        icon={GiRank1}
        text={text}
        onClick={onClick}
      />
    );
  };

  // The maestro button sends the user to upgrade their subscription
  const MaestroButton = () => {
    const text = isMaestro ? "Activated Maestro" : "Become a Maestro";
    const buttonClass = classNames(
      "bg-maestro-dark/80",
      isMaestro
        ? "cursor-default ring-4 ring-maestro saturate-150"
        : `hover:bg-maestro-dark ${defaultRing}`
    );

    // Direct the user to the purchase or upgrade page
    const onClick = async () => {
      const maestroUrl = isProdigy
        ? await getCheckoutUrl(firebaseApp, "maestro")
        : await getPortalUrl(firebaseApp, "maestro");
      openLink(maestroUrl);
    };
    return (
      <UserActionButton
        className={buttonClass}
        disabled={isMaestro}
        onClick={onClick}
        icon={GiRank2}
        text={text}
      />
    );
  };

  // The virtuoso button sends the user to upgrade their subscription
  const VirtuosoButton = () => {
    const text = isVirtuoso ? "Activated Virtuoso" : "Become a Virtuoso";
    const buttonClass = classNames(
      "bg-virtuoso-dark/80",
      isVirtuoso
        ? "cursor-default ring-4 ring-virtuoso saturate-150"
        : `hover:bg-virtuoso-dark ${defaultRing}`
    );
    // Direct the user to the purchase or upgrade page
    const onClick = async () => {
      const virtuosoUrl = isProdigy
        ? await getCheckoutUrl(firebaseApp, "virtuoso")
        : await getPortalUrl(firebaseApp, "virtuoso");
      openLink(virtuosoUrl);
    };
    return (
      <UserActionButton
        className={buttonClass}
        disabled={isVirtuoso}
        onClick={onClick}
        icon={GiRank3}
        text={text}
      />
    );
  };

  // The manage button sends the user to the Stripe portal
  const ManageButton = () => {
    const onClick = async () => {
      const portalUrl = await getPortalUrl(firebaseApp);
      openLink(portalUrl);
    };
    return (
      <UserActionButton
        className={`bg-slate-500/80 hover:bg-slate-500 ${defaultRing}`}
        onClick={onClick}
        icon={GiTakeMyMoney}
        text="Manage Subscription"
      />
    );
  };

  // The desktop button downloads the desktop app
  const DesktopButton = () => {
    if (!isVirtuoso) return null;
    return (
      <UserActionButton
        className={`bg-cyan-600/80 hover:bg-cyan-600 ${defaultRing}`}
        icon={SiElectron}
        text="Get the Desktop App"
        link={DESKTOP_URL}
      />
    );
  };

  // The plugin button downloads the VST plugin
  const PluginButton = () => {
    if (!isVirtuoso) return null;
    return (
      <UserActionButton
        className={`bg-blue-900/80 hover:bg-blue-900 ${defaultRing}`}
        icon={GiPlug}
        text="Get the VST Plugin"
        link={PLUGIN_URL}
      />
    );
  };

  // The repository button sends the user to the GitHub repository
  const RepositoryButton = () => {
    return (
      <UserActionButton
        className={`bg-slate-700/90 hover:bg-slate-700 ${defaultRing}`}
        icon={FaGithub}
        text="Open Repository"
        link={REPO_URL}
      />
    );
  };

  // The user can sign out of their account
  const SignOutButton = () => {
    return (
      <UserActionButton
        className={`bg-gray-900/80 hover:bg-gray-800 ${defaultRing}`}
        onClick={() => {
          if (isAdmin) {
            localStorage.removeItem("harmonia-password");
            dispatchCustomEvent("harmonia-password", null);
            navigate("/");
          } else {
            signOut();
          }
        }}
        icon={GiExitDoor}
        text="Sign Out"
      />
    );
  };

  // The user can delete their account
  const [deletingAccount, setDeletingAccount] = useState(false);
  const DeleteAccountButton = () => {
    const text = deletingAccount ? "Are you sure?" : "Delete Account";
    const icon = deletingAccount ? FaSadCry : BsTrash;
    return (
      <>
        <UserActionButton
          className={`bg-red-500/80 hover:bg-red-500 ${defaultRing}`}
          onClick={() => setDeletingAccount(!deletingAccount)}
          icon={icon}
          text={text}
        >
          {deletingAccount && (
            <div
              className={classNames(
                "absolute inset-0 h-16 top-32 mt-4 flex gap-4 total-center",
                "animate-in fade-in backdrop-blur bg-slate-900/80 rounded border border-slate-600 "
              )}
            >
              <button
                className="bg-red-600/80 hover:bg-red-600 border border-slate-600 font-bold py-2 px-4 rounded-lg"
                onClick={deleteUser}
              >
                Confirm
              </button>
              <button
                className="bg-gray-900/80 hover:bg-gray-700 border border-slate-600 font-bold py-2 px-4 rounded-lg"
                onClick={() => setDeletingAccount(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </UserActionButton>
      </>
    );
  };
  return (
    <div
      className={`w-full max-w-5xl items-center justify-center flex flex-wrap saturate-150 opacity-90`}
    >
      {isAdmin ? (
        <>
          <DesktopButton />
          <PluginButton />
          {/* <RepositoryButton /> */}
          <SignOutButton />
        </>
      ) : (
        <>
          <ProdigyButton />
          <MaestroButton />
          <VirtuosoButton />
          <ManageButton />
          <DesktopButton />
          <PluginButton />
          <SignOutButton />
          <DeleteAccountButton />
        </>
      )}
    </div>
  );
};
