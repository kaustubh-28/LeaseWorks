<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { FormFieldSchema } from '$lib/entities';
    import { Button } from '$lib/components';

    const dispatch = createEventDispatcher();

    // Svelte 5 props definition
    interface Props {
        entityType: string;
        schema?: FormFieldSchema[];
        initialData?: any;
        isOpen?: boolean;
        isEditing?: boolean;
        apiBasePath?: string;
        onsubmit?: (eventData: any) => void;
        onerror?: (errorData: any) => void;
        onclose?: () => void;
    }

    let {
        entityType,
        schema = [],
        initialData = {},
        isOpen = $bindable(false),
        isEditing = $bindable(false),
        apiBasePath = '',
        onsubmit,
        onerror,
        onclose
    }: Props = $props();

    // Svelte 5 state variables
    let formData = $state<any>({});
    let validationErrors = $state<Record<string, string>>({});
    let errorMessage = $state<string | null>(null);
    let processing = $state(false);
    let relatedEntities = $state<Record<string, any[]>>({});

    // Fetch related entities and initialize values when form opens
    $effect(() => {
        if (isOpen) {
            errorMessage = null;
            validationErrors = {};
            formData = { ...initialData };
            
            // Set defaults for any missing fields in schema
            schema.forEach(field => {
                if (formData[field.name] === undefined) {
                    if (field.defaultValue !== undefined) {
                        formData[field.name] = field.defaultValue;
                    } else {
                        formData[field.name] = field.type === 'boolean' ? false : '';
                    }
                }
            });

            loadRelatedEntities();
        }
    });

    // --- Public API Functions (exported for parent components) ---

    export function openForm(data: any = {}, editing: boolean = false) {
        formData = { ...data };
        isEditing = editing;
        isOpen = true;
        errorMessage = null;
        validationErrors = {};
    }

    export function closeForm() {
        closePopup();
    }

    export async function submitForm(): Promise<boolean> {
        if (!validateForm()) {
            return false;
        }
        return await saveEntity();
    }

    // --- Core Form Operations ---

    function getApiEndpoint() {
        const basePath = apiBasePath || `/api/${entityType}`;
        return isEditing && formData.id ? `${basePath}/${formData.id}` : basePath;
    }

    async function loadRelatedEntities() {
        const entityTypes = new Set<string>();

        schema.forEach(field => {
            if (field.type === 'entity-select' && field.entityType) {
                entityTypes.add(field.entityType);
            }
        });

        for (const targetType of entityTypes) {
            try {
                const response = await fetch(`/api/${targetType}`);
                if (response.ok) {
                    relatedEntities[targetType] = await response.json();
                } else {
                    console.error(`Failed to fetch related ${targetType}`);
                }
            } catch (error) {
                console.error(`Error fetching related ${targetType}:`, error);
            }
        }
    }

    function closePopup() {
        formData = {};
        validationErrors = {};
        errorMessage = null;
        isOpen = false;
        dispatch('close');
        onclose?.();
    }

    async function saveEntity(): Promise<boolean> {
        try {
            processing = true;
            errorMessage = null;
            const endpoint = getApiEndpoint();
            
            // Use PUT for editing details, POST for creating new rows
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const responseData = await response.json();
                const eventPayload = {
                    data: responseData || formData,
                    isEditing,
                    success: true
                };
                dispatch('submit', eventPayload);
                onsubmit?.(eventPayload);
                return true;
            } else {
                let message = 'Unknown error occurred';
                try {
                    const errorData = await response.json();
                    message = errorData.message || errorData.error || message;
                } catch (jsonError) {
                    message = response.statusText || message;
                }
                errorMessage = message;
                dispatch('error', { message });
                onerror?.({ message });
                return false;
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
            errorMessage = message;
            dispatch('error', { message });
            onerror?.({ message });
            return false;
        } finally {
            processing = false;
        }
    }

    async function handleSubmit() {
        if (!validateForm()) {
            return;
        }

        const success = await saveEntity();
        if (success) {
            closePopup();
        }
    }

    // --- Dynamic Schema Validation ---

    function validateField(fieldName: string, field: FormFieldSchema): string | null {
        const value = formData[fieldName];

        if (field.required && (value === undefined || value === '' || value === null)) {
            return `${field.label} is required`;
        }

        if (field.type === 'number' && value !== '' && value !== null && isNaN(Number(value))) {
            return `${field.label} must be a number`;
        }

        if (field.mutuallyExclusiveWith && field.mutuallyExclusiveWith.length > 0) {
            const hasValue = [field.name, ...field.mutuallyExclusiveWith].some(
                name => formData[name] !== undefined && formData[name] !== '' && formData[name] !== null
            );

            if (!hasValue) {
                return `Either ${field.label} or one of its related fields must be provided`;
            }
        }

        return null;
    }

    function validateForm(): boolean {
        validationErrors = {};
        let isValid = true;

        schema.forEach(field => {
            const error = validateField(field.name, field);
            if (error) {
                validationErrors[field.name] = error;
                isValid = false;
            }
        });

        // Mutually exclusive checking
        const mutualGroups = getMutuallyExclusiveGroups();
        for (const group of mutualGroups) {
            const fieldsWithValues = group.filter(
                name => formData[name] !== undefined && formData[name] !== '' && formData[name] !== null
            );

            if (group.some(name => schema.find(f => f.name === name)?.required) && fieldsWithValues.length === 0) {
                group.forEach(name => {
                    validationErrors[name] = `One of these related fields must be provided`;
                });
                isValid = false;
            }
        }

        return isValid;
    }

    function getMutuallyExclusiveGroups(): string[][] {
        const groups: string[][] = [];
        const processedFields = new Set<string>();

        schema.forEach(field => {
            if (field.mutuallyExclusiveWith && !processedFields.has(field.name)) {
                const group = [field.name, ...field.mutuallyExclusiveWith];
                groups.push(group);
                group.forEach(name => processedFields.add(name));
            }
        });

        return groups;
    }

    function handleMutualExclusion(fieldName: string, value: any) {
        const field = schema.find(f => f.name === fieldName);
        if (field?.mutuallyExclusiveWith && value) {
            field.mutuallyExclusiveWith.forEach(exclusiveField => {
                formData[exclusiveField] = '';
            });
        }
    }

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            closePopup();
        }
    }
