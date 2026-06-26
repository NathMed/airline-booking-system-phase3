<script setup>
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../../stores/global';

const router = useRouter();
const globalStore = useGlobalStore();

function logout() {
    localStorage.removeItem('token');
    globalStore.user.token = null;
    globalStore.user.email = null;
    router.push('/login');
}
</script>

<template>
    <nav class="admin-sidebar">

        <p class="sidebar-section-label">Operations</p>
        <div class="profile-nav">
            <RouterLink class="nav-link" :to="{ name: 'AdminFlights' }">
                <i class="ti ti-plane"></i>
                Flights
            </RouterLink>
            <RouterLink class="nav-link" :to="{ name: 'AdminPassengers' }">
                <i class="ti ti-users"></i>
                Passengers
            </RouterLink>
            <RouterLink class="nav-link" :to="{ name: 'AdminBookings' }">
                <i class="ti ti-ticket"></i>
                Bookings
            </RouterLink>
            <RouterLink class="nav-link" :to="{ name: 'AdminSeats' }">
                <i class="ti ti-armchair"></i>
                Seats
            </RouterLink>
            <RouterLink class="nav-link" :to="{ name: 'AdminPayments' }">
                <i class="ti ti-credit-card"></i>
                Payments
            </RouterLink>
        </div>

        <div class="pn-sep"></div>

        <p class="sidebar-section-label">Configuration</p>
        <div class="profile-nav">
            <RouterLink class="nav-link" :to="{ name: 'AdminAirlines' }">
                <i class="ti ti-building-airport"></i>
                Airlines
            </RouterLink>
            <RouterLink class="nav-link" :to="{ name: 'AdminAirports' }">
                <i class="ti ti-map-pin"></i>
                Airports
            </RouterLink>
            <RouterLink class="nav-link" :to="{ name: 'AdminAircraft' }">
                <i class="ti ti-drone"></i>
                Aircraft
            </RouterLink>
            <RouterLink class="nav-link" :to="{ name: 'AdminUsers' }">
                <i class="ti ti-user-cog"></i>
                Users
            </RouterLink>
            <RouterLink class="nav-link" :to="{ name: 'AdminNotifications' }">
                <i class="ti ti-bell"></i>
                Notifications
            </RouterLink>
        </div>

        <div class="pn-sep"></div>

        <div class="profile-nav">
            <button class="nav-link logout-nav" @click="logout">
                <i class="ti ti-logout"></i>
                Logout
            </button>
        </div>

    </nav>
</template>

<style scoped>
@import './admin-shared.css';

.admin-sidebar {
    flex: 0 0 200px;
    min-width: 160px;
    border-right: 1px solid var(--border-dim);
    padding-right: 16px;
}

.sidebar-section-label {
    font-family: var(--font-sans);
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
    margin: 0 0 6px 14px;
}

/* Reuse .profile-nav pattern from global styles */
.profile-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 8px;
}

.profile-nav .nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    font-family: var(--font-sans);
    font-size: 0.76rem;
    font-weight: 600;
    color: var(--muted);
    text-decoration: none;
    border-radius: 4px;
    transition: background 0.18s ease, color 0.18s ease;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
}

.profile-nav .nav-link .ti {
    font-size: 1rem;
    flex-shrink: 0;
}

.profile-nav .nav-link:hover {
    background: var(--gold-dim);
    color: var(--text);
}

.profile-nav .nav-link.router-link-active {
    background: var(--gold-dim);
    color: var(--gold);
}

.profile-nav .nav-link.logout-nav {
    color: var(--error);
}

.profile-nav .nav-link.logout-nav:hover {
    background: rgba(255, 77, 77, 0.08);
}

/* ── Light theme overrides ──────────────────────────────────────────────────
   Your app sets data-theme="light" on a wrapper <div> (not on <html>), so we
   use :deep() to escape Vue's scoped-CSS boundary and target that ancestor div.
   Without :deep(), Vue would mangle the selector and it would never match.
   --------------------------------------------------------------------------- */
:deep([data-theme="light"]) .profile-nav .nav-link {
    color: #374151; /* slate-700 — legible on white sidebar background */
}

:deep([data-theme="light"]) .profile-nav .nav-link:hover {
    color: #111827; /* slate-900 — strong contrast on hover */
}

:deep([data-theme="light"]) .profile-nav .nav-link.logout-nav:hover {
    background: rgba(217, 56, 58, 0.08);
}

.pn-sep {
    height: 1px;
    background: var(--border);
    margin: 10px 0;
}

/* Responsive: horizontal on small screens */
@media (max-width: 768px) {
    .admin-sidebar {
        flex: unset;
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--border-dim);
        padding-right: 0;
        padding-bottom: 16px;
    }

    .sidebar-section-label {
        display: none;
    }

    .profile-nav {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 4px;
    }

    .profile-nav .nav-link {
        padding: 7px 12px;
        font-size: 0.7rem;
    }

    .pn-sep {
        display: none;
    }
}
</style>