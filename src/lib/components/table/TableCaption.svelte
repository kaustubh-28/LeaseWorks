<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let { class: className = '', children, ...restProps }: Props = $props();
</script>

<caption class="text-sm text-slate-brown font-sans p-4 mt-2 text-left caption-bottom {className}" {...restProps}>
  {@render children?.()}
</caption>
