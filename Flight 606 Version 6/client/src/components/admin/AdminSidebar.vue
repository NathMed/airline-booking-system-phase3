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
    <nav class="col-md-2 d-none d-md-block bg-light min-vh-100 border-end">
        <div class="position-sticky pt-3">

            <ul class="nav flex-column">
                <li class="nav-item">
                    <RouterLink class="nav-link" :to="{ name: 'AdminFlights' }">
                        Flights
                    </RouterLink>
                </li>
                <li class="nav-item">
                    <RouterLink class="nav-link" :to="{ name: 'AdminPassengers' }">
                        Passengers
                    </RouterLink>
                </li>
                <li class="nav-item">
                    <RouterLink class="nav-link" :to="{ name: 'AdminBookings' }">
                        Bookings
                    </RouterLink>
                </li>
                <li class="nav-item">
                    <RouterLink class="nav-link" :to="{ name: 'AdminSeats' }">
                        Seats
                    </RouterLink>
                </li>
                <li class="nav-item">
                    <RouterLink class="nav-link" :to="{ name: 'AdminPayments' }">
                        Payments
                    </RouterLink>
                </li>

                <hr />

                <li class="nav-item">
                    <RouterLink class="nav-link" :to="{ name: 'AdminAirlines' }">
                        Airlines
                    </RouterLink>
                </li>
                <li class="nav-item">
                    <RouterLink class="nav-link" :to="{ name: 'AdminAirports' }">
                        Airports
                    </RouterLink>
                </li>
                <li class="nav-item">
                    <RouterLink class="nav-link" :to="{ name: 'AdminAircraft' }">
                        Aircraft
                    </RouterLink>
                </li>
                <li class="nav-item">
                    <RouterLink class="nav-link" :to="{ name: 'AdminUsers' }">
                        Users
                    </RouterLink>
                </li>
                <li class="nav-item">
                    <RouterLink class="nav-link" :to="{ name: 'AdminNotifications' }">
                        Notifications
                    </RouterLink>
                </li>

                <hr />

                <li class="nav-item">
                    <button class="btn btn-link nav-link text-danger" @click="logout">
                        Logout
                    </button>
                </li>
            </ul>

        </div>
    </nav>
</template>