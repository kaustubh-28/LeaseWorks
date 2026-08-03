<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let { class: className = '', children, ...restProps }: Props = $props();
</script>

<p
  class="font-sans text-sm md:text-[15px] text-slate-brown leading-normal {className}"
  {...restProps}
>
  {@render children?.()}
</p>
