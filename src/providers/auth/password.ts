import { promptModal } from "components/PromptModal";
import { useEventListener } from "hooks/window/useCustomEventListener";
import { useState } from "react";
import { dispatchCustomEvent } from "utils/html";

export const CLEARANCE = "harmonia-password-authorization";
export const UPDATE_CLEARANCE = "update-password-clearance";
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
export const SECRET_PASSWORD = import.meta.env.VITE_SECRET_PASSWORD;
export const USER_PASSWORD = import.meta.env.VITE_PASSWORD;

// The clearance type is only specific for the admin
export const adminClearance = "super-secret-administrator" as const;
export const userClearance = "default-user";
export type Clearance = typeof adminClearance | (string & {}) | null;

// Handle the password through a modal
export const promptPassword = () =>
  promptModal("Welcome to Harmonia!", "Please enter the password.");

// Check the password status through local storage
export async function authorize(forceCheck = false): Promise<Clearance> {
  const clearance = localStorage.getItem(CLEARANCE);

  return new Promise(async (resolve) => {
    if (clearance !== null && !forceCheck) return resolve(clearance);
    const password = await promptPassword();

    // Check for admin privileges
    if (password === ADMIN_PASSWORD || password === SECRET_PASSWORD) {
      updateClearance(adminClearance);
    }

    // Check for regular privileges
    else if (password === USER_PASSWORD) {
      updateClearance(userClearance);
    }

    return resolve(clearance);
  });
}

// Get the password clearance from local storage
export const getClearance = (): Clearance =>
  localStorage.getItem(CLEARANCE) as Clearance;

// Update the password clearance in local storage and dispatch an event
export const updateClearance = (clearance: Clearance) => {
  dispatchCustomEvent(UPDATE_CLEARANCE, clearance);
  if (clearance === null) {
    localStorage.removeItem(CLEARANCE);
  } else {
    localStorage.setItem(CLEARANCE, clearance);
  }
};

// Store the clearance in state and listen for changes
export const useClearance = () => {
  const [clearance, setClearance] = useState(getClearance());
  useEventListener(UPDATE_CLEARANCE, (e) => setClearance(e.detail));
  return {
    clearance,
    isAdmin: clearance === adminClearance,
    isUser: clearance === userClearance,
  };
};
