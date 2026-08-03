<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    bordered?: boolean;
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    bordered = true,
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  const context = getContext<{ padding: string; hasFooter: boolean }>('cardContext');

  if (context) {
    context.hasFooter = true;
  }

  const padding = $derived(context ? context.padding : 'md');

  // Responsive padding mapping for footer
  const paddingClasses: Record<string, string> = {
    none: 'p-0',
    sm: 'pb-4 px-4 pt-3',
    md: 'pb-6 px-6 pt-4 md:pb-8 md:px-8 md:pt-5',
    lg: 'pb-8 px-8 pt-5 md:pb-10 md:px-10 md:pt-6',
    xl: 'pb-10 px-10 pt-6 md:pb-12 md:px-12 md:pt-8'
  };

  const borderClass = $derived(bordered ? 'border-t border-border-tan' : '');
</script>

<div
  class="flex items-center justify-between w-full gap-4 {paddingClasses[padding]} {borderClass} {className}"
  {...restProps}
>
  {@render children?.()}
</div>
