<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let { class: className = '', children, ...restProps }: Props = $props();
</script>

<h3
  class="font-serif font-bold text-[20px] md:text-[22px] text-primary tracking-tight leading-tight {className}"
  {...restProps}
>
  {@render children?.()}
</h3>
