<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let { class: className = '', children, ...restProps }: Props = $props();
</script>

<tbody class={className} {...restProps}>
  {@render children?.()}
</tbody>
