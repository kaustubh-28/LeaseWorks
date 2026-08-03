<script lang="ts">
    interface Props {
        item: any;
        displayProperty?: string;
        onclick?: () => void;
        onedit?: () => void;
        ondelete?: () => void;
    }

    let {
        item,
        displayProperty = 'name',
        onclick,
        onedit,
        ondelete
    }: Props = $props();

    function handleClick() {
        onclick?.();
    }

    function handleEdit(event: MouseEvent) {
        event.stopPropagation();
        onedit?.();
    }

    function handleDelete(event: MouseEvent) {
        event.stopPropagation();
        ondelete?.();
    }
</script>

<li 
    class="flex justify-between items-center p-4 border-b border-border-tan/50 bg-white hover:bg-[#FAF9F6] transition-colors cursor-pointer group" 
    onclick={handleClick}
    role="presentation"
>
    <div class="flex items-center text-[16px] text-charcoal font-medium">
        <span>{item[displayProperty]}</span>
        <slot {item}></slot>
    </div>
    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
            class="p-2 border border-border-tan hover:border-primary rounded-sm hover:bg-primary/10 text-slate-brown hover:text-primary transition-all cursor-pointer flex items-center justify-center" 
            onclick={handleEdit} 
            aria-label="Edit"
        >
            <span class="material-symbols-outlined text-[16px]">edit</span>
        </button>
        <button 
            class="p-2 border border-border-tan hover:border-error rounded-sm hover:bg-error/10 text-slate-brown hover:text-error transition-all cursor-pointer flex items-center justify-center" 
            onclick={handleDelete} 
            aria-label="Delete"
        >
            <span class="material-symbols-outlined text-[16px]">delete</span>
        </button>
    </div>
</li>