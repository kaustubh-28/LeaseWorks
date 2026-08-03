<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    href?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    uppercase?: boolean;
    leftIcon?: string;
    rightIcon?: string;
    icon?: string; // for icon-only button
    class?: string;
    onclick?: (event: MouseEvent | KeyboardEvent) => void;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    variant = 'primary',
    size = 'lg',
    href = '',
    type = 'button',
    disabled = false,
    loading = false,
    fullWidth = false,
    uppercase = true,
    leftIcon = '',
    rightIcon = '',
    icon = '',
    class: className = '',
    onclick,
    children,
    ...restProps
  }: Props = $props();

  // Dynamic tags
  let elementTag = $derived(href ? 'a' : 'button');

  // Variant classes mapping
  const variantClasses = {
    primary: 'bg-primary text-white border border-transparent hover:bg-[#005230] shadow-sm',
    secondary: 'bg-white text-charcoal border border-border-tan hover:bg-parchment',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primary/5',
    ghost: 'bg-transparent text-charcoal border border-transparent hover:bg-parchment/40',
    danger: 'bg-error text-white border border-transparent hover:bg-[#93000a] shadow-sm',
    success: 'bg-status-green-text text-white border border-transparent hover:bg-[#0f4925] shadow-sm',
    warning: 'bg-secondary text-white border border-transparent hover:bg-[#5c4200] shadow-sm'
  };

  // Size classes mapping (handles height, horizontal/vertical padding, text size, and gap spacing)
  const standardSizeClasses = {
    xs: 'h-8 px-3 text-xs gap-1.5',
    sm: 'h-10 px-4 text-sm gap-2',
    md: 'h-12 px-5 text-[15px] gap-2',
    lg: 'h-14 px-6 text-[16px] gap-2.5',
    xl: 'h-16 px-8 text-[18px] gap-3'
  };

  // For icon-only buttons (square aspect-ratio):
  const iconOnlySizeClasses = {
    xs: 'h-8 w-8 text-xs justify-center p-0',
    sm: 'h-10 w-10 text-sm justify-center p-0',
    md: 'h-12 w-12 text-[15px] justify-center p-0',
    lg: 'h-14 w-14 text-[16px] justify-center p-0',
    xl: 'h-16 w-16 text-[18px] justify-center p-0'
  };

  const sizeClasses = $derived(icon ? iconOnlySizeClasses[size] : standardSizeClasses[size]);

  // Combined styling classes
  const baseClasses = 'relative inline-flex items-center justify-center font-sans font-bold tracking-wider rounded-sm transition-all duration-150 ease-in-out select-none cursor-pointer';
  const widthClasses = $derived(fullWidth ? 'w-full flex' : '');
  const uppercaseClasses = $derived(uppercase ? 'uppercase' : '');
  const disabledClasses = 'opacity-70 cursor-not-allowed';
  const focusClasses = 'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none';

  const activeClasses = $derived(
    disabled || loading
      ? ''
      : 'active:scale-[0.98]'
  );

  const finalClasses = $derived(
    [
      baseClasses,
      variantClasses[variant],
      sizeClasses,
      widthClasses,
      uppercaseClasses,
      focusClasses,
      activeClasses,
      (disabled || loading) ? disabledClasses : '',
      className
    ]
      .filter(Boolean)
      .join(' ')
  );

  // Click & Key events
  function handleClick(event: MouseEvent) {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onclick?.(event);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onclick?.(event);
    }
  }
</script>

{#snippet buttonInner()}
  <!-- Loading spinner overlay (absolute-centered to prevent layout shift) -->
  {#if loading}
    <span class="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
      <span class="material-symbols-outlined animate-spin text-[1.25em]">progress_activity</span>
    </span>
  {/if}

  <!-- Content wrapper (opacity-0 when loading to preserve button width exactly) -->
  <span class="inline-flex items-center justify-center gap-inherit font-inherit text-inherit h-full {loading ? 'opacity-0' : ''}">
    {#if icon}
      <span class="material-symbols-outlined text-[1.25em]" aria-hidden="true">{icon}</span>
    {:else}
      {#if leftIcon}
        <span class="material-symbols-outlined text-[1.2em]" aria-hidden="true">{leftIcon}</span>
      {/if}
      
      {#if children}
        {@render children()}
      {/if}

      {#if rightIcon}
        <span class="material-symbols-outlined text-[1.2em]" aria-hidden="true">{rightIcon}</span>
      {/if}
    {/if}
  </span>
{/snippet}

{#if elementTag === 'a'}
  <a
    href={(disabled || loading) ? undefined : href}
    class={finalClasses}
    role="button"
    tabindex={(disabled || loading) ? -1 : 0}
    aria-disabled={disabled || loading ? 'true' : undefined}
    aria-busy={loading ? 'true' : undefined}
    onclick={handleClick}
    onkeydown={handleKeyDown}
    {...restProps}
  >
    {@render buttonInner()}
  </a>
{:else}
  <button
    {type}
    disabled={disabled || loading}
    class={finalClasses}
    aria-busy={loading ? 'true' : undefined}
    onclick={handleClick}
    {...restProps}
  >
    {@render buttonInner()}
  </button>
{/if}
