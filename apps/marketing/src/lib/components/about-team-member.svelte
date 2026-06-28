<script lang="ts">
  import type { AboutTeamMember } from "$lib/marketing-content";

  interface Props {
    member: AboutTeamMember;
  }

  let { member }: Props = $props();

  const initials = $derived(
    member.name
      .split(/\s+/)
      .map((part) => part[0] ?? "")
      .slice(0, 2)
      .join("")
      .toUpperCase(),
  );
</script>

<article class="flex flex-col items-center text-center">
  <div
    class="border-border bg-muted mb-4 flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border"
  >
    {#if member.imageSrc}
      <img
        src={member.imageSrc}
        alt="{member.name}, {member.title}"
        class="h-full w-full object-cover"
        width="112"
        height="112"
        loading="lazy"
        decoding="async"
      />
    {:else}
      <span
        class="text-foreground/10 text-5xl font-semibold tracking-wide select-none"
        aria-hidden="true"
      >
        {initials}
      </span>
    {/if}
  </div>
  <h3 class="text-foreground text-lg font-semibold">{member.name}</h3>
  <p class="text-muted-foreground mt-0.5 text-sm font-medium">{member.title}</p>
  <p class="text-muted-foreground mt-3 max-w-xs text-sm leading-relaxed">
    {member.bio}
  </p>
</article>
