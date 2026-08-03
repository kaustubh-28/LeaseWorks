<script lang="ts">
    import { goto } from '$app/navigation';

    let title = '';
    let category = '';
    let urgency = 'LOW';
    let description = '';
    let files: File[] = [];
    let dragOver = false;
    let loading = false;
    let showSuccessModal = false;
    let generatedTicketNum = '';

    function handleFileDrop(e: DragEvent) {
        dragOver = false;
        if (e.dataTransfer && e.dataTransfer.files) {
            files = [...files, ...Array.from(e.dataTransfer.files)];
        }
    }

    function handleFileSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files) {
            files = [...files, ...Array.from(input.files)];
        }
    }

    async function handleSubmit() {
        loading = true;
        
        try {
            const response = await fetch('/api/maintenance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    category,
                    urgency,
                    description
                })
            });

            if (response.ok) {
                const data = await response.json();
                generatedTicketNum = `TKT-${data.id.slice(0, 8).toUpperCase()}`;
                showSuccessModal = true;
                
                // Reset form fields
                title = '';
                category = '';
                urgency = 'LOW';
                description = '';
                files = [];
            } else {
                const err = await response.json();
                alert(err.message || 'Failed to submit request');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('An unexpected error occurred');
        } finally {
            loading = false;
        }
    }

    function handleReturn() {
        showSuccessModal = false;
        goto('/tenant');
    }
</script>

