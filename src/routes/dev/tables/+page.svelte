<script lang="ts">
  import { 
    Table, TableHeader, TableBody, TableRow, TableCell, TableHead, 
    TableCaption, TableToolbar, TablePagination, TableEmpty, TableLoading 
  } from '$lib/components/table';
  import { Button } from '$lib/components/button';
  import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from '$lib/components/card';

  // Interactive configurations
  let density = $state<'compact' | 'default' | 'comfortable'>('default');
  let isLoading = $state(false);
  let isEmpty = $state(false);
  let sticky = $state(false);

  // Pagination states
  let page = $state(1);
  let pageSize = $state(5);

  // Sorting states
  let sortColumn = $state<'name' | 'rent' | 'none'>('none');
  let sortDirection = $state<'asc' | 'desc' | 'none'>('none');

  // Row selection states
  let selectedIds = $state<number[]>([]);

  // Mock data
  const mockData = [
    { id: 1, name: 'Alice Jenkins', email: 'alice.j@example.com', property: 'Oakridge Manor', unit: 'Apt 4B', rent: 1850, status: 'paid' },
    { id: 2, name: 'Bob Henderson', email: 'bob.h@example.com', property: 'Maplewood Villas', unit: 'Apt 12C', rent: 2200, status: 'pending' },
    { id: 3, name: 'Charlie Miller', email: 'charlie.m@example.com', property: 'Oakridge Manor', unit: 'Apt 1A', rent: 1750, status: 'overdue' },
    { id: 4, name: 'Diana Prince', email: 'diana.p@example.com', property: 'Sunset Towers', unit: 'Penthouse 1', rent: 5400, status: 'paid' },
    { id: 5, name: 'Ethan Hunt', email: 'ethan.h@example.com', property: 'Maplewood Villas', unit: 'Apt 3D', rent: 2100, status: 'paid' },
    { id: 6, name: 'Fiona Gallagher', email: 'fiona.g@example.com', property: 'South Side Apartments', unit: 'Apt 2', rent: 1200, status: 'overdue' },
    { id: 7, name: 'George Clark', email: 'george.c@example.com', property: 'Oakridge Manor', unit: 'Apt 8F', rent: 1950, status: 'paid' },
    { id: 8, name: 'Hannah Abbott', email: 'hannah.a@example.com', property: 'Sunset Towers', unit: 'Apt 15B', rent: 2500, status: 'pending' },
    { id: 9, name: 'Ian Malcolm', email: 'ian.m@example.com', property: 'Jurassic Parks Apartments', unit: 'Bldg 4', rent: 3100, status: 'paid' },
    { id: 10, name: 'Julia Roberts', email: 'julia.r@example.com', property: 'Sunset Towers', unit: 'Apt 10A', rent: 2850, status: 'paid' },
    { id: 11, name: 'Kevin Bacon', email: 'kevin.b@example.com', property: 'South Side Apartments', unit: 'Apt 9', rent: 1450, status: 'pending' },
    { id: 12, name: 'Laura Croft', email: 'laura.c@example.com', property: 'Oakridge Manor', unit: 'Manor Estate', rent: 8500, status: 'paid' }
  ];

  // Sorting logic
  let sortedData = $derived.by(() => {
    let data = [...mockData];
    if (sortColumn === 'none' || sortDirection === 'none') {
      return data;
    }

    data.sort((a, b) => {
      let aVal = sortColumn === 'name' ? a.name : a.rent;
      let bVal = sortColumn === 'name' ? b.name : b.rent;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      } else {
        return sortDirection === 'asc' 
          ? (aVal as number) - (bVal as number) 
          : (bVal as number) - (aVal as number);
      }
    });

    return data;
  });

  // Pagination logic
  let paginatedData = $derived.by(() => {
    if (isEmpty) return [];
    const startIndex = (page - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  });

  // Total items computed count
  const totalItems = $derived(isEmpty ? 0 : mockData.length);

  // Checkbox selection triggers
  function handleSelectAll(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      selectedIds = paginatedData.map(item => item.id);
    } else {
      selectedIds = [];
    }
  }

  function handleSelectRow(id: number, checked: boolean) {
    if (checked) {
      if (!selectedIds.includes(id)) {
        selectedIds = [...selectedIds, id];
      }
    } else {
      selectedIds = selectedIds.filter(x => x !== id);
    }
  }

  const isAllSelected = $derived(
    paginatedData.length > 0 && paginatedData.every(item => selectedIds.includes(item.id))
  );

  // Handle Sort Change
  function handleSort(column: 'name' | 'rent', direction: 'asc' | 'desc' | 'none') {
    sortColumn = column;
    sortDirection = direction;
  }

  // Formatting helper
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  // Row Action Tracker
  function triggerAction(action: string, name: string) {
    alert(`Triggered action: "${action}" on tenant "${name}"`);
  }
</script>

