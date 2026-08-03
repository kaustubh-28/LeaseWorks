<script lang="ts">
    export let title: string;
</script>

<div class="mb-6 font-sans">
    <h3 class="text-[20px] font-serif font-bold text-charcoal mb-4 pb-1.5 border-b-2 border-double border-border-tan">
        {title}
    </h3>
    <div class="space-y-3">
        <slot></slot>
    </div>
</div>