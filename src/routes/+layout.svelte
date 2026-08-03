<script lang="ts">
    import '../app.css';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    $: pathname = $page.url.pathname;
    $: user = data.user;
    $: urgentAlert = data.urgentAlert;

    // Check if we are on a public/auth route
    $: isPublicRoute = pathname === '/' || pathname.startsWith('/login');

    // Landlord vs Tenant views
    $: isLandlordView = pathname.startsWith('/landlord') || 
                        pathname.startsWith('/buildings') || 
                        pathname.startsWith('/apartments') || 
                        pathname.startsWith('/tenants') || 
                        pathname.startsWith('/leases') || 
                        pathname.startsWith('/costs') || 
                        pathname.startsWith('/meters') || 
                        (user && user.role === 'LANDLORD' && !pathname.startsWith('/tenant'));

    $: isTenantView = pathname.startsWith('/tenant') || 
                      (user && user.role === 'TENANT' && !isLandlordView);

    // Responsive and collapsible sidebar state
    let isMobile = false;
    let isTablet = false;
    let isSidebarOpenMobile = false; // Mobile drawer toggle
    let sidebarCollapsed = false;

    function handleResize() {
        if (typeof window === 'undefined') return;
        const width = window.innerWidth;
        isMobile = width < 768;
        isTablet = width >= 768 && width < 1024;

        if (isTablet) {
            sidebarCollapsed = true;
        } else if (!isMobile) {
            const stored = localStorage.getItem('sidebarCollapsed');
            sidebarCollapsed = stored === 'true';
        }
    }

    onMount(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    });

    function toggleSidebar() {
        if (isMobile) {
            isSidebarOpenMobile = !isSidebarOpenMobile;
        } else {
            sidebarCollapsed = !sidebarCollapsed;
            localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
        }
    }

    async function handleSignOut() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            });
            if (response.ok) {
                goto('/login');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }
</script>

