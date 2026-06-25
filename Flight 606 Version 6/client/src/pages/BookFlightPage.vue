<!-- BookingForm.vue — Refactored Step 1 & 2 -->
<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookingStore } from '../stores/booking';
import { Notyf } from 'notyf';
import { getFlightById, getSeatsByFlight, getMyPassengers } from '../api.js';

const route = useRoute();
const router = useRouter();
const bookingStore = useBookingStore();
const notyf = new Notyf({ duration: 4000, position: { x: 'right', y: 'top' }, ripple: true });

const isGuestRoute = computed(() => route.name === 'GuestCheckout');

// ─── Core state from Backup ───────────────────────────────────
const flightsMap = ref([]);
const seatsMap = ref({});
const isLoading = ref(true);
const errorMessage = ref('');
const savedPassengers = ref([]); 

// ─── UI State from Groupmates ─────────────────────────────────
const activeLegIndex = ref(0);
const activePassengerIndex = ref(0);
const closedSections = ref([]);
const COLS = ['A', 'B', 'C', null, 'D', 'E', 'F'];

// Define route params
const flightIds = route.params.flightId ? route.params.flightId.split(',').filter(Boolean) : [];

// ─── Accordion Logic ──────────────────────────────────────────
function isOpen(key) {
    return !closedSections.value.includes(key);
}
function toggleSection(key) {
    const i = closedSections.value.indexOf(key);
    if (i > -1) closedSections.value.splice(i, 1);
    else closedSections.value.push(key);
}

// ─── Mount: Load flights + seats + profiles in parallel ───────
onMounted(async () => {
    if (flightIds.length === 0) {
        errorMessage.value = 'No flight selected. Please go back and search again.';
        isLoading.value = false;
        return;
    }

    try {
        const flightsCollector = [];
        const flightSeatLoads = flightIds.map(id =>
            Promise.all([getFlightById(id), getSeatsByFlight(id)])
        );

        const [flightSeatResults, profilesResult] = await Promise.allSettled([
            Promise.all(flightSeatLoads),
            getMyPassengers()
        ]);

        if (flightSeatResults.status === 'fulfilled') {
            for (let i = 0; i < flightIds.length; i++) {
                const [flightRes, seatsRes] = flightSeatResults.value[i];
                flightsCollector.push(flightRes.result || flightRes.data || flightRes);
                seatsMap.value[flightIds[i]] = seatsRes.seats || seatsRes.result || [];
                selectedSeats.value[flightIds[i]] = [];   // init empty selection per leg
            }
            flightsMap.value = flightsCollector;
            
            // Initialize store funnel if groupmate store structure requires it
            bookingStore.startFunnel({ flights: flightsCollector, isGuest: isGuestRoute.value });

            // CRITICAL: push the full seats array into each store leg RIGHT NOW.
            // ConfirmPaymentPage navigates here next and needs leg.seats to resolve
            // seat objects for pricing. seatsMap is local to this component and dies
            // on navigation — the store is the only thing that survives the page change.
            for (let i = 0; i < flightIds.length; i++) {
                if (bookingStore.legs[i]) {
                    bookingStore.legs[i].seats = seatsMap.value[flightIds[i]] || [];
                }
            }
        } else {
            errorMessage.value = 'Failed to load flight details. Please try again.';
        }

        if (profilesResult.status === 'fulfilled') {
            savedPassengers.value = profilesResult.value.passengers || profilesResult.value.result || [];
        }

    } catch (err) {
        errorMessage.value = 'We could not load this flight. Please search again.';
    } finally {
        isLoading.value = false;
    }
});

const passengerCount  = computed(() => bookingStore.passengers?.length || 1);
const selectedSeats   = ref({});   // { flightId: [ seatObj, … ] }  — local mirror for pricing

// ─── Seat Map Logic ───────────────────────────────────────────
const currentLeg = computed(() => flightsMap.value[activeLegIndex.value] || null);
const currentFlightId = computed(() => currentLeg.value?._id);

