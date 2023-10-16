import { nanoid } from "@reduxjs/toolkit";
import { ID } from "types/units";

export type UserId = ID;
export type UserUpdate = Partial<User> & { id: UserId };
export type Name = string;
export type Birthday = Date;
export type Photo = string;

/**
 * The user type exists in the database and is used within the profile.
 */
export interface User {
  id: UserId;
  dateCreated: string;
  name?: Name;
  birthday?: string;
  photo?: Photo;
  favoriteWorks: Name[];
  favoriteComposers: Name[];
  favoriteAlbums: Name[];
  favoriteGenres: Name[];
  favoriteInstruments: Name[];
}

/**
 * Create a new user with a unique ID.
 * @returns A new user with a unique ID.
 */
export const initializeUser = (): User => ({
  id: nanoid(),
  dateCreated: new Date().toISOString(),
  favoriteWorks: [],
  favoriteComposers: [],
  favoriteAlbums: [],
  favoriteGenres: [],
  favoriteInstruments: [],
});
