<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    density?: 'compact' | 'default' | 'comfortable';
    sticky?: boolean;
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    density = 'default',
    sticky = false,
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  // Create reactive context state
  let tableState = $state({
    density,
    sticky
  });

  // Keep state in sync reactively
  $effect(() => {
    tableState.density = density;
    tableState.sticky = sticky;
  });

  setContext('tableContext', tableState);
</script>

<div class="w-full overflow-x-auto border border-border-tan rounded-sm shadow-sm bg-white {sticky ? 'overflow-y-auto max-h-[450px]' : ''} {className}">
  <table class="w-full border-collapse text-left" {...restProps}>
    {@render children?.()}
  </table>
</div>
