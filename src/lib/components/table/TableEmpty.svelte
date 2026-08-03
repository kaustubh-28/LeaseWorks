<script lang="ts">
  import TableRow from './TableRow.svelte';
  import TableCell from './TableCell.svelte';

  interface Props {
    colspan: number;
    message?: string;
    icon?: string;
    class?: string;
    [key: string]: any;
  }

  let {
    colspan,
    message = 'No data available',
    icon = 'inbox',
    class: className = '',
    ...restProps
  }: Props = $props();
</script>

<TableRow class={className} {...restProps}>
  <TableCell {colspan} class="text-center py-12 text-slate-brown bg-white">
    <div class="flex flex-col items-center justify-center gap-2">
      <span class="material-symbols-outlined text-4xl text-slate-brown/40" aria-hidden="true">{icon}</span>
      <p class="font-sans text-[16px] font-semibold">{message}</p>
    </div>
  </TableCell>
</TableRow>
