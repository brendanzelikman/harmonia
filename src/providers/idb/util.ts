import { PROJECT_STORE } from "utils/constants";
import {
  PRODIGY_PROJECT_LIMIT,
  MAESTRO_PROJECT_LIMIT,
  VIRTUOSO_PROJECT_LIMIT,
} from "utils/rank";
import { fetchUser } from "providers/auth";

// ------------------------------------------------------------
// Database Projects
// ------------------------------------------------------------

/** Get a boolean indicating whether a user has reached their maximum projects */
export const hasReachedProjectLimit = async (): Promise<boolean> => {
  const user = await fetchUser();

  // Bypass admins
  if (user.isAdmin) return false;

  // Otherwise, get the user's projects
  if (!user.db) return true;
  const projects = await user.db.getAll(PROJECT_STORE);
  const projectCount = projects.length;

  // Check the different tiers
  if (user.isProdigy && projectCount >= PRODIGY_PROJECT_LIMIT) return true;
  if (user.isMaestro && projectCount >= MAESTRO_PROJECT_LIMIT) return true;
  if (user.isVirtuoso && projectCount >= VIRTUOSO_PROJECT_LIMIT) return true;
  return false;
};
