<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    sortable?: boolean;
    sortDirection?: 'asc' | 'desc' | 'none';
    onsort?: (direction: 'asc' | 'desc' | 'none') => void;
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    sortable = false,
    sortDirection = 'none',
    onsort,
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  const context = getContext<{ density: 'compact' | 'default' | 'comfortable'; sticky: boolean }>('tableContext');
  const density = $derived(context ? context.density : 'default');
  const sticky = $derived(context ? context.sticky : false);

  const paddingClasses: Record<string, string> = {
    compact: 'py-2.5 px-3 text-xs',
    default: 'py-4 px-4 text-xs',
    comfortable: 'py-6 px-6 text-xs'
  };

  const stickyClasses = $derived(
    sticky ? 'sticky top-0 bg-white z-10 shadow-[inset_0_-1px_0_var(--color-border-tan)] border-b border-border-tan' : ''
  );

  const finalThClasses = $derived(
    `font-sans font-bold uppercase tracking-widest text-slate-brown align-middle ${paddingClasses[density]} ${stickyClasses} ${className}`
  );

  function handleSortClick() {
    if (!sortable || !onsort) return;
    
    let nextDirection: 'asc' | 'desc' | 'none';
    if (sortDirection === 'none') {
      nextDirection = 'asc';
    } else if (sortDirection === 'asc') {
      nextDirection = 'desc';
    } else {
      nextDirection = 'none';
    }
    onsort(nextDirection);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!sortable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSortClick();
    }
  }

  const ariaSort = $derived(
    sortable
      ? sortDirection === 'asc'
        ? 'ascending'
        : sortDirection === 'desc'
          ? 'descending'
          : 'none'
      : undefined
  );
</script>

<th
  class={finalThClasses}
  aria-sort={ariaSort}
  {...restProps}
>
  {#if sortable}
    <button
      type="button"
      class="inline-flex items-center gap-1.5 hover:text-charcoal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-xs uppercase font-inherit text-inherit bg-transparent border-none cursor-pointer w-full text-left"
      onclick={handleSortClick}
      onkeydown={handleKeyDown}
    >
      <span class="flex-grow min-w-0 truncate">
        {@render children?.()}
      </span>
      <span class="material-symbols-outlined text-[16px] flex-shrink-0 select-none {sortDirection === 'none' ? 'opacity-30' : 'text-primary'}" aria-hidden="true">
        {#if sortDirection === 'asc'}
          arrow_upward
        {:else if sortDirection === 'desc'}
          arrow_downward
        {:else}
          unfold_more
        {/if}
      </span>
    </button>
  {:else}
    {@render children?.()}
  {/if}
</th>
