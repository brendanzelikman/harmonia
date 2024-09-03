import { Logo } from "components/Logo";
import { LandingSection } from "../Landing/components";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AccountProviderButtons } from "./components/AccountProviderButtons";
import { EmailRegex } from "utils/html";
import { useMagicLink } from "./hooks/useMagicLink";
import { useAuthorizationRedirect } from "./hooks/useAuthorizationRedirect";
import isElectron from "is-electron";
import { AccountContinueButton } from "./components/AccountContinueButton";
import { AccountEmailForm } from "./components/AccountEmailForm";
import classNames from "classnames";
import { LandingAction } from "pages/landing";

export const AccountPage = (props: { action: LandingAction }) => {
  const { action } = props;
  const navigate = useNavigate();
  useAuthorizationRedirect();
  useMagicLink(action);

  // Store and verify the email
  const [email, setEmail] = useState("");
  const isValidEmail = EmailRegex.test(email);
  const onElectron = isElectron();

  return (
    <LandingSection className="animate-in fade-in duration-500 backdrop-blur">
      <Logo
        height={onElectron ? "200px" : "150px"}
        width={onElectron ? "200px" : "150px"}
        className="mt-8 mb-4 cursor-pointer"
        onClick={() => navigate("/")}
      />
      <div
        className={classNames(
          onElectron ? "gap-10" : "gap-4",
          "py-4 flex flex-col items-center text-white transition-all duration-300 [&>input]:focus:transition-all [&>input]:focus:duration-500"
        )}
      >
        <h1
          className={classNames(
            onElectron ? "mb-2" : "mb-4",
            "text-5xl font-bold"
          )}
        >
          Ready to Start?
        </h1>
        <AccountEmailForm
          email={email}
          setEmail={setEmail}
          isValidEmail={isValidEmail}
        />
        <AccountContinueButton email={email} isValidEmail={isValidEmail} />
        {!onElectron && (
          <>
            <hr className="my-4 w-full border border-slate-200/50" />
            <AccountProviderButtons />
          </>
        )}
      </div>
    </LandingSection>
  );
};
