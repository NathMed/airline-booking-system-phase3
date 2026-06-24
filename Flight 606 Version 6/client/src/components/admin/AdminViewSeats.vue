<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSeatsByFlight, getFlightById, getPassengersByBooking, updateSeatStatus } from '../../api.js';

const route = useRoute();
const router = useRouter();
const flightId = route.params.flightId;

const flight = ref(null);
const seats = ref([]);
const isLoading = ref(true);
const pageError = ref(null);
const actionSuccess = ref(null);
const actionError = ref(null);

// passenger lookup cache: seatId -> passenger name
const passengerCache = ref({});
const isLoadingPassengers = ref(false);

const stats = computed(() => {
    const total = seats.value.length;
    const occupied = seats.value.filter(s => s.isOccupied).length;
    const business = seats.value.filter(s => s.class === 'business').length;
    const businessOccupied = seats.value.filter(s => s.class === 'business' && s.isOccupied).length;
    return {
        total,
        occupied,
        available: total - occupied,
        business,
        businessOccupied,
        economy: total - business,
        economyOccupied: occupied - businessOccupied,
        occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0
    };
});

const businessSeats = computed(() => seats.value.filter(s => s.class === 'business'));
const economySeats = computed(() => seats.value.filter(s => s.class === 'economy'));

// Selected seat for detail panel
const selectedSeat = ref(null);

function selectSeat(seat) {
    selectedSeat.value = seat;
}

function getSeatButtonClass(seat) {
    if (!seat.isActive) return 'seat-btn seat-inactive';
    if (seat.isOccupied) return 'seat-btn seat-occupied';
    if (seat.class === 'business') return 'seat-btn seat-business';
    return 'seat-btn seat-economy';
}

async function fetchData() {
    isLoading.value = true;
    pageError.value = null;
    try {
        const [flightRes, seatsRes] = await Promise.all([
            getFlightById(flightId),
            getSeatsByFlight(flightId)
        ]);
        flight.value = flightRes.result;
        seats.value = seatsRes.seats;
    } catch (err) {
        pageError.value = 'Failed to load seat data.';
    } finally {
        isLoading.value = false;
    }
}

async function toggleSeatStatus(seat) {
    actionError.value = null;
    actionSuccess.value = null;
    try {
        await updateSeatStatus(seat._id, { isOccupied: !seat.isOccupied });
        actionSuccess.value = `Seat ${seat.seatNumber} updated successfully.`;
        await fetchData();
        selectedSeat.value = null;
        setTimeout(() => actionSuccess.value = null, 3000);
    } catch (err) {
        actionError.value = err.response?.data?.message || 'Failed to update seat.';
        setTimeout(() => actionError.value = null, 3000);
    }
}