function seatRows(flightId) {
    const seats = seatsMap.value[flightId];
    if (!seats || seats.length === 0) return [];
    const rows = new Set();
    seats.forEach(s => {
        if (s && s.seatNumber) {
            const num = parseInt(s.seatNumber, 10);
            if (!isNaN(num)) rows.add(num);
        }
    });
    return Array.from(rows).sort((a, b) => a - b);
}

function seatAt(flightId, row, col) {
    const seats = seatsMap.value[flightId];
    if (!seats) return null;
    return seats.find(s => s && s.seatNumber === `${row}${col}`) || null;
}

// Returns which passenger (0-based index) owns this seat on this leg, or -1
function ownerOf(legIndex, seatId) {
    const leg = bookingStore.legs?.[legIndex];
    if (!leg?.selectedSeatIds) return -1;
    return leg.selectedSeatIds.indexOf(seatId);
}

function seatBtnClass(legIndex, seat) {
    if (!seat || seat.isOccupied) return 'btn-secondary disabled';

    const owner = ownerOf(legIndex, seat._id);

    // Seat belongs to the next-to-assign passenger (highlighted as "active pick")
    if (owner === activePassengerIndex.value) return 'btn-primary';

    // Seat belongs to another passenger — show teal so they're visually distinct
    if (owner > -1) return 'btn-info';

    // Available seats: business → amber outline, economy → green outline
    return seat.class === 'business' ? 'btn-outline-warning' : 'btn-outline-success';
}

function onSeatClick(legIndex, seat) {
    if (!seat || seat.isOccupied) return;
    const flight = flightsMap.value[legIndex];
    if (!flight) return;

    const paxCount = passengerCount.value;
    const existingOwner = ownerOf(legIndex, seat._id);

    // ── Deselect: clicking an already-owned seat removes it ──────────────────
    if (existingOwner > -1) {
        bookingStore.selectSeatForLeg(legIndex, existingOwner, null);

        const collection = [...(selectedSeats.value[flight._id] || [])];
        const idx = collection.findIndex(s => s._id === seat._id);
        if (idx > -1) collection.splice(idx, 1);
        selectedSeats.value[flight._id] = collection;

        // Move the active pointer back to the deselected passenger's slot
        activePassengerIndex.value = existingOwner;
        return;
    }

    // ── All seats already assigned for this leg — nothing to do ──────────────
    if (activePassengerIndex.value >= paxCount) return;

    // ── Assign seat to the current active passenger ───────────────────────────
    const leg = bookingStore.legs?.[legIndex];

    // If this passenger already had a seat, remove it from the local mirror first
    const prevSeatId = leg?.selectedSeatIds?.[activePassengerIndex.value];
    if (prevSeatId) {
        const collection = [...(selectedSeats.value[flight._id] || [])];
        const prevIdx = collection.findIndex(s => s._id === prevSeatId);
        if (prevIdx > -1) collection.splice(prevIdx, 1);
        selectedSeats.value[flight._id] = collection;
    }

    bookingStore.selectSeatForLeg(legIndex, activePassengerIndex.value, seat._id);

    // Keep the store leg's seats array populated so ConfirmPaymentPage can price
    if (bookingStore.legs[legIndex] && !bookingStore.legs[legIndex].seats?.length) {
        bookingStore.legs[legIndex].seats = seatsMap.value[flight._id] || [];
    }

    // Push into local pricing mirror
    const collection = [...(selectedSeats.value[flight._id] || [])];
    collection.push(seat);
    selectedSeats.value[flight._id] = collection;

    // ── Auto-advance to the next unassigned passenger ─────────────────────────
    const nextUnassigned = leg?.selectedSeatIds?.findIndex(
        (id, i) => i > activePassengerIndex.value && (id === null || id === undefined)
    ) ?? -1;

    if (nextUnassigned > -1) {
        activePassengerIndex.value = nextUnassigned;
    } else {
        // All passengers on this leg are seated — clamp to last pax so
        // the indicator shows "all done" rather than going out of bounds
        activePassengerIndex.value = paxCount - 1;
    }
}

