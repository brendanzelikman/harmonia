import {
  PROJECT_STORE,
  PRODIGY_PROJECT_LIMIT,
  MAESTRO_PROJECT_LIMIT,
  VIRTUOSO_PROJECT_LIMIT,
} from "utils/constants";
import { getDatabase } from "./database";
import { fetchUser } from "providers/auth";

// ------------------------------------------------------------
// Database Projects
// ------------------------------------------------------------

/** Get a boolean indicating whether a user has reached their maximum projects */
export const hasReachedProjectLimit = async (): Promise<boolean> => {
  const { isProdigy, isMaestro, isVirtuoso, isAdmin } = await fetchUser();

  // Bypass admins
  if (isAdmin) return false;

  // Otherwise, get the user's projects
  const db = getDatabase();
  if (!db) return true;

  const projects = await db.getAll(PROJECT_STORE);
  const projectCount = projects.length;

  // Check the different tiers
  if (isProdigy && projectCount >= PRODIGY_PROJECT_LIMIT) return true;
  if (isMaestro && projectCount >= MAESTRO_PROJECT_LIMIT) return true;
  if (isVirtuoso && projectCount >= VIRTUOSO_PROJECT_LIMIT) return true;
  return false;
};
