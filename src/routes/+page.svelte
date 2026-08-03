<script lang="ts">
    // Landing Page - Lease Works
</script>

<style>
    .hero-image-fade {
        opacity: 0;
        animation: imgFadeIn 0.3s ease-out 0.1s forwards;
    }
    @keyframes imgFadeIn {
        to { opacity: 1; }
    }
</style>

<div class="min-h-screen bg-white text-[#2B2A28] flex flex-col font-sans antialiased">
    <!-- Navbar -->
    <header class="bg-white border-b border-[#D6D4CD] sticky top-0 z-50">
        <div class="max-w-[1200px] mx-auto flex justify-between items-center px-6 md:px-12 h-20">
            <!-- Brand Logo -->
            <a href="/" class="text-primary hover:opacity-90 transition-opacity">
                <span class="text-3xl font-bold font-serif">Lease Works</span>
            </a>

            <!-- Mid Navigation Links -->
            <nav class="hidden md:flex items-center gap-8">
                <a
                    href="#"
                    class="text-[#2B2A28] hover:text-[#006a40] text-[15px] font-semibold transition-colors"
                    >Properties</a
                >
                <a
                    href="#"
                    class="text-[#2B2A28] hover:text-[#006a40] text-[15px] font-semibold transition-colors"
                    >Leases</a
                >
                <a
                    href="#"
                    class="text-[#2B2A28] hover:text-[#006a40] text-[15px] font-semibold transition-colors"
                    >Finance</a
                >
                <a
                    href="#"
                    class="text-[#2B2A28] hover:text-[#006a40] text-[15px] font-semibold transition-colors"
                    >Documents</a
                >
            </nav>

            <!-- Right Actions -->
            <div class="flex items-center gap-6">
                <!-- Sign In Button -->
                <a
                    href="/login"
                    class="bg-primary hover:bg-[#005230] !text-white px-6 py-2 rounded text-[15px] font-semibold transition-all shadow-sm"
                >
                    Sign In
                </a>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section
        class="relative min-h-[580px] flex items-center bg-cover bg-center"
        style="background-image: linear-gradient(to bottom, rgba(23, 29, 24, 0.45), rgba(23, 29, 24, 0.85)), url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80');"
    >
        <div
            class="max-w-[1200px] mx-auto w-full px-6 md:px-12 py-20 flex flex-col items-start text-left"
        >
            <div class="max-w-[700px] text-white space-y-6">
                <h1 class="text-4xl md:text-6xl font-serif font-bold tracking-tight leading-tight !text-white">
                    Preserving Legacy, Managing Progress.
                </h1>
                <p
                    class="text-lg md:text-xl text-gray-200 font-normal leading-relaxed opacity-95 max-w-[620px]"
                >
                    A dignified approach to property management. For landlords with 3+ properties
                    who value discretion, transparency, and institutional-grade reliability.
                </p>
                <div class="pt-4 flex flex-wrap gap-4">
                    <a
                        href="/login"
                        class="bg-[#006a40] hover:bg-[#005230] text-white px-8 py-3.5 rounded text-[16px] font-bold transition-all shadow-md"
                    >
                        Request a Proposal
                    </a>
                    <a
                        href="/login"
                        class="bg-transparent hover:bg-white/10 text-white border border-white px-8 py-3.5 rounded text-[16px] font-bold transition-all"
                    >
                        View Portfolio
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Three Value Columns -->
    <section class="bg-white border-b border-[#D6D4CD]">
        <div class="max-w-[1200px] mx-auto px-6 md:px-12 py-20">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                <!-- Column 1 -->
                <div class="flex flex-col items-center text-center space-y-4 max-w-[340px] mx-auto">
                    <div
                        class="w-12 h-12 rounded-lg bg-[#DCF1E4] text-[#006a40] flex items-center justify-center"
                    >
                        <span
                            class="material-symbols-outlined text-[28px]"
                            style="font-variation-settings: 'FILL' 0;">verified_user</span
                        >
                    </div>
                    <h3 class="text-xl font-bold text-[#2B2A28] font-sans">Reliability</h3>
                    <p class="text-[#6B6A65] text-[15px] leading-relaxed">
                        Quarterly inspections and proactive maintenance cycles ensure your physical
                        assets never depreciate in quality.
                    </p>
                </div>

                <!-- Column 2 -->
                <div class="flex flex-col items-center text-center space-y-4 max-w-[340px] mx-auto">
                    <div
                        class="w-12 h-12 rounded-lg bg-[#DCF1E4] text-[#006a40] flex items-center justify-center"
                    >
                        <span
                            class="material-symbols-outlined text-[28px]"
                            style="font-variation-settings: 'FILL' 0;">analytics</span
                        >
                    </div>
                    <h3 class="text-xl font-bold text-[#2B2A28] font-sans">Transparency</h3>
                    <p class="text-[#6B6A65] text-[15px] leading-relaxed">
                        Real-time financial dashboards and immutable document trails. Every penny
                        and policy accounted for.
                    </p>
                </div>

                <!-- Column 3 -->
                <div class="flex flex-col items-center text-center space-y-4 max-w-[340px] mx-auto">
                    <div
                        class="w-12 h-12 rounded-lg bg-[#DCF1E4] text-[#006a40] flex items-center justify-center"
                    >
                        <span
                            class="material-symbols-outlined text-[28px]"
                            style="font-variation-settings: 'FILL' 0;">vpn_key</span
                        >
                    </div>
                    <h3 class="text-xl font-bold text-[#2B2A28] font-sans">Ease of Use</h3>
                    <p class="text-[#6B6A65] text-[15px] leading-relaxed">
                        A modern digital portal designed for simplicity. Manage complex portfolios
                        with refined, intuitive tools.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Split Checklist Section -->
    <section class="bg-[#FAF9F6]">
        <div
            class="max-w-[1200px] mx-auto px-6 md:px-12 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
        >
            <!-- Left Side Content (Text block shifted to left) -->
            <div class="col-span-1 lg:col-span-7 space-y-6">
                <span
                    class="text-[#B8860B] font-bold text-[13px] uppercase tracking-widest block font-sans"
                >
                    Institutional Grade
                </span>
                <h2 class="text-3xl md:text-4xl font-serif font-bold text-[#2B2A28] leading-tight">
                    Designed for the Discerning Multi-Property Owner
                </h2>
                <p class="text-[#6B6A65] text-[16px] leading-relaxed">
                    Managing three or more properties requires more than just rent collection—it
                    requires strategic oversight. <strong class="text-[#2B2A28] font-semibold"
                        >Lease Works</strong
                    > offers a centralized hub for landlords with growing portfolios.
                </p>

                <!-- Checklist -->
                <div class="space-y-5 pt-4">
                    <!-- Check 1 -->
                    <div class="flex gap-4 items-start">
                        <div
                            class="w-6 h-6 rounded-full bg-[#DCF1E4] text-[#006a40] flex items-center justify-center flex-shrink-0 mt-0.5"
                        >
                            <span class="material-symbols-outlined text-[16px] font-bold"
                                >check</span
                            >
                        </div>
                        <div>
                            <h4 class="font-bold text-[#2B2A28] text-[16px]">
                                Consolidated Reporting
                            </h4>
                            <p class="text-[#6B6A65] text-[14px] leading-relaxed mt-0.5">
                                View the performance of your entire portfolio in a single,
                                high-level statement.
                            </p>
                        </div>
                    </div>
                    <!-- Check 2 -->
                    <div class="flex gap-4 items-start">
                        <div
                            class="w-6 h-6 rounded-full bg-[#DCF1E4] text-[#006a40] flex items-center justify-center flex-shrink-0 mt-0.5"
                        >
                            <span class="material-symbols-outlined text-[16px] font-bold"
                                >check</span
                            >
                        </div>
                        <div>
                            <h4 class="font-bold text-[#2B2A28] text-[16px]">
                                Compliance Automation
                            </h4>
                            <p class="text-[#6B6A65] text-[14px] leading-relaxed mt-0.5">
                                Automatic tracking of safety certificates and legal mandates across
                                different jurisdictions.
                            </p>
                        </div>
                    </div>
                    <!-- Check 3 -->
                    <div class="flex gap-4 items-start">
                        <div
                            class="w-6 h-6 rounded-full bg-[#DCF1E4] text-[#006a40] flex items-center justify-center flex-shrink-0 mt-0.5"
                        >
                            <span class="material-symbols-outlined text-[16px] font-bold"
                                >check</span
                            >
                        </div>
                        <div>
                            <h4 class="font-bold text-[#2B2A28] text-[16px]">Vendor Relations</h4>
                            <p class="text-[#6B6A65] text-[14px] leading-relaxed mt-0.5">
                                Access our vetted network of elite contractors who understand the
                                standard of a Lease Works.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Side Image (Hidden on mobile < 1024px, visible >= 1024px) -->
            <div class="hidden lg:block lg:col-span-5 h-full w-full">
                <img 
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80" 
                    alt="Property manager shaking hands with client" 
                    class="rounded-[12px] shadow-md w-full h-[450px] object-cover hero-image-fade"
                />
            </div>
        </div>
    </section>

    <!-- Ecosystem of Care -->
    <section class="bg-[#d5dcd4]">
        <div class="max-w-[1200px] mx-auto px-6 md:px-12 py-20 text-center space-y-12">
            <div class="space-y-3">
                <h2 class="text-3xl md:text-4xl font-serif font-bold text-[#2B2A28]">
                    The Ecosystem of Care
                </h2>
                <p class="text-[#6B6A65] text-[16px] max-w-[500px] mx-auto">
                    A seamless bridge between investors and residents.
                </p>
            </div>

            <!-- Two Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[960px] mx-auto text-left">
                <!-- Card 1: Landlords -->
                <div class="bg-white border border-[#D6D4CD] rounded p-8 shadow-sm space-y-6">
                    <div
                        class="flex items-center gap-3 text-[#006a40] border-b border-[#D6D4CD]/60 pb-4"
                    >
                        <span class="material-symbols-outlined text-[28px]">domain</span>
                        <h3 class="text-xl font-bold font-serif text-[#2B2A28]">For Landlords</h3>
                    </div>
                    <ul class="space-y-4">
                        <li class="flex items-start gap-3">
                            <span class="text-[#006a40] font-bold mt-1 text-[18px]">•</span>
                            <div>
                                <strong class="text-[#2B2A28] font-bold block">Onboarding</strong>
                                <span class="text-[#6B6A65] text-sm leading-relaxed block mt-0.5">
                                    Your dedicated account manager audits your portfolio and
                                    migrates all existing leases.
                                </span>
                            </div>
                        </li>
                        <li class="flex items-start gap-3">
                            <span class="text-[#006a40] font-bold mt-1 text-[18px]">•</span>
                            <div>
                                <strong class="text-[#2B2A28] font-bold block"
                                    >Active Management</strong
                                >
                                <span class="text-[#6B6A65] text-sm leading-relaxed block mt-0.5">
                                    We handle maintenance, tenant relations, and financial
                                    optimization cycles.
                                </span>
                            </div>
                        </li>
                        <li class="flex items-start gap-3">
                            <span class="text-[#006a40] font-bold mt-1 text-[18px]">•</span>
                            <div>
                                <strong class="text-[#2B2A28] font-bold block"
                                    >Growth & Insights</strong
                                >
                                <span class="text-[#6B6A65] text-sm leading-relaxed block mt-0.5">
                                    Monthly reviews and data-backed advice on expanding your estate
                                    holdings.
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- Card 2: Tenants -->
                <div class="bg-white border border-[#D6D4CD] rounded p-8 shadow-sm space-y-6">
                    <div
                        class="flex items-center gap-3 text-[#006a40] border-b border-[#D6D4CD]/60 pb-4"
                    >
                        <span class="material-symbols-outlined text-[28px]">home</span>
                        <h3 class="text-xl font-bold font-serif text-[#2B2A28]">For Tenants</h3>
                    </div>
                    <ul class="space-y-4">
                        <li class="flex items-start gap-3">
                            <span class="text-[#006a40] font-bold mt-1 text-[18px]">•</span>
                            <div>
                                <strong class="text-[#2B2A28] font-bold block"
                                    >Seamless Search</strong
                                >
                                <span class="text-[#6B6A65] text-sm leading-relaxed block mt-0.5">
                                    Browse curated, high-quality residences with detailed history
                                    and virtual tours.
                                </span>
                            </div>
                        </li>
                        <li class="flex items-start gap-3">
                            <span class="text-[#006a40] font-bold mt-1 text-[18px]">•</span>
                            <div>
                                <strong class="text-[#2B2A28] font-bold block"
                                    >Digital Living</strong
                                >
                                <span class="text-[#6B6A65] text-sm leading-relaxed block mt-0.5">
                                    Payment via autopay and report maintenance issues in seconds
                                    through the app.
                                </span>
                            </div>
                        </li>
                        <li class="flex items-start gap-3">
                            <span class="text-[#006a40] font-bold mt-1 text-[18px]">•</span>
                            <div>
                                <strong class="text-[#2B2A28] font-bold block"
                                    >Legacy Service</strong
                                >
                                <span class="text-[#6B6A65] text-sm leading-relaxed block mt-0.5">
                                    Experience the hospitality of a Lease Works, where every
                                    request is handled with priority.
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Bottom CTA Banner -->
    <section class="bg-[#006a40] text-white text-center py-20 px-6">
        <div class="max-w-[800px] mx-auto space-y-8">
            <h2 class="text-3xl md:text-5xl font-serif font-bold tracking-tight !text-white">
                Elevate Your Property Standards.
            </h2>
            <p class="text-gray-200 text-base md:text-lg max-w-[600px] mx-auto">
                Join the exclusive network of multi-property landlords who prioritize excellence
                over efficiency alone.
            </p>
            <div class="pt-2">
                <a
                    href="/login"
                    class="inline-block bg-white hover:bg-gray-100 !text-primary px-10 py-4 rounded font-bold text-[16px] transition-all shadow-md"
                >
                    Speak with a Consultant
                </a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-[#d5dcd4] border-t border-[#D6D4CD] py-12 px-6 md:px-12 text-[#6B6A65]">
        <div
            class="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6"
        >
            <div class="space-y-1 text-center md:text-left">
                <span class="text-2xl font-bold text-primary font-serif block"
                    >Lease Works</span
                >
                <span class="text-xs">© 2026 Lease Works Management. All rights reserved.</span>
            </div>

            <div class="flex flex-wrap justify-center gap-6 text-[14px]">
                <a href="#" class="underline hover:text-[#006a40] transition-colors"
                    >Contact Support</a
                >
                <a href="#" class="underline hover:text-[#006a40] transition-colors"
                    >Privacy Policy</a
                >
                <a href="#" class="underline hover:text-[#006a40] transition-colors"
                    >Terms of Service</a
                >
                <a href="#" class="underline hover:text-[#006a40] transition-colors"
                    >Tenant Handbook</a
                >
            </div>
        </div>
    </footer>
</div>
