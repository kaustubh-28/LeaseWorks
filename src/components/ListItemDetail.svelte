<script lang="ts">
    interface Props {
        item: any;
        displayProperty?: string;
        secondaryProperties?: string[];
        onclick?: () => void;
    }

    let {
        item,
        displayProperty = 'name',
        secondaryProperties = [],
        onclick
    }: Props = $props();

    const actualSecondaryProps = $derived(
        secondaryProperties.length > 0
            ? secondaryProperties
            : Object.keys(item).filter(key =>
                key !== 'id' &&
                key !== displayProperty &&
                typeof item[key] !== 'object' &&
                item[key] !== null &&
                key !== 'createdAt' &&
                key !== 'updatedAt')
    );

    function handleClick() {
        onclick?.();
    }

    function formatValue(value: any): string {
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (value instanceof Date) return value.toLocaleDateString();
        return String(value);
    }
</script>

<li class="mb-3 font-sans">
    <button 
        class="w-full text-left p-4 bg-white border border-border-tan/70 rounded-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer hover:border-primary/80 hover:bg-[#FAF9F6]" 
        onclick={handleClick}
    >
        <div class="flex items-center gap-2 mb-2 font-medium text-[16px] text-charcoal">
            <span>{item[displayProperty]}</span>
            <slot {item}></slot>
        </div>

        <div class="pl-3 border-l-2 border-border-tan ml-1 space-y-1">
            {#each actualSecondaryProps.slice(0, 3) as prop}
                <div class="flex text-sm">
                    <span class="w-[100px] shrink-0 text-slate-brown uppercase font-bold text-xs tracking-wider">{prop}:</span>
                    <span class="text-charcoal font-medium">{formatValue(item[prop])}</span>
                </div>
            {/each}
        </div>
    </button>
</li>