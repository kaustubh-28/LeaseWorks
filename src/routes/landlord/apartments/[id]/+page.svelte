<script lang="ts">
    import type { PageData } from './$types';
    import { Button } from '$lib/components/button';
    import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '$lib/components/table';
    import { invalidateAll } from '$app/navigation';

    export let data: PageData;

    $: apartment = data.apartment;
    $: maintenanceRequests = data.maintenanceRequests || [];

    // Extract active lease
    $: activeLease = apartment.leases?.find((l: any) => {
        const now = new Date();
        const start = new Date(l.startDate);
        const end = l.endDate ? new Date(l.endDate) : null;
        return start <= now && (!end || end >= now);
    });

    // Rent History Payments
    $: rentHistory = apartment.payments || [];

    // Upcoming bills (costs)
    $: upcomingBills = apartment.costs || [];

    // Format dates
    function formatDate(dateStr: string) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Get payment month name
    function getPaymentMonth(dateStr: string) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    }

    // Handle updating maintenance request status via select dropdown
    async function handleStatusChange(reqId: string, newStatus: string) {
        try {
            const response = await fetch(`/api/maintenance/${reqId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                await invalidateAll();
            } else {
                const err = await response.json();
                alert(err.message || 'Failed to update maintenance status');
            }
        } catch (error) {
            console.error('Error updating maintenance request:', error);
            alert('An unexpected error occurred');
        }
    }
</script>

<div class="space-y-8 max-w-[1100px] mx-auto pb-16">
    <!-- Navigation Back Link and Header actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6D4CD] pb-6">
        <div class="space-y-2">
            <a href="/landlord" class="text-primary font-bold text-[15px] hover:underline flex items-center gap-1.5 font-sans">
                <span class="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Dashboard
            </a>
            <h1 class="text-[38px] font-serif font-bold text-charcoal tracking-tight leading-tight">
                {apartment.building.name}, Apt {apartment.name}
            </h1>
            <p class="text-slate-brown text-[15px] font-sans">
                {apartment.building.address.street} {apartment.building.address.houseNumber}, {apartment.building.address.city}
            </p>
        </div>
        <div>
            <Button variant="secondary" size="sm" href="/apartments?id={apartment.id}&edit=true" class="!bg-white border-[#D6D4CD] hover:!bg-parchment">
                <span class="material-symbols-outlined text-[18px] mr-1">edit</span>
                Edit Property
            </Button>
        </div>
    </div>

    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Left Column (Rent History & Complaints) - 2/3 width -->
        <div class="lg:col-span-2 space-y-12">
            <!-- Rent History Section -->
            <section class="space-y-4">
                <h3 class="text-xl font-serif font-bold text-charcoal">Rent History</h3>
                <div class="bg-white border border-[#D6D4CD] rounded-sm overflow-hidden shadow-xs">
                    <Table>
                        <TableHeader>
                            <TableRow hover={false} class="border-b border-[#D6D4CD]">
                                <TableHead class="text-xs font-bold uppercase tracking-widest text-slate-brown py-3 px-6 border-b-0">Month</TableHead>
                                <TableHead class="text-xs font-bold uppercase tracking-widest text-slate-brown py-3 px-4 border-b-0">Amount</TableHead>
                                <TableHead class="text-xs font-bold uppercase tracking-widest text-slate-brown py-3 px-4 border-b-0">Date Paid</TableHead>
                                <TableHead class="text-xs font-bold uppercase tracking-widest text-slate-brown py-3 px-6 border-b-0 text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {#if rentHistory.length > 0}
                                {#each rentHistory as payment}
                                    <TableRow class="border-b border-[#D6D4CD]/45 hover:bg-parchment/20">
                                        <TableCell class="py-4 px-6 font-semibold text-charcoal">{getPaymentMonth(payment.dueDate)}</TableCell>
                                        <TableCell class="py-4 px-4 font-bold text-charcoal">${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell class="py-4 px-4 text-slate-brown">{payment.status === 'paid' ? formatDate(payment.updatedAt) : '-'}</TableCell>
                                        <TableCell class="py-4 px-6 text-right">
                                            {#if payment.status === 'paid'}
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold bg-[#e6f4ea] text-[#137333]">
                                                    Paid
                                                </span>
                                            {:else if payment.status === 'pending'}
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold bg-[#fef7e0] text-[#b06000]">
                                                    Pending
                                                </span>
                                            {:else}
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold bg-[#fce8e6] text-[#c5221f]">
                                                    Unpaid
                                                </span>
                                            {/if}
                                        </TableCell>
                                    </TableRow>
                                {/each}
                            {:else}
                                <TableRow hover={false}>
                                    <TableCell colspan="4" class="px-6 py-8 text-center text-slate-brown italic bg-white">
                                        No rent history ledger entries recorded.
                                    </TableCell>
                                </TableRow>
                            {/if}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <!-- Active Complaints & Requests (Maintenance) -->
            <section class="space-y-4">
                <h3 class="text-xl font-serif font-bold text-charcoal">Active Complaints & Requests</h3>
                
                {#if maintenanceRequests.length > 0}
                    <div class="space-y-6">
                        {#each maintenanceRequests as req}
                            <div class="bg-white border border-[#D6D4CD] rounded-sm p-6 flex flex-col md:flex-row justify-between gap-6 shadow-xs relative">
                                <div class="space-y-3 flex-1">
                                    <div class="flex items-center gap-3">
                                        {#if req.urgency === 'HIGH' || req.urgency === 'EMERGENCY'}
                                            <span class="px-2 py-0.5 bg-[#fce8e6] text-[#c5221f] border border-[#fce8e6] rounded-sm text-[10px] font-bold uppercase tracking-wider">
                                                Urgent
                                            </span>
                                        {/if}
                                        <span class="text-xs text-slate-brown font-light">
                                            Reported: {formatDate(req.createdAt)}
                                        </span>
                                    </div>
                                    
                                    <h4 class="text-xl font-serif font-bold text-charcoal">{req.title}</h4>
                                    <p class="text-[15px] text-slate-brown leading-relaxed">{req.description}</p>
                                    
                                    <div class="flex items-center gap-1 text-xs text-slate-brown font-medium pt-1">
                                        <span class="material-symbols-outlined text-[16px] text-slate-brown">person</span>
                                        Tenant: {req.tenant.firstName} {req.tenant.name}
                                    </div>
                                </div>
                                
                                <div class="flex flex-col md:items-end justify-between min-w-[150px] gap-4">
                                    <div class="space-y-1.5 w-full md:w-auto">
                                        <span class="text-[11px] uppercase tracking-wider text-slate-brown font-bold block md:text-right">Status</span>
                                        <select 
                                            class="select !h-9 !py-0 !text-[13px] bg-[#f6f8f7] border-[#D6D4CD] w-full md:w-36 rounded-sm font-semibold"
                                            value={req.status}
                                            on:change={(e) => handleStatusChange(req.id, e.currentTarget.value)}
                                        >
                                            <option value="PENDING">Pending Review</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="RESOLVED">Addressed / Closed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="bg-[#FAF9F6] border border-[#D6D4CD] rounded-sm p-8 text-center text-slate-brown italic">
                        No active complaints or requests reported.
                    </div>
                {/if}
            </section>
        </div>

        <!-- Right Column (Cards Side panel) - 1/3 width -->
        <div class="space-y-8">
            <!-- Current Lease Card -->
            <section class="bg-white border border-[#D6D4CD] rounded-sm p-6 shadow-xs flex flex-col gap-5">
                <h3 class="text-md uppercase tracking-wider text-slate-brown font-bold font-sans border-b border-[#D6D4CD]/45 pb-3">
                    Current Lease
                </h3>
                
                {#if activeLease}
                    <div class="space-y-4">
                        <div>
                            <span class="text-xs text-slate-brown uppercase tracking-wider block font-light">Primary Tenant</span>
                            <span class="text-[17px] font-semibold text-charcoal">{activeLease.tenant.firstName} {activeLease.tenant.name}</span>
                        </div>
                        <div>
                            <span class="text-xs text-slate-brown uppercase tracking-wider block font-light">Lease Term</span>
                            <span class="text-[15px] font-sans text-charcoal">{formatDate(activeLease.startDate)} - {formatDate(activeLease.endDate)}</span>
                        </div>
                        <div>
                            <span class="text-xs text-slate-brown uppercase tracking-wider block font-light">Monthly Rent</span>
                            <span class="text-[18px] font-bold text-[#006a40]">${activeLease.rentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div>
                            <span class="text-xs text-slate-brown uppercase tracking-wider block font-light">Security Deposit</span>
                            <span class="text-[15px] text-charcoal">${activeLease.rentAmount.toLocaleString('en-US')} (Held)</span>
                        </div>
                    </div>
                {:else}
                    <div class="py-4 text-center text-slate-brown italic text-[14px]">
                        No active lease agreement.
                    </div>
                {/if}
            </section>

            <!-- Upcoming Bills (Costs) Card -->
            <section class="bg-white border border-[#D6D4CD] rounded-sm p-6 shadow-xs flex flex-col gap-5">
                <h3 class="text-md uppercase tracking-wider text-slate-brown font-bold font-sans border-b border-[#D6D4CD]/45 pb-3">
                    Upcoming Bills
                </h3>
                
                {#if upcomingBills.length > 0}
                    <div class="space-y-4">
                        {#each upcomingBills.slice(0, 3) as bill}
                            <div class="flex justify-between items-start gap-4">
                                <div class="space-y-0.5">
                                    <span class="text-[15px] font-bold text-charcoal block leading-snug">{bill.name}</span>
                                    <span class="text-xs text-slate-brown block font-light">Due {formatDate(bill.occurredAt)}</span>
                                </div>
                                <span class="text-[16px] font-bold text-charcoal">${bill.amount.toLocaleString()}</span>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="py-4 text-center text-slate-brown italic text-[14px]">
                        No upcoming bills listed.
                    </div>
                {/if}

                <div class="border-t border-[#D6D4CD]/45 pt-4 text-center">
                    <a href="/costs" class="text-primary hover:underline text-[15px] font-bold">
                        View All Finances
                    </a>
                </div>
            </section>
        </div>
    </div>
</div>
