<script lang="ts">
    import { goto } from '$app/navigation';

    let email = '';
    let password = '';
    let portalType: 'Landlord' | 'Tenant' = 'Landlord';
    let errorMessage = '';
    let loading = false;
    let showPassword = false;

    async function handleSubmit() {
        loading = true;
        errorMessage = '';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const userRole = data.role; // LANDLORD or TENANT
                
                if (portalType === 'Landlord' && userRole === 'LANDLORD') {
                    goto('/landlord');
                } else if (portalType === 'Tenant' && userRole === 'TENANT') {
                    goto('/tenant');
                } else {
                    // Redirect to their actual role portal anyway
                    if (userRole === 'LANDLORD') {
                        goto('/landlord');
                    } else {
                        goto('/tenant');
                    }
                }
            } else {
                errorMessage = data.message || 'Invalid email or password';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage = 'An unexpected error occurred. Please try again.';
        } finally {
            loading = false;
        }
    }
</script>

<div class="bg-parchment min-h-screen flex flex-col text-charcoal font-sans antialiased">
    <!-- Header Bar with Back to Homepage button -->
    <header class="h-16 bg-primary w-full shadow-sm flex items-center justify-between px-8 border-b border-border-tan flex-shrink-0">
        <a href="/" class="!text-white hover:opacity-80 transition-colors flex items-center gap-2 text-sm font-semibold">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Back to Homepage</span>
        </a>
    </header>

    <!-- Main Content -->
    <main class="flex-grow flex items-center justify-center p-6">
        <div class="w-full max-w-[480px]">
            <!-- Page Title -->
            <div class="text-center mb-8">
                <h1 class="text-[32px] font-semibold text-primary font-serif tracking-tight">
                    Lease Works Management
                </h1>
            </div>

            <!-- Login Card -->
            <div class="bg-white border border-border-tan rounded shadow-sm p-8 pb-10">
                <!-- Role Toggle Selection -->
                <div class="flex gap-4 mb-8">
                    <button
                        type="button"
                        class="flex cursor-pointer h-12 grow items-center justify-center overflow-hidden rounded px-2 text-[18px] font-semibold transition-all bg-white {portalType === 'Landlord' ? 'border-2 border-primary text-primary shadow-[0_1px_3px_rgba(0,0,0,0.1)] font-bold' : 'border border-border-tan text-slate-brown hover:text-charcoal font-medium'}"
                        on:click={() => portalType = 'Landlord'}
                    >
                        <span class="truncate">Landlord</span>
                    </button>
                    <button
                        type="button"
                        class="flex cursor-pointer h-12 grow items-center justify-center overflow-hidden rounded px-2 text-[18px] font-semibold transition-all bg-white {portalType === 'Tenant' ? 'border-2 border-primary text-primary shadow-[0_1px_3px_rgba(0,0,0,0.1)] font-bold' : 'border border-border-tan text-slate-brown hover:text-charcoal font-medium'}"
                        on:click={() => portalType = 'Tenant'}
                    >
                        <span class="truncate">Tenant</span>
                    </button>
                </div>

                <!-- Form -->
                <form on:submit|preventDefault={handleSubmit}>
                    <!-- Email Field -->
                    <div class="mb-6">
                        <label class="block text-[15px] font-semibold text-charcoal mb-2" for="email">
                            Email Address
                        </label>
                        <input
                            class="w-full h-12 px-4 border border-border-tan rounded text-[18px] text-charcoal focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors"
                            id="email"
                            name="email"
                            placeholder="name@example.com"
                            required
                            type="email"
                            bind:value={email}
                            disabled={loading}
                        />
                    </div>

                    <!-- Password Field -->
                    <div class="mb-8">
                        <label class="block text-[15px] font-semibold text-charcoal mb-2" for="password">
                            Password
                        </label>
                        <div class="relative">
                            <input
                                class="w-full h-12 pl-4 pr-12 border {errorMessage ? 'border-error' : 'border-border-tan'} rounded text-[18px] text-charcoal focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors"
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                required
                                type={showPassword ? 'text' : 'password'}
                                bind:value={password}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-brown hover:text-charcoal transition-colors focus:outline-none flex items-center justify-center p-1 bg-transparent border-none cursor-pointer"
                                on:click={() => showPassword = !showPassword}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                <span class="material-symbols-outlined text-[20px]">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                        <!-- Inline Validation Error -->
                        {#if errorMessage}
                            <p class="text-error text-[15px] mt-2 font-medium flex items-center gap-1">
                                <span class="material-symbols-outlined text-[18px]">error</span>
                                <span>{errorMessage}</span>
                            </p>
                        {/if}
                    </div>

                    <!-- Submit Button -->
                    <button
                        class="w-full h-12 bg-primary hover:bg-[#0f271a] !text-white text-[18px] font-semibold rounded tracking-[0.02em] transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-parchment disabled:opacity-70 disabled:cursor-not-allowed"
                        id="submitBtn"
                        type="submit"
                        disabled={loading}
                    >
                        {#if loading}
                            <span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            <span>Signing in as {portalType === 'Landlord' ? 'Landlord' : 'Tenant'}...</span>
                        {:else}
                            <span>Sign In as {portalType === 'Landlord' ? 'Landlord' : 'Tenant'}</span>
                        {/if}
                    </button>
                </form>

                <!-- Footer Links -->
                <div class="mt-8 flex flex-col items-center gap-3">
                    <a class="text-[15px] text-slate-brown hover:text-primary transition-colors font-medium" href="#" on:click|preventDefault>
                        Forgot your password?
                    </a>
                    <a 
                        class="text-[15px] text-slate-brown hover:text-primary hover:underline transition-colors font-medium" 
                        href="#" 
                        on:click|preventDefault={() => alert("Please contact Lease Works Management at portal@leaseworks.com to set up your account.")}
                    >
                        Don't have an account? Create one
                    </a>
                </div>
            </div>
        </div>
    </main>
</div>