<div class="content-container py-6">
    <!-- Back Link -->
    <div class="mb-8">
        <a class="inline-flex items-center text-primary font-semibold text-sm hover:underline gap-2 mb-4 group transition-all" href="/tenant">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Dashboard
        </a>
        <h1 class="font-serif text-3xl font-bold text-charcoal">Report Maintenance Issue</h1>
        <p class="text-slate-brown mt-2 text-sm leading-relaxed">
            Please provide detailed information about the issue to help our team address it promptly.
        </p>
    </div>

    <!-- Info Banner -->
    <div class="alert alert-success p-4 mb-8 flex items-start gap-4">
        <span class="material-symbols-outlined text-status-green-text mt-0.5" style="font-variation-settings: 'FILL' 1;">info</span>
        <div>
            <p class="text-status-green-text font-bold text-[14px] uppercase tracking-wide">Priority Handling</p>
            <p class="text-status-green-text text-xs sm:text-sm mt-0.5">
                Emergency requests (e.g., major leaks, electrical hazards) are responded to within 4 hours.
            </p>
        </div>
    </div>

    <!-- Form Card -->
    <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
        <div class="card !p-0 overflow-hidden shadow-sm">
            <!-- Header -->
            <div class="card-header !bg-primary px-6 py-4 border-b border-border-tan mb-0 flex items-center justify-between">
                <h2 class="text-white font-bold text-lg font-serif">Issue Details</h2>
            </div>
            
            <div class="p-6 space-y-6">
                <!-- Title -->
                <div class="space-y-2">
                    <label class="block text-xs font-bold uppercase text-charcoal tracking-wider" for="issueTitle">
                        Issue Title
                    </label>
                    <input 
                        class="input" 
                        id="issueTitle" 
                        placeholder="e.g., Leaking faucet in master bathroom" 
                        required 
                        type="text"
                        bind:value={title}
                        disabled={loading}
                    />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Category -->
                    <div class="space-y-2">
                        <label class="block text-xs font-bold uppercase text-charcoal tracking-wider" for="category">
                            Category
                        </label>
                        <div class="relative">
                            <select 
                                class="select pr-10 appearance-none" 
                                id="category" 
                                required
                                bind:value={category}
                                disabled={loading}
                            >
                                <option disabled selected value="">Select a category</option>
                                <option value="plumbing">Plumbing</option>
                                <option value="electrical">Electrical</option>
                                <option value="hvac">HVAC (Heating/Cooling)</option>
                                <option value="appliances">Appliances</option>
                                <option value="structural">Structural/Interior</option>
                                <option value="pest_control">Pest Control</option>
                                <option value="other">Other</option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-brown">
                                <span class="material-symbols-outlined text-lg">expand_more</span>
                            </div>
                        </div>
                    </div>

                    <!-- Urgency -->
                    <div class="space-y-2">
                        <label class="block text-xs font-bold uppercase text-charcoal tracking-wider" for="urgency">
                            Urgency Level
                        </label>
                        <div class="relative">
                            <select 
                                class="select pr-10 appearance-none" 
                                id="urgency" 
                                required
                                bind:value={urgency}
                                disabled={loading}
                            >
                                <option value="LOW">Low (Non-urgent)</option>
                                <option value="MEDIUM">Medium (Standard Repair)</option>
                                <option value="HIGH">High (Needs immediate attention)</option>
                                <option value="EMERGENCY">Emergency (Safety/Property Hazard)</option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-brown">
                                <span class="material-symbols-outlined text-lg">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Description -->
                <div class="space-y-2">
                    <label class="block text-xs font-bold uppercase text-charcoal tracking-wider" for="description">
                        Detailed Description
                    </label>
                    <textarea 
                        class="textarea" 
                        id="description" 
                        placeholder="Please describe exactly what is happening, when it started, and any troubleshooting you've attempted..." 
                        required 
                        rows="5"
                        bind:value={description}
                        disabled={loading}
                    ></textarea>
                </div>

                <!-- Image Upload Simulator -->
                <div class="space-y-2">
                    <label class="block text-xs font-bold uppercase text-charcoal tracking-wider">
                        Documentation Photos (Optional)
                    </label>
                    <!-- Drag & Drop Area -->
                    <div 
                        class="border-2 border-dashed border-border-tan rounded-sm p-8 text-center cursor-pointer transition-colors hover:bg-gray-50 flex flex-col items-center justify-center {dragOver ? 'bg-parchment border-primary' : 'bg-parchment/50'}"
                        on:dragover|preventDefault={() => dragOver = true}
                        on:dragleave|preventDefault={() => dragOver = false}
                        on:drop|preventDefault={handleFileDrop}
                        on:click={() => document.getElementById('fileElem')?.click()}
                    >
                        <input 
                            accept="image/*" 
                            class="hidden" 
                            id="fileElem" 
                            multiple 
                            type="file" 
                            on:change={handleFileSelect}
                        />
                        <span class="material-symbols-outlined text-4xl text-slate-brown mb-2">cloud_upload</span>
                        <p class="text-[16px] text-charcoal font-semibold">Drag and drop photos here</p>
                        <p class="text-slate-brown text-xs mt-1">or click to browse your files (JPEG, PNG up to 10MB)</p>
                        
                        {#if files.length > 0}
                            <div class="flex flex-wrap justify-center gap-4 mt-6">
                                {#each files as file}
                                    <div class="relative w-20 h-20 border border-border-tan overflow-hidden rounded bg-white shadow-sm flex items-center justify-center text-[10px] text-slate-brown font-bold uppercase px-1 break-all">
                                        {file.name.slice(0, 15)}...
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        <!-- Submit Section -->
        <div class="flex flex-col sm:flex-row items-center justify-end gap-4">
            <a 
                class="btn-secondary w-full sm:w-auto" 
                href="/tenant"
            >
                Cancel
            </a>
            <button 
                class="btn-primary w-full sm:w-auto px-12" 
                type="submit"
                disabled={loading}
            >
                {#if loading}
                    <span class="material-symbols-outlined animate-spin text-[20px] mr-2">sync</span>
                    Submitting...
                {:else}
                    Submit Request
                {/if}
            </button>
        </div>
    </form>
</div>

<!-- Success Modal -->
{#if showSuccessModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-charcoal/60 backdrop-blur-xs"></div>
        <!-- Modal Content -->
        <div class="modal-content !max-w-md text-center flex flex-col items-center z-10">
            <div class="w-16 h-16 bg-status-green-bg rounded-full flex items-center justify-center mb-6 border border-status-green-text/20">
                <span class="material-symbols-outlined text-status-green-text text-3xl font-bold" style="font-variation-settings: 'FILL' 1;">check_circle</span>
            </div>
            <h3 class="font-serif text-2xl font-bold text-charcoal mb-2">Request Submitted</h3>
            <p class="text-slate-brown text-sm mb-8 leading-relaxed">
                Your maintenance request <span class="font-bold text-charcoal">{generatedTicketNum}</span> has been successfully filed. A coordinator will contact you shortly.
            </p>
            <button 
                class="btn-primary w-full" 
                on:click={handleReturn}
            >
                Return to Dashboard
            </button>
        </div>
    </div>
{/if}
