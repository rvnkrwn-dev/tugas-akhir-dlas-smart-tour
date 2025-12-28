<template>
    <div class="space-y-6 max-w-full overflow-hidden">
        <!-- Header & Controls -->
        <!-- Header & Controls -->
        <div class="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 class="text-xl sm:text-2xl font-semibold text-[#333] mb-1">Beranda</h1>
                    <p class="text-xs sm:text-sm text-[#666]">Ringkasan performa bisnis Anda</p>
                </div>
                <div class="flex items-center gap-3">
                    <button @click="refreshData"
                        class="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-green-600 transition-colors">
                        <svg class="w-5 h-5" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="border-b border-gray-200">
            <nav class="flex space-x-8 overflow-x-auto" aria-label="Tabs">
                <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                    :class="[activeTab === tab.id ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors']">
                    {{ tab.name }}
                </button>
            </nav>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading && !isRefreshing" class="py-20 flex justify-center">
            <div class="flex flex-col items-center">
                <div class="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3">
                </div>
                <p class="text-gray-500 text-sm">Memuat analitik...</p>
            </div>
        </div>

        <!-- Content Area -->
        <div v-else class="space-y-6">
            <!-- OVERVIEW TAB -->
            <div v-if="activeTab === 'overview'" class="space-y-6">
                <!-- KPI Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="(card, index) in overviewCards" :key="index"
                        class="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all duration-200">
                        <!-- Icon -->
                        <div class="mb-4">
                            <div
                                :class="`w-11 h-11 bg-gradient-to-br ${card.bgGradient} rounded-xl flex items-center justify-center`">
                                <component :is="card.icon" :class="`w-5 h-5 ${card.iconColor}`" />
                            </div>
                        </div>

                        <!-- Value -->
                        <h3 class="text-2xl font-bold text-gray-900 mb-1.5 truncate">{{ card.value }}</h3>

                        <!-- Label -->
                        <p class="text-sm text-gray-500 font-medium mb-3">{{ card.label }}</p>

                        <!-- Badge or Trend -->
                        <div v-if="card.badge" class="flex items-center">
                            <span
                                :class="`inline-flex items-center text-[10px] font-bold uppercase tracking-wide ${card.badgeColor} px-2 py-0.5 rounded-md`">
                                {{ card.badge }}
                            </span>
                        </div>
                        <div v-else-if="card.trend !== undefined && card.trend !== null"
                            class="flex items-center text-xs font-semibold"
                            :class="card.trend > 0 ? 'text-green-600' : (card.trend < 0 ? 'text-red-600' : 'text-gray-500')">
                            <svg v-if="card.trend > 0" class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <svg v-else-if="card.trend < 0" class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                            <span>{{ card.trend > 0 ? '+' : '' }}{{ card.trend }}%</span>
                            <span class="text-gray-400 font-normal ml-1">vs sebelumnya</span>
                        </div>
                    </div>
                </div>

                <!-- Transaction & Payment Status Widgets -->
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <!-- Transactions Status -->
                    <div class="bg-white rounded-2xl p-6 border border-gray-200">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <component :is="ShoppingCartIcon" class="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 class="text-lg font-bold text-gray-800">Ringkasan Transaksi</h3>
                        </div>

                        <div class="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p class="text-sm text-gray-500 mb-2">Pendapatan Hari Ini</p>
                                <p class="text-2xl font-bold text-gray-900">{{
                                    formatCurrency(transactionsWidget.todayRevenue) }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 mb-2">Tingkat Konversi</p>
                                <p class="text-2xl font-bold text-blue-600">{{ transactionsWidget.conversionRate }}%</p>
                            </div>
                        </div>

                        <div class="pt-2 border-t border-gray-100">

                            <button @click="showTransactionModal = true"
                                class="w-full mt-4 px-4 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Lihat Detail Lengkap
                            </button>
                        </div>
                    </div>

                    <!-- Payments Status -->
                    <div class="bg-white rounded-2xl p-6 border border-gray-200">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <component :is="CreditCardIcon" class="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 class="text-lg font-bold text-gray-800">Ringkasan Pembayaran</h3>
                        </div>

                        <div class="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p class="text-sm text-gray-500 mb-2">Jumlah Hari Ini</p>
                                <p class="text-2xl font-bold text-gray-900">{{
                                    formatCurrency(paymentsWidget.todayAmount) }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 mb-2">Tingkat Sukses</p>
                                <p class="text-2xl font-bold text-indigo-600">{{ paymentsWidget.successRate }}%</p>
                            </div>
                        </div>

                        <div class="pt-2 border-t border-gray-100">
                            <button @click="showPaymentModal = true"
                                class="w-full mt-4 px-4 py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Lihat Detail Lengkap
                            </button>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <!-- Revenue Trend -->
                    <div class="xl:col-span-2 bg-white rounded-2xl p-5 border border-gray-200">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">Tren Pendapatan</h3>
                        <div class="h-80">
                            <Line v-if="charts.revenueTrend" :data="charts.revenueTrend" :options="lineChartOptions" />
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white rounded-2xl p-5 border border-gray-200 flex flex-col">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">Aktivitas Terbaru</h3>
                        <div class="flex-1 overflow-y-auto max-h-80 custom-scrollbar pr-2 space-y-4">
                            <div v-if="!recentActivities.length" class="text-center py-8 text-gray-400 text-sm">
                                Tidak ada aktivitas terbaru
                            </div>
                            <div v-for="activity in recentActivities" :key="activity.id"
                                class="flex gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                <div
                                    class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-gray-100 text-gray-500">
                                    <component :is="ActivityIcon" class="w-4 h-4" />
                                </div>
                                <div class="min-w-0 flex-1">
                                    <div class="flex justify-between items-start gap-2">
                                        <p class="text-xs font-bold text-gray-900 line-clamp-1"
                                            :title="activity.action">
                                            {{ formatActivityAction(activity.action) }}
                                        </p>
                                        <span class="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                                            {{ formatRelativeTime(activity.createdAt) }}
                                        </span>
                                    </div>
                                    <p class="text-xs text-gray-600 mt-0.5 line-clamp-2" :title="activity.description">
                                        {{
                                            activity.description }}</p>
                                    <div class="mt-1 flex items-center gap-1.5">
                                        <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <p class="text-[10px] text-gray-500 truncate">
                                            {{ activity.users?.email || 'System' }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Attractions -->
                <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div class="p-5 border-b border-gray-200">
                        <h3 class="text-lg font-bold text-gray-800">Wahana Teratas (Tiket Terjual)</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr class="border-b border-gray-200">
                                    <th class="px-6 py-3 w-16 text-center">Peringkat</th>
                                    <th class="px-6 py-3">Nama Wahana</th>
                                    <th class="px-6 py-3">Tipe</th>
                                    <th class="px-6 py-3 text-right">Tiket Terjual</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr v-if="!overviewStats?.attractions?.topAttractions?.length"
                                    class="text-center text-gray-500">
                                    <td colspan="4" class="px-6 py-8">Tidak ada data wahana tersedia</td>
                                </tr>
                                <tr v-for="(item, idx) in overviewStats?.attractions?.topAttractions || []"
                                    :key="item.attraction?.id || idx" class="hover:bg-gray-50 transition-colors">
                                    <td class="px-6 py-4 text-center font-bold text-gray-400">#{{ idx + 1 }}</td>
                                    <td class="px-6 py-4 font-medium text-gray-900">{{ item.attraction?.name ||
                                        'Unknown' }}</td>
                                    <td class="px-6 py-4">
                                        <span
                                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            {{ item.attraction?.type || 'N/A' }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-right font-bold text-blue-600">
                                        {{ item.ticketsSold }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- REVENUE TAB -->
            <div v-if="activeTab === 'revenue'" class="space-y-6">
                <!-- Period Selector -->
                <div class="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200">
                    <h2 class="text-lg font-bold text-gray-800">Analitik Pendapatan</h2>
                    <select v-model="revenuePeriod"
                        class="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none transition-all text-sm">
                        <option value="7d">7 Hari Terakhir</option>
                        <option value="30d">30 Hari Terakhir</option>
                        <option value="90d">3 Bulan Terakhir</option>
                        <option value="1y">1 Tahun Terakhir</option>
                    </select>
                </div>

                <!-- Revenue KPI Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div v-for="(card, index) in revenueCards" :key="index"
                        class="bg-white rounded-2xl p-5 border border-gray-200 transition-all duration-300 md:hover:-translate-y-1">
                        <div class="flex items-start justify-between mb-3">
                            <div
                                :class="`w-12 h-12 bg-gradient-to-br ${card.bgGradient} rounded-xl flex items-center justify-center shrink-0`">
                                <component :is="card.icon" :class="`w-6 h-6 ${card.iconColor}`" />
                            </div>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-1 truncate">{{ card.value }}</h3>
                        <p class="text-sm text-gray-500 font-medium">{{ card.label }}</p>
                        <div v-if="card.trend !== undefined" class="mt-3 flex items-center text-xs font-medium"
                            :class="card.trend > 0 ? 'text-green-600' : 'text-red-600'">
                            <span class="mr-1">{{ card.trend > 0 ? '+' : '' }}{{ card.trend }}%</span>
                            <span class="text-gray-400 font-normal">vs periode sebelumnya</span>
                        </div>
                    </div>
                </div>

                <!-- Revenue Trend Chart -->
                <div class="bg-white rounded-2xl p-6 border border-gray-200">
                    <h3 class="text-lg font-bold text-gray-800 mb-6">Tren Pendapatan</h3>
                    <div class="h-80">
                        <Line v-if="charts.revenueTabTrend" :data="charts.revenueTabTrend"
                            :options="lineChartOptions" />
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Main Revenue Breakdown by Attraction -->
                    <div class="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200">
                        <h3 class="text-lg font-bold text-gray-800 mb-6">Pendapatan per Wahana</h3>
                        <div class="h-80">
                            <Bar v-if="charts.revenueByAttraction" :data="charts.revenueByAttraction"
                                :options="barChartOptions" />
                        </div>
                    </div>

                    <!-- Stats Breakdown -->
                    <div class="space-y-6">
                        <!-- Ticket Type Sales -->
                        <div class="bg-white rounded-2xl p-6 border border-gray-200">
                            <h3 class="text-lg font-bold text-gray-800 mb-4">Penjualan per Tipe Tiket</h3>
                            <div class="h-60 flex justify-center">
                                <Doughnut v-if="charts.ticketTypeSales" :data="charts.ticketTypeSales"
                                    :options="doughnutChartOptions" />
                            </div>
                        </div>
                        <!-- Payment Methods -->
                        <div class="bg-white rounded-2xl p-6 border border-gray-200">
                            <h3 class="text-lg font-bold text-gray-800 mb-4">Metode Pembayaran</h3>
                            <div class="h-60 flex justify-center">
                                <Doughnut v-if="charts.paymentMethodSales" :data="charts.paymentMethodSales"
                                    :options="doughnutChartOptions" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Performing Attractions Table -->
                <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div class="p-6 border-b border-gray-200">
                        <h3 class="text-lg font-bold text-gray-800">Wahana Terbaik</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th class="px-6 py-3">Wahana</th>
                                    <th class="px-6 py-3 text-right">Tiket Terjual</th>
                                    <th class="px-6 py-3 text-right">Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr v-if="!revenueStats?.topAttractions?.length" class="text-center text-gray-500">
                                    <td colspan="3" class="px-6 py-8">Tidak ada data wahana tersedia</td>
                                </tr>
                                <tr v-for="item in revenueStats?.topAttractions || []" :key="item.attractionId"
                                    class="hover:bg-gray-50 transition-colors">
                                    <td class="px-6 py-4 font-medium text-gray-900">{{ item.name }}</td>
                                    <td class="px-6 py-4 text-right text-gray-600">{{ item.ticketsSold }}</td>
                                    <td class="px-6 py-4 font-bold text-green-600 text-right">{{
                                        formatCurrency(item.revenue) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Transaction Details Modal -->
    <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-show="showTransactionModal"
            class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            @click.self="showTransactionModal = false">
            <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                <div v-show="showTransactionModal"
                    class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <!-- Modal Header -->
                    <div
                        class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <component :is="ShoppingCartIcon" class="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 class="text-lg font-bold text-gray-800">Detail Status Transaksi</h3>
                        </div>
                        <button @click="showTransactionModal = false"
                            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Modal Body -->
                    <div class="p-6 space-y-6">
                        <!-- Summary Cards -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
                                <p class="text-sm text-gray-600 mb-1">Pendapatan Hari Ini</p>
                                <p class="text-2xl font-bold text-gray-900">{{
                                    formatCurrency(transactionsWidget.todayRevenue) }}</p>
                            </div>
                            <div class="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4">
                                <p class="text-sm text-gray-600 mb-1">Tingkat Konversi</p>
                                <p class="text-2xl font-bold text-green-600">{{ transactionsWidget.conversionRate }}%
                                </p>
                            </div>
                        </div>

                        <!-- Status Breakdown -->
                        <div>
                            <h4 class="text-sm font-semibold text-gray-700 mb-4">Breakdown Status</h4>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                                    <div
                                        class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p class="text-sm text-gray-600 mb-1">Selesai</p>
                                    <p class="text-3xl font-bold text-green-600">{{ transactionsWidget.completed }}</p>
                                </div>
                                <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
                                    <div
                                        class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p class="text-sm text-gray-600 mb-1">Menunggu</p>
                                    <p class="text-3xl font-bold text-yellow-600">{{ transactionsWidget.pending }}</p>
                                </div>
                                <div class="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                                    <div
                                        class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <p class="text-sm text-gray-600 mb-1">Gagal</p>
                                    <p class="text-3xl font-bold text-red-600">{{ transactionsWidget.failed }}</p>
                                </div>
                                <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
                                    <div
                                        class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p class="text-sm text-gray-600 mb-1">Hari Ini</p>
                                    <p class="text-3xl font-bold text-gray-700">{{ transactionsWidget.today }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    </Transition>

    <!-- Payment Details Modal -->
    <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-show="showPaymentModal"
            class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            @click.self="showPaymentModal = false">
            <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                <div v-show="showPaymentModal"
                    class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <!-- Modal Header -->
                    <div
                        class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <component :is="CreditCardIcon" class="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 class="text-lg font-bold text-gray-800">Detail Status Pembayaran</h3>
                        </div>
                        <button @click="showPaymentModal = false"
                            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Modal Body -->
                    <div class="p-6 space-y-6">
                        <!-- Summary Cards -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4">
                                <p class="text-sm text-gray-600 mb-1">Jumlah Hari Ini</p>
                                <p class="text-2xl font-bold text-gray-900">{{
                                    formatCurrency(paymentsWidget.todayAmount) }}</p>
                            </div>
                            <div class="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4">
                                <p class="text-sm text-gray-600 mb-1">Tingkat Sukses</p>
                                <p class="text-2xl font-bold text-green-600">{{ paymentsWidget.successRate }}%</p>
                            </div>
                        </div>

                        <!-- Status Breakdown -->
                        <div>
                            <h4 class="text-sm font-semibold text-gray-700 mb-4">Breakdown Status</h4>
                            <div class="grid grid-cols-3 gap-4">
                                <div class="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                                    <div
                                        class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p class="text-sm text-gray-600 mb-1">Selesai</p>
                                    <p class="text-3xl font-bold text-green-600">{{ paymentsWidget.settled }}</p>
                                </div>
                                <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
                                    <div
                                        class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p class="text-sm text-gray-600 mb-1">Menunggu</p>
                                    <p class="text-3xl font-bold text-yellow-600">{{ paymentsWidget.pending }}</p>
                                </div>
                                <div class="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                                    <div
                                        class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <p class="text-sm text-gray-600 mb-1">Gagal</p>
                                    <p class="text-3xl font-bold text-red-600">{{ paymentsWidget.failed }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, h } from 'vue'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import { Line, Doughnut, Bar } from 'vue-chartjs'

// --- Custom Icon Components (Render Functions) ---
// Using 'h' to define simple SVG icons locally to ensure no missing dependencies
const createIcon = (d: string) => ({
    render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor' }, [
        h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d })
    ])
})

const CurrencyDollarIcon = createIcon('M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z')
const UserGroupIcon = createIcon('M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z')
const ShoppingCartIcon = createIcon('M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z')
const TicketIcon = createIcon('M15 5v2m0 4v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z')
const MapIcon = createIcon('M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7')
const CreditCardIcon = createIcon('M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z')
const ClockIcon = createIcon('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z')
const ActivityIcon = createIcon('M13 10V3L4 14h7v7l9-11h-7z')


// Register Chart.js Components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'admin']
})

const { user } = useAuth()
const { apiFetch } = useFetchApi()

// --- State ---
interface OverviewStats {
    revenue: { total: number; growth: number; trend: Array<{ date: string; total: number }> }
    users: { total: number; newToday: number }
    transactions: { completed: number; growth: number; todayRevenue: number; conversionRate: number; pending: number; failed: number; today: number }
    tickets: { total: number; activePercentage: number }
    attractions: { active: number; total: number; topAttractions: any[] }
    payments: { settled: number; total: number; successRate: number; pending: number; failed: number; todayAmount: number }
    recentActivities?: any[]
}

const isLoading = ref(true)
const isRefreshing = ref(false)
const activeTab = ref('overview')
// Independent periods
const revenuePeriod = ref('30d')
// Modal states
const showTransactionModal = ref(false)
const showPaymentModal = ref(false)

const tabs = [
    { id: 'overview', name: 'Ringkasan' },
    { id: 'revenue', name: 'Pendapatan' }
]

// Data Stores
const overviewStats = ref<OverviewStats>({
    revenue: { total: 0, growth: 0, trend: [] },
    users: { total: 0, newToday: 0 },
    transactions: { completed: 0, growth: 0, todayRevenue: 0, conversionRate: 0, pending: 0, failed: 0, today: 0 },
    tickets: { total: 0, activePercentage: 0 },
    attractions: { active: 0, total: 0, topAttractions: [] },
    payments: { settled: 0, total: 0, successRate: 0, pending: 0, failed: 0, todayAmount: 0 },
    recentActivities: []
})
const revenueStats = ref<any>({
    overview: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, previousPeriodRevenue: 0, revenueGrowth: 0 },
    trend: [],
    topAttractions: [],
    byTicketType: [],
    byPaymentMethod: []
})
const recentActivities = computed(() => overviewStats.value.recentActivities || [])

// --- Actions & Helpers ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount || 0)
}

const formatRelativeTime = (date: string) => {
    if (!date) return '-'
    const diff = new Date().getTime() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

const formatActivityAction = (action: string) => {
    return action?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'Action'
}

// --- KPI Cards Computed ---
const overviewCards = computed(() => {
    if (!overviewStats.value) return []
    const s = overviewStats.value

    // Robust accessors
    const revTotal = s.revenue?.total ?? 0
    const revGrowth = s.revenue?.growth ?? 0

    const usersTotal = s.users?.total ?? 0
    const usersNew = s.users?.newToday ?? 0

    const transCompleted = s.transactions?.completed ?? 0
    const transGrowth = s.transactions?.growth ?? 0

    const ticketsTotal = s.tickets?.total ?? 0
    const ticketsActivePct = s.tickets?.activePercentage ?? 0

    const attrActive = s.attractions?.active ?? 0
    const attrTotal = s.attractions?.total ?? 0

    const paySettled = s.payments?.settled ?? 0
    const payTotal = s.payments?.total ?? 0
    const paySuccessRate = s.payments?.successRate ?? 0

    return [
        {
            label: 'Total Pendapatan',
            value: formatCurrency(revTotal),
            icon: CurrencyDollarIcon,
            bgGradient: 'from-green-100 to-emerald-200',
            iconColor: 'text-green-600',
            trend: revGrowth
        },
        {
            label: 'Total Pengguna',
            value: usersTotal,
            icon: UserGroupIcon,
            bgGradient: 'from-blue-100 to-blue-200',
            iconColor: 'text-blue-600',
            badge: usersNew > 0 ? `${usersNew} baru` : null,
            badgeColor: 'bg-blue-100 text-blue-700'
        },
        {
            label: 'Penjualan Selesai',
            value: transCompleted,
            icon: ShoppingCartIcon,
            bgGradient: 'from-purple-100 to-purple-200',
            iconColor: 'text-purple-600',
            trend: transGrowth
        },
        {
            label: 'Tiket Terjual',
            value: ticketsTotal,
            icon: TicketIcon,
            bgGradient: 'from-orange-100 to-orange-200',
            iconColor: 'text-orange-600',
            badge: `${ticketsActivePct}% aktif`,
            badgeColor: 'bg-orange-100 text-orange-700'
        },
        {
            label: 'Wahana',
            value: `${attrActive} / ${attrTotal}`,
            icon: MapIcon,
            bgGradient: 'from-pink-100 to-pink-200',
            iconColor: 'text-pink-600',
            badge: 'Aktif',
            badgeColor: 'bg-pink-100 text-pink-700'
        },
        {
            label: 'Pembayaran',
            value: `${paySettled} / ${payTotal}`,
            icon: CreditCardIcon,
            bgGradient: 'from-indigo-100 to-indigo-200',
            iconColor: 'text-indigo-600',
            badge: `${paySuccessRate}% sukses`,
            badgeColor: 'bg-indigo-100 text-indigo-700'
        }
    ]
})

const transactionsWidget = computed(() => {
    const t = overviewStats.value?.transactions || {}
    return {
        completed: t.completed ?? 0,
        pending: t.pending ?? 0,
        failed: t.failed ?? 0,
        today: t.today ?? 0,
        todayRevenue: t.todayRevenue ?? 0,
        conversionRate: t.conversionRate ?? 0
    }
})

const paymentsWidget = computed(() => {
    const p = overviewStats.value?.payments || {}
    return {
        settled: p.settled ?? 0,
        pending: p.pending ?? 0,
        failed: p.failed ?? 0,
        todayAmount: p.todayAmount ?? 0,
        successRate: p.successRate ?? 0
    }
})

const revenueCards = computed(() => {
    if (!revenueStats.value?.overview) return []
    const s = revenueStats.value.overview
    return [
        {
            label: 'Total Pendapatan',
            value: formatCurrency(s.totalRevenue),
            icon: CurrencyDollarIcon,
            bgGradient: 'from-green-100 to-emerald-200',
            iconColor: 'text-green-600',
            trend: s.revenueGrowth
        },
        {
            label: 'Total Pesanan',
            value: s.totalOrders,
            icon: ShoppingCartIcon,
            bgGradient: 'from-blue-100 to-blue-200',
            iconColor: 'text-blue-600'
        },
        {
            label: 'Rata-rata Nilai Pesanan',
            value: formatCurrency(s.averageOrderValue),
            icon: CreditCardIcon,
            bgGradient: 'from-purple-100 to-purple-200',
            iconColor: 'text-purple-600'
        },
        {
            label: 'Pendapatan Periode Sebelumnya',
            value: formatCurrency(s.previousPeriodRevenue),
            icon: ClockIcon,
            bgGradient: 'from-gray-100 to-gray-200',
            iconColor: 'text-gray-600'
        }
    ]
})

// --- Charts Data Computed ---
const charts = computed(() => {
    const defaultColor = '#4CAF50'

    // Overview Revenue Chart (Trend)
    let revenueTrend = null
    const trendData = overviewStats.value?.revenue?.trend || []

    if (trendData.length > 0) {
        const sortedTrend = [...trendData].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        revenueTrend = {
            labels: sortedTrend.map((t: any) => new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
            datasets: [{
                label: 'Revenue',
                data: sortedTrend.map((t: any) => t.total),
                borderColor: defaultColor,
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: true,
                tension: 0.4
            }]
        }
    }

    // Revenue Tab Trend Line Chart
    let revenueTabTrend = null
    const revTrendData = revenueStats.value?.trend || []
    if (revTrendData.length > 0) {
        const sorted = [...revTrendData].sort((a: any, b: any) => new Date(a.period).getTime() - new Date(b.period).getTime())
        revenueTabTrend = {
            labels: sorted.map((t: any) => new Date(t.period).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
            datasets: [{
                label: 'Revenue',
                data: sorted.map((t: any) => t.revenue),
                borderColor: '#10B981', // emerald-500
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.3
            }]
        }
    }


    // Revenue by Attraction (Bar) - Revenue Tab
    let revenueByAttraction = null
    if (revenueStats.value?.topAttractions) {
        const taps = revenueStats.value.topAttractions
        revenueByAttraction = {
            labels: taps.map((t: any) => t.name),
            datasets: [{
                label: 'Revenue',
                data: taps.map((t: any) => t.revenue),
                backgroundColor: 'rgba(76, 175, 80, 0.8)',
                borderRadius: 4
            }]
        }
    }

    // Ticket Sales by Type - Revenue Tab
    let ticketTypeSales = null
    if (revenueStats.value?.byTicketType) {
        const tts = revenueStats.value.byTicketType
        ticketTypeSales = {
            labels: tts.map((t: any) => t.type),
            datasets: [{
                data: tts.map((t: any) => t.revenue),
                backgroundColor: ['#4CAF50', '#8BC34A', '#CDDC39'],
                borderWidth: 0
            }]
        }
    }

    // Payment Methods - Revenue Tab
    let paymentMethodSales = null
    if (revenueStats.value?.byPaymentMethod) {
        const pms = revenueStats.value.byPaymentMethod
        paymentMethodSales = {
            labels: pms.map((t: any) => t.method),
            datasets: [{
                data: pms.map((t: any) => t.revenue),
                backgroundColor: ['#6366F1', '#8B5CF6', '#EC4899'],
                borderWidth: 0
            }]
        }
    }

    return {
        revenueTrend,
        revenueTabTrend,
        revenueByAttraction,
        ticketTypeSales,
        paymentMethodSales
    }
})

// Chart Configs
const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#4CAF50',
            borderWidth: 1
        }
    }
}
const lineChartOptions = { ...commonChartOptions, plugins: { ...commonChartOptions.plugins, legend: { display: true } } }
const doughnutChartOptions = { ...commonChartOptions, plugins: { ...commonChartOptions.plugins, legend: { display: true, position: 'bottom' as const } } }
const barChartOptions = { ...commonChartOptions, scales: { y: { beginAtZero: true } } }

// --- Fetch Logic ---
const fetchOverviewData = async () => {
    const res: any = await apiFetch('/api/admin/dashboard/overview')
    if (res.success) {
        overviewStats.value = res.data
    }
}

const fetchDetailedData = async (type: string) => {
    const endpointMap: any = {
        'revenue': '/api/admin/dashboard/revenue'
    }

    if (!endpointMap[type]) return
    const res: any = await apiFetch(`${endpointMap[type]}?period=${revenuePeriod.value}`)
    if (res.success) {
        if (type === 'revenue') revenueStats.value = res.data
    }
}

const refreshData = async () => {
    if (isRefreshing.value) return
    isRefreshing.value = true
    isLoading.value = true

    try {
        if (activeTab.value === 'overview') {
            await fetchOverviewData()
        } else {
            await fetchDetailedData(activeTab.value)
        }
    } finally {
        isRefreshing.value = false
        isLoading.value = false
    }
}

// Watchers
watch(activeTab, () => {
    refreshData()
})

watch([revenuePeriod], () => {
    if (activeTab.value !== 'overview') {
        fetchDetailedData(activeTab.value)
    }
})

onMounted(() => {
    // Initial fetch
    refreshData()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e0e0e0;
    border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #bdbdbd;
}
</style>