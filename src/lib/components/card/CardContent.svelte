<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let { class: className = '', children, ...restProps }: Props = $props();

  const context = getContext<{ padding: string; hasHeader: boolean; hasFooter: boolean }>('cardContext');

  const padding = $derived(context ? context.padding : 'md');
  const hasHeader = $derived(context ? context.hasHeader : false);
  const hasFooter = $derived(context ? context.hasFooter : false);

  // Horizontal padding is constant, vertical padding is dynamic based on surrounding components
  const paddingClasses = $derived.by(() => {
    switch (padding) {
      case 'none':
        return 'p-0';
      case 'sm':
        return `px-4 ${hasHeader ? 'pt-2' : 'pt-4'} ${hasFooter ? 'pb-2' : 'pb-4'}`;
      case 'md':
        return `px-6 md:px-8 ${hasHeader ? 'pt-3' : 'pt-6 md:pt-8'} ${hasFooter ? 'pb-3' : 'pb-6 md:pb-8'}`;
      case 'lg':
        return `px-8 md:px-10 ${hasHeader ? 'pt-4' : 'pt-8 md:pt-10'} ${hasFooter ? 'pb-4' : 'pb-8 md:pb-10'}`;
      case 'xl':
        return `px-10 md:px-12 ${hasHeader ? 'pt-5' : 'pt-10 md:pt-12'} ${hasFooter ? 'pb-5' : 'pb-10 md:pb-12'}`;
      default:
        return 'p-6';
    }
  });
</script>

<div
  class="flex-grow w-full font-sans text-[16px] text-charcoal leading-relaxed {paddingClasses} {className}"
  {...restProps}
>
  {@render children?.()}
</div>