{#if isPublicRoute}
    <!-- Public landing / auth shell -->
    <slot />
{:else if isTenantView}
    <!-- Tenant Top Navigation Shell -->
    <div class="bg-[#FAF9F6] text-[#2B2A28] antialiased min-h-screen flex flex-col font-sans">
        <!-- Top Nav Bar -->
        <div class="relative flex h-auto w-full flex-col bg-white border-b border-solid border-[#D6D4CD] z-30">
            <div class="layout-container flex h-full grow flex-col w-full">
                <div class="px-4 md:px-10 flex flex-1 justify-center py-0">
                    <div class="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
                        <header class="flex items-center justify-between whitespace-nowrap px-0 py-4">
                            <!-- Logo -->
                            <a href="/tenant" class="flex items-center gap-2 text-[#006a40] hover:opacity-90 transition-opacity">
                                <div class="size-6 text-[#006a40] flex items-center justify-center">
                                    <span class="material-symbols-outlined text-2xl font-bold">account_balance</span>
                                </div>
                                <h2 class="text-[#006a40] text-xl font-bold leading-tight tracking-[-0.015em] font-serif">
                                    Lease Works
                                </h2>
                            </a>

                            <!-- Navigation Links -->
                            <div class="flex flex-1 justify-end items-center gap-4 md:gap-8">
                                <div class="flex items-center gap-6 md:gap-8">
                                    <a class="text-[#2B2A28] text-[16px] md:text-[18px] font-semibold leading-normal hover:text-[#006a40] transition-colors {pathname === '/tenant' ? 'text-[#006a40] underline decoration-2 underline-offset-4' : ''}" href="/tenant">
                                        Dashboard
                                    </a>
                                    <a class="text-[#2B2A28] text-[16px] md:text-[18px] font-semibold leading-normal hover:text-[#006a40] transition-colors {pathname.startsWith('/tenant/maintenance') ? 'text-[#006a40] underline decoration-2 underline-offset-4' : ''}" href="/tenant/maintenance/new">
                                        Maintenance
                                    </a>
                                </div>

                                <!-- User Profile & Logout -->
                                <div class="flex items-center gap-3 border-l border-[#D6D4CD] pl-4 md:pl-8">
                                    <span class="hidden sm:inline text-sm text-[#6B6A65] font-medium">
                                        {user?.name || 'Tenant'}
                                    </span>
                                    <button 
                                        onclick={handleSignOut} 
                                        class="flex items-center justify-center p-2 text-[#6B6A65] hover:text-[#ba1a1a] rounded-full hover:bg-gray-100 transition-all"
                                        title="Sign Out"
                                    >
                                        <span class="material-symbols-outlined text-[22px]">logout</span>
                                    </button>
                                </div>
                            </div>
                        </header>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content Area -->
        <main class="flex-1 w-full max-w-[800px] mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
            <slot />
        </main>

        <!-- Footer -->
        <footer class="bg-[#d5dcd4] border-t border-[#D6D4CD] py-6 px-4 mt-auto">
            <div class="max-w-[800px] mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-[#6B6A65]">
                <span class="font-bold text-[#006a40] mb-2 md:mb-0">Lease Works</span>
                <p>© 2026 Lease Works Management. All rights reserved.</p>
            </div>
        </footer>
    </div>
{:else}
    <!-- Landlord Collapsible Navigation Shell -->
    <div class="bg-[#FAF9F6] text-[#2B2A28] min-h-screen flex flex-col antialiased font-sans">
        <!-- Sticky Golden Alert Banner at the absolute top of the viewport -->
        {#if urgentAlert}
            <div class="bg-[#C58B12] text-white py-3 px-6 md:px-10 flex items-center justify-between z-40 border-b border-[#AF790E] shadow-sm select-none">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined font-bold text-[20px]">warning</span>
                    <span class="font-sans text-[15px] font-semibold">
                        Urgent: {urgentAlert.title} at {urgentAlert.apartment.building.name} (Apt {urgentAlert.apartment.name})
                    </span>
                </div>
                <a href="/landlord/apartments/{urgentAlert.apartmentId}" class="bg-[#8A5E07] hover:bg-[#724D04] text-white text-[13px] font-bold uppercase tracking-wider px-4 py-1.5 rounded transition-all">
                    View Request
                </a>
            </div>
        {/if}

        <div class="flex-1 flex flex-row relative min-h-0">
            <!-- Sidebar Navigation Overlay Backdrop (Mobile only) -->
            {#if isMobile && isSidebarOpenMobile}
                <button
                    class="fixed inset-0 bg-charcoal/40 backdrop-blur-xs z-40 transition-opacity w-full h-full border-none outline-none cursor-default"
                    onclick={() => isSidebarOpenMobile = false}
                    aria-label="Close sidebar drawer"
                ></button>
            {/if}

            <!-- Sidebar Panel -->
            <aside 
                class="bg-white border-r border-[#D6D4CD] flex-shrink-0 flex flex-col z-40 transition-[width] duration-300 ease-in-out h-screen sticky top-0
                    {isMobile 
                        ? `fixed top-0 left-0 w-[240px] transform ${isSidebarOpenMobile ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300` 
                        : sidebarCollapsed ? 'w-[76px]' : 'w-[240px]'}"
            >
                <!-- Sidebar Header & Toggle -->
                <div class="p-6 border-b border-[#D6D4CD] flex items-center justify-between overflow-hidden">
                    <a href="/landlord" class="flex items-center gap-2.5 overflow-hidden">
                        <div class="size-8 rounded-sm bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <span class="material-symbols-outlined text-[20px] font-bold">account_balance</span>
                        </div>
                        {#if !sidebarCollapsed || isMobile}
                            <div class="flex flex-col whitespace-nowrap transition-opacity duration-300">
                                <h1 class="text-lg font-serif text-primary font-bold leading-tight">Classic Estate</h1>
                                <p class="text-[10px] text-slate-brown font-bold tracking-widest uppercase">Management</p>
                            </div>
                        {/if}
                    </a>
                    
                    {#if !isMobile}
                        <button 
                            onclick={toggleSidebar} 
                            class="text-slate-brown hover:text-charcoal hover:bg-parchment p-1 rounded-sm transition-all focus:outline-none"
                            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <span class="material-symbols-outlined text-[20px]">
                                {sidebarCollapsed ? 'arrow_forward_ios' : 'arrow_back_ios'}
                            </span>
                        </button>
                    {/if}
                </div>

                <!-- Navigation Links -->
                <nav class="flex-1 py-6 flex flex-col gap-1 overflow-y-auto select-none">
                    <!-- Dashboard -->
                    <a 
                        class="flex items-center gap-3 px-6 py-3 transition-all border-l-4 
                            {pathname === '/landlord' 
                                ? 'bg-parchment border-primary text-charcoal font-bold' 
                                : 'border-transparent text-slate-brown hover:text-charcoal hover:bg-parchment/60'}" 
                        href="/landlord"
                        onclick={() => { if (isMobile) isSidebarOpenMobile = false; }}
                    >
                        <span class="material-symbols-outlined text-[22px]">dashboard</span>
                        {#if !sidebarCollapsed || isMobile}
                            <span class="text-[16px] font-medium transition-opacity duration-300">Dashboard</span>
                        {/if}
                    </a>

                    <!-- Properties -->
                    <a 
                        class="flex items-center gap-3 px-6 py-3 transition-all border-l-4 
                            {pathname.startsWith('/buildings') || pathname.startsWith('/landlord/buildings')
                                ? 'bg-parchment border-primary text-charcoal font-bold' 
                                : 'border-transparent text-slate-brown hover:text-charcoal hover:bg-parchment/60'}" 
                        href="/buildings"
                        onclick={() => { if (isMobile) isSidebarOpenMobile = false; }}
                    >
                        <span class="material-symbols-outlined text-[22px]">domain</span>
                        {#if !sidebarCollapsed || isMobile}
                            <span class="text-[16px] font-medium transition-opacity duration-300">Properties</span>
                        {/if}
                    </a>

                    <!-- Apartments (Units) -->
                    <a 
                        class="flex items-center gap-3 px-6 py-3 transition-all border-l-4 
                            {pathname.startsWith('/apartments') || pathname.startsWith('/landlord/apartments')
                                ? 'bg-parchment border-primary text-charcoal font-bold' 
                                : 'border-transparent text-slate-brown hover:text-charcoal hover:bg-parchment/60'}" 
                        href="/apartments"
                        onclick={() => { if (isMobile) isSidebarOpenMobile = false; }}
                    >
                        <span class="material-symbols-outlined text-[22px]">key</span>
                        {#if !sidebarCollapsed || isMobile}
                            <span class="text-[16px] font-medium transition-opacity duration-300">Units</span>
                        {/if}
                    </a>

                    <!-- Tenants -->
                    <a 
                        class="flex items-center gap-3 px-6 py-3 transition-all border-l-4 
                            {pathname.startsWith('/tenants') 
                                ? 'bg-parchment border-primary text-charcoal font-bold' 
                                : 'border-transparent text-slate-brown hover:text-charcoal hover:bg-parchment/60'}" 
                        href="/tenants"
                        onclick={() => { if (isMobile) isSidebarOpenMobile = false; }}
                    >
                        <span class="material-symbols-outlined text-[22px]">group</span>
                        {#if !sidebarCollapsed || isMobile}
                            <span class="text-[16px] font-medium transition-opacity duration-300">Tenants</span>
                        {/if}
                    </a>

                    <!-- Leases -->
                    <a 
                        class="flex items-center gap-3 px-6 py-3 transition-all border-l-4 
                            {pathname.startsWith('/leases') 
                                ? 'bg-parchment border-primary text-charcoal font-bold' 
                                : 'border-transparent text-slate-brown hover:text-charcoal hover:bg-parchment/60'}" 
                        href="/leases"
                        onclick={() => { if (isMobile) isSidebarOpenMobile = false; }}
                    >
                        <span class="material-symbols-outlined text-[22px]">assignment</span>
                        {#if !sidebarCollapsed || isMobile}
                            <span class="text-[16px] font-medium transition-opacity duration-300">Leases</span>
                        {/if}
                    </a>

                    <!-- Finances (Costs) -->
                    <a 
                        class="flex items-center gap-3 px-6 py-3 transition-all border-l-4 
                            {pathname.startsWith('/costs') 
                                ? 'bg-parchment border-primary text-charcoal font-bold' 
                                : 'border-transparent text-slate-brown hover:text-charcoal hover:bg-parchment/60'}" 
                        href="/costs"
                        onclick={() => { if (isMobile) isSidebarOpenMobile = false; }}
                    >
                        <span class="material-symbols-outlined text-[22px]">account_balance</span>
                        {#if !sidebarCollapsed || isMobile}
                            <span class="text-[16px] font-medium transition-opacity duration-300">Finances</span>
                        {/if}
                    </a>
                </nav>

                <!-- Sidebar Footer (Logout) -->
                <div class="p-6 border-t border-[#D6D4CD]">
                    <button 
                        onclick={handleSignOut} 
                        class="flex items-center gap-3 text-slate-brown hover:text-[#ba1a1a] transition-colors w-full text-left font-bold"
                    >
                        <span class="material-symbols-outlined text-[22px]">logout</span>
                        {#if !sidebarCollapsed || isMobile}
                            <span class="text-[16px]">Sign Out</span>
                        {/if}
                    </button>
                </div>
            </aside>

            <!-- Main Content Area -->
            <div class="flex-1 flex flex-col min-w-0 min-h-screen">
                <!-- Mobile Header (Mobile only) -->
                {#if isMobile}
                    <header class="bg-white border-b border-[#D6D4CD] h-16 flex items-center px-6 justify-between flex-shrink-0 sticky top-0 z-30">
                        <button 
                            onclick={() => isSidebarOpenMobile = true} 
                            class="text-slate-brown hover:text-charcoal p-1 rounded-sm focus:outline-none"
                            aria-label="Open navigation drawer"
                        >
                            <span class="material-symbols-outlined text-[26px]">menu</span>
                        </button>
                        <h2 class="text-primary font-serif font-bold text-lg">Classic Estate</h2>
                        <div class="w-8"></div> <!-- Spacer -->
                    </header>
                {/if}

                <!-- Scrollable Content Frame -->
                <main class="flex-1 overflow-y-auto p-6 md:p-10 lg:p-14">
                    <div class="max-w-[1100px] mx-auto w-full">
                        <slot />
                    </div>
                </main>
            </div>
        </div>
    </div>
{/if}
