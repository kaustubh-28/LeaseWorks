<script lang="ts">
    import type { PageData } from './$types';
    import { invalidateAll } from '$app/navigation';

    export let data: PageData;

    $: tenant = data.tenant;
    $: lease = data.lease;
    $: payments = data.payments || [];
    $: maintenanceRequests = data.maintenanceRequests || [];

    // Find latest rent payment
    $: rentPayment = payments.find((p: any) => p.type === 'REGULAR_RENT');
    $: isRentPaid = rentPayment ? rentPayment.status === 'paid' : true;
    $: rentAmount = rentPayment ? rentPayment.amount : (lease ? lease.rentAmount : 0);
    $: rentDueDate = rentPayment ? new Date(rentPayment.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

    let showPaymentModal = false;
    let paymentProcessing = false;
    let paymentSuccess = false;

    async function handleConfirmPayment() {
        if (!rentPayment) return;
        paymentProcessing = true;
        
        try {
            const response = await fetch(`/api/payments/${rentPayment.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'paid' })
            });

            if (response.ok) {
                paymentSuccess = true;
            } else {
                const err = await response.json();
                alert(err.message || 'Payment processing failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('An unexpected error occurred during payment.');
        } finally {
            paymentProcessing = false;
        }
    }

    async function handleCloseSuccessModal() {
        showPaymentModal = false;
        paymentSuccess = false;
        await invalidateAll(); // Refresh page details
    }
</script>

<div class="space-y-8">
    <!-- Rent Status Banner -->
    {#if !isRentPaid && rentPayment}
        <section class="w-full bg-secondary/10 border-l-4 border-secondary rounded-sm flex flex-col md:flex-row items-center justify-between px-6 py-8 min-h-[120px] shadow-sm relative overflow-hidden">
            <div class="absolute right-[-20px] top-[-20px] opacity-10 text-secondary">
                <span class="material-symbols-outlined text-[120px]">error</span>
            </div>
            <div class="relative z-10 mb-6 md:mb-0">
                <h1 class="text-2xl md:text-3xl font-bold text-secondary mb-2 font-serif">
                    Rent Due: ${rentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h1>
                <p class="text-[16px] sm:text-[18px] text-charcoal font-medium">Payment is required by {rentDueDate}.</p>
            </div>
            <div class="relative z-10 w-full md:w-auto">
                <button 
                    class="w-full md:w-auto flex items-center justify-center gap-2 px-8 h-14 bg-secondary hover:bg-[#5d4200] text-white text-[18px] font-bold rounded-sm tracking-[0.02em] transition-colors shadow-md border-none cursor-pointer"
                    on:click={() => showPaymentModal = true}
                >
                    <span class="material-symbols-outlined">payments</span>
                    Pay Rent Now
                </button>
            </div>
        </section>
    {:else}
        <section class="w-full bg-primary/10 border-l-4 border-primary rounded-sm flex flex-col md:flex-row items-center justify-between px-6 py-8 min-h-[120px] shadow-sm relative overflow-hidden transition-all duration-500">
            <div class="absolute right-[-20px] top-[-20px] opacity-10 text-primary">
                <span class="material-symbols-outlined text-[120px]">check_circle</span>
            </div>
            <div class="relative z-10 mb-6 md:mb-0">
                <h1 class="text-2xl md:text-3xl font-bold text-primary mb-2 font-serif">All Caught Up</h1>
                <p class="text-[16px] sm:text-[18px] text-charcoal font-medium">Your rent has been paid in full.</p>
            </div>
            <div class="relative z-10">
                <button 
                    class="w-full md:w-auto px-8 h-12 bg-white text-primary border border-primary text-[16px] font-bold rounded-sm transition-colors hover:bg-primary hover:text-white cursor-pointer"
                    on:click={() => alert('Viewing rental receipts')}
                >
                    View Receipt
                </button>
            </div>
        </section>
    {/if}

    <!-- Action Buttons -->
    <section class="flex flex-col sm:flex-row gap-4 w-full">
        <button 
            class="btn-secondary flex-1"
            on:click={() => alert(`Active Lease Agreement:\nStart: ${new Date(lease?.startDate).toLocaleDateString()}\nRent: $${lease?.rentAmount}`)}
        >
            <span class="material-symbols-outlined">description</span>
            View Lease Agreement
        </button>
        <a 
            class="btn-primary flex-1"
            href="/tenant/maintenance/new"
        >
            <span class="material-symbols-outlined">construction</span>
            Report Maintenance Issue
        </a>
    </section>

    <!-- Lease Information Card -->
    {#if lease}
        <section class="card">
            <div class="card-header">
                <h2 class="section-heading flex items-center gap-2">
                    <span class="material-symbols-outlined">home</span>
                    Lease Information
                </h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="flex flex-col gap-4">
                    <div>
                        <span class="text-[13px] text-slate-brown uppercase tracking-wider font-semibold block mb-1">Property Address</span>
                        <p class="text-[16px] sm:text-[18px] text-charcoal">
                            {lease.apartment.building.name}, Apt {lease.apartment.name}<br/>
                            {lease.apartment.building.address.street} {lease.apartment.building.address.houseNumber}<br/>
                            {lease.apartment.building.address.city}, {lease.apartment.building.address.postalCode}
                        </p>
                    </div>
                    <div>
                        <span class="text-[13px] text-slate-brown uppercase tracking-wider font-semibold block mb-1">Lease Term</span>
                        <p class="text-[16px] sm:text-[18px] text-charcoal">
                            {new Date(lease.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – 
                            {lease.endDate ? new Date(lease.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Ongoing'}
                        </p>
                    </div>
                </div>
                <div class="flex flex-col gap-4">
                    <div>
                        <span class="text-[13px] text-slate-brown uppercase tracking-wider font-semibold block mb-1">Landlord Contact</span>
                        <p class="text-[16px] sm:text-[18px] text-charcoal font-semibold">{lease.apartment.building.user.name}</p>
                        <p class="text-[16px] sm:text-[18px] text-charcoal">{lease.apartment.building.user.email}</p>
                        <p class="text-[16px] sm:text-[18px] text-charcoal">(555) 019-2834</p>
                    </div>
                </div>
            </div>
        </section>
    {:else}
        <section class="card text-center py-10 text-slate-brown italic">
            No active lease details found.
        </section>
    {/if}

    <!-- Maintenance Requests Table -->
    <section class="card !p-0 overflow-hidden">
        <div class="px-8 py-6 border-b border-border-tan bg-white">
            <h2 class="section-heading flex items-center gap-2">
                <span class="material-symbols-outlined">history</span>
                Recent Maintenance Requests
            </h2>
        </div>
        <div class="overflow-x-auto">
            <table class="table-ledger">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Issue Description</th>
                        <th>Urgency</th>
                        <th class="text-right">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {#if maintenanceRequests.length > 0}
                        {#each maintenanceRequests as req}
                            <tr>
                                <td class="text-sm text-slate-brown">
                                    {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td>
                                    <div class="font-bold text-charcoal">{req.title}</div>
                                    <div class="text-xs text-slate-brown font-light truncate max-w-[300px]">{req.description}</div>
                                </td>
                                <td>
                                    <span class="uppercase tracking-wide font-bold text-[12px] 
                                        {req.urgency === 'HIGH' || req.urgency === 'EMERGENCY' ? 'text-error' : ''}
                                        {req.urgency === 'MEDIUM' ? 'text-secondary' : ''}
                                        {req.urgency === 'LOW' ? 'text-slate-brown' : ''}
                                    ">
                                        {req.urgency}
                                    </span>
                                </td>
                                <td class="text-right">
                                    {#if req.status === 'RESOLVED'}
                                        <span class="badge-success">
                                            <span class="material-symbols-outlined text-[15px] mr-1" style="font-variation-settings: 'FILL' 1;">check_circle</span> 
                                            Resolved
                                        </span>
                                    {:else if req.status === 'PENDING'}
                                        <span class="badge-warning">
                                            <span class="material-symbols-outlined text-[15px] mr-1" style="font-variation-settings: 'FILL' 1;">schedule</span> 
                                            Pending
                                        </span>
                                    {:else}
                                        <span class="badge-warning">
                                            <span class="material-symbols-outlined text-[15px] mr-1" style="font-variation-settings: 'FILL' 1;">sync</span> 
                                            In Progress
                                        </span>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    {:else}
                        <tr>
                            <td colspan="4" class="py-8 px-2 text-center text-slate-brown italic">
                                No maintenance history.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </section>
</div>

<!-- Payment Modal -->
{#if showPaymentModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <button class="absolute inset-0 bg-charcoal/60 w-full h-full border-none outline-none cursor-default" on:click={() => showPaymentModal = false}></button>
        
        <!-- Modal Content -->
        <div class="modal-content text-left">
            {#if !paymentSuccess}
                <div>
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-2xl font-bold text-primary font-serif flex items-center gap-2">
                            <span class="material-symbols-outlined text-2xl font-bold">account_balance_wallet</span>
                            Make Payment
                        </h3>
                        <button class="text-slate-brown hover:text-charcoal transition-colors bg-transparent border-none p-0" on:click={() => showPaymentModal = false}>
                            <span class="material-symbols-outlined text-2xl">close</span>
                        </button>
                    </div>

                    <div class="mb-8 p-4 bg-parchment border border-border-tan rounded-sm flex justify-between items-center">
                        <span class="text-[18px] text-charcoal font-medium">Amount Due:</span>
                        <span class="text-2xl font-bold text-charcoal">${rentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col gap-2">
                            <label class="text-[13px] font-bold text-slate-brown uppercase tracking-wider" for="payment-method">
                                Payment Method
                            </label>
                            <div class="relative">
                                <select 
                                    id="payment-method"
                                    class="select pr-10 appearance-none"
                                >
                                    <option>Bank Account ending in ••••4582</option>
                                    <option>Add New Bank Account</option>
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-brown">
                                    <span class="material-symbols-outlined text-lg">expand_more</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            class="btn-primary w-full"
                            on:click={handleConfirmPayment}
                            disabled={paymentProcessing}
                        >
                            {#if paymentProcessing}
                                <span class="material-symbols-outlined animate-spin text-[20px]">sync</span>
                                Processing...
                            {:else}
                                Confirm Payment of ${rentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            {/if}
                        </button>
                    </div>
                </div>
            {:else}
                <div class="flex flex-col items-center justify-center text-center py-6">
                    <div class="size-20 rounded-full bg-status-green-bg text-status-green-text flex items-center justify-center mb-6 border border-status-green-text/20">
                        <span class="material-symbols-outlined text-5xl">check</span>
                    </div>
                    <h3 class="text-2xl font-bold text-charcoal mb-2 font-serif">Payment Successful</h3>
                    <p class="text-[16px] sm:text-[18px] text-slate-brown mb-8">Your rent payment has been processed successfully.</p>
                    <button 
                        class="btn-secondary w-full"
                        on:click={handleCloseSuccessModal}
                    >
                        Return to Dashboard
                    </button>
                </div>
            {/if}
        </div>
    </div>
{/if}
