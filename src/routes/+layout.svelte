<script lang="ts">
    import '../app.css';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';

    export let data: PageData;

    $: pathname = $page.url.pathname;
    $: user = data.user;

    // Check if we are on a public/auth route
    $: isPublicRoute = pathname === '/' || pathname.startsWith('/login');

    // Check if the current route is Landlord vs Tenant
    // Default to Landlord if role is LANDLORD or path starts with /landlord
    $: isLandlordView = pathname.startsWith('/landlord') || (user && user.role === 'LANDLORD' && !pathname.startsWith('/tenant'));
    $: isTenantView = pathname.startsWith('/tenant') || (user && user.role === 'TENANT' && !pathname.startsWith('/landlord'));

    async function handleSignOut() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            });
            if (response.ok) {
                // Clear state and redirect to login
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
                                        on:click={handleSignOut} 
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
    <!-- Landlord Sidebar Navigation Shell -->
    <div class="bg-[#f6f8f7] text-[#2B2A28] min-h-screen flex flex-row antialiased font-sans">
        <!-- Sidebar Navigation (240px wide) -->
        <aside class="w-[240px] bg-white border-r border-[#D6D4CD] flex-shrink-0 flex flex-col z-20">
            <!-- Sidebar Header -->
            <div class="p-8 pb-6 border-b border-[#D6D4CD]">
                <h1 class="text-2xl font-serif text-[#12a165] font-semibold leading-tight mb-1">Lease Works</h1>
                <p class="text-[14px] text-[#6B6A65] font-medium tracking-wide uppercase">Management</p>
            </div>

            <!-- Navigation Links -->
            <nav class="flex-1 py-6 flex flex-col gap-1">
                <a class="flex items-center gap-3 px-8 py-3 transition-all border-l-[3px] {pathname === '/landlord' ? 'bg-[#F0EFEA] border-[#B8860B] text-[#2B2A28] font-bold' : 'border-transparent text-[#6B6A65] hover:text-[#2B2A28] hover:bg-[#F0EFEA]'}" href="/landlord">
                    <span class="material-symbols-outlined text-[22px]">dashboard</span>
                    <span class="text-[16px] md:text-[18px]">Dashboard</span>
                </a>
                <a class="flex items-center gap-3 px-8 py-3 transition-all border-l-[3px] {pathname.startsWith('/landlord/properties') ? 'bg-[#F0EFEA] border-[#B8860B] text-[#2B2A28] font-bold' : 'border-transparent text-[#6B6A65] hover:text-[#2B2A28] hover:bg-[#F0EFEA]'}" href="/landlord">
                    <span class="material-symbols-outlined text-[22px]">domain</span>
                    <span class="text-[16px] md:text-[18px]">Properties</span>
                </a>
                <a class="flex items-center gap-3 px-8 py-3 transition-all border-l-[3px] border-transparent text-[#6B6A65] hover:text-[#2B2A28] hover:bg-[#F0EFEA] opacity-60 cursor-not-allowed" href="#" on:click|preventDefault>
                    <span class="material-symbols-outlined text-[22px]">group</span>
                    <span class="text-[16px] md:text-[18px]">Tenants</span>
                </a>
                <a class="flex items-center gap-3 px-8 py-3 transition-all border-l-[3px] border-transparent text-[#6B6A65] hover:text-[#2B2A28] hover:bg-[#F0EFEA] opacity-60 cursor-not-allowed" href="#" on:click|preventDefault>
                    <span class="material-symbols-outlined text-[22px]">account_balance</span>
                    <span class="text-[16px] md:text-[18px]">Finances</span>
                </a>
            </nav>

            <!-- Sidebar Footer (Logout) -->
            <div class="p-8 border-t border-[#D6D4CD]">
                <button on:click={handleSignOut} class="flex items-center gap-3 text-[#6B6A65] hover:text-[#ba1a1a] transition-colors w-full text-left font-semibold">
                    <span class="material-symbols-outlined text-[22px]">logout</span>
                    <span class="text-[16px]">Sign Out</span>
                </button>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 overflow-y-auto p-8 lg:p-12">
            <div class="max-w-[1200px] mx-auto">
                <slot />
            </div>
        </main>
    </div>
{/if}

<style>
    /* Global classes overrides if any */
    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>
