<script lang="ts">
  import { Card, CardHeader, CardTitle, CardSubtitle, CardContent, CardFooter } from '$lib/components';
  
  let clickCount = $state(0);
  let isLoading = $state(false);
  let isEmpty = $state(false);

  function handleCardClick() {
    clickCount += 1;
  }
</script>

<div class="min-h-screen bg-parchment text-charcoal font-sans p-6 md:p-10">
  <div class="max-w-6xl mx-auto space-y-10">
    <!-- Header -->
    <header class="border-b-4 border-double border-border-tan pb-6">
      <h1 class="font-serif font-bold text-3xl md:text-4xl text-primary tracking-tight">
        Card Component Showcase
      </h1>
      <p class="font-sans text-slate-brown text-[16px] md:text-[18px] mt-2">
        A preview and visual testbed for the LeaseWorks reusable Card component system, built to adhere to the Classic Estate double-ledger aesthetic guidelines.
      </p>
    </header>

    <!-- Controls for Interactive Demos -->
    <section class="bg-white border border-border-tan rounded-sm p-4 flex flex-wrap items-center gap-4 shadow-sm">
      <span class="font-bold text-sm uppercase tracking-wider text-slate-brown font-sans">Interactive Controls:</span>
      <button 
        type="button" 
        class="h-10 px-4 bg-primary hover:bg-[#005230] text-white font-bold uppercase tracking-wider text-xs rounded-sm transition-all cursor-pointer border-none"
        onclick={() => isLoading = !isLoading}
      >
        Toggle Loading: {isLoading ? 'ON' : 'OFF'}
      </button>
      <button 
        type="button" 
        class="h-10 px-4 bg-white hover:bg-parchment text-charcoal border border-border-tan font-bold uppercase tracking-wider text-xs rounded-sm transition-all cursor-pointer"
        onclick={() => isEmpty = !isEmpty}
      >
        Toggle Empty: {isEmpty ? 'ON' : 'OFF'}
      </button>
      <div class="text-sm font-semibold text-charcoal font-sans">
        Interactive Clicks: <span class="bg-primary/10 px-2 py-0.5 rounded text-primary">{clickCount}</span>
      </div>
    </section>

    <!-- Row 1: Core Layouts & Variants -->
    <section class="space-y-6">
      <h2 class="font-serif font-bold text-xl md:text-2xl text-primary border-b border-border-tan pb-2">
        1. Core Compositions
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Complete Card -->
        <Card loading={isLoading} empty={isEmpty} emptyMessage="Property occupancy data is not available.">
          <CardHeader>
            {#snippet actions()}
              <span class="badge-success">Active</span>
            {/snippet}
            <CardTitle>Sunset Heights Apartments</CardTitle>
            <CardSubtitle>1044 Birch Street, Suite A</CardSubtitle>
          </CardHeader>
          <CardContent>
            <p class="mb-4">
              This card demonstrates a complete composition featuring a header (with title, subtitle, and badge actions), a content body, and a structured footer containing financial aggregates.
            </p>
            <div class="grid grid-cols-2 gap-4 border-t border-border-tan/30 pt-4">
              <div>
                <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Monthly Rent</span>
                <p class="font-serif text-lg font-bold text-charcoal">$2,450.00</p>
              </div>
              <div>
                <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Security Deposit</span>
                <p class="font-serif text-lg font-bold text-charcoal">$3,000.00</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <span class="text-xs text-slate-brown font-sans">Lease term ends Dec 31, 2026</span>
            <button class="text-xs text-primary font-bold hover:underline bg-transparent border-none cursor-pointer font-sans">
              View Details →
            </button>
          </CardFooter>
        </Card>

        <!-- Borderless Subcomponents & No Divider Card -->
        <Card loading={isLoading} empty={isEmpty}>
          <CardHeader bordered={false}>
            {#snippet actions()}
              <button class="flex items-center text-slate-brown hover:text-charcoal bg-transparent border-none cursor-pointer" aria-label="More options">
                <span class="material-symbols-outlined text-[20px]">more_vert</span>
              </button>
            {/snippet}
            <CardTitle>Minimalist Layout</CardTitle>
            <CardSubtitle>No Section Dividers</CardSubtitle>
          </CardHeader>
          <CardContent>
            <p>
              This card contains a header and footer but removes the border-bottom and border-top dividers (`bordered={false}`). It achieves a clean, open layout while preserving typography and consistent margins.
            </p>
          </CardContent>
          <CardFooter bordered={false}>
            <span class="text-xs font-semibold text-slate-brown font-sans">Last updated 2 hours ago</span>
          </CardFooter>
        </Card>
      </div>
    </section>

    <!-- Row 2: Elevation & Border Variants -->
    <section class="space-y-6">
      <h2 class="font-serif font-bold text-xl md:text-2xl text-primary border-b border-border-tan pb-2">
        2. Elevation & Border Styles
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card elevation="none">
          <CardContent class="py-6">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-brown font-sans">Elevation: None</span>
            <p class="mt-2 text-sm">Flat card with no box-shadow. Ideal for embedding inside larger panels or containers.</p>
          </CardContent>
        </Card>

        <Card elevation="sm">
          <CardContent class="py-6">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-brown font-sans">Elevation: Small (Default)</span>
            <p class="mt-2 text-sm">Subtle shadow-sm mapping. Replicates standard physical index cards on parchment.</p>
          </CardContent>
        </Card>

        <Card elevation="md">
          <CardContent class="py-6">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-brown font-sans">Elevation: Medium</span>
            <p class="mt-2 text-sm">Enhanced depth using shadow-md. Useful for overlaying menus or prominent sections.</p>
          </CardContent>
        </Card>

        <Card bordered={false} elevation="xl" class="bg-white">
          <CardContent class="py-6">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-brown font-sans">No Border + Shadow XL</span>
            <p class="mt-2 text-sm">Removes the outer border and adds a prominent shadow-xl overlaying the page context.</p>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Row 3: Highlighted & Status Variants -->
    <section class="space-y-6">
      <h2 class="font-serif font-bold text-xl md:text-2xl text-primary border-b border-border-tan pb-2">
        3. Double-Ledger Highlights
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card highlighted={true} highlightColor="primary">
          <CardContent class="py-6">
            <div class="flex items-center gap-2 mb-2 text-primary">
              <span class="material-symbols-outlined text-[20px]">check_circle</span>
              <span class="text-xs font-bold uppercase tracking-widest font-sans">Primary Highlight</span>
            </div>
            <p class="text-sm">Includes an emerald green left border. Best utilized for representing active, completed, or authorized landlord states.</p>
          </CardContent>
        </Card>

        <Card highlighted={true} highlightColor="secondary">
          <CardContent class="py-6">
            <div class="flex items-center gap-2 mb-2 text-secondary">
              <span class="material-symbols-outlined text-[20px]">warning</span>
              <span class="text-xs font-bold uppercase tracking-widest font-sans">Secondary Highlight</span>
            </div>
            <p class="text-sm">Includes a golden/secondary left border. Best utilized for warnings, pending invoices, or attention requirements.</p>
          </CardContent>
        </Card>

        <Card highlighted={true} highlightColor="error">
          <CardContent class="py-6">
            <div class="flex items-center gap-2 mb-2 text-error">
              <span class="material-symbols-outlined text-[20px]">error</span>
              <span class="text-xs font-bold uppercase tracking-widest font-sans">Error / Urgent Highlight</span>
            </div>
            <p class="text-sm">Includes a ledger red left border. Best utilized for overdue rent bills, emergencies, or critical technical errors.</p>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Row 4: Clickable & Interactive Actions -->
    <section class="space-y-6">
      <h2 class="font-serif font-bold text-xl md:text-2xl text-primary border-b border-border-tan pb-2">
        4. Interactive & Clickable Cards (Accessibility focus)
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Clickable Button Card -->
        <Card clickable={true} onclick={handleCardClick} class="text-left">
          <CardHeader>
            <CardTitle>Interactive Action Card</CardTitle>
            <CardSubtitle>Compiles as a native &lt;button&gt;</CardSubtitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm mb-4">
              When a `clickable` prop is provided (without a `href`), the component automatically compiles as an HTML `<button>`. 
              This provides native accessibility: keyboard navigation (Tab), screen reader voice-overs, and standard form lifecycle handlers.
            </p>
            <div class="bg-parchment p-3 rounded-sm text-xs font-mono text-slate-brown">
              &lt;Card clickable={"{true}"} onclick={"{handleCardClick}"}&gt;
            </div>
          </CardContent>
          <CardFooter>
            <span class="text-xs font-bold text-primary uppercase font-sans">Click this card to increment count</span>
            <span class="material-symbols-outlined text-primary text-[20px]">arrow_forward</span>
          </CardFooter>
        </Card>

        <!-- Clickable Link Card -->
        <Card clickable={true} href="/landlord" class="text-left">
          <CardHeader>
            <CardTitle>Navigation Link Card</CardTitle>
            <CardSubtitle>Compiles as an &lt;a&gt; element</CardSubtitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm mb-4">
              Passing a `href` prop alongside `clickable` compiles the card as an HTML anchor link (`&lt;a&gt;`). It inherits full hover transitions and focus ring indicators while navigating to standard SvelteKit layout routes.
            </p>
            <div class="bg-parchment p-3 rounded-sm text-xs font-mono text-slate-brown">
              &lt;Card clickable={"{true}"} href="/landlord"&gt;
            </div>
          </CardContent>
          <CardFooter>
            <span class="text-xs font-bold text-primary uppercase font-sans">Navigates to Landlord Dashboard</span>
            <span class="material-symbols-outlined text-primary text-[20px]">open_in_new</span>
          </CardFooter>
        </Card>
      </div>
    </section>

    <!-- Row 5: Padding Configuration -->
    <section class="space-y-6">
      <h2 class="font-serif font-bold text-xl md:text-2xl text-primary border-b border-border-tan pb-2">
        5. Spacing & Padding Scale
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <!-- None -->
        <Card padding="none" class="bg-white">
          <CardHeader><CardTitle class="text-[16px] px-3 pt-3">None</CardTitle></CardHeader>
          <CardContent class="p-3 bg-parchment/40 text-xs">No padding (`p-0`). Useful when custom grid templates or nested graphics require flush alignment.</CardContent>
        </Card>

        <!-- Small -->
        <Card padding="sm">
          <CardHeader><CardTitle class="text-[16px]">Small</CardTitle></CardHeader>
          <CardContent class="text-xs">Compact layout (`p-4`). Ideal for dense utility logs, side panels, and small list nodes.</CardContent>
        </Card>

        <!-- Medium -->
        <Card padding="md">
          <CardHeader><CardTitle class="text-[16px]">Medium</CardTitle></CardHeader>
          <CardContent class="text-xs">Standard layout spacing (`p-6`). Offers comfortable reading margins for text blocks.</CardContent>
        </Card>

        <!-- Large -->
        <Card padding="lg">
          <CardHeader><CardTitle class="text-[16px]">Large</CardTitle></CardHeader>
          <CardContent class="text-xs">Padded details (`p-8`). Best suited for central dashboard reports and layout summaries.</CardContent>
        </Card>

        <!-- Extra Large -->
        <Card padding="xl">
          <CardHeader><CardTitle class="text-[16px]">Extra Large</CardTitle></CardHeader>
          <CardContent class="text-xs">Generous negative space (`p-10`). Preferred for landing hero containers or main forms.</CardContent>
        </Card>
      </div>
    </section>

    <!-- Row 6: Empty States and Custom Fallbacks -->
    <section class="space-y-6">
      <h2 class="font-serif font-bold text-xl md:text-2xl text-primary border-b border-border-tan pb-2">
        6. Empty States
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Default Empty State -->
        <Card empty={true}>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <!-- Content will be hidden since empty=true -->
            This content is hidden.
          </CardContent>
        </Card>

        <!-- Custom Empty State -->
        <Card 
          empty={true} 
          emptyMessage="No pending maintenance requests reported this month." 
          emptyIcon="construction"
        >
          <CardHeader>
            <CardTitle>Maintenance Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            This content is hidden.
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</div>
