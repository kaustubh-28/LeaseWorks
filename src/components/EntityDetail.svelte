<script lang="ts">
    import { goto } from '$app/navigation';
    import EntityForm from './EntityForm.svelte';
    import { 
        Card, 
        CardHeader, 
        CardContent, 
        CardFooter, 
        CardTitle,
        Button 
    } from '$lib/components';

    // Svelte 5 Props using interface
    interface Props {
        title?: string;
        loading?: boolean;
        entityType?: string;
        schema?: any[];
        entity?: any;
    }

    let {
        title = 'Detail View',
        loading = false,
        entityType = '',
        schema = [],
        entity = null
    }: Props = $props();

    let entityForm: EntityForm;
    let showDeleteConfirm = $state(false);
    let processingDelete = $state(false);

    function onEdit() {
        if (entityForm && entity) {
            entityForm.openForm(entity, true);
        }
    }

    async function handleFormSubmit() {
        window.location.reload();
    }

    function handleFormError(event: any) {
        const msg = event?.detail?.message || event?.message || 'Update failed';
        console.error('Form error:', msg);
        alert(msg);
    }

    function goBack() {
        goto('/' + entityType);
    }

    function handleDeleteClick() {
        showDeleteConfirm = true;
    }

    async function confirmDelete() {
        if (!entity || !entity.id) return;
        processingDelete = true;
        
        try {
            const response = await fetch(`/api/${entityType}/${entity.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                showDeleteConfirm = false;
                goto('/' + entityType);
            } else {
                let errorMessage = 'Failed to delete record';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = response.statusText || errorMessage;
                }
                alert(`Error: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            alert('An unexpected error occurred.');
        } finally {
            processingDelete = false;
        }
    }

    function cancelDelete() {
        showDeleteConfirm = false;
    }
</script>

<div class="w-full max-w-[1000px] mx-auto p-4 sm:p-6 md:p-8">
    <Card padding="none" bordered={true}>
        <!-- Card Header with Back navigation & Title -->
        <CardHeader>
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onclick={goBack} leftIcon="arrow_back" aria-label="Go back" />
                    <CardTitle class="text-2xl font-serif text-charcoal font-bold">{title}</CardTitle>
                </div>
            </div>
        </CardHeader>

        <!-- Card Content holding the graphics & fields -->
        <CardContent>
            {#if loading}
                <div class="flex justify-center items-center py-20 font-sans text-slate-brown gap-2">
                    <span class="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    Loading details...
                </div>
            {:else}
                <div class="flex flex-col md:flex-row items-stretch border-t border-border-tan/50 bg-[#FAF9F6]">
                    <!-- Left column graphic slot -->
                    {#if $$slots['graphic']}
                        <div class="md:w-[280px] p-8 border-b md:border-b-0 md:border-r border-border-tan/50 bg-white flex items-center justify-center shrink-0">
                            <slot name="graphic"></slot>
                        </div>
                    {/if}
                    
                    <!-- Right column details slot -->
                    <div class="flex-1 p-8 space-y-6">
                        <slot></slot>
                    </div>
                </div>
            {/if}
        </CardContent>

        <!-- Separated action footer -->
        <CardFooter bordered={true}>
            <div class="flex items-center justify-between w-full p-6">
                <!-- Destructive Delete Action -->
                <div>
                    {#if entity && !loading}
                        <Button variant="danger" onclick={handleDeleteClick} leftIcon="delete">
                            Delete Record
                        </Button>
                    {/if}
                </div>

                <!-- Primary Edit Action -->
                <div>
                    {#if entity && !loading}
                        <Button variant="primary" onclick={onEdit} leftIcon="edit">
                            Edit Details
                        </Button>
                    {/if}
                </div>
            </div>
        </CardFooter>
    </Card>
</div>

<!-- Modal Form for Editing -->
<EntityForm
    bind:this={entityForm}
    {entityType}
    {schema}
    initialData={{}}
    isOpen={false}
    apiBasePath={`/api/${entityType}`}
    onsubmit={handleFormSubmit}
    onerror={handleFormError}
/>

<!-- Double-ledger styled Delete Confirmation Modal -->
{#if showDeleteConfirm}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs">
        <button class="absolute inset-0 bg-transparent w-full h-full border-none outline-none cursor-default" onclick={cancelDelete} aria-label="Close confirmation dialog"></button>
        <div class="bg-white border border-border-tan rounded-sm shadow-xl p-8 max-w-sm w-full relative z-10 space-y-5">
            <h3 class="text-xl font-bold font-serif text-charcoal">Confirm Delete</h3>
            <p class="text-sm text-slate-brown leading-relaxed">
                Are you sure you want to delete this record from <span class="font-bold text-charcoal">{entityType}</span>?
            </p>
            <p class="text-xs font-bold text-error uppercase tracking-wider">
                This action cannot be undone and will delete the record permanently.
            </p>
            <div class="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onclick={cancelDelete}>Cancel</Button>
                <Button variant="danger" onclick={confirmDelete} loading={processingDelete}>Delete</Button>
            </div>
        </div>
    </div>
{/if}