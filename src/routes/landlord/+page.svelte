<script lang="ts">
    import type { PageData } from './$types';
    import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '$lib/components/card';
    import { Button } from '$lib/components/button';
    import { invalidateAll } from '$app/navigation';

    export let data: PageData;

    $: buildings = data.buildings || [];
    $: maintenanceRequests = data.maintenanceRequests || [];

    // Derive Portfolio Analytics
    $: totalBuildingsCount = buildings.length;
    $: totalUnits = buildings.reduce((sum: number, b: any) => sum + (b.apartments?.length || 0), 0);
    $: occupiedUnits = buildings.reduce((sum: number, b: any) => {
        return sum + (b.apartments || []).filter((apt: any) => {
            return apt.leases.some((l: any) => {
                const now = new Date();
                const start = new Date(l.startDate);
                const end = l.endDate ? new Date(l.endDate) : null;
                return start <= now && (!end || end >= now);
            });
        }).length;
    }, 0);
    $: vacantUnits = totalUnits - occupiedUnits;
    $: occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    $: monthlyRevenue = buildings.reduce((sum: number, b: any) => {
        return sum + (b.apartments || []).reduce((aptSum: number, apt: any) => {
            const activeLease = apt.leases.find((l: any) => {
                const now = new Date();
                const start = new Date(l.startDate);
                const end = l.endDate ? new Date(l.endDate) : null;
                return start <= now && (!end || end >= now);
            });
            return aptSum + (activeLease ? activeLease.rentAmount : 0);
        }, 0);
    }, 0);

    $: monthlyExpenses = buildings.reduce((sum: number, b: any) => {
        const buildingCosts = (b.costs || []).reduce((cSum: number, c: any) => cSum + c.amount, 0);
        const apartmentCosts = (b.apartments || []).reduce((aptSum: number, apt: any) => {
            return aptSum + (apt.costs || []).reduce((cSum: number, c: any) => cSum + c.amount, 0);
        }, 0);
        return sum + buildingCosts + apartmentCosts;
    }, 0);

    $: avgRent = occupiedUnits > 0 ? monthlyRevenue / occupiedUnits : 0;
    $: revPerUnit = totalUnits > 0 ? monthlyRevenue / totalUnits : 0;

    // Filtered maintenance requests for summary
    $: openMaintenanceRequests = maintenanceRequests.filter((req: any) => req.status !== 'RESOLVED');
    $: highUrgencyRequests = openMaintenanceRequests.filter((req: any) => req.urgency === 'HIGH' || req.urgency === 'EMERGENCY');
    $: normalUrgencyRequests = openMaintenanceRequests.filter((req: any) => req.urgency === 'LOW' || req.urgency === 'MEDIUM');

    function getBuildingStats(building: any) {
        const apartments = building.apartments || [];
        const aptCount = apartments.length;
        const occupied = apartments.filter((apt: any) => {
            return apt.leases.some((l: any) => {
                const now = new Date();
                const start = new Date(l.startDate);
                const end = l.endDate ? new Date(l.endDate) : null;
                return start <= now && (!end || end >= now);
            });
        }).length;
        const vacant = aptCount - occupied;
        const occupancyPct = aptCount > 0 ? (occupied / aptCount) * 100 : 0;

        const revenue = apartments.reduce((sum: number, apt: any) => {
            const activeLease = apt.leases.find((l: any) => {
                const now = new Date();
                const start = new Date(l.startDate);
                const end = l.endDate ? new Date(l.endDate) : null;
                return start <= now && (!end || end >= now);
            });
            return sum + (activeLease ? activeLease.rentAmount : 0);
        }, 0);

        const expenses = ((building.costs || []).reduce((sum: number, c: any) => sum + c.amount, 0) || 0) +
                         apartments.reduce((sum: number, apt: any) => sum + ((apt.costs || []).reduce((cSum: number, c: any) => cSum + c.amount, 0) || 0), 0);

        const openMaintenance = maintenanceRequests.filter((req: any) => {
            return req.apartment.buildingId === building.id && req.status !== 'RESOLVED';
        }).length;

        return {
            aptCount,
            occupied,
            vacant,
            occupancyPct,
            revenue,
            expenses,
            openMaintenance
        };
    }
</script>

