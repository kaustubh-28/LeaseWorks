<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';

  // Props definition using Svelte 5 runes
  interface Props {
    tag?: string;
    bordered?: boolean;
    highlighted?: boolean;
    highlightColor?: 'primary' | 'secondary' | 'error';
    clickable?: boolean;
    elevation?: 'none' | 'sm' | 'md' | 'xl';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    loading?: boolean;
    empty?: boolean;
    emptyMessage?: string;
    emptyIcon?: string;
    class?: string;
    href?: string;
    onclick?: (event: MouseEvent | KeyboardEvent) => void;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    tag = 'div',
    bordered = true,
    highlighted = false,
    highlightColor = 'primary',
    clickable = false,
    elevation = 'sm',
    padding = 'md',
    loading = false,
    empty = false,
    emptyMessage = 'No data available',
    emptyIcon = 'info',
    class: className = '',
    href = '',
    onclick,
    children,
    ...restProps
  }: Props = $props();

  // Create reactive context state
  let cardState = $state({
    padding,
    hasHeader: false,
    hasFooter: false
  });

  // Keep padding in context reactive
  $effect(() => {
    cardState.padding = padding;
  });

  setContext('cardContext', cardState);

  // Dynamic tags
  let elementTag = $derived(clickable ? (href ? 'a' : 'button') : tag);

  // Elevation styles
  const elevationClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    xl: 'shadow-xl'
  };

  // Border styles
  const borderClasses = $derived(
    bordered
      ? 'border border-border-tan'
      : ''
  );

  // Highlight style
  const highlightClasses = $derived(
    highlighted
      ? `border-l-4 ${
          highlightColor === 'primary'
            ? 'border-l-primary'
            : highlightColor === 'secondary'
              ? 'border-l-secondary'
              : 'border-l-error'
        }`
      : ''
  );

  // Clickable card classes
  const clickableClasses = $derived(
    clickable
      ? 'cursor-pointer hover:bg-parchment/30 hover:border-slate-brown/50 active:bg-parchment/60 transition-all duration-150 ease-in-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none'
      : ''
  );

  // Base card styling
  const cardBaseClasses = 'relative bg-white rounded-sm flex flex-col w-full text-charcoal';

  // Handle keyboard event for non-native button clickable elements
  function handleKeyDown(event: KeyboardEvent) {
    if (!clickable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onclick?.(event);
    }
  }

  function handleClick(event: MouseEvent) {
    if (clickable) {
      onclick?.(event);
    }
  }
</script>

{#snippet cardInner()}
  {#if loading}
    <div
      class="absolute inset-0 bg-white/70 flex items-center justify-center z-10 transition-opacity rounded-sm"
      aria-live="polite"
      aria-label="Loading content"
    >
      <span class="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
    </div>
  {/if}

  {#if empty && !loading}
    <div class="flex flex-col items-center justify-center text-center p-8 min-h-[160px] text-slate-brown w-full">
      <span class="material-symbols-outlined text-[40px] mb-2 text-slate-brown/60" aria-hidden="true">{emptyIcon}</span>
      <p class="font-sans text-[16px] font-medium">{emptyMessage}</p>
    </div>
  {:else}
    {@render children?.()}
  {/if}
{/snippet}

{#if elementTag === 'a'}
  <a
    href={href || undefined}
    class="{cardBaseClasses} {elevationClasses[elevation]} {borderClasses} {highlightClasses} {clickableClasses} {className}"
    onclick={handleClick}
    {...restProps}
  >
    {@render cardInner()}
  </a>
{:else if elementTag === 'button'}
  <button
    type="button"
    class="{cardBaseClasses} {elevationClasses[elevation]} {borderClasses} {highlightClasses} {clickableClasses} {className}"
    onclick={handleClick}
    aria-busy={loading ? true : undefined}
    {...restProps}
  >
    {@render cardInner()}
  </button>
{:else}
  <svelte:element
    this={elementTag}
    class="{cardBaseClasses} {elevationClasses[elevation]} {borderClasses} {highlightClasses} {clickableClasses} {className}"
    role={clickable ? 'button' : undefined}
    tabindex={clickable ? 0 : undefined}
    onkeydown={handleKeyDown}
    onclick={handleClick}
    {...restProps}
  >
    {@render cardInner()}
  </svelte:element>
{/if}
