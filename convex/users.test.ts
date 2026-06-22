import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import { ANONYMOUS_TASK_LIMIT, SIGNED_IN_TASK_LIMIT } from "./lib/constants";
import schema from "./schema";
import { modules } from "./_test.setup";

const anonUser = { subject: "anon_guest_test" };
const clerkUser = {
  subject: "user_clerk_test",
  name: "Clerk User",
  email: "clerk@example.com",
  pictureUrl: "https://example.com/clerk.png",
};

test("accountStatus reports guest limit for anonymous users", async () => {
  const t = convexTest(schema, modules).withIdentity(anonUser);

  await t.mutation(api.tasks.create, { title: "Guest task" });
  const status = await t.query(api.users.accountStatus, {});

  expect(status.isGuest).toBe(true);
  expect(status.taskCount).toBe(1);
  expect(status.taskLimit).toBe(ANONYMOUS_TASK_LIMIT);
});

test("create enforces guest task limit", async () => {
  const t = convexTest(schema, modules).withIdentity(anonUser);

  for (let i = 0; i < ANONYMOUS_TASK_LIMIT; i++) {
    await t.mutation(api.tasks.create, { title: `Task ${i + 1}` });
  }

  await expect(
    t.mutation(api.tasks.create, { title: "Over limit" }),
  ).rejects.toThrow(`Guest task limit reached (${ANONYMOUS_TASK_LIMIT})`);
});

test("mergeGuestSessionIntoAccount upgrades guest row on first sign-up", async () => {
  const t = convexTest(schema, modules);
  const asAnon = t.withIdentity(anonUser);
  const asClerk = t.withIdentity(clerkUser);

  await asAnon.mutation(api.tasks.create, { title: "Keep me" });
  await asAnon.mutation(api.tasks.create, { title: "Keep me too" });

  const result = await asClerk.mutation(
    api.users.mergeGuestSessionIntoAccount,
    {
      guestTokenIdentifier: anonUser.subject,
    },
  );

  expect(result.upgradedInPlace).toBe(true);
  expect(result.migratedTaskCount).toBe(2);

  const clerkTasks = await asClerk.query(api.tasks.list, {});
  expect(clerkTasks).toHaveLength(2);

  const users = await t.run(async (ctx) => ctx.db.query("users").collect());
  expect(users).toHaveLength(1);
  expect(users[0]?.tokenIdentifier).toBe(clerkUser.subject);
  expect(users[0]?.firstName).toBe("Clerk");
  expect(users[0]?.lastName).toBe("User");
  expect(users[0]?.imageUrl).toBe("https://example.com/clerk.png");
});

test("mergeGuestSessionIntoAccount merges into existing account for returning users", async () => {
  const t = convexTest(schema, modules);
  const asClerk = t.withIdentity(clerkUser);
  const asAnon = t.withIdentity(anonUser);

  await asClerk.mutation(api.users.syncCurrentUser, {});
  await asAnon.mutation(api.tasks.create, { title: "Guest task" });

  const result = await asClerk.mutation(
    api.users.mergeGuestSessionIntoAccount,
    {
      guestTokenIdentifier: anonUser.subject,
    },
  );

  expect(result.upgradedInPlace).toBe(false);
  expect(result.migratedTaskCount).toBe(1);

  const clerkTasks = await asClerk.query(api.tasks.list, {});
  expect(clerkTasks).toHaveLength(1);
  expect(clerkTasks[0]?.title).toBe("Guest task");

  const users = await t.run(async (ctx) => ctx.db.query("users").collect());
  expect(users).toHaveLength(1);
  expect(users[0]?.tokenIdentifier).toBe(clerkUser.subject);
});

test("signed-in users are limited to SIGNED_IN_TASK_LIMIT tasks", async () => {
  const t = convexTest(schema, modules).withIdentity(clerkUser);

  for (let i = 0; i < SIGNED_IN_TASK_LIMIT; i++) {
    await t.mutation(api.tasks.create, { title: `Task ${i + 1}` });
  }

  const status = await t.query(api.users.accountStatus, {});
  expect(status.isGuest).toBe(false);
  expect(status.taskLimit).toBe(SIGNED_IN_TASK_LIMIT);
  expect(status.taskCount).toBe(SIGNED_IN_TASK_LIMIT);

  await expect(
    t.mutation(api.tasks.create, { title: "Over limit" }),
  ).rejects.toThrow(`Signed-in task limit reached (${SIGNED_IN_TASK_LIMIT})`);
});

test("syncCurrentUser seeds profile fields from JWT claims", async () => {
  const t = convexTest(schema, modules).withIdentity(clerkUser);

  const userId = await t.mutation(api.users.syncCurrentUser, {});
  const user = await t.run(async (ctx) => ctx.db.get(userId));

  expect(user?.tokenIdentifier).toBe(clerkUser.subject);
  expect(user?.firstName).toBe("Clerk");
  expect(user?.lastName).toBe("User");
  expect(user?.email).toBe("clerk@example.com");
  expect(user?.imageUrl).toBe("https://example.com/clerk.png");
});

test("upsertFromClerk uses profile_image_url when image_url is absent", async () => {
  const t = convexTest(schema, modules);

  await t.mutation(internal.users.upsertFromClerk, {
    data: {
      id: "user_profile_image",
      first_name: "Grace",
      last_name: "Hopper",
      email_addresses: [{ email_address: "grace@example.com" }],
      profile_image_url: "https://example.com/grace.png",
    },
  });

  const user = await t.run(async (ctx) =>
    ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", "user_profile_image"),
      )
      .unique(),
  );

  expect(user?.imageUrl).toBe("https://example.com/grace.png");
});

test("upsertFromClerk overwrites profile fields from webhook payload", async () => {
  const t = convexTest(schema, modules);

  await t.mutation(internal.users.upsertFromClerk, {
    data: {
      id: "user_webhook",
      first_name: "Ada",
      last_name: "Lovelace",
      email_addresses: [{ email_address: "ada@example.com" }],
      image_url: "https://example.com/ada.png",
    },
  });

  const user = await t.run(async (ctx) =>
    ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", "user_webhook"))
      .unique(),
  );

  expect(user?.firstName).toBe("Ada");
  expect(user?.lastName).toBe("Lovelace");
  expect(user?.email).toBe("ada@example.com");
  expect(user?.imageUrl).toBe("https://example.com/ada.png");
});
