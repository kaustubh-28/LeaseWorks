<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let { class: className = '', children, ...restProps }: Props = $props();
</script>

<div
  class="flex flex-wrap items-center justify-between gap-4 border-b border-border-tan pb-4 mb-4 {className}"
  {...restProps}
>
  {@render children?.()}
</div>