// ─── Passenger Validation & Autofill ──────────────────────────
function applySaved(pIdx, savedId) {
    const sp = savedPassengers.value.find(s => s._id === savedId);
    if (!sp) return;
    const p = bookingStore.passengers[pIdx];
    if (!p) return;
    
    p.firstName = sp.firstName || '';
    p.lastName = sp.lastName || '';
    p.gender = sp.gender || '';
    p.dateOfBirth = sp.dateOfBirth ? sp.dateOfBirth.substring(0, 10) : '';
    p.nationality = sp.nationality || '';
    p.passportNumber = sp.passportNumber || '';
    p.passportExpiry = sp.passportExpiry ? sp.passportExpiry.substring(0, 10) : '';
    p.phone = sp.phone || '';
}

function digitsOnly(p) {
    if (p) p.phone = (p.phone || '').replace(/\D/g, '').slice(0, 11);
}

// ─── Pricing ──────────────────────────────────────────────────
// Mirrors the backend rule: business rows use businessPrice, all others basePrice
function getSeatPrice(flight, seat) {
    if (!flight || !seat) return 0;
    return seat.class === 'business' ? (flight.businessPrice ?? 0) : (flight.basePrice ?? 0);
}

// Grand total across all selected seats on all legs
const grandTotalValue = computed(() => {
    let total = 0;
    for (const flight of flightsMap.value) {
        for (const seat of (selectedSeats.value[flight._id] || [])) {
            total += getSeatPrice(flight, seat);
        }
    }
    return total;
});