<div class="min-h-screen bg-parchment text-charcoal font-sans p-6 md:p-10">
  <div class="max-w-6xl mx-auto space-y-10">
    <!-- Header -->
    <header class="border-b-4 border-double border-border-tan pb-6">
      <h1 class="font-serif font-bold text-3xl md:text-4xl text-primary tracking-tight">
        Data Grid Showcase
      </h1>
      <p class="font-sans text-slate-brown text-[16px] md:text-[18px] mt-2">
        A preview and visual testbed for the LeaseWorks reusable Data Grid component library, demonstrating sorting, selection, density modes, and responsiveness.
      </p>
    </header>

    <!-- Controls for Interactive Demos -->
    <section class="bg-white border border-border-tan rounded-sm p-4 flex flex-wrap items-center gap-4 shadow-sm">
      <div class="flex items-center gap-2">
        <span class="font-bold text-sm uppercase tracking-wider text-slate-brown font-sans">Density:</span>
        <select 
          class="h-9 border border-border-tan rounded-sm bg-white px-2 py-0 focus:outline-none focus:ring-1 focus:ring-primary text-charcoal"
          bind:value={density}
        >
          <option value="compact">Compact</option>
          <option value="default">Default</option>
          <option value="comfortable">Comfortable</option>
        </select>
      </div>

      <Button 
        variant="primary" 
        size="sm" 
        onclick={() => isLoading = !isLoading}
      >
        Toggle Loading: {isLoading ? 'ON' : 'OFF'}
      </Button>

      <Button 
        variant="secondary" 
        size="sm" 
        onclick={() => { isEmpty = !isEmpty; page = 1; }}
      >
        Toggle Empty: {isEmpty ? 'ON' : 'OFF'}
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        onclick={() => sticky = !sticky}
      >
        Toggle Sticky Header: {sticky ? 'ON' : 'OFF'}
      </Button>

      <div class="text-sm font-semibold text-charcoal font-sans ml-auto">
        Selected Rows: <span class="bg-primary/10 px-2 py-0.5 rounded text-primary font-mono">{selectedIds.length}</span>
      </div>
    </section>

    <!-- Main Grid Demo -->
    <Card>
      <CardHeader>
        <CardTitle>Tenant & Lease Directory</CardTitle>
        <CardSubtitle>Administrative ledger displaying current occupancy status, rental contracts, and unit bindings.</CardSubtitle>
      </CardHeader>
      
      <CardContent class="pt-4">
        <!-- Optional Toolbar -->
        <TableToolbar>
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-brown font-sans">Search:</span>
            <input 
              type="text" 
              placeholder="Filter tenants..." 
              class="h-8 w-48 px-3 border border-border-tan rounded-sm bg-white text-sm text-charcoal focus:ring-1 focus:ring-primary focus:outline-none"
              disabled
            />
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="xs" leftIcon="download" disabled={selectedIds.length === 0}>Export Selected</Button>
            <Button variant="danger" size="xs" leftIcon="delete" disabled={selectedIds.length === 0}>Archive Selected</Button>
          </div>
        </TableToolbar>

        <!-- Responsive Table Container -->
        <Table {density} {sticky}>
          <TableCaption>Authoritative ledger tracking active leases, tenant emails, monthly rents, and status codes.</TableCaption>
          
          <TableHeader>
            <TableRow hover={false}>
              <!-- Checkbox Header -->
              <TableHead class="w-12">
                <input 
                  type="checkbox" 
                  checked={isAllSelected} 
                  onchange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </TableHead>
              <TableHead sortable={true} sortDirection={sortColumn === 'name' ? sortDirection : 'none'} onsort={(dir) => handleSort('name', dir)}>
                Tenant Name
              </TableHead>
              <TableHead>Property Location</TableHead>
              <TableHead sortable={true} sortDirection={sortColumn === 'rent' ? sortDirection : 'none'} onsort={(dir) => handleSort('rent', dir)} class="text-right">
                Monthly Rent
              </TableHead>
              <TableHead class="text-center">Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {#if isLoading}
              <TableLoading rows={pageSize} cols={6} />
            {:else if isEmpty || paginatedData.length === 0}
              <TableEmpty colspan={6} message="No tenants match the current search filters." icon="search_off" />
            {:else}
              {#each paginatedData as item (item.id)}
                <TableRow selected={selectedIds.includes(item.id)}>
                  <!-- Checkbox Cell -->
                  <TableCell class="w-12">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item.id)}
                      onchange={(e) => handleSelectRow(item.id, (e.target as HTMLInputElement).checked)}
                      aria-label="Select row"
                    />
                  </TableCell>
                  
                  <!-- Tenant Details -->
                  <TableCell>
                    <div class="font-bold text-charcoal truncate max-w-[200px]" title={item.name}>{item.name}</div>
                    <div class="text-xs text-slate-brown truncate max-w-[200px]" title={item.email}>{item.email}</div>
                  </TableCell>

                  <!-- Location Details -->
                  <TableCell>
                    <div class="font-medium text-charcoal">{item.property}</div>
                    <div class="text-xs text-slate-brown font-semibold uppercase">{item.unit}</div>
                  </TableCell>

                  <!-- Currency Rent Details -->
                  <TableCell class="text-right font-serif font-bold text-charcoal">
                    {formatCurrency(item.rent)}
                  </TableCell>

                  <!-- Status Badge -->
                  <TableCell class="text-center">
                    {#if item.status === 'paid'}
                      <span class="badge-success">Paid</span>
                    {:else if item.status === 'pending'}
                      <span class="badge-warning">Pending</span>
                    {:else}
                      <span class="badge-error">Overdue</span>
                    {/if}
                  </TableCell>

                  <!-- Actions Cell -->
                  <TableCell class="text-right">
                    <div class="inline-flex gap-1.5">
                      <Button 
                        variant="secondary" 
                        size="xs" 
                        icon="edit" 
                        onclick={() => triggerAction('edit', item.name)} 
                        aria-label="Edit lease details" 
                      />
                      <Button 
                        variant="outline" 
                        size="xs" 
                        icon="mail" 
                        onclick={() => triggerAction('email', item.name)} 
                        aria-label="Send notification email" 
                      />
                    </div>
                  </TableCell>
                </TableRow>
              {/each}
            {/if}
          </TableBody>
        </Table>

        <!-- Pagination Footer Controls -->
        <TablePagination 
          page={page} 
          pageSize={pageSize} 
          totalItems={totalItems} 
          onpagechange={(p) => { page = p; selectedIds = []; }}
          onpagesizechange={(sz) => { pageSize = sz; page = 1; selectedIds = []; }}
        />
      </CardContent>
    </Card>
  </div>
</div>
