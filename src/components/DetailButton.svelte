<script lang="ts">
    import { goto } from '$app/navigation';

    export let href: string = ''; // URL to navigate to when clicked
    export let clickable: boolean = false; // Whether it is clickable

    function handleClick() {
        if (clickable && href) {
            goto(href);
        }
    }
</script>

<button 
    class="w-full text-left bg-white p-4 border border-border-tan/70 rounded-sm font-sans text-charcoal shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 {clickable ? 'cursor-pointer hover:border-primary/80 hover:bg-[#FAF9F6]' : 'cursor-default'}" 
    onclick={handleClick} 
    disabled={!clickable}
>
    <div class="space-y-1">
        <slot></slot>
    </div>
</button>