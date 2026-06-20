import { expect, test } from "vitest";
import type { UserIdentity } from "convex/server";
import {
  formatUserDisplayName,
  profileFromClerkWebhook,
  profileFromIdentity,
} from "./users";

test("formatUserDisplayName joins first and last name", () => {
  expect(
    formatUserDisplayName({ firstName: "Ada", lastName: "Lovelace" }),
  ).toBe("Ada Lovelace");
  expect(formatUserDisplayName({ firstName: "Ada" })).toBe("Ada");
});

test("profileFromIdentity reads givenName and familyName", () => {
  const identity = {
    tokenIdentifier: "issuer|user_1",
    subject: "user_1",
    issuer: "https://clerk.example.com",
    givenName: "Ada",
    familyName: "Lovelace",
    pictureUrl: "https://example.com/avatar.png",
    email: "ada@example.com",
  } satisfies UserIdentity & { givenName: string; familyName: string };

  expect(profileFromIdentity(identity)).toEqual({
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    imageUrl: "https://example.com/avatar.png",
  });
});

test("profileFromIdentity splits name claim into first and last", () => {
  const identity = {
    tokenIdentifier: "issuer|user_1",
    subject: "user_1",
    issuer: "https://clerk.example.com",
    name: "Clerk User",
  } satisfies UserIdentity & { name: string };

  expect(profileFromIdentity(identity)).toEqual({
    firstName: "Clerk",
    lastName: "User",
    email: undefined,
    imageUrl: undefined,
  });
});

test("profileFromIdentity falls back to picture claim", () => {
  const identity = {
    tokenIdentifier: "issuer|user_1",
    subject: "user_1",
    issuer: "https://clerk.example.com",
    picture: "https://example.com/fallback.png",
  } satisfies UserIdentity & { picture: string };

  expect(profileFromIdentity(identity).imageUrl).toBe(
    "https://example.com/fallback.png",
  );
});

test("profileFromClerkWebhook maps first and last name", () => {
  expect(
    profileFromClerkWebhook({
      first_name: "Grace",
      last_name: "Hopper",
      email_addresses: [{ email_address: "grace@example.com" }],
      profile_image_url: "https://example.com/grace.png",
    }),
  ).toEqual({
    firstName: "Grace",
    lastName: "Hopper",
    email: "grace@example.com",
    imageUrl: "https://example.com/grace.png",
  });
});
