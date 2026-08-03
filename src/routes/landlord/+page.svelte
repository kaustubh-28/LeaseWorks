<script lang="ts">
    import type { PageData } from './$types';
    import { invalidateAll } from '$app/navigation';

    export let data: PageData;

    $: stats = data.stats;
    $: apartments = data.apartments || [];

    let searchQuery = '';
    let selectedUrgentAlert: any = null;

    // Filtered apartments list
    $: filteredApartments = apartments.filter(apt => {
        const addressText = `${apt.building.name} ${apt.name} ${apt.building.address.street}`.toLowerCase();
        const tenantText = apt.leases[0]?.tenant ? `${apt.leases[0].tenant.firstName} ${apt.leases[0].tenant.name}`.toLowerCase() : 'vacant';
        const query = searchQuery.toLowerCase();
        return addressText.includes(query) || tenantText.includes(query);
    });

    function getTenantName(apt: any) {
        const activeLease = apt.leases[0];
        if (!activeLease || !activeLease.tenant) return 'Vacant';
        return `${activeLease.tenant.firstName} ${activeLease.tenant.name}`;
    }

    function getLatestPaymentStatus(apt: any) {
        const activeLease = apt.leases[0];
        if (!activeLease) return 'vacant';
        const payments = activeLease.payments || [];
        if (payments.length === 0) return 'pending';
        // Sort payments by due date descending
        const sorted = [...payments].sort((a: any, b: any) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        return sorted[0].status; // paid, pending, overdue
    }

    async function handleResolveAlert(id: string) {
        try {
            const response = await fetch(`/api/maintenance/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'RESOLVED' })
            });

            if (response.ok) {
                selectedUrgentAlert = null;
                // Re-fetch loaders
                await invalidateAll();
            } else {
                const err = await response.json();
                alert(err.message || 'Failed to resolve request');
            }
        } catch (error) {
            console.error('Error resolving request:', error);
            alert('An unexpected error occurred');
        }
    }
</script>

<div class="space-y-10">
    <!-- Dashboard Header -->
    <header class="flex items-center justify-between">
        <h2 class="text-[32px] font-serif font-bold text-charcoal tracking-tight">Dashboard</h2>
        <button class="btn-primary !h-12 !px-5 !text-[15px]" on:click={() => alert('Add Property feature can be set up in Database Seeding.')}>
            <span class="material-symbols-outlined text-[20px]">add</span>
            Add Property
        </button>
    </header>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Urgent Alerts Card -->
        <div class="card !border-2 !border-secondary/20 hover:!border-secondary/40 transition-all relative overflow-hidden group">
            <div class="flex items-center gap-3 text-secondary">
                <span class="material-symbols-outlined font-bold" style="font-variation-settings: 'FILL' 1;">warning</span>
                <h3 class="text-[18px] font-semibold">Urgent Alerts</h3>
            </div>
            
            {#if stats.urgentAlerts && stats.urgentAlerts.length > 0}
                {@const alertItem = stats.urgentAlerts[0]}
                <div class="bg-secondary/5 p-4 rounded-sm border border-secondary/10">
                    <p class="font-bold text-charcoal mb-1">{alertItem.title}</p>
                    <p class="text-[14px] text-slate-brown">
                        {alertItem.apartment.building.name} - Apt {alertItem.apartment.name}
                    </p>
                    <p class="text-[12px] text-slate-brown mt-1">
                        Reported by {alertItem.tenant.firstName} {alertItem.tenant.name}
                    </p>
                    <button class="mt-3 text-secondary font-semibold text-[15px] hover:underline flex items-center gap-1 bg-transparent p-0 border-none hover:bg-transparent" on:click={() => selectedUrgentAlert = alertItem}>
                        View Request <span class="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            {:else}
                <div class="bg-[#FAF9F6] p-4 rounded-sm border border-border-tan text-center py-6 text-sm text-slate-brown">
                    No urgent alerts at this time.
                </div>
            {/if}
        </div>

        <!-- Total Revenue Card -->
        <div class="card hover:!border-primary transition-all group">
            <div class="flex justify-between items-start w-full mb-3">
                <p class="text-[18px] text-slate-brown font-semibold group-hover:text-primary transition-colors">Total Revenue</p>
                <span class="material-symbols-outlined text-slate-brown group-hover:text-primary transition-colors">trending_up</span>
            </div>
            <p class="text-[36px] font-serif font-bold text-charcoal tracking-tight mb-4">
                ${stats.incoming.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div class="flex gap-4 pt-3 border-t border-border-tan/50">
                <div>
                    <p class="text-[11px] uppercase tracking-wider text-slate-brown font-bold">Income (Rent)</p>
                    <p class="text-[16px] font-bold text-primary">
                        +${stats.incoming.toLocaleString()}
                    </p>
                </div>
                <div class="border-l border-border-tan/50 pl-4">
                    <p class="text-[11px] uppercase tracking-wider text-slate-brown font-bold">Expenses</p>
                    <p class="text-[16px] font-bold text-error">
                        -${stats.outgoing.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>

        <!-- Active Requests Card -->
        <div class="card hover:!border-primary transition-all group">
            <div class="mb-4">
                <p class="text-[18px] text-slate-brown font-semibold group-hover:text-primary transition-colors">Active Requests</p>
                <p class="text-[36px] font-serif font-bold text-charcoal tracking-tight mt-1">
                    {stats.activeRequestsCount}
                </p>
            </div>
            <div class="flex items-center justify-between text-primary font-bold text-[15px] pt-3 border-t border-border-tan/50">
                <span>Pending Repairs</span>
                <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
        </div>
    </div>

    <!-- Property Portfolio Table Section -->
    <section class="card !p-0 overflow-hidden">
        <div class="px-8 py-6 border-b border-border-tan bg-white flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
            <h3 class="section-heading">Property Portfolio</h3>
            <div class="flex items-center gap-3 w-full sm:w-auto">
                <div class="relative flex-1 sm:flex-none">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-brown text-[20px]">search</span>
                    <input class="pl-10 pr-4 input !h-10 !text-[15px] w-full sm:w-64 bg-[#f6f8f7] transition-all placeholder:text-slate-brown" placeholder="Search properties..." type="text" bind:value={searchQuery}/>
                </div>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="table-ledger">
                <thead>
                    <tr>
                        <th class="w-[40%]">Address / Unit</th>
                        <th class="w-[25%]">Current Tenant</th>
                        <th class="w-[20%]">Rent Status</th>
                        <th class="w-[15%] text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {#if filteredApartments.length > 0}
                        {#each filteredApartments as apt}
                            <tr>
                                <td>
                                    <div class="font-semibold text-charcoal">{apt.building.name}</div>
                                    <div class="text-sm text-slate-brown font-light">
                                        {apt.name} - {apt.building.address.street} {apt.building.address.houseNumber}
                                    </div>
                                </td>
                                <td>
                                    {#if getTenantName(apt) === 'Vacant'}
                                        <span class="italic text-gray-400">Vacant</span>
                                    {:else}
                                        <span>{getTenantName(apt)}</span>
                                    {/if}
                                </td>
                                <td>
                                    {#if getLatestPaymentStatus(apt) === 'paid'}
                                        <span class="badge-success">
                                            <span class="material-symbols-outlined text-[16px] mr-1" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                                            Paid
                                        </span>
                                    {:else if getLatestPaymentStatus(apt) === 'pending'}
                                        <span class="badge-warning">
                                            <span class="material-symbols-outlined text-[16px] mr-1" style="font-variation-settings: 'FILL' 1;">schedule</span>
                                            Pending
                                        </span>
                                    {:else if getLatestPaymentStatus(apt) === 'overdue'}
                                        <span class="badge-error">
                                            <span class="material-symbols-outlined text-[16px] mr-1" style="font-variation-settings: 'FILL' 1;">error</span>
                                            Late
                                        </span>
                                    {:else}
                                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[14px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                                            N/A
                                        </span>
                                    {/if}
                                </td>
                                <td class="text-right">
                                    <button class="text-primary font-bold text-[14px] hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded bg-transparent p-0 hover:bg-transparent" on:click={() => alert(`Details for ${apt.name} are loaded in DB.`)}>
                                        View / Edit
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    {:else}
                        <tr>
                            <td colspan="4" class="px-8 py-10 text-center text-slate-brown italic bg-white">
                                No properties match your search.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </section>
</div>

<!-- Urgent Alert Modal -->
{#if selectedUrgentAlert}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <button class="absolute inset-0 bg-charcoal/60 transition-opacity cursor-default w-full h-full border-none outline-none" on:click={() => selectedUrgentAlert = null}></button>
        <!-- Modal Content -->
        <div class="modal-content text-left">
            <div class="flex justify-between items-start mb-6">
                <h3 class="text-2xl font-bold font-serif text-secondary flex items-center gap-2">
                    <span class="material-symbols-outlined text-2xl font-bold" style="font-variation-settings: 'FILL' 1;">warning</span>
                    Urgent Alert Details
                </h3>
                <button class="text-slate-brown hover:text-charcoal transition-colors bg-transparent border-none p-0" on:click={() => selectedUrgentAlert = null}>
                    <span class="material-symbols-outlined text-2xl">close</span>
                </button>
            </div>
            
            <div class="space-y-4 mb-8">
                <div>
                    <span class="text-xs font-bold uppercase text-slate-brown tracking-wider block mb-1">Issue Title</span>
                    <p class="text-lg font-bold text-charcoal">{selectedUrgentAlert.title}</p>
                </div>
                <div>
                    <span class="text-xs font-bold uppercase text-slate-brown tracking-wider block mb-1">Location</span>
                    <p class="text-[16px]">
                        {selectedUrgentAlert.apartment.building.name} - Apt {selectedUrgentAlert.apartment.name}<br/>
                        {selectedUrgentAlert.apartment.building.address.street} {selectedUrgentAlert.apartment.building.address.houseNumber}
                    </p>
                </div>
                <div>
                    <span class="text-xs font-bold uppercase text-slate-brown tracking-wider block mb-1">Reported By</span>
                    <p class="text-[16px] font-semibold">{selectedUrgentAlert.tenant.firstName} {selectedUrgentAlert.tenant.name}</p>
                    <p class="text-sm text-slate-brown">{selectedUrgentAlert.tenant.email} | {selectedUrgentAlert.tenant.phoneNumber}</p>
                </div>
                <div>
                    <span class="text-xs font-bold uppercase text-slate-brown tracking-wider block mb-1">Description</span>
                    <p class="text-sm bg-parchment border border-border-tan/50 p-4 rounded-sm text-charcoal leading-relaxed">
                        {selectedUrgentAlert.description}
                    </p>
                </div>
            </div>

            <div class="flex gap-4">
                <button class="btn-secondary flex-1 !h-12" on:click={() => selectedUrgentAlert = null}>
                    Close
                </button>
                <button class="btn-primary flex-1 !h-12" on:click={() => handleResolveAlert(selectedUrgentAlert.id)}>
                    <span class="material-symbols-outlined text-[20px]">check_circle</span>
                    Resolve Issue
                </button>
            </div>
        </div>
    </div>
{/if}