function formatDateTime(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

onMounted(fetchData);
</script>

<template>
    <div>
        <!-- Back button -->
        <button class="btn btn-sm btn-outline-secondary mb-4" @click="router.push('/admin/seats')">
            <i class="bi bi-arrow-left me-1"></i> Back to All Flights
        </button>

        <!-- Loading -->
        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="text-muted mt-2 small">Loading seat map...</p>
        </div>

        <div v-else-if="pageError" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ pageError }}
        </div>

        <div v-else>

            <!-- Flight header -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
                        <div>
                            <h4 class="fw-bold mb-1">
                                <i class="bi bi-airplane me-2 text-primary"></i>
                                Flight {{ flight?.flightNumber }}
                            </h4>
                            <p class="text-muted mb-0 small">
                                Departure: {{ formatDateTime(flight?.departureTime) }}
                            </p>
                        </div>
                        <button class="btn btn-sm btn-outline-secondary" @click="fetchData" :disabled="isLoading">
                            <i class="bi bi-arrow-clockwise me-1"></i>Refresh
                        </button>
                    </div>
                </div>
            </div>

            <!-- Feedback -->
            <div v-if="actionSuccess" class="alert alert-success alert-dismissible py-2 px-3 mb-3 small shadow-sm">
                <i class="bi bi-check-circle-fill me-2"></i>{{ actionSuccess }}
                <button type="button" class="btn-close btn-sm" @click="actionSuccess = null"></button>
            </div>
            <div v-if="actionError" class="alert alert-danger alert-dismissible py-2 px-3 mb-3 small shadow-sm">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ actionError }}
                <button type="button" class="btn-close btn-sm" @click="actionError = null"></button>
            </div>

            <!-- Stats row -->
            <div class="row g-3 mb-4">
                <div class="col-6 col-md-2">
                    <div class="card border-0 shadow-sm text-center py-3">
                        <div class="fs-4 fw-bold text-primary">{{ stats.total }}</div>
                        <div class="small text-muted">Total</div>
                    </div>
                </div>
                <div class="col-6 col-md-2">
                    <div class="card border-0 shadow-sm text-center py-3">
                        <div class="fs-4 fw-bold text-danger">{{ stats.occupied }}</div>
                        <div class="small text-muted">Occupied</div>
                    </div>
                </div>
                <div class="col-6 col-md-2">
                    <div class="card border-0 shadow-sm text-center py-3">
                        <div class="fs-4 fw-bold text-success">{{ stats.available }}</div>
                        <div class="small text-muted">Available</div>
                    </div>
                </div>
                <div class="col-6 col-md-2">
                    <div class="card border-0 shadow-sm text-center py-3">
                        <div class="fs-4 fw-bold text-warning">{{ stats.occupancyRate }}%</div>
                        <div class="small text-muted">Occupancy</div>
                    </div>
                </div>
                <div class="col-6 col-md-2">
                    <div class="card border-0 shadow-sm text-center py-3">
                        <div class="fs-4 fw-bold text-warning">{{ stats.businessOccupied }}/{{ stats.business }}</div>
                        <div class="small text-muted">Business</div>
                    </div>
                </div>
                <div class="col-6 col-md-2">
                    <div class="card border-0 shadow-sm text-center py-3">
                        <div class="fs-4 fw-bold text-success">{{ stats.economyOccupied }}/{{ stats.economy }}</div>
                        <div class="small text-muted">Economy</div>
                    </div>
                </div>
            </div>

            <!-- Occupancy progress bar -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body py-3">
                    <div class="d-flex justify-content-between small text-muted mb-1">
                        <span>Occupancy Rate</span>
                        <span>{{ stats.occupied }} / {{ stats.total }} seats</span>
                    </div>
                    <div class="progress" style="height: 12px; border-radius: 6px;">
                        <div
                            class="progress-bar"
                            :class="stats.occupancyRate > 80 ? 'bg-danger' : stats.occupancyRate > 50 ? 'bg-warning' : 'bg-success'"
                            :style="{ width: stats.occupancyRate + '%' }"
                        ></div>
                    </div>
                </div>
            </div>

            <div class="row g-4">

                <!-- Seat map -->
                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body p-4">

                            <!-- Legend -->
                            <div class="d-flex flex-wrap gap-3 mb-4 small">
                                <span class="d-flex align-items-center gap-2">
                                    <span class="seat-btn seat-business" style="width:36px; height:28px; font-size:10px; display:inline-flex; align-items:center; justify-content:center; border-radius:4px;">1A</span>
                                    Business — available
                                </span>
                                <span class="d-flex align-items-center gap-2">
                                    <span class="seat-btn seat-economy" style="width:36px; height:28px; font-size:10px; display:inline-flex; align-items:center; justify-content:center; border-radius:4px;">1A</span>
                                    Economy — available
                                </span>
                                <span class="d-flex align-items-center gap-2">
                                    <span class="seat-btn seat-occupied" style="width:36px; height:28px; font-size:10px; display:inline-flex; align-items:center; justify-content:center; border-radius:4px;">1A</span>
                                    Occupied
                                </span>
                                <span class="d-flex align-items-center gap-2">
                                    <span class="seat-btn seat-inactive" style="width:36px; height:28px; font-size:10px; display:inline-flex; align-items:center; justify-content:center; border-radius:4px;">1A</span>
                                    Inactive
                                </span>
                            </div>

                            <!-- Business class -->
                            <div class="mb-4">
                                <div class="small fw-bold text-uppercase text-warning mb-2">
                                    <i class="bi bi-star-fill me-1"></i>Business Class
                                </div>
                                <div class="d-flex flex-wrap gap-2">
                                    <button
                                        v-for="seat in businessSeats"
                                        :key="seat._id"
                                        :class="[getSeatButtonClass(seat), selectedSeat?._id === seat._id ? 'seat-selected' : '']"
                                        style="width: 52px;"
                                        @click="selectSeat(seat)"
                                        :title="seat.isOccupied ? 'Occupied — click to view details' : 'Available'"
                                    >
                                        {{ seat.seatNumber }}
                                    </button>
                                </div>
                            </div>

                            <!-- Divider -->
                            <div class="border-top border-dashed my-3"></div>

                            <!-- Economy class -->
                            <div>
                                <div class="small fw-bold text-uppercase text-success mb-2">
                                    <i class="bi bi-grid me-1"></i>Economy Class
                                </div>
                                <div class="d-flex flex-wrap gap-2">
                                    <button
                                        v-for="seat in economySeats"
                                        :key="seat._id"
                                        :class="[getSeatButtonClass(seat), selectedSeat?._id === seat._id ? 'seat-selected' : '']"
                                        style="width: 52px;"
                                        @click="selectSeat(seat)"
                                        :title="seat.isOccupied ? 'Occupied — click to view details' : 'Available'"
                                    >
                                        {{ seat.seatNumber }}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- Detail panel -->
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body p-4">

                            <!-- No seat selected -->
                            <div v-if="!selectedSeat" class="text-center text-muted py-5">
                                <i class="bi bi-cursor-fill d-block fs-1 mb-3 opacity-25"></i>
                                <p class="small">Click any seat on the map to view details.</p>
                            </div>

                            <!-- Seat details -->
                            <div v-else>
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h5 class="fw-bold mb-0">Seat {{ selectedSeat.seatNumber }}</h5>
                                        <span
                                            class="badge mt-1"
                                            :class="selectedSeat.class === 'business' ? 'bg-warning text-dark' : 'bg-success'"
                                        >
                                            {{ selectedSeat.class }}
                                        </span>
                                    </div>
                                    <button class="btn btn-sm btn-outline-secondary" @click="selectedSeat = null">
                                        <i class="bi bi-x"></i>
                                    </button>
                                </div>

                                <table class="table table-sm table-borderless small mb-3">
                                    <tbody>
                                        <tr>
                                            <td class="text-muted fw-semibold" style="width: 90px;">Status</td>
                                            <td>
                                                <span v-if="selectedSeat.isOccupied" class="badge bg-danger">Occupied</span>
                                                <span v-else class="badge bg-success">Available</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="text-muted fw-semibold">Active</td>
                                            <td>
                                                <span v-if="selectedSeat.isActive" class="text-success">Yes</span>
                                                <span v-else class="text-danger">No</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="text-muted fw-semibold">Class</td>
                                            <td class="text-capitalize">{{ selectedSeat.class }}</td>
                                        </tr>
                                        <tr>
                                            <td class="text-muted fw-semibold">Seat ID</td>
                                            <td class="font-monospace" style="font-size: 0.7rem;">{{ selectedSeat._id }}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <!-- Admin action: toggle occupied status -->
                                <div class="border-top pt-3">
                                    <p class="small text-muted mb-2">Admin Override</p>
                                    <button
                                        class="btn btn-sm w-100"
                                        :class="selectedSeat.isOccupied ? 'btn-outline-success' : 'btn-outline-danger'"
                                        @click="toggleSeatStatus(selectedSeat)"
                                    >
                                        <i class="bi me-1" :class="selectedSeat.isOccupied ? 'bi-unlock' : 'bi-lock'"></i>
                                        {{ selectedSeat.isOccupied ? 'Mark as Available' : 'Mark as Occupied' }}
                                    </button>
                                    <p class="text-muted mt-2" style="font-size: 0.7rem;">
                                        Use this only to manually correct seat status after a cancelled booking.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.seat-btn {
    width: 52px;
    height: 36px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;
    border: 1.5px solid;
    cursor: pointer;
    transition: all 0.15s ease;
}
.seat-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.seat-business {
    background-color: #fff8e1;
    border-color: #f59e0b;
    color: #92400e;
}
.seat-economy {
    background-color: #f0fdf4;
    border-color: #22c55e;
    color: #166534;
}
.seat-occupied {
    background-color: #fef2f2;
    border-color: #ef4444;
    color: #991b1b;
    cursor: pointer;
}
.seat-occupied:hover {
    background-color: #fee2e2;
}
.seat-inactive {
    background-color: #f3f4f6;
    border-color: #9ca3af;
    color: #6b7280;
    cursor: not-allowed;
    opacity: 0.5;
}
.seat-selected {
    outline: 3px solid #2563eb;
    outline-offset: 2px;
}
.border-dashed {
    border-style: dashed !important;
}
</style>