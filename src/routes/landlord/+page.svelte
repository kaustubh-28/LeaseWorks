<script lang="ts">
    import type { PageData } from './$types';
    import { Button } from '$lib/components/button';
    import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '$lib/components/table';

    export let data: PageData;

    $: buildings = data.buildings || [];
    $: maintenanceRequests = data.maintenanceRequests || [];

    // Flat list of all apartments (units) in the portfolio
    $: apartments = buildings.flatMap((b: any) => {
        return (b.apartments || []).map((apt: any) => ({
            ...apt,
            buildingName: b.name,
            addressText: `${b.name}, Apt ${apt.name}`
        }));
    });

    // Stats calculations
    $: totalRevenue = apartments.reduce((sum: number, apt: any) => {
        const activeLease = apt.leases?.find((l: any) => {
            const now = new Date();
            const start = new Date(l.startDate);
            const end = l.endDate ? new Date(l.endDate) : null;
            return start <= now && (!end || end >= now);
        });
        return sum + (activeLease ? activeLease.rentAmount : 0);
    }, 0);

    $: vacantPropertiesCount = apartments.filter((apt: any) => {
        const activeLease = apt.leases?.find((l: any) => {
            const now = new Date();
            const start = new Date(l.startDate);
            const end = l.endDate ? new Date(l.endDate) : null;
            return start <= now && (!end || end >= now);
        });
        return !activeLease;
    }).length;

    $: activeRequestsCount = maintenanceRequests.filter((r: any) => r.status !== 'RESOLVED').length;

    // Search query
    let searchQuery = '';

    // Helper: get tenant name
    function getTenantName(apt: any) {
        const activeLease = apt.leases?.find((l: any) => {
            const now = new Date();
            const start = new Date(l.startDate);
            const end = l.endDate ? new Date(l.endDate) : null;
            return start <= now && (!end || end >= now);
        });
        if (!activeLease || !activeLease.tenant) return 'Vacant';
        return `${activeLease.tenant.firstName} ${activeLease.tenant.name}`;
    }

    // Helper: get rent status
    function getRentStatus(apt: any) {
        const activeLease = apt.leases?.find((l: any) => {
            const now = new Date();
            const start = new Date(l.startDate);
            const end = l.endDate ? new Date(l.endDate) : null;
            return start <= now && (!end || end >= now);
        });
        if (!activeLease) return 'N/A';
        
        const payments = activeLease.payments || [];
        if (payments.length === 0) return 'Pending';
        
        // Sort payments by due date descending
        const sorted = [...payments].sort((a: any, b: any) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        const status = sorted[0].status; // paid, pending, overdue
        
        if (status === 'paid') return 'Paid';
        if (status === 'pending') return 'Pending';
        if (status === 'overdue') return 'Late';
        return 'Pending';
    }

    // Filtered units list
    $: filteredApartments = apartments.filter((apt: any) => {
        const address = apt.addressText.toLowerCase();
        const tenant = getTenantName(apt).toLowerCase();
        const query = searchQuery.toLowerCase();
        return address.includes(query) || tenant.includes(query);
    });
</script>

<div class="space-y-12">
    <!-- Header Section -->
    <header class="flex items-end justify-between border-b border-[#D6D4CD] pb-6">
        <div>
            <h1 class="text-[44px] font-serif font-bold text-charcoal leading-none tracking-tight">Dashboard</h1>
        </div>
        <div>
            <Button variant="primary" size="md" href="/buildings?add=true" class="!bg-[#0f9d58] hover:!bg-[#0d874c]">
                <span class="material-symbols-outlined text-[20px] mr-1">add</span>
                Add Property
            </Button>
        </div>
    </header>

    <!-- Stats Grid (Borderless, Spacious style) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Total Revenue -->
        <div class="bg-white border border-[#D6D4CD]/65 rounded-sm p-8 flex flex-col gap-2">
            <span class="text-xs uppercase tracking-widest text-slate-brown font-bold font-sans">Total Revenue</span>
            <span class="text-[40px] font-serif font-bold text-charcoal leading-tight">
                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
        </div>

        <!-- Vacant Properties -->
        <div class="bg-white border border-[#D6D4CD]/65 rounded-sm p-8 flex flex-col gap-2">
            <span class="text-xs uppercase tracking-widest text-slate-brown font-bold font-sans">Vacant Properties</span>
            <span class="text-[40px] font-serif font-bold text-charcoal leading-tight">
                {vacantPropertiesCount}
            </span>
        </div>

        <!-- Active Requests -->
        <div class="bg-white border border-[#D6D4CD]/65 rounded-sm p-8 flex flex-col gap-2">
            <span class="text-xs uppercase tracking-widest text-slate-brown font-bold font-sans">Active Requests</span>
            <span class="text-[40px] font-serif font-bold text-charcoal leading-tight">
                {activeRequestsCount}
            </span>
        </div>
    </div>

    <!-- Property Portfolio Section -->
    <section class="bg-white border border-[#D6D4CD] rounded-sm overflow-hidden shadow-xs">
        <!-- Title and Search bar -->
        <div class="px-8 py-6 border-b border-[#D6D4CD] bg-white flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
            <h3 class="text-xl font-serif font-bold text-charcoal">Property Portfolio</h3>
            <div class="relative w-full sm:w-64">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-brown text-[18px]">search</span>
                <input 
                    class="pl-10 pr-4 input !h-9 !text-[14px] w-full bg-[#f6f8f7] border-[#D6D4CD] focus:border-primary transition-all placeholder:text-slate-brown rounded-sm" 
                    placeholder="Search properties..." 
                    type="text" 
                    bind:value={searchQuery}
                />
            </div>
        </div>

        <Table class="w-full text-left">
            <TableHeader>
                <TableRow hover={false} class="border-b border-[#D6D4CD]">
                    <TableHead class="text-xs font-bold uppercase tracking-widest text-slate-brown py-4 px-8 border-b-0 w-[45%]">Address</TableHead>
                    <TableHead class="text-xs font-bold uppercase tracking-widest text-slate-brown py-4 px-4 border-b-0 w-[20%]">Current Tenant</TableHead>
                    <TableHead class="text-xs font-bold uppercase tracking-widest text-slate-brown py-4 px-4 border-b-0 w-[20%]">Rent Status</TableHead>
                    <TableHead class="text-xs font-bold uppercase tracking-widest text-slate-brown py-4 px-8 border-b-0 text-right w-[15%]">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {#if filteredApartments.length > 0}
                    {#each filteredApartments as apt}
                        {@const tenantName = getTenantName(apt)}
                        {@const status = getRentStatus(apt)}
                        <TableRow class="hover:bg-parchment/30 transition-colors border-b border-[#D6D4CD]/45">
                            <TableCell class="py-5 px-8 font-sans font-semibold text-charcoal text-[16px]">
                                {apt.addressText}
                            </TableCell>
                            <TableCell class="py-5 px-4 font-sans text-charcoal text-[15px]">
                                {#if tenantName === 'Vacant'}
                                    <span class="italic text-slate-brown/65">Vacant</span>
                                {:else}
                                    <span>{tenantName}</span>
                                {/if}
                            </TableCell>
                            <TableCell class="py-5 px-4">
                                {#if status === 'Paid'}
                                    <span class="inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#e6f4ea] text-[#137333]">
                                        <span class="size-1.5 rounded-full bg-[#137333] mr-1.5 inline-block"></span>
                                        Paid
                                    </span>
                                {:else if status === 'Pending'}
                                    <span class="inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#fef7e0] text-[#b06000]">
                                        <span class="size-1.5 rounded-full bg-[#b06000] mr-1.5 inline-block"></span>
                                        Pending
                                    </span>
                                {:else if status === 'Late'}
                                    <span class="inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#fce8e6] text-[#c5221f]">
                                        <span class="size-1.5 rounded-full bg-[#c5221f] mr-1.5 inline-block"></span>
                                        Late
                                    </span>
                                {:else}
                                    <span class="inline-flex items-center px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#f1f3f4] text-[#5f6368]">
                                        N/A
                                    </span>
                                {/if}
                            </TableCell>
                            <TableCell class="py-5 px-8 text-right">
                                <a 
                                    href="/landlord/apartments/{apt.id}" 
                                    class="text-[#006a40] hover:text-[#005230] font-bold text-[14px] hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded"
                                >
                                    View / Edit
                                </a>
                            </TableCell>
                        </TableRow>
                    {/each}
                {:else}
                    <TableRow hover={false}>
                        <TableCell colspan="4" class="px-8 py-12 text-center text-slate-brown italic bg-white">
                            No properties match your search.
                        </TableCell>
                    </TableRow>
                {/if}
            </TableBody>
        </Table>
    </section>
</div>
