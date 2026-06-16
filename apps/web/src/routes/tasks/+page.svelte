<script lang="ts">
  import RequireAuth from "$lib/components/require-auth.svelte";
  import TasksView from "./tasks-view.svelte";
</script>

<RequireAuth>
  <TasksView />
</RequireAuth>
