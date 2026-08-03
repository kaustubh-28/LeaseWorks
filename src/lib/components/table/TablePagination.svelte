<script lang="ts">
  import { Button } from '$lib/components/button';

  interface Props {
    page?: number;
    pageSize?: number;
    totalItems?: number;
    pageSizeOptions?: number[];
    onpagechange?: (page: number) => void;
    onpagesizechange?: (pageSize: number) => void;
    class?: string;
    [key: string]: any;
  }

  let {
    page = 1,
    pageSize = 10,
    totalItems = 0,
    pageSizeOptions = [5, 10, 20, 50],
    onpagechange,
    onpagesizechange,
    class: className = '',
    ...restProps
  }: Props = $props();

  const totalPages = $derived(Math.max(1, Math.ceil(totalItems / pageSize)));
  const startItem = $derived(totalItems === 0 ? 0 : (page - 1) * pageSize + 1);
  const endItem = $derived(Math.min(totalItems, page * pageSize));

  function handlePrev() {
    if (page > 1) {
      onpagechange?.(page - 1);
    }
  }

  function handleNext() {
    if (page < totalPages) {
      onpagechange?.(page + 1);
    }
  }

  function handlePageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    onpagesizechange?.(Number(target.value));
  }
</script>

<div
  class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-border-tan/50 font-sans text-sm text-slate-brown {className}"
  {...restProps}
>
  <!-- Showing Stats -->
  <div class="font-medium text-charcoal">
    Showing <span class="font-bold">{startItem}</span> to <span class="font-bold">{endItem}</span> of <span class="font-bold">{totalItems}</span> entries
  </div>

  <!-- Pagination Controls & Page Size Selector -->
  <div class="flex flex-wrap items-center gap-4">
    <!-- Page Size Dropdown -->
    <div class="flex items-center gap-2">
      <label for="pageSizeSelect" class="text-xs uppercase font-bold tracking-wider">Show</label>
      <select
        id="pageSizeSelect"
        class="h-8 border border-border-tan rounded-sm bg-white px-2 py-0 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-charcoal"
        value={pageSize}
        onchange={handlePageSizeChange}
      >
        {#each pageSizeOptions as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
      <span class="text-xs uppercase font-bold tracking-wider">entries</span>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex items-center gap-2">
      <Button
        variant="secondary"
        size="xs"
        disabled={page <= 1}
        onclick={handlePrev}
        leftIcon="chevron_left"
        aria-label="Previous Page"
      />
      
      <span class="text-xs font-bold uppercase tracking-wider text-charcoal font-sans px-2">
        Page {page} of {totalPages}
      </span>

      <Button
        variant="secondary"
        size="xs"
        disabled={page >= totalPages}
        onclick={handleNext}
        rightIcon="chevron_right"
        aria-label="Next Page"
      />
    </div>
  </div>
</div>
