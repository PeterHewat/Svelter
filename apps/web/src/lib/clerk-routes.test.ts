import { describe, expect, it } from "vitest";
import {
  hasAuthLoginParam,
  needsClerkForRoute,
  urlWithoutAuthLoginParam,
} from "./clerk-routes";

describe("needsClerkForRoute", () => {
  it("returns true for /tasks, /user, and /login", () => {
    expect(needsClerkForRoute("/tasks", new URLSearchParams())).toBe(true);
    expect(needsClerkForRoute("/user", new URLSearchParams())).toBe(true);
    expect(needsClerkForRoute("/login", new URLSearchParams())).toBe(true);
  });

  it("returns true when auth=login is in the query string", () => {
    expect(needsClerkForRoute("/", new URLSearchParams("auth=login"))).toBe(
      true,
    );
  });

  it("returns false for anonymous routes", () => {
    expect(needsClerkForRoute("/", new URLSearchParams())).toBe(false);
    expect(needsClerkForRoute("/about", new URLSearchParams())).toBe(false);
  });
});

describe("hasAuthLoginParam", () => {
  it("detects auth=login", () => {
    expect(hasAuthLoginParam(new URLSearchParams("auth=login"))).toBe(true);
    expect(hasAuthLoginParam(new URLSearchParams())).toBe(false);
  });
});

describe("urlWithoutAuthLoginParam", () => {
  it("removes auth=login and keeps other params", () => {
    expect(
      urlWithoutAuthLoginParam(
        new URL("http://localhost:3000/?lang=en&theme=dark&auth=login"),
      ),
    ).toBe("/?lang=en&theme=dark");
  });

  it("returns null when auth=login is absent", () => {
    expect(
      urlWithoutAuthLoginParam(new URL("http://localhost:3000/tasks")),
    ).toBeNull();
  });
});