// ─── Routing ──────────────────────────────────────────────────
function validateAndContinue() {
    errorMessage.value = '';

    if (!bookingStore.isSeatSelectionComplete) {
        errorMessage.value = 'Please select a seat for every passenger on every flight.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    let hasError = false;
    bookingStore.passengers.forEach((p, i) => {
        if (!p.firstName.trim() || !p.lastName.trim() || !p.passportNumber.trim() || !p.gender || String(p.phone).length !== 11) {
            hasError = true;
        }
    });

    if (hasError) {
        errorMessage.value = 'Please complete all required passenger details (Phone must be 11 digits).';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // Move to payment page instead of firing API here
    router.push({ name: 'ConfirmPayment' });
}

// ─── Formatting ───────────────────────────────────────────────
function legLabel(flight, i) {
    if (!flight) return 'Flight';
    const origin = flight.originAirportId?.iataCode || 'DEP';
    const dest = flight.destinationAirportId?.iataCode || 'ARR';
    const dateLabel = flight.departureTime
        ? new Date(flight.departureTime).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
        : '';
    const prefix = flightsMap.value.length > 1 ? (i === 0 ? 'Outbound · ' : 'Return · ') : '';
    return `${prefix}${origin} → ${dest} · ${dateLabel} · ${flight.flightNumber || ''}`;
}
</script>

<template>
    <div class="page active bg-light min-vh-100 py-5">
        <div class="container">

            <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-3 fw-bold text-muted">Loading your flight details…</p>
            </div>

            <div v-else-if="errorMessage" class="alert alert-danger shadow-sm my-5 d-flex justify-content-between align-items-center">
                <span><i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMessage }}</span>
                <button class="btn btn-sm btn-outline-danger" @click="router.push({ name: 'SearchFlights' })">Search again</button>
            </div>

            <div v-else class="row g-4">
                <div class="col-lg-8">
                    
                    <!-- Breadcrumbs -->
                    <nav aria-label="breadcrumb" class="mb-4">
                        <ol class="breadcrumb mb-0">
                            <li class="breadcrumb-item"><RouterLink to="/">Home</RouterLink></li>
                            <li class="breadcrumb-item"><RouterLink to="/search">Flights</RouterLink></li>
                            <li class="breadcrumb-item active fw-bold text-dark">Booking Details</li>
                        </ol>
                    </nav>

                    <div class="card shadow-sm border-0 mb-4">
                        <div class="card-header bg-primary text-white py-3">
                            <h5 class="mb-0"><i class="bi bi-airplane me-2"></i> Selected Flights</h5>
                        </div>
                        <div class="card-body">
                            <div v-for="(flight, i) in flightsMap" :key="i" class="fw-bold text-dark">
                                {{ legLabel(flight, i) }}
                            </div>
                        </div>
                    </div>

                    <!-- Passenger Forms (Accordion) -->
                    <div v-for="(p, pIdx) in bookingStore.passengers" :key="pIdx" class="card shadow-sm border-0 mb-4">
                        <div 
                            class="card-header bg-white d-flex justify-content-between align-items-center py-3" 
                            style="cursor: pointer;" 
                            @click="toggleSection(pIdx)"
                        >
                            <div class="d-flex align-items-center">
                                <i class="bi bi-person-badge fs-4 text-primary me-3"></i>
                                <div>
                                    <h6 class="mb-0 fw-bold">Passenger {{ pIdx + 1 }}</h6>
                                    <small class="text-muted">Personal & passport details</small>
                                </div>
                            </div>
                            <i :class="isOpen(pIdx) ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                        </div>
                        
                        <div class="card-body bg-light border-top" v-if="isOpen(pIdx)">
                            <div v-if="savedPassengers.length > 0" class="mb-4">
                                <label class="form-label small fw-bold text-primary">Autofill from saved profile</label>
                                <select class="form-select border-primary" @change="applySaved(pIdx, $event.target.value)">
                                    <option value="">— Select —</option>
                                    <option v-for="sp in savedPassengers" :key="sp._id" :value="sp._id">
                                        {{ sp.firstName }} {{ sp.lastName }} ({{ sp.passportNumber }})
                                    </option>
                                </select>
                            </div>

                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label small fw-bold">First Name</label>
                                    <input type="text" class="form-control" v-model="p.firstName" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small fw-bold">Last Name</label>
                                    <input type="text" class="form-control" v-model="p.lastName" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small fw-bold">Date of Birth</label>
                                    <input type="date" class="form-control" v-model="p.dateOfBirth" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small fw-bold">Gender</label>
                                    <select class="form-select" v-model="p.gender" required>
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small fw-bold">Nationality</label>
                                    <input type="text" class="form-control" v-model="p.nationality" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small fw-bold">Phone (11 digits)</label>
                                    <input type="tel" class="form-control" v-model="p.phone" maxlength="11" @input="digitsOnly(p)" placeholder="09XXXXXXXXX" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small fw-bold">Passport Number</label>
                                    <input type="text" class="form-control" v-model="p.passportNumber" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small fw-bold">Passport Expiry</label>
                                    <input type="date" class="form-control" v-model="p.passportExpiry" required>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Seat Map Container -->
                    <div class="card shadow-sm border-0 mb-4">
                        <div class="card-header bg-white d-flex justify-content-between align-items-center py-3" style="cursor: pointer;" @click="toggleSection('seats')">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-grid-3x3-gap fs-4 text-primary me-3"></i>
                                <div>
                                    <h6 class="mb-0 fw-bold">Select Seats</h6>
                                    <small class="text-muted">Choose a seat for each passenger</small>
                                </div>
                            </div>
                            <i :class="isOpen('seats') ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                        </div>
                        
                        <div class="card-body p-4" v-if="isOpen('seats')">
                            
                            <div class="d-flex gap-2 mb-4 overflow-auto">
                                <button
                                    v-for="(flight, i) in flightsMap"
                                    :key="i"
                                    class="btn"
                                    :class="activeLegIndex === i ? 'btn-primary' : 'btn-outline-secondary'"
                                    @click="activeLegIndex = i; activePassengerIndex = bookingStore.legs?.[i]?.selectedSeatIds?.findIndex(id => !id) ?? 0; activePassengerIndex = activePassengerIndex < 0 ? passengerCount - 1 : activePassengerIndex"
                                >
                                    Leg {{ i + 1 }}: {{ flight.flightNumber }}
                                    <i v-if="bookingStore.legs?.[i]?.selectedSeatIds?.every(id => !!id) && bookingStore.legs?.[i]?.selectedSeatIds?.length === passengerCount" class="bi bi-check-circle-fill text-warning ms-1"></i>
                                </button>
                            </div>

                            <!-- Auto-advance status strip — no manual tabs needed -->
                            <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom flex-wrap">
                                <div
                                    v-for="(p, i) in bookingStore.passengers"
                                    :key="i"
                                    class="d-flex align-items-center gap-2 px-3 py-2 rounded"
                                    :class="i === activePassengerIndex
                                        ? 'bg-success text-white fw-bold'
                                        : ownerOf(activeLegIndex, bookingStore.legs?.[activeLegIndex]?.selectedSeatIds?.[i]) > -1 || bookingStore.legs?.[activeLegIndex]?.selectedSeatIds?.[i]
                                            ? 'bg-light text-success border border-success'
                                            : 'bg-light text-muted border'"
                                    style="font-size: 0.85rem;"
                                >
                                    <i
                                        class="bi"
                                        :class="bookingStore.legs?.[activeLegIndex]?.selectedSeatIds?.[i]
                                            ? 'bi-check-circle-fill'
                                            : i === activePassengerIndex ? 'bi-cursor-fill' : 'bi-circle'"
                                    ></i>
                                    Pax {{ i + 1 }}
                                    <span v-if="bookingStore.legs?.[activeLegIndex]?.selectedSeatIds?.[i]" class="ms-1 small opacity-75">
                                        · {{ seatsMap[currentFlightId]?.find(s => s._id === bookingStore.legs[activeLegIndex].selectedSeatIds[i])?.seatNumber || '—' }}
                                    </span>
                                    <span v-else-if="i === activePassengerIndex" class="ms-1 small opacity-75">← pick a seat</span>
                                </div>
                            </div>

                            <div class="text-center p-3 bg-light rounded border">
                                <!-- Column headers -->
                                <div class="d-flex justify-content-center gap-2 mb-2">
                                    <div style="width:20px"></div>
                                    <template v-for="col in COLS" :key="col ?? 'aisle'">
                                        <div v-if="col === null" style="width: 30px;"></div>
                                        <div v-else class="fw-bold text-muted" style="width: 40px;">{{ col }}</div>
                                    </template>
                                </div>

                                <!-- Business class label + price -->
                                <div class="d-flex align-items-center gap-2 mb-2 mt-3">
                                    <span class="badge bg-warning text-dark px-3 py-2">
                                        <i class="bi bi-star-fill me-1"></i>Business Class
                                    </span>
                                    <span class="text-muted small fw-bold" v-if="currentLeg">
                                        ₱{{ (currentLeg.businessPrice ?? 0).toLocaleString() }} / seat
                                    </span>
                                </div>

                                <!-- Business rows (rows ≤ BUSINESS_ROWS, i.e. row 1–2) -->
                                <div
                                    v-for="r in seatRows(currentFlightId).filter(r => r <= 2)"
                                    :key="'b-' + r"
                                    class="d-flex justify-content-center gap-2 mb-2"
                                >
                                    <div class="fw-bold text-muted d-flex align-items-center justify-content-center" style="width: 20px;">{{ r }}</div>
                                    <template v-for="col in COLS" :key="col ?? 'aisle'">
                                        <div v-if="col === null" style="width: 30px;"></div>
                                        <button
                                            v-else
                                            type="button"
                                            class="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                                            :class="seatBtnClass(activeLegIndex, seatAt(currentFlightId, r, col))"
                                            style="width: 40px; height: 40px;"
                                            :disabled="!seatAt(currentFlightId, r, col) || seatAt(currentFlightId, r, col).isOccupied"
                                            @click="onSeatClick(activeLegIndex, seatAt(currentFlightId, r, col))"
                                        >
                                            {{ r }}{{ col }}
                                        </button>
                                    </template>
                                </div>

                                <!-- Divider -->
                                <hr class="my-3 border-dashed" />

                                <!-- Economy class label + price -->
                                <div class="d-flex align-items-center gap-2 mb-2">
                                    <span class="badge bg-success px-3 py-2">
                                        <i class="bi bi-person-fill me-1"></i>Economy Class
                                    </span>
                                    <span class="text-muted small fw-bold" v-if="currentLeg">
                                        ₱{{ (currentLeg.basePrice ?? 0).toLocaleString() }} / seat
                                    </span>
                                </div>

                                <!-- Economy rows (rows > 2) -->
                                <div
                                    v-for="r in seatRows(currentFlightId).filter(r => r > 2)"
                                    :key="'e-' + r"
                                    class="d-flex justify-content-center gap-2 mb-2"
                                >
                                    <div class="fw-bold text-muted d-flex align-items-center justify-content-center" style="width: 20px;">{{ r }}</div>
                                    <template v-for="col in COLS" :key="col ?? 'aisle'">
                                        <div v-if="col === null" style="width: 30px;"></div>
                                        <button
                                            v-else
                                            type="button"
                                            class="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                                            :class="seatBtnClass(activeLegIndex, seatAt(currentFlightId, r, col))"
                                            style="width: 40px; height: 40px;"
                                            :disabled="!seatAt(currentFlightId, r, col) || seatAt(currentFlightId, r, col).isOccupied"
                                            @click="onSeatClick(activeLegIndex, seatAt(currentFlightId, r, col))"
                                        >
                                            {{ r }}{{ col }}
                                        </button>
                                    </template>
                                </div>

                                <!-- Legend -->
                                <div class="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                                    <span class="d-flex align-items-center gap-1 small">
                                        <span class="btn btn-sm btn-outline-warning px-2 py-0" style="pointer-events:none;">1A</span> Business
                                    </span>
                                    <span class="d-flex align-items-center gap-1 small">
                                        <span class="btn btn-sm btn-outline-success px-2 py-0" style="pointer-events:none;">3A</span> Economy
                                    </span>
                                    <span class="d-flex align-items-center gap-1 small">
                                        <span class="btn btn-sm btn-primary px-2 py-0" style="pointer-events:none;">✓</span> Your seat
                                    </span>
                                    <span class="d-flex align-items-center gap-1 small">
                                        <span class="btn btn-sm btn-info px-2 py-0" style="pointer-events:none;">✓</span> Other pax
                                    </span>
                                    <span class="d-flex align-items-center gap-1 small">
                                        <span class="btn btn-sm btn-secondary px-2 py-0" style="pointer-events:none;">✗</span> Taken
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end mb-5">
                        <button type="button" class="btn btn-lg btn-success px-5 fw-bold shadow" @click="validateAndContinue">
                            Continue to Payment <i class="bi bi-arrow-right ms-2"></i>
                        </button>
                    </div>

                </div>

                <div class="col-lg-4">
                    <div class="card shadow-sm border-0 position-sticky" style="top: 2rem;">
                        <div class="card-header bg-dark text-white py-3">
                            <h5 class="mb-0"><i class="bi bi-receipt me-2"></i> Booking Summary</h5>
                        </div>
                        <div class="card-body">
                            <div class="text-muted small border-bottom pb-2 mb-3">
                                {{ bookingStore.passengers.length }} passenger(s) · {{ flightsMap.length }} flight(s)
                            </div>

                            <!-- Per-leg seat selection summary -->
                            <div v-for="flight in flightsMap" :key="flight._id" class="mb-3">
                                <div class="fw-bold small text-primary text-uppercase mb-1">
                                    {{ flight.flightNumber }}
                                </div>
                                <div
                                    v-for="(seat, pIdx) in (selectedSeats[flight._id] || [])"
                                    :key="seat._id"
                                    class="d-flex justify-content-between align-items-center my-1 ms-1"
                                >
                                    <span class="small text-muted">
                                        Pax {{ pIdx + 1 }} · Seat {{ seat.seatNumber }}
                                        <span
                                            class="badge ms-1"
                                            :class="seat.class === 'business' ? 'bg-warning text-dark' : 'bg-success'"
                                        >{{ seat.class }}</span>
                                    </span>
                                    <span class="fw-bold small text-dark">
                                        ₱{{ getSeatPrice(flight, seat).toLocaleString() }}
                                    </span>
                                </div>
                                <div v-if="!(selectedSeats[flight._id] || []).length" class="small text-muted ms-1">
                                    No seats selected yet
                                </div>
                            </div>
                            
                            <div class="d-flex justify-content-between align-items-center pt-3 mt-2 border-top">
                                <h5 class="fw-bold mb-0">Total</h5>
                                <h4 class="text-success fw-bold mb-0">
                                    ₱{{ grandTotalValue.toLocaleString() }}
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>