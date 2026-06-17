/**
 * Opens a URL in the system default browser when possible.
 *
 * @param url - HTTPS URL to open
 * @returns Whether a browser command succeeded
 */
export async function openUrlInBrowser(url: string): Promise<boolean> {
  const commands: Array<[string, string[]]> =
    process.platform === "darwin"
      ? [["open", [url]]]
      : process.platform === "win32"
        ? [["cmd", ["/c", "start", "", url]]]
        : [["xdg-open", [url]]];

  for (const [cmd, args] of commands) {
    try {
      const proc = Bun.spawn([cmd, ...args], {
        stdout: "ignore",
        stderr: "ignore",
      });
      const code = await proc.exited;
      if (code === 0) {
        return true;
      }
    } catch {
      // try next opener
    }
  }
  return false;
}
