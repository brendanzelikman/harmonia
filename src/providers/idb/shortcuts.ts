import { SHORTCUT_STORE } from "utils/constants";
import { getUserDatabase } from "./database";

export type Shortcut = { id: string; name: string; keys: string[] };

export const getShortcutsFromDB = async (uid: string) => {
  const db = await getUserDatabase(uid);
  return db.getAll(SHORTCUT_STORE);
};

export const addShortcutToDB = async (uid: string, shortcut: Shortcut) => {
  const db = await getUserDatabase(uid);
  await db.add(SHORTCUT_STORE, shortcut);
};

export const removeShortcutFromDB = async (uid: string, id: string) => {
  const db = await getUserDatabase(uid);
  await db.delete(SHORTCUT_STORE, id);
};

export const clearShortcutsFromDB = async (uid: string) => {
  const db = await getUserDatabase(uid);
  await db.clear(SHORTCUT_STORE);
};
