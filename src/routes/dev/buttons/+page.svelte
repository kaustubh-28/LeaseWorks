<script lang="ts">
  import { Button } from '$lib/components/button';
  import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from '$lib/components/card';
  
  let isGlobalLoading = $state(false);
  let isGlobalDisabled = $state(false);
  let clickCount = $state(0);
  
  function handleButtonClick() {
    clickCount += 1;
  }
</script>

<div class="min-h-screen bg-parchment text-charcoal font-sans p-6 md:p-10">
  <div class="max-w-6xl mx-auto space-y-10">
    <!-- Header -->
    <header class="border-b-4 border-double border-border-tan pb-6">
      <h1 class="font-serif font-bold text-3xl md:text-4xl text-primary tracking-tight">
        Button Component Showcase
      </h1>
      <p class="font-sans text-slate-brown text-[16px] md:text-[18px] mt-2">
        A preview and visual testbed for the LeaseWorks reusable Button component library, using the Card system for organization.
      </p>
    </header>

    <!-- Controls for Interactive Demos -->
    <section class="bg-white border border-border-tan rounded-sm p-4 flex flex-wrap items-center gap-4 shadow-sm">
      <span class="font-bold text-sm uppercase tracking-wider text-slate-brown font-sans">Showcase Controls:</span>
      <Button 
        variant="primary" 
        size="sm" 
        onclick={() => isGlobalLoading = !isGlobalLoading}
      >
        Toggle Loading: {isGlobalLoading ? 'ON' : 'OFF'}
      </Button>
      <Button 
        variant="secondary" 
        size="sm" 
        onclick={() => isGlobalDisabled = !isGlobalDisabled}
      >
        Toggle Disabled: {isGlobalDisabled ? 'ON' : 'OFF'}
      </Button>
      <div class="text-sm font-semibold text-charcoal font-sans ml-auto">
        Test Action Clicks: <span class="bg-primary/10 px-2.5 py-1 rounded text-primary font-mono">{clickCount}</span>
      </div>
    </section>

    <!-- Row 1: Button Variants -->
    <Card>
      <CardHeader>
        <CardTitle>1. Button Variants</CardTitle>
        <CardSubtitle>A complete set of branding and status buttons mapping to the double-ledger color palette</CardSubtitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Primary</span>
            <Button variant="primary" loading={isGlobalLoading} disabled={isGlobalDisabled} onclick={handleButtonClick}>Primary</Button>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Secondary</span>
            <Button variant="secondary" loading={isGlobalLoading} disabled={isGlobalDisabled} onclick={handleButtonClick}>Secondary</Button>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Outline</span>
            <Button variant="outline" loading={isGlobalLoading} disabled={isGlobalDisabled} onclick={handleButtonClick}>Outline</Button>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Ghost</span>
            <Button variant="ghost" loading={isGlobalLoading} disabled={isGlobalDisabled} onclick={handleButtonClick}>Ghost</Button>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Danger</span>
            <Button variant="danger" loading={isGlobalLoading} disabled={isGlobalDisabled} onclick={handleButtonClick}>Danger</Button>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Success</span>
            <Button variant="success" loading={isGlobalLoading} disabled={isGlobalDisabled} onclick={handleButtonClick}>Success</Button>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Warning</span>
            <Button variant="warning" loading={isGlobalLoading} disabled={isGlobalDisabled} onclick={handleButtonClick}>Warning</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Row 2: Sizes -->
    <Card>
      <CardHeader>
        <CardTitle>2. Sizing Scale</CardTitle>
        <CardSubtitle>From compact controls suitable for inline tables to prominent action triggers</CardSubtitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap items-end gap-6">
          <div class="flex flex-col items-center gap-2">
            <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Extra Small (XS)</span>
            <Button size="xs" variant="primary" loading={isGlobalLoading} disabled={isGlobalDisabled}>XS Button</Button>
          </div>
          <div class="flex flex-col items-center gap-2">
            <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Small (SM)</span>
            <Button size="sm" variant="primary" loading={isGlobalLoading} disabled={isGlobalDisabled}>SM Button</Button>
          </div>
          <div class="flex flex-col items-center gap-2">
            <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Medium (MD)</span>
            <Button size="md" variant="primary" loading={isGlobalLoading} disabled={isGlobalDisabled}>MD Button</Button>
          </div>
          <div class="flex flex-col items-center gap-2">
            <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Large (LG - Default)</span>
            <Button size="lg" variant="primary" loading={isGlobalLoading} disabled={isGlobalDisabled}>LG Button</Button>
          </div>
          <div class="flex flex-col items-center gap-2">
            <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Extra Large (XL)</span>
            <Button size="xl" variant="primary" loading={isGlobalLoading} disabled={isGlobalDisabled}>XL Button</Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Row 3: Icons & Icon-Only -->
    <Card>
      <CardHeader>
        <CardTitle>3. Icon Integration</CardTitle>
        <CardSubtitle>Supports left, right, and square icon-only formats using Google Material Symbols</CardSubtitle>
      </CardHeader>
      <CardContent class="space-y-8">
        <!-- Standard Button with Icons -->
        <div class="space-y-2">
          <h4 class="text-sm font-bold uppercase tracking-wider text-slate-brown font-sans">Icon Labels</h4>
          <div class="flex flex-wrap gap-4">
            <Button variant="primary" leftIcon="arrow_back">Go Back</Button>
            <Button variant="primary" rightIcon="arrow_forward">Continue</Button>
            <Button variant="secondary" leftIcon="cloud_upload">Upload File</Button>
            <Button variant="outline" rightIcon="open_in_new">External Link</Button>
            <Button variant="danger" leftIcon="delete">Delete Record</Button>
          </div>
        </div>

        <!-- Icon Only Square Buttons -->
        <div class="space-y-2">
          <h4 class="text-sm font-bold uppercase tracking-wider text-slate-brown font-sans">Icon Only (Square Aspect-Ratio)</h4>
          <div class="flex flex-wrap items-center gap-4">
            <Button size="xs" variant="primary" icon="search" aria-label="Search" />
            <Button size="sm" variant="secondary" icon="edit" aria-label="Edit" />
            <Button size="md" variant="outline" icon="share" aria-label="Share" />
            <Button size="lg" variant="danger" icon="delete" aria-label="Delete" />
            <Button size="xl" variant="success" icon="check" aria-label="Approve" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Row 4: Width & Tags -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card class="h-full">
        <CardHeader>
          <CardTitle>4. Full Width Buttons</CardTitle>
          <CardSubtitle>Adapts and fills the parent column width cleanly</CardSubtitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <Button variant="primary" fullWidth={true}>Solid Full Width</Button>
          <Button variant="secondary" fullWidth={true} leftIcon="save">Secondary Full Width</Button>
        </CardContent>
      </Card>

      <Card class="h-full">
        <CardHeader>
          <CardTitle>5. Elements & Accessibility</CardTitle>
          <CardSubtitle>Supports anchor links or standard action handlers</CardSubtitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Navigation Anchor (href)</span>
            <div class="flex gap-4">
              <Button href="/landlord" variant="primary">Landlord Portal</Button>
              <Button href="https://google.com" target="_blank" rel="noopener" variant="secondary" rightIcon="open_in_new">External</Button>
            </div>
          </div>
          <div class="flex flex-col gap-2 border-t border-border-tan/30 pt-4">
            <span class="text-xs font-bold text-slate-brown uppercase tracking-wider font-sans">Custom Layout Case: No Uppercase</span>
            <div>
              <Button variant="outline" uppercase={false}>Normal text casing</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
