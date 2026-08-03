<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    bordered?: boolean;
    class?: string;
    actions?: Snippet;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    bordered = true,
    class: className = '',
    actions,
    children,
    ...restProps
  }: Props = $props();

  const context = getContext<{ padding: string; hasHeader: boolean }>('cardContext');

  if (context) {
    context.hasHeader = true;
  }

  const padding = $derived(context ? context.padding : 'md');

  // Responsive padding mapping for header (matching horizontal padding and vertical offset)
  const paddingClasses: Record<string, string> = {
    none: 'p-0',
    sm: 'pt-4 px-4 pb-3',
    md: 'pt-6 px-6 pb-4 md:pt-8 md:px-8 md:pb-5',
    lg: 'pt-8 px-8 pb-5 md:pt-10 md:px-10 md:pb-6',
    xl: 'pt-10 px-10 pb-6 md:pt-12 md:px-12 md:pb-8'
  };

  const borderClass = $derived(bordered ? 'border-b border-border-tan' : '');
</script>

<div
  class="flex justify-between items-center w-full gap-4 {paddingClasses[padding]} {borderClass} {className}"
  {...restProps}
>
  <div class="flex flex-col gap-1 min-w-0">
    {@render children?.()}
  </div>

  {#if actions}
    <div class="flex items-center gap-2 flex-shrink-0">
      {@render actions()}
    </div>
  {/if}
</div>
