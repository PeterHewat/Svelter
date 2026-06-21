import { describe, expect, test } from "vitest";
import {
  MARKETING_DEV_PORT,
  MARKETING_PREVIEW_PORT,
  WEB_DEV_PORT,
  WEB_PREVIEW_PORT,
  marketingDevOrigin,
  webDevOrigin,
} from "./dev-ports";

describe("dev-ports", () => {
  test("marketing is web + 1 within dev and preview", () => {
    expect(MARKETING_DEV_PORT).toBe(WEB_DEV_PORT + 1);
    expect(MARKETING_PREVIEW_PORT).toBe(WEB_PREVIEW_PORT + 1);
  });

  test("preview block is dev block + 1000", () => {
    expect(WEB_PREVIEW_PORT).toBe(WEB_DEV_PORT + 1000);
    expect(MARKETING_PREVIEW_PORT).toBe(MARKETING_DEV_PORT + 1000);
  });

  test("origins match localhost dev ports", () => {
    expect(webDevOrigin).toBe(`http://localhost:${WEB_DEV_PORT}`);
    expect(marketingDevOrigin).toBe(`http://localhost:${MARKETING_DEV_PORT}`);
  });
});