</script>

{#if isOpen}
    <!-- Overlay backdrop -->
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs overflow-y-auto"
        onclick={handleBackdropClick}
        role="presentation"
    >
        <!-- Modal Card Content -->
        <div 
            class="bg-white border border-border-tan rounded-sm shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col relative z-10"
            onclick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
        >
            <!-- Modal Header -->
            <div class="px-8 py-5 border-b border-border-tan bg-[#FAF9F6] flex justify-between items-center rounded-t-sm">
                <h2 class="text-xl font-serif font-bold text-charcoal">
                    {isEditing ? `Edit ${entityType}` : `New ${entityType}`}
                </h2>
                <button 
                    class="text-slate-brown hover:text-charcoal transition-colors bg-transparent border-none p-0 flex items-center justify-center cursor-pointer" 
                    onclick={closePopup}
                    aria-label="Close form"
                >
                    <span class="material-symbols-outlined text-[24px]">close</span>
                </button>
            </div>

            <!-- Validation Error Alert Banner -->
            {#if errorMessage}
                <div class="mx-8 mt-6 p-4 bg-status-error-bg/20 border border-status-error-text/20 rounded-sm text-status-error-text text-sm font-semibold flex items-center gap-2">
                    <span class="material-symbols-outlined text-[20px]">error</span>
                    <span>{errorMessage}</span>
                </div>
            {/if}

            <!-- Dynamic Input Form Body -->
            <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="p-8 space-y-6 overflow-y-auto flex-1 font-sans text-[16px]">
                {#each schema as field}
                    <div class="flex flex-col gap-1.5 text-left">
                        <label for={field.name} class="text-xs uppercase font-bold tracking-wider text-slate-brown flex items-center gap-1">
                            {field.label}
                            {#if field.required}
                                <span class="text-error font-bold">*</span>
                            {/if}
                        </label>

                        {#if field.type === 'entity-select'}
                            <div class="relative">
                                <select
                                    id={field.name}
                                    bind:value={formData[field.name]}
                                    required={field.required}
                                    onchange={() => handleMutualExclusion(field.name, formData[field.name])}
                                    class="select pr-10 appearance-none {validationErrors[field.name] ? 'border-error ring-1 ring-error' : ''}"
                                    disabled={field.mutuallyExclusiveWith && field.mutuallyExclusiveWith.some(exField => formData[exField])}
                                >
                                    <option value="">- No {field.label} Selected -</option>
                                    {#if field.entityType && relatedEntities[field.entityType]}
                                        {#each relatedEntities[field.entityType] as related}
                                            <option value={related.id}>
                                                {field.displayProperty ? related[field.displayProperty] : related.id}
                                            </option>
                                        {/each}
                                    {/if}
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-brown">
                                    <span class="material-symbols-outlined text-lg">expand_more</span>
                                </div>
                            </div>
                        {:else if field.type === 'select' && field.options}
                            <div class="relative">
                                <select
                                    id={field.name}
                                    bind:value={formData[field.name]}
                                    required={field.required}
                                    class="select pr-10 appearance-none {validationErrors[field.name] ? 'border-error ring-1 ring-error' : ''}"
                                >
                                    <option value="">- Select {field.label} -</option>
                                    {#each field.options as option}
                                        <option value={option}>{option}</option>
                                    {/each}
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-brown">
                                    <span class="material-symbols-outlined text-lg">expand_more</span>
                                </div>
                            </div>
                        {:else if field.type === 'date'}
                            <input
                                type="date"
                                id={field.name}
                                bind:value={formData[field.name]}
                                required={field.required}
                                class="input {validationErrors[field.name] ? 'border-error ring-1 ring-error' : ''}"
                            />
                        {:else if field.type === 'boolean'}
                            <div class="flex items-center h-12">
                                <input
                                    type="checkbox"
                                    id={field.name}
                                    bind:checked={formData[field.name]}
                                    class="size-5 border border-border-tan rounded-sm accent-primary bg-white text-primary cursor-pointer"
                                />
                            </div>
                        {:else}
                            <input
                                type={field.type}
                                id={field.name}
                                bind:value={formData[field.name]}
                                required={field.required}
                                class="input {validationErrors[field.name] ? 'border-error ring-1 ring-error' : ''}"
                                step={field.type === 'number' ? (field.step || '1') : undefined}
                                placeholder="Enter {field.label.toLowerCase()}..."
                            />
                        {/if}

                        {#if validationErrors[field.name]}
                            <span class="text-error text-xs font-semibold mt-1 flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">warning</span>
                                {validationErrors[field.name]}
                            </span>
                        {/if}
                    </div>
                {/each}

                <!-- Form Bottom Action buttons using Button component -->
                <div class="flex justify-end gap-3 pt-6 border-t border-border-tan/50">
                    <Button variant="secondary" onclick={closePopup}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" loading={processing}>
                        {isEditing ? 'Update' : 'Create'} {entityType}
                    </Button>
                </div>
            </form>
        </div>
    </div>
{/if}