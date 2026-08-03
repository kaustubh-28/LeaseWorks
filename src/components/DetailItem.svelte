<script lang="ts">
    export let label: string;
</script>

<div class="bg-white border border-border-tan/70 rounded-sm p-4 text-[16px] text-charcoal flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-sm">
    <span class="text-xs uppercase font-bold tracking-wider text-slate-brown">{label}</span>
    <span class="font-medium text-charcoal">
        <slot></slot>
    </span>
</div>