<script lang="ts">
    import type { PageData } from './$types';
    import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/card';
    import { Button } from '$lib/components/button';
    import { 
        Table, TableHeader, TableBody, TableRow, TableCell, TableHead 
    } from '$lib/components/table';
    import { invalidateAll } from '$app/navigation';

    export let data: PageData;

    $: building = data.building;
    $: maintenanceRequests = data.maintenanceRequests || [];
    $: apartments = building.apartments || [];

    // Search, Filter, Sort state
    let searchQuery = '';
    let statusFilter = 'ALL'; // ALL, OCCUPIED, VACANT
    let typeFilter = 'ALL'; // ALL, HOUSE, APARTMENT, LOFT, STUDIO, etc.
    let sortKey = 'name'; // name, rent, size
    let sortOrder = 'asc'; // asc, desc

    let selectedRequest: any = null;

    // Helper functions
    function getActiveLease(apt: any) {
        if (!apt.leases) return null;
        return apt.leases.find((l: any) => {
            const now = new Date();
            const start = new Date(l.startDate);
            const end = l.endDate ? new Date(l.endDate) : null;
            return start <= now && (!end || end >= now);
        });
    }

    function isOccupied(apt: any) {
        return !!getActiveLease(apt);
    }

    // Apartment calculations
    $: totalUnits = apartments.length;
    $: occupiedUnits = apartments.filter(isOccupied).length;
    $: vacantUnits = totalUnits - occupiedUnits;
    $: occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    $: monthlyRevenue = apartments.reduce((sum: number, apt: any) => {
        const activeLease = getActiveLease(apt);
        return sum + (activeLease ? activeLease.rentAmount : 0);
    }, 0);

    $: buildingExpenses = (building.costs || []).reduce((sum: number, c: any) => sum + c.amount, 0);
    $: apartmentExpenses = apartments.reduce((sum: number, apt: any) => {
        return sum + (apt.costs || []).reduce((cSum: number, c: any) => cSum + c.amount, 0);
    }, 0);
    $: monthlyExpenses = buildingExpenses + apartmentExpenses;
    $: netYield = monthlyRevenue - monthlyExpenses;

    $: avgRent = occupiedUnits > 0 ? monthlyRevenue / occupiedUnits : 0;
    $: revPerUnit = totalUnits > 0 ? monthlyRevenue / totalUnits : 0;

    // Filter and Sort Apartments list
    $: filteredApartments = apartments.filter((apt: any) => {
        const activeLease = getActiveLease(apt);
        const occupied = !!activeLease;

        if (statusFilter === 'OCCUPIED' && !occupied) return false;
        if (statusFilter === 'VACANT' && occupied) return false;

        if (typeFilter !== 'ALL' && apt.type !== typeFilter) return false;

        const query = searchQuery.toLowerCase();
        if (query) {
            const unitMatch = apt.name.toLowerCase().includes(query);
            const tenantMatch = activeLease?.tenant ? `${activeLease.tenant.firstName} ${activeLease.tenant.name}`.toLowerCase().includes(query) : false;
            return unitMatch || tenantMatch;
        }

        return true;
    }).sort((a: any, b: any) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === 'rent') {
            const leaseA = getActiveLease(a);
            const leaseB = getActiveLease(b);
            valA = leaseA ? leaseA.rentAmount : 0;
            valB = leaseB ? leaseB.rentAmount : 0;
        }

        if (typeof valA === 'string') {
            return sortOrder === 'asc' 
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        } else {
            return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
    });

    // Extract cost ledger records
    $: costsLedger = [
        ...(building.costs || []).map((c: any) => ({ ...c, target: 'Building' })),
        ...apartments.flatMap((apt: any) => 
            (apt.costs || []).map((c: any) => ({ ...c, target: `Apt ${apt.name}` }))
        )
    ].sort((a: any, b: any) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    // Extract payments
    $: buildingPayments = apartments.flatMap((apt: any) => {
        return (apt.payments || []).map((p: any) => ({
            ...p,
            apartmentName: apt.name
        }));
    }).sort((a: any, b: any) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    // Lease expirations (leases expiring or active)
    $: activeLeases = apartments.flatMap((apt: any) => {
        return (apt.leases || []).filter((l: any) => {
            const now = new Date();
            const start = new Date(l.startDate);
            const end = l.endDate ? new Date(l.endDate) : null;
            return start <= now && (!end || end >= now);
        }).map((l: any) => ({
            ...l,
            apartmentName: apt.name
        }));
    }).sort((a: any, b: any) => {
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    });

    // Resolve maintenance requests
    $: openMaintenance = maintenanceRequests.filter((req: any) => req.status !== 'RESOLVED');

    async function handleResolveRequest(id: string) {
        try {
            const response = await fetch(`/api/maintenance/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'RESOLVED' })
            });

            if (response.ok) {
                selectedRequest = null;
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
    <!-- Header with quick actions -->
    <header class="border-b-4 border-double border-border-tan pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <div class="flex items-center gap-2 text-slate-brown mb-1">
                <a href="/landlord" class="hover:text-primary font-bold flex items-center gap-0.5 text-sm uppercase tracking-wider">
                    <span class="material-symbols-outlined text-md">arrow_back</span>
                    Portfolio
                </a>
                <span>/</span>
                <span class="text-sm uppercase tracking-wider">{building.name}</span>
            </div>
            <h2 class="text-4xl font-serif font-bold text-charcoal tracking-tight">{building.name}</h2>
            <p class="text-slate-brown italic mt-1 font-serif">{building.address.street} {building.address.houseNumber}, {building.address.city}, {building.address.postalCode}</p>
        </div>
        <div class="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" href="/apartments?buildingId={building.id}&add=true">
                <span class="material-symbols-outlined text-[18px] mr-1">add_box</span>
                Add Unit
            </Button>
            <Button variant="outline" size="sm" href="/costs?buildingId={building.id}&add=true">
                <span class="material-symbols-outlined text-[18px] mr-1">receipt</span>
                Record Cost
            </Button>
            <Button variant="outline" size="sm" href="/meters?buildingId={building.id}&add=true">
                <span class="material-symbols-outlined text-[18px] mr-1">speed</span>
                Connect Meter
            </Button>
        </div>
    </header>

    <!-- Occupancy Analytics -->
    <section class="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card padding="sm" class="bg-white border-border-tan">
            <CardHeader padding="none" class="mb-2">
                <span class="text-xs uppercase tracking-wider text-slate-brown font-bold block">Total Units</span>
            </CardHeader>
            <CardContent padding="none">
                <p class="text-3xl font-serif font-bold text-charcoal">{totalUnits}</p>
            </CardContent>
        </Card>

        <Card padding="sm" class="bg-white border-border-tan">
            <CardHeader padding="none" class="mb-2">
                <span class="text-xs uppercase tracking-wider text-slate-brown font-bold block text-primary">Occupied</span>
            </CardHeader>
            <CardContent padding="none">
                <p class="text-3xl font-serif font-bold text-primary">{occupiedUnits}</p>
            </CardContent>
        </Card>

        <Card padding="sm" class="bg-white border-border-tan">
            <CardHeader padding="none" class="mb-2">
                <span class="text-xs uppercase tracking-wider text-slate-brown font-bold block text-slate-400">Vacant</span>
            </CardHeader>
            <CardContent padding="none">
                <p class="text-3xl font-serif font-bold text-slate-400">{vacantUnits}</p>
            </CardContent>
        </Card>

        <Card padding="sm" class="bg-white border-border-tan">
            <CardHeader padding="none" class="mb-2">
                <span class="text-xs uppercase tracking-wider text-slate-brown font-bold block">Occupancy Rate</span>
            </CardHeader>
            <CardContent padding="none">
                <p class="text-3xl font-serif font-bold text-charcoal">{occupancyRate.toFixed(1)}%</p>
            </CardContent>
        </Card>

        <Card padding="sm" class="bg-white border-border-tan">
            <CardHeader padding="none" class="mb-2">
                <span class="text-xs uppercase tracking-wider text-slate-brown font-bold block">Average Rent</span>
            </CardHeader>
            <CardContent padding="none">
                <p class="text-3xl font-serif font-bold text-charcoal">${avgRent.toFixed(0)}</p>
            </CardContent>
        </Card>

        <Card padding="sm" class="bg-white border-border-tan">
            <CardHeader padding="none" class="mb-2">
                <span class="text-xs uppercase tracking-wider text-slate-brown font-bold block">Yield / Unit</span>
            </CardHeader>
            <CardContent padding="none">
                <p class="text-3xl font-serif font-bold text-charcoal">{revPerUnit.toFixed(0)}</p>
            </CardContent>
        </Card>
    </section>

    <!-- Apartment Directory Section -->
    <section class="card bg-white border border-border-tan !p-0 overflow-hidden">
        <div class="px-8 py-6 border-b border-border-tan flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[#FCFBF9]">
            <div>
                <h3 class="text-lg font-serif font-bold text-charcoal">Apartment Directory</h3>
                <p class="text-xs text-slate-brown italic font-serif">Unit details, size, and lease occupancy status</p>
            </div>
            
            <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <!-- Search -->
                <div class="relative flex-1 md:flex-none">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-brown text-[20px]">search</span>
                    <input class="pl-10 pr-4 input !h-10 !text-[14px] w-full md:w-48 placeholder:text-slate-brown" placeholder="Search units..." type="text" bind:value={searchQuery}/>
                </div>

                <!-- Status Filter -->
                <select class="select !h-10 !text-[14px] !py-0 w-32" bind:value={statusFilter}>
                    <option value="ALL">All Status</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="VACANT">Vacant</option>
                </select>

                <!-- Sort Key -->
                <select class="select !h-10 !text-[14px] !py-0 w-32" bind:value={sortKey}>
                    <option value="name">Sort by Unit</option>
                    <option value="rent">Sort by Rent</option>
                    <option value="size">Sort by Size</option>
                </select>

                <!-- Sort Order -->
                <button class="btn-secondary !h-10 !w-10 !p-0 flex items-center justify-center border border-border-tan" on:click={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}>
                    <span class="material-symbols-outlined text-[20px]">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                </button>
            </div>
        </div>

        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead class="w-[15%]">Unit</TableHead>
                    <TableHead class="w-[15%]">Floor</TableHead>
                    <TableHead class="w-[20%]">Type & Size</TableHead>
                    <TableHead class="w-[25%]">Current Tenant</TableHead>
                    <TableHead class="w-[15%]">Rent</TableHead>
                    <TableHead class="w-[10%] text-right">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {#if filteredApartments.length > 0}
                    {#each filteredApartments as apt}
                        {@const activeLease = getActiveLease(apt)}
                        <TableRow class="cursor-pointer" onclick={() => window.location.href = `/apartments?id=${apt.id}`}>
                            <TableCell class="font-bold text-charcoal">{apt.name}</TableCell>
                            <TableCell>{apt.floor === 0 ? 'G' : apt.floor}F</TableCell>
                            <TableCell>
                                <span class="text-xs uppercase tracking-wider text-slate-brown block font-semibold">{apt.type}</span>
                                <span class="text-xs font-light text-slate-brown">{apt.size} {apt.sizeUnit}</span>
                            </TableCell>
                            <TableCell>
                                {#if activeLease?.tenant}
                                    <span class="font-semibold text-charcoal">{activeLease.tenant.firstName} {activeLease.tenant.name}</span>
                                {:else}
                                    <span class="italic text-gray-400">Vacant</span>
                                {/if}
                            </TableCell>
                            <TableCell class="font-bold">
                                {#if activeLease}
                                    ${activeLease.rentAmount.toLocaleString()} / mo
                                {:else}
                                    —
                                {/if}
                            </TableCell>
                            <TableCell class="text-right">
                                {#if activeLease}
                                    <span class="badge-success">Occupied</span>
                                {:else}
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[14px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">Vacant</span>
                                {/if}
                            </TableCell>
                        </TableRow>
                    {/each}
                {:else}
                    <TableRow hover={false}>
                        <TableCell colspan="6" class="px-8 py-12 text-center text-slate-brown italic">
                            No apartments match the filter selection.
                        </TableCell>
                    </TableRow>
                {/if}
            </TableBody>
        </Table>
    </section>

    <!-- Detailed Ledger Section -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Financial Ledger & Cost History -->
        <Card padding="none" class="bg-white border border-border-tan overflow-hidden flex flex-col justify-between">
            <div>
                <CardHeader class="px-6 py-4 border-b border-border-tan/40 flex justify-between items-center bg-[#FCFBF9]">
                    <CardTitle class="text-sm uppercase tracking-wider text-slate-brown font-bold font-serif">Expenses & Cost Ledger</CardTitle>
                </CardHeader>
                <div class="overflow-x-auto max-h-[300px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Target</TableHead>
                                <TableHead>Cost Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead class="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {#if costsLedger.length > 0}
                                {#each costsLedger as cost}
                                    <TableRow>
                                        <TableCell class="text-xs uppercase tracking-wider text-slate-brown font-bold">{cost.target}</TableCell>
                                        <TableCell class="font-semibold text-charcoal">{cost.name}</TableCell>
                                        <TableCell class="text-xs font-light text-slate-brown">{new Date(cost.occurredAt).toLocaleDateString()}</TableCell>
                                        <TableCell class="text-right font-bold text-error">-${cost.amount.toLocaleString()}</TableCell>
                                    </TableRow>
                                {/each}
                            {:else}
                                <TableRow hover={false}>
                                    <TableCell colspan="4" class="px-6 py-8 text-center text-slate-brown italic">No recorded costs</TableCell>
                                </TableRow>
                            {/if}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div class="p-6 bg-[#FCFBF9] border-t border-border-tan/40 flex justify-between items-center">
                <div>
                    <span class="text-[11px] uppercase tracking-wider text-slate-brown block font-bold">Monthly Yield Ledger</span>
                    <span class="text-2xl font-serif font-bold {netYield >= 0 ? 'text-[#006a40]' : 'text-error'}">
                        {netYield >= 0 ? '+' : ''}${netYield.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                </div>
                <div class="text-right text-xs text-slate-brown font-light">
                    Incoming: ${monthlyRevenue.toLocaleString()}<br/>
                    Outgoing: ${monthlyExpenses.toLocaleString()}
                </div>
            </div>
        </Card>

        <!-- Recent Payments Feed -->
        <Card padding="none" class="bg-white border border-border-tan overflow-hidden">
            <CardHeader class="px-6 py-4 border-b border-border-tan/40 bg-[#FCFBF9]">
                <CardTitle class="text-sm uppercase tracking-wider text-slate-brown font-bold font-serif">Recent Rent Payments</CardTitle>
            </CardHeader>
            <div class="overflow-x-auto max-h-[360px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Unit</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead class="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {#if buildingPayments.length > 0}
                            {#each buildingPayments.slice(0, 6) as payment}
                                <TableRow>
                                    <TableCell class="font-bold text-charcoal">Apt {payment.apartmentName}</TableCell>
                                    <TableCell class="text-xs text-slate-brown">{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {#if payment.status === 'paid'}
                                            <span class="badge-success">Paid</span>
                                        {:else if payment.status === 'pending'}
                                            <span class="badge-warning">Pending</span>
                                        {:else}
                                            <span class="badge-error">Overdue</span>
                                        {/if}
                                    </TableCell>
                                    <TableCell class="text-right font-bold">${payment.amount.toLocaleString()}</TableCell>
                                </TableRow>
                            {/each}
                        {:else}
                            <TableRow hover={false}>
                                <TableCell colspan="4" class="px-6 py-8 text-center text-slate-brown italic">No recorded payments</TableCell>
                            </TableRow>
                        {/if}
                    </TableBody>
                </Table>
            </div>
        </Card>
    </section>

    <!-- Maintenance Activity & Lease Expirations -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Maintenance requests queue -->
        <Card padding="none" class="bg-white border border-border-tan overflow-hidden">
            <CardHeader class="px-6 py-4 border-b border-border-tan/40 bg-[#FCFBF9] flex justify-between items-center">
                <CardTitle class="text-sm uppercase tracking-wider text-slate-brown font-bold font-serif">Maintenance Queue</CardTitle>
            </CardHeader>
            <div class="p-6 space-y-4 max-h-[350px] overflow-y-auto">
                {#if openMaintenance.length > 0}
                    {#each openMaintenance as req}
                        <div class="flex justify-between items-start p-4 bg-parchment/20 border border-border-tan/30 rounded-sm">
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <p class="font-bold text-charcoal">{req.title}</p>
                                    <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm border 
                                        {req.urgency === 'HIGH' || req.urgency === 'EMERGENCY' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-slate-100 text-slate-500 border-slate-200'}">
                                        {req.urgency}
                                    </span>
                                </div>
                                <p class="text-xs text-slate-brown">
                                    Unit {req.apartment.name} | Reported by {req.tenant.firstName} {req.tenant.name}
                                </p>
                            </div>
                            <Button variant="outline" size="xs" onclick={() => selectedRequest = req} class="!h-8 !px-3">
                                Resolve
                            </Button>
                        </div>
                    {/each}
                {:else}
                    <div class="text-center py-8 text-slate-brown italic text-sm">
                        All unit repairs are completed.
                    </div>
                {/if}
            </div>
        </Card>

        <!-- Upcoming lease expirations -->
        <Card padding="none" class="bg-white border border-border-tan overflow-hidden">
            <CardHeader class="px-6 py-4 border-b border-border-tan/40 bg-[#FCFBF9]">
                <CardTitle class="text-sm uppercase tracking-wider text-slate-brown font-bold font-serif">Upcoming Lease Expirations</CardTitle>
            </CardHeader>
            <div class="overflow-x-auto max-h-[350px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Unit</TableHead>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Expiration Date</TableHead>
                            <TableHead class="text-right">Rent</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {#if activeLeases.length > 0}
                            {#each activeLeases as lease}
                                <TableRow>
                                    <TableCell class="font-bold text-charcoal">Apt {lease.apartmentName}</TableCell>
                                    <TableCell class="font-semibold text-charcoal">{lease.tenant.firstName} {lease.tenant.name}</TableCell>
                                    <TableCell class="text-xs text-slate-brown">
                                        {#if lease.endDate}
                                            {new Date(lease.endDate).toLocaleDateString()}
                                            {@const daysLeft = Math.ceil((new Date(lease.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                                            {#if daysLeft <= 60}
                                                <span class="text-secondary font-bold ml-1">({daysLeft}d left)</span>
                                            {/if}
                                        {:else}
                                            <span class="italic text-gray-400">Month-to-month</span>
                                        {/if}
                                    </TableCell>
                                    <TableCell class="text-right font-bold">${lease.rentAmount.toLocaleString()}</TableCell>
                                </TableRow>
                            {/each}
                        {:else}
                            <TableRow hover={false}>
                                <TableCell colspan="4" class="px-6 py-8 text-center text-slate-brown italic">No active leases</TableCell>
                            </TableRow>
                        {/if}
                    </TableBody>
                </Table>
            </div>
        </Card>
    </section>
</div>

<!-- Maintenance Resolve Modal -->
{#if selectedRequest}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <button class="absolute inset-0 bg-charcoal/60 transition-opacity cursor-default w-full h-full border-none outline-none" on:click={() => selectedRequest = null}></button>
        <!-- Modal Content -->
        <div class="modal-content text-left">
            <div class="flex justify-between items-start mb-6">
                <h3 class="text-2xl font-bold font-serif text-secondary flex items-center gap-2">
                    Resolve Issue Alert
                </h3>
                <button class="text-slate-brown hover:text-charcoal transition-colors bg-transparent border-none p-0" on:click={() => selectedRequest = null}>
                    <span class="material-symbols-outlined text-2xl">close</span>
                </button>
            </div>
            
            <div class="space-y-4 mb-8">
                <div>
                    <span class="text-xs font-bold uppercase text-slate-brown tracking-wider block mb-1">Issue Description</span>
                    <p class="text-lg font-bold text-charcoal">{selectedRequest.title}</p>
                    <p class="text-sm bg-parchment border border-border-tan/50 p-4 rounded-sm text-charcoal mt-2">
                        {selectedRequest.description}
                    </p>
                </div>
            </div>

            <div class="flex gap-4">
                <Button variant="secondary" size="md" onclick={() => selectedRequest = null} class="flex-1">
                    Cancel
                </Button>
                <Button variant="success" size="md" onclick={() => handleResolveRequest(selectedRequest.id)} class="flex-1">
                    Mark as Resolved
                </Button>
            </div>
        </div>
    </div>
{/if}
