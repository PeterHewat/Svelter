<script lang="ts">
  import { GoogleOneTap } from "svelte-clerk/client";

  interface Props {
    /** Post sign-in redirect when One Tap completes (must be same-origin). */
    redirectUrl?: string;
  }

  let { redirectUrl = "/tasks" }: Props = $props();
</script>

<!--
  Renders only for signed-out users (Clerk hides it when a session exists).
  Requires Google custom credentials in Clerk — see `bun run setup`.
-->
<GoogleOneTap
  signInForceRedirectUrl={redirectUrl}
  signUpForceRedirectUrl={redirectUrl}
  cancelOnTapOutside={true}
  itpSupport={true}
  fedCmSupport={true}
/>
