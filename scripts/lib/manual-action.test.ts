import { afterEach, describe, expect, it, mock } from "bun:test";
import {
  exitWithManualAction,
  printManualAction,
  requireManualAction,
} from "./manual-action";

describe("requireManualAction", () => {
  const exit = mock(() => {});
  const originalExit = process.exit;

  afterEach(() => {
    process.exit = originalExit;
    exit.mockClear();
  });

  it("exits when autoConfirm is false", () => {
    process.exit = exit as typeof process.exit;
    requireManualAction("Do the thing", ["Step one"]);
    expect(exit).toHaveBeenCalledWith(1);
  });

  it("does not exit when autoConfirm is true", () => {
    process.exit = exit as typeof process.exit;
    requireManualAction("Do the thing", ["Step one"], { autoConfirm: true });
    expect(exit).not.toHaveBeenCalled();
  });
});

describe("printManualAction", () => {
  it("uses Follow up prefix by default", () => {
    expect(() => printManualAction("Title", ["a"])).not.toThrow();
  });
});

describe("exitWithManualAction", () => {
  it("always exits", () => {
    const exit = mock(() => {});
    const originalExit = process.exit;
    process.exit = exit as typeof process.exit;
    exitWithManualAction("Stop", ["fix"]);
    expect(exit).toHaveBeenCalledWith(1);
    process.exit = originalExit;
  });
});
