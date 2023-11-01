import { nanoid } from "@reduxjs/toolkit";
import { isArray, isPlainObject, isString, isUndefined } from "lodash";
import { ID } from "types/units";

// ------------------------------------------------------------
// User Generics
// ------------------------------------------------------------

export type UserId = ID;
export type UserPartial = Partial<User>;
export type UserUpdate = Partial<User> & { id: UserId };
export type Name = string;
export type Birthday = Date;
export type Photo = string;

// ------------------------------------------------------------
// User Definitions
// ------------------------------------------------------------

/** The user type exists in the database and is used within the profile. */
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

// ------------------------------------------------------------
// User Initialization
// ------------------------------------------------------------

export const defaultUser: User = {
  id: "default-user",
  dateCreated: "2021-01-01T00:00:00.000Z",
  favoriteWorks: [],
  favoriteComposers: [],
  favoriteAlbums: [],
  favoriteGenres: [],
  favoriteInstruments: [],
};

export const initializeUser = (user?: UserPartial): User => ({
  ...defaultUser,
  ...user,
  id: nanoid(),
  dateCreated: new Date().toISOString(),
});

// ------------------------------------------------------------
// User Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `User`. */
export const isUser = (obj: unknown): obj is User => {
  const candidate = obj as User;
  return (
    isPlainObject(candidate) &&
    isString(candidate.id) &&
    isString(candidate.dateCreated) &&
    (isString(candidate.name) || isUndefined(candidate.name)) &&
    (isString(candidate.birthday) || isUndefined(candidate.birthday)) &&
    (isString(candidate.photo) || isUndefined(candidate.photo)) &&
    isArray(candidate.favoriteWorks) &&
    isArray(candidate.favoriteComposers) &&
    isArray(candidate.favoriteAlbums) &&
    isArray(candidate.favoriteGenres) &&
    isArray(candidate.favoriteInstruments) &&
    candidate.favoriteWorks.every(isString) &&
    candidate.favoriteComposers.every(isString) &&
    candidate.favoriteAlbums.every(isString) &&
    candidate.favoriteGenres.every(isString) &&
    candidate.favoriteInstruments.every(isString)
  );
};
