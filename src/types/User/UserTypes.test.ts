import { expect, test } from "vitest";
import * as _ from "./UserTypes";

test("initializeUser should create a user with a unique ID", () => {
  const oldUser = _.initializeUser();
  const user = _.initializeUser(oldUser);
  expect(user.id).toBeDefined();
  expect(user.id).not.toEqual(oldUser.id);
});

test("isUser should only return true for valid users", () => {
  expect(_.isUser(_.defaultUser)).toBe(true);

  expect(_.isUser(undefined)).toBe(false);
  expect(_.isUser({})).toBe(false);
  expect(_.isUser({ id: "user", name: "user" }));
});
