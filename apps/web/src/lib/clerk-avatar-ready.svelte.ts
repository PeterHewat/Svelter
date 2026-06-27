/**
 * Tracks when Clerk's UserButton avatar image is painted in a mount root.
 *
 * @param getRoot - Returns the UserButton mount element
 * @param enabled - When false, resets and skips observation
 * @returns Reactive ready flag for spinner / overlay visibility
 */
export function useClerkAvatarReady(
  getRoot: () => HTMLElement | null,
  getEnabled: () => boolean,
) {
  let ready = $state(false);

  function markReadyWhenPainted(root: HTMLElement) {
    if (ready) return;

    const img = root.querySelector("img");
    if (!img) return;

    if (img.complete && img.naturalWidth > 0) {
      ready = true;
      return;
    }

    img.addEventListener(
      "load",
      () => {
        ready = true;
      },
      { once: true },
    );
  }

  $effect(() => {
    if (!getEnabled()) {
      ready = false;
      return;
    }

    const root = getRoot();
    if (!root) {
      ready = false;
      return;
    }

    const onLoad = () => markReadyWhenPainted(root);

    markReadyWhenPainted(root);

    const observer = new MutationObserver(() => {
      markReadyWhenPainted(root);
    });
    observer.observe(root, { childList: true, subtree: true });

    root.addEventListener("load", onLoad, true);

    return () => {
      observer.disconnect();
      root.removeEventListener("load", onLoad, true);
    };
  });

  return {
    get ready() {
      return ready;
    },
  };
}
