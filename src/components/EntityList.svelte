<script lang="ts">
    import { goto } from '$app/navigation';
    import EntityForm from './EntityForm.svelte';
    import { 
        Card, 
        CardHeader, 
        CardTitle, 
        CardContent,
        Table, 
        TableHeader, 
        TableBody, 
        TableRow, 
        TableCell, 
        TableHead, 
        TablePagination, 
        TableEmpty, 
        TableLoading,
        Button 
    } from '$lib/components';
    import type { FormFieldSchema } from '$lib/entities';

    // Svelte 5 bindable props using runes
    interface Props {
        title: string;
        items?: any[];
        loading?: boolean;
        basePath?: string;
        displayProperty?: string;
        emptyMessage?: string;
        showAddButton?: boolean;
        detailed?: boolean;
        schema?: FormFieldSchema[];
    }

    let {
        title,
        items = $bindable([]),
        loading = false,
        basePath = '',
        displayProperty = 'name',
        emptyMessage = 'No items available',
        showAddButton = true,
        detailed = $bindable(false),
        schema = []
    }: Props = $props();

    let entityForm: EntityForm;

    // Local pagination state
    let page = $state(1);
    let pageSize = $state(10);

    // Delete confirmation state
    let showDeleteConfirm = $state(false);
    let itemToDelete = $state<any>(null);

    // Get entity type from basePath
    const entityType = $derived(basePath.split('/').filter(p => p).pop() || '');

    // Visible fields based on details toggle
    const visibleFields = $derived(schema.filter(field => {
        if (!detailed) {
            // Basic view: show displayProperty and non-relationship required fields
            return field.name === displayProperty || (field.type !== 'entity-select' && field.required);
        }
        return true; // Detailed view: show all fields in the schema
    }));

    // Paginated subset of items
    const paginatedItems = $derived(items.slice((page - 1) * pageSize, page * pageSize));

    // Navigation function to view entity details
    function viewDetails(id: string) {
        goto(`${basePath}/${id}`);
    }

    // Open form for adding a new entity
    function handleAddNew() {
        if (entityForm) {
            entityForm.openForm({}, false);
        }
    }

    // Open form for editing an existing entity
    function handleEditItem(item: any) {
        // Format date values for the form (YYYY-MM-DD)
        const formattedItem = Object.keys(item).reduce((acc: Record<string, any>, key: string) => {
            const value = item[key];
            if (value && typeof value === 'string' && !isNaN(Date.parse(value))) {
                acc[key] = value.slice(0, 10); // Extract only the date (YYYY-MM-DD)
            } else {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, any>);

        if (entityForm) {
            entityForm.openForm(formattedItem, true);
        }
    }

    // Show delete confirmation dialog
    function handleDeleteItem(item: any) {
        itemToDelete = item;
        showDeleteConfirm = true;
    }

    async function confirmDelete() {
        if (!itemToDelete) return;

        try {
            const response = await fetch(`/api${basePath}/${itemToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Refresh the data
                await fetchItems();
                // Close confirmation dialog
                showDeleteConfirm = false;
                itemToDelete = null;
            } else {
                let errorMessage = 'Unknown error occurred';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    errorMessage = response.statusText || errorMessage;
                }
                alert(`Error: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('An unexpected error occurred');
        }
    }

    function cancelDelete() {
        showDeleteConfirm = false;
        itemToDelete = null;
    }

    async function handleFormSubmit() {
        // Refresh data after successful form submission
        await fetchItems();
    }

    function handleFormError(event: any) {
        const msg = event?.detail?.message || event?.message || 'Form submission failed';
        alert(msg);
    }

    async function fetchItems() {
        try {
            loading = true;
            const response = await fetch(`/api${basePath}`);
            if (response.ok) {
                items = await response.json();
            } else {
                console.error(`Failed to fetch ${entityType}`);
            }
        } catch (error) {
            console.error(`Error fetching ${entityType}:`, error);
        } finally {
            loading = false;
        }
    }

    // Dynamic relational field and generic formatting
    function getFieldValue(item: any, field: FormFieldSchema) {
        if (!item) return '';

        if (field.type === 'entity-select' && field.entityType) {
            // Map plural entityType to singular relation key (e.g. 'buildings' -> 'building')
            const relationKey = field.entityType.endsWith('ies') 
                ? field.entityType.slice(0, -3) + 'y' 
                : field.entityType.endsWith('s') 
                    ? field.entityType.slice(0, -1) 
                    : field.entityType;

            const relatedObj = item[relationKey];
            if (relatedObj) {
                return relatedObj[field.displayProperty || 'name'] || item[field.name] || '';
            }
            return item[field.name] || '';
        }

        const value = item[field.name];
        if (value === null || value === undefined) return '';
        if (field.type === 'boolean') return value ? 'Yes' : 'No';
        if (field.type === 'date') {
            return new Date(value).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

        return String(value);
    }
</script>

<div class="w-full max-w-[1200px] mx-auto p-4 sm:p-6 md:p-8">
    <Card padding="none" bordered={true}>
        <CardHeader>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div>
                    <CardTitle class="text-2xl font-serif text-charcoal font-bold">{title}</CardTitle>
                </div>
                <div class="flex flex-wrap items-center gap-6">
                    <!-- Svelte 5 details switch -->
                    <div class="flex items-center gap-3">
                        <span class="text-sm font-bold text-slate-brown uppercase tracking-wider font-sans">Details</span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={detailed}
                            onclick={() => detailed = !detailed}
                            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 {detailed ? 'bg-primary' : 'bg-[#D6D4CD]'}"
                            aria-label="Toggle detailed view columns"
                        >
                            <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out {detailed ? 'translate-x-5' : 'translate-x-0'}"></span>
                        </button>
                    </div>

                    {#if showAddButton}
                        <Button variant="primary" size="sm" onclick={handleAddNew} leftIcon="add">
                            Add New
                        </Button>
                    {/if}
                </div>
            </div>
        </CardHeader>

        <CardContent>
            {#if loading}
                <div class="p-8">
                    <TableLoading rows={5} cols={visibleFields.length + ($$slots['item-content'] ? 1 : 0) + 1} />
                </div>
            {:else if items.length === 0}
                <div class="p-8">
                    <TableEmpty colspan={visibleFields.length + ($$slots['item-content'] ? 1 : 0) + 1} message={emptyMessage} />
                </div>
            {:else}
                <Table density="default" sticky={false}>
                    <TableHeader>
                        <TableRow>
                            {#each visibleFields as field}
                                <TableHead>{field.label}</TableHead>
                            {/each}
                            {#if $$slots['item-content']}
                                <TableHead>Info</TableHead>
                            {/if}
                            <TableHead class="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {#each paginatedItems as item (item.id)}
                            <!-- Triggers view details page navigation, matches original row-click -->
                            <TableRow hover={true} onclick={() => viewDetails(item.id)} class="cursor-pointer">
                                {#each visibleFields as field}
                                    <TableCell>{getFieldValue(item, field)}</TableCell>
                                {/each}
                                {#if $$slots['item-content']}
                                    <!-- Stops row click propagation to click handlers inside slot contents -->
                                    <TableCell onclick={(e: MouseEvent) => e.stopPropagation()}>
                                        <slot name="item-content" {item}></slot>
                                    </TableCell>
                                {/if}
                                <!-- Actions cell stops row click propagation -->
                                <TableCell class="text-right" onclick={(e: MouseEvent) => e.stopPropagation()}>
                                    <div class="flex justify-end items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="xs"
                                            onclick={() => handleEditItem(item)}
                                            leftIcon="edit"
                                            aria-label="Edit item"
                                        />
                                        <Button
                                            variant="danger"
                                            size="xs"
                                            onclick={() => handleDeleteItem(item)}
                                            leftIcon="delete"
                                            aria-label="Delete item"
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        {/each}
                    </TableBody>
                </Table>

                <!-- Dynamic table pagination footer -->
                <div class="px-8 pb-6">
                    <TablePagination
                        page={page}
                        pageSize={pageSize}
                        totalItems={items.length}
                        onpagechange={(p) => page = p}
                        onpagesizechange={(ps) => { pageSize = ps; page = 1; }}
                    />
                </div>
            {/if}
        </CardContent>
    </Card>
</div>

<!-- Modal Form Dialog -->
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
                Are you sure you want to delete <span class="font-bold text-charcoal">{itemToDelete?.[displayProperty]}</span>?
            </p>
            <p class="text-xs font-bold text-error uppercase tracking-wider">
                This action cannot be undone.
            </p>
            <div class="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onclick={cancelDelete}>Cancel</Button>
                <Button variant="danger" onclick={confirmDelete}>Delete</Button>
            </div>
        </div>
    </div>
{/if}