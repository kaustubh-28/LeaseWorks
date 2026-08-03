<script lang="ts">
  import TableRow from './TableRow.svelte';
  import TableCell from './TableCell.svelte';

  interface Props {
    rows?: number;
    cols: number;
    class?: string;
    [key: string]: any;
  }

  let {
    rows = 5,
    cols,
    class: className = '',
    ...restProps
  }: Props = $props();

  const rowArray = $derived(Array(rows).fill(0));
  const colArray = $derived(Array(cols).fill(0));
</script>

{#each rowArray as _, rowIndex}
  <TableRow class={className} {...restProps}>
    {#each colArray as _, colIndex}
      <TableCell>
        <div 
          class="h-4 bg-slate-brown/10 animate-pulse rounded-sm"
          style="width: {colIndex === 0 ? '60%' : colIndex === cols - 1 ? '40%' : '80%'}"
        ></div>
      </TableCell>
    {/each}
  </TableRow>
{/each}
