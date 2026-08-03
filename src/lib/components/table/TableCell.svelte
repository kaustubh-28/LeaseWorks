<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let { class: className = '', children, ...restProps }: Props = $props();

  const context = getContext<{ density: 'compact' | 'default' | 'comfortable' }>('tableContext');
  const density = $derived(context ? context.density : 'default');

  const paddingClasses: Record<string, string> = {
    compact: 'py-2.5 px-3 text-sm',
    default: 'py-4 px-4 text-[16px]',
    comfortable: 'py-6 px-6 text-[17px]'
  };

  const finalClasses = $derived(
    `align-middle font-sans text-charcoal leading-relaxed ${paddingClasses[density]} ${className}`
  );
</script>

<td class={finalClasses} {...restProps}>
  {@render children?.()}
</td>
