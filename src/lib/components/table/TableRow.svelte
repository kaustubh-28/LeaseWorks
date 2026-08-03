<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    hover?: boolean;
    selected?: boolean;
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    hover = true,
    selected = false,
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  const hoverClass = $derived(hover ? 'hover:bg-parchment/40 transition-colors' : '');
  const selectedClass = $derived(selected ? 'bg-status-green-bg/30 hover:bg-status-green-bg/40' : '');
</script>

<tr
  class="border-b border-border-tan/50 {hoverClass} {selectedClass} {className}"
  aria-selected={selected ? true : undefined}
  {...restProps}
>
  {@render children?.()}
</tr>