<div class="space-y-10">
    <!-- Double-ledger Header -->
    <header class="border-b-4 border-double border-border-tan pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 class="text-4xl font-serif font-bold text-charcoal tracking-tight">Property Portfolio Workspace</h2>
            <p class="text-slate-brown italic mt-1 font-serif">Comprehensive operations & asset ledger management</p>
        </div>
        <div class="flex gap-3">
            <Button variant="outline" size="md" href="/buildings">
                <span class="material-symbols-outlined text-[18px] mr-1">domain</span>
                View Ledger Database
            </Button>
        </div>
    </header>

    <!-- Quick Actions Panel -->
    <section class="card bg-[#FCFBF9] !p-6 border border-border-tan/80">
        <h3 class="text-xs uppercase tracking-wider text-slate-brown font-bold mb-4 font-serif">Portfolio Quick Actions</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            <Button variant="secondary" size="sm" href="/buildings?add=true" class="w-full">
                <span class="material-symbols-outlined text-md mr-1">add_home</span>
                Add Building
            </Button>
            <Button variant="secondary" size="sm" href="/apartments?add=true" class="w-full">
                <span class="material-symbols-outlined text-md mr-1">key</span>
                Add Apartment
            </Button>
            <Button variant="secondary" size="sm" href="/tenants?add=true" class="w-full">
                <span class="material-symbols-outlined text-md mr-1">person_add</span>
                Register Tenant
            </Button>
            <Button variant="secondary" size="sm" href="/leases?add=true" class="w-full">
                <span class="material-symbols-outlined text-md mr-1">assignment</span>
                Create Lease
            </Button>
            <Button variant="secondary" size="sm" href="/leases" class="w-full col-span-2 sm:col-span-1">
                <span class="material-symbols-outlined text-md mr-1">payments</span>
                Record Payment
            </Button>
        </div>
    </section>

    <!-- Portfolio Occupancy Analytics -->
    <section class="space-y-4">
        <h3 class="text-xs uppercase tracking-wider text-slate-brown font-bold font-serif">Portfolio Occupancy Analytics</h3>
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card padding="sm" class="bg-white">
                <CardHeader padding="none" class="mb-2">
                    <CardTitle class="text-xs uppercase tracking-wider text-slate-brown">Total Units</CardTitle>
                </CardHeader>
                <CardContent padding="none">
                    <p class="text-3xl font-serif font-bold text-charcoal">{totalUnits}</p>
                </CardContent>
            </Card>

            <Card padding="sm" class="bg-white">
                <CardHeader padding="none" class="mb-2">
                    <CardTitle class="text-xs uppercase tracking-wider text-slate-brown">Occupied Units</CardTitle>
                </CardHeader>
                <CardContent padding="none">
                    <p class="text-3xl font-serif font-bold text-primary">{occupiedUnits}</p>
                </CardContent>
            </Card>

            <Card padding="sm" class="bg-white">
                <CardHeader padding="none" class="mb-2">
                    <CardTitle class="text-xs uppercase tracking-wider text-slate-brown">Vacant Units</CardTitle>
                </CardHeader>
                <CardContent padding="none">
                    <p class="text-3xl font-serif font-bold text-slate-400">{vacantUnits}</p>
                </CardContent>
            </Card>

            <Card padding="sm" class="bg-white">
                <CardHeader padding="none" class="mb-2">
                    <CardTitle class="text-xs uppercase tracking-wider text-slate-brown">Occupancy Rate</CardTitle>
                </CardHeader>
                <CardContent padding="none">
                    <p class="text-3xl font-serif font-bold text-charcoal">{occupancyRate.toFixed(1)}%</p>
                </CardContent>
            </Card>

            <Card padding="sm" class="bg-white">
                <CardHeader padding="none" class="mb-2">
                    <CardTitle class="text-xs uppercase tracking-wider text-slate-brown">Average Rent</CardTitle>
                </CardHeader>
                <CardContent padding="none">
                    <p class="text-3xl font-serif font-bold text-charcoal">${avgRent.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                </CardContent>
            </Card>

            <Card padding="sm" class="bg-white">
                <CardHeader padding="none" class="mb-2">
                    <CardTitle class="text-xs uppercase tracking-wider text-slate-brown">Rev Per Unit</CardTitle>
                </CardHeader>
                <CardContent padding="none">
                    <p class="text-3xl font-serif font-bold text-charcoal">${revPerUnit.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                </CardContent>
            </Card>
        </div>
    </section>

    <!-- Portfolio Buildings Directory -->
    <section class="space-y-4">
        <h3 class="text-xs uppercase tracking-wider text-slate-brown font-bold font-serif">Property Portfolio Directory</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {#each buildings as building}
                {@const stats = getBuildingStats(building)}
                <Card clickable={true} href="/landlord/buildings/{building.id}" padding="none" class="flex flex-col justify-between overflow-hidden hover:!border-primary hover:shadow-md transition-all bg-white border border-border-tan">
                    <div class="p-6 space-y-4">
                        <!-- Card Title -->
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="text-2xl font-serif font-bold text-charcoal hover:text-primary transition-colors">{building.name}</h4>
                                <p class="text-slate-brown text-sm font-light mt-0.5">{building.address.street} {building.address.houseNumber}, {building.address.city}</p>
                            </div>
                            <span class="material-symbols-outlined text-slate-brown group-hover:text-primary transition-colors">domain</span>
                        </div>

                        <!-- Occupancy Bar -->
                        <div class="space-y-1.5">
                            <div class="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-brown">
                                <span>Occupancy ({stats.occupancyPct.toFixed(0)}%)</span>
                                <span>{stats.occupied} / {stats.aptCount} Units</span>
                            </div>
                            <div class="w-full h-2 bg-[#F0EFEA] rounded-sm overflow-hidden flex">
                                <div class="h-full bg-primary" style="width: {stats.occupancyPct}%"></div>
                            </div>
                        </div>

                        <!-- Analytics Ledger Columns -->
                        <div class="grid grid-cols-2 gap-4 pt-3 border-t border-border-tan/40">
                            <div>
                                <span class="text-[11px] uppercase tracking-wider text-slate-brown font-bold block">Monthly Yield</span>
                                <span class="text-lg font-bold text-primary">+${stats.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div class="border-l border-border-tan/40 pl-4">
                                <span class="text-[11px] uppercase tracking-wider text-slate-brown font-bold block">Monthly Expenses</span>
                                <span class="text-lg font-bold text-error">-${stats.expenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Card Footer Details -->
                    <div class="px-6 py-4 bg-[#FCFBF9] border-t border-border-tan/40 flex justify-between items-center text-xs">
                        <div class="flex items-center gap-1">
                            {#if stats.openMaintenance > 0}
                                <span class="material-symbols-outlined text-secondary text-sm">warning</span>
                                <span class="text-secondary font-bold">{stats.openMaintenance} Open Requests</span>
                            {:else}
                                <span class="material-symbols-outlined text-[#006a40] text-sm">check_circle</span>
                                <span class="text-[#006a40] font-bold">No Repairs Pending</span>
                            {/if}
                        </div>
                        <span class="text-primary font-bold hover:underline flex items-center gap-0.5">
                            Manage Property
                            <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                    </div>
                </Card>
            {/each}
        </div>
    </section>

    <!-- Maintenance Summary & Quick Alerts Feed -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Maintenance Activity Card -->
        <Card padding="md" class="md:col-span-2 bg-white border border-border-tan">
            <CardHeader padding="none" class="pb-3 border-b border-border-tan/40 mb-4 flex justify-between items-center">
                <div>
                    <CardTitle class="text-sm uppercase tracking-wider text-slate-brown font-bold font-serif">Recent Portfolio Repairs</CardTitle>
                </div>
                <Button variant="ghost" size="xs" href="/landlord" class="!h-8">
                    View Maintenance
                </Button>
            </CardHeader>
            <CardContent padding="none">
                {#if openMaintenanceRequests.length > 0}
                    <div class="space-y-3">
                        {#each openMaintenanceRequests.slice(0, 3) as req}
                            <div class="flex justify-between items-start p-3 bg-parchment/30 border border-border-tan/30 rounded-sm">
                                <div>
                                    <div class="flex items-center gap-2">
                                        <p class="font-bold text-charcoal">{req.title}</p>
                                        {#if req.urgency === 'HIGH' || req.urgency === 'EMERGENCY'}
                                            <span class="px-2 py-0.5 text-[10px] font-bold uppercase bg-secondary/15 text-secondary border border-secondary/20 rounded-sm">Urgent</span>
                                        {/if}
                                    </div>
                                    <p class="text-xs text-slate-brown mt-0.5">
                                        {req.apartment.building.name} - Apt {req.apartment.name} | Reported by {req.tenant.firstName} {req.tenant.name}
                                    </p>
                                </div>
                                <span class="text-xs font-bold uppercase tracking-wider text-slate-brown px-2 py-1 bg-white border border-border-tan/40 rounded-sm">{req.status}</span>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="bg-[#FAF9F6] p-8 text-center border border-border-tan/30 text-sm text-slate-brown italic">
                        All maintenance requests resolved.
                    </div>
                {/if}
            </CardContent>
        </Card>

        <!-- Urgency Breakdown Card -->
        <Card padding="md" class="bg-white border border-border-tan">
            <CardHeader padding="none" class="pb-3 border-b border-border-tan/40 mb-4">
                <CardTitle class="text-sm uppercase tracking-wider text-slate-brown font-bold font-serif">Urgency Breakdown</CardTitle>
            </CardHeader>
            <CardContent padding="none">
                <div class="space-y-4">
                    <div class="flex justify-between items-center p-3 border-l-4 border-secondary bg-secondary/5">
                        <div>
                            <p class="text-xs uppercase tracking-wider text-slate-brown font-bold">Urgent Alerts</p>
                            <p class="text-2xl font-bold font-serif text-secondary mt-0.5">{highUrgencyRequests.length}</p>
                        </div>
                        <span class="material-symbols-outlined text-secondary text-3xl font-bold">warning</span>
                    </div>

                    <div class="flex justify-between items-center p-3 border-l-4 border-[#006a40] bg-[#006a40]/5">
                        <div>
                            <p class="text-xs uppercase tracking-wider text-slate-brown font-bold">Standard Queue</p>
                            <p class="text-2xl font-bold font-serif text-[#006a40] mt-0.5">{normalUrgencyRequests.length}</p>
                        </div>
                        <span class="material-symbols-outlined text-[#006a40] text-3xl">build</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    </section>
</div>
