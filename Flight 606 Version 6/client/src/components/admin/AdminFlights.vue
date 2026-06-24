<script setup>
import { ref, onMounted } from 'vue';
import {
    getAllFlights, createFlight, updateFlight, deactivateFlight, reactivateFlight,
    getAllAirlines, getAllAircraft, getAllAirports
} from '../../api.js';

const flights = ref([]);
const airlines = ref([]);
const aircraft = ref([]);
const airports = ref([]);

const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const isSubmitting = ref(false);
const showCreateForm = ref(false);
const showEditModal = ref(false);

const emptyForm = () => ({
    airlineId: '',
    aircraftId: '',
    originAirportId: '',
    destinationAirportId: '',
    flightNumber: '',
    departureTime: '',
    arrivalTime: '',
    basePrice: '',
    businessPrice: '',
    originTerminal: '',
    destinationTerminal: ''
});

const form = ref(emptyForm());
const editForm = ref({ id: null, ...emptyForm(), status: '' });

const statusOptions = ['scheduled', 'delayed', 'on-time', 'cancelled', 'departed', 'arrived'];

// Helper: Append strict +08:00 Philippine Standard Time offset to input fields
function formatToPHTPayload(localDateTimeString) {
    if (!localDateTimeString) return null;
    return `${localDateTimeString}:00+08:00`;
}

// Helper: Convert a saved DB string back into matching local YYYY-MM-DDTHH:mm for inputs using Asia/Manila
function convertToPHTInputString(dt) {
    if (!dt) return '';
    const date = new Date(dt);
    const datePart = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
    const timePart = date.toLocaleTimeString('en-GB', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' });
    return `${datePart}T${timePart}`;
}

function formatDateTime(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-PH', {
        timeZone: 'Asia/Manila', // Enforce Philippine Standard Time on table views
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function calcTravelTime(departure, arrival) {
    if (!departure || !arrival) return '—';
    const diff = new Date(arrival) - new Date(departure);
    if (diff <= 0) return '—';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

function getLabel(list, id, field = 'name') {
    if (!list || !Array.isArray(list)) return '—';
    const found = list.find(i => String(i._id) === String(id));
    return found ? found[field] : '—';
}

function getAirportCode(id) {
    if (!airports.value || !Array.isArray(airports.value)) return '—';
    const found = airports.value.find(i => String(i._id) === String(id));
    return found ? found.iataCode : '—';
}

async function loadData() {
    try {
        isLoading.value = true;
        const [flightsRes, airlinesRes, aircraftRes, airportsRes] = await Promise.allSettled([
            getAllFlights(),
            getAllAirlines(),
            getAllAircraft(),
            getAllAirports()
        ]);
        if (flightsRes.status === 'fulfilled') {
            flights.value = flightsRes.value.result || flightsRes.value.flights || [];
        }
        if (airlinesRes.status === 'fulfilled') {
            airlines.value = airlinesRes.value.result.filter(a => a.isActive);
        } else {
            airlines.value = [];
        }
        if (aircraftRes.status === 'fulfilled') {
            aircraft.value = aircraftRes.value.result.filter(a => a.isActive);
        } else {
            aircraft.value = [];
        }
        if (airportsRes.status === 'fulfilled') airports.value = airportsRes.value.result.filter(a => a.isActive);
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Failed to load data.';
    } finally {
        isLoading.value = false;
    }
}

function validateForm(f) {
    if (!f.airlineId) return 'Please select an airline.';
    if (!f.aircraftId) return 'Please select an aircraft.';
    if (!f.originAirportId) return 'Please select an origin airport.';
    if (!f.destinationAirportId) return 'Please select a destination airport.';
    if (f.originAirportId === f.destinationAirportId) return 'Origin and destination airports cannot be the same.';
    if (!f.flightNumber.trim()) return 'Flight number is required.';
    if (!f.departureTime) return 'Departure time is required.';
    if (!f.arrivalTime) return 'Arrival time is required.';
    
    // Evaluate timestamps cleanly against explicit PHT offsets for accurate temporal checking
    if (new Date(formatToPHTPayload(f.arrivalTime)) <= new Date(formatToPHTPayload(f.departureTime))) {
        return 'Arrival time must be after departure time.';
    }
    
    if (!f.basePrice || f.basePrice <= 0) return 'Economy price must be a positive number.';
    if (!f.businessPrice || f.businessPrice <= 0) return 'Business price must be a positive number.';
    if (Number(f.businessPrice) <= Number(f.basePrice)) return 'Business class price must be greater than economy price.';
    return null;
}

async function handleCreate() {
    errorMessage.value = '';
    successMessage.value = '';
    const err = validateForm(form.value);
    if (err) { errorMessage.value = err; return; }

    try {
        isSubmitting.value = true;
        await createFlight({
            airlineId: form.value.airlineId,
            aircraftId: form.value.aircraftId,
            originAirportId: form.value.originAirportId,
            destinationAirportId: form.value.destinationAirportId,
            flightNumber: form.value.flightNumber,
            departureTime: formatToPHTPayload(form.value.departureTime),
            arrivalTime: formatToPHTPayload(form.value.arrivalTime),
            basePrice: Number(form.value.basePrice),
            businessPrice: Number(form.value.businessPrice),
            originTerminal: form.value.originTerminal || null,
            destinationTerminal: form.value.destinationTerminal || null
        });
        successMessage.value = 'Flight created successfully.';
        form.value = emptyForm();
        showCreateForm.value = false;
        await loadData();
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Failed to create flight.';
    } finally {
        isSubmitting.value = false;
    }
}

function openEditModal(flight) {
    editForm.value = {
        id: flight._id,
        airlineId: flight.airlineId,
        aircraftId: flight.aircraftId,
        originAirportId: flight.originAirportId,
        destinationAirportId: flight.destinationAirportId,
        flightNumber: flight.flightNumber,
        departureTime: convertToPHTInputString(flight.departureTime),
        arrivalTime: convertToPHTInputString(flight.arrivalTime),
        basePrice: flight.basePrice,
        businessPrice: flight.businessPrice,
        originTerminal: flight.originTerminal || '',
        destinationTerminal: flight.destinationTerminal || '',
        status: flight.status
    };
    showEditModal.value = true;
}

function closeEditModal() {
    showEditModal.value = false;
    editForm.value = { id: null, ...emptyForm(), status: '' };
}

async function handleEdit() {
    errorMessage.value = '';
    successMessage.value = '';
    const err = validateForm(editForm.value);
    if (err) { errorMessage.value = err; return; }

    try {
        isSubmitting.value = true;
        await updateFlight(editForm.value.id, {
            airlineId: editForm.value.airlineId,
            aircraftId: editForm.value.aircraftId,
            originAirportId: editForm.value.originAirportId,
            destinationAirportId: editForm.value.destinationAirportId,
            flightNumber: editForm.value.flightNumber,
            departureTime: formatToPHTPayload(editForm.value.departureTime),
            arrivalTime: formatToPHTPayload(editForm.value.arrivalTime),
            basePrice: Number(editForm.value.basePrice),
            businessPrice: Number(editForm.value.businessPrice),
            originTerminal: editForm.value.originTerminal || null,
            destinationTerminal: editForm.value.destinationTerminal || null,
            status: editForm.value.status
        });
        successMessage.value = 'Flight updated successfully.';
        closeEditModal();
        await loadData();
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Failed to update flight.';
    } finally {
        isSubmitting.value = false;
    }
}

async function toggleStatus(flight) {
    errorMessage.value = '';
    successMessage.value = '';
    try {
        if (flight.isActive) {
            await deactivateFlight(flight._id);
        } else {
            await reactivateFlight(flight._id);
        }
        await loadData();
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Failed to update flight status.';
    }
}

function statusBadgeClass(status) {
    const map = {
        scheduled: 'bg-primary',
        delayed: 'bg-warning text-dark',
        'on-time': 'bg-success',
        cancelled: 'bg-danger',
        departed: 'bg-info text-dark',
        arrived: 'bg-secondary'
    };
    return map[status] || 'bg-secondary';
}

onMounted(loadData);
</script>

<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Flights</h2>
            <button class="btn btn-primary" @click="showCreateForm = !showCreateForm">
                {{ showCreateForm ? 'Cancel' : 'Create Flight' }}
            </button>
        </div>

        <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <div v-if="showCreateForm" class="card mb-4">
            <div class="card-body">
                <h5 class="card-title mb-3">New Flight</h5>
                <form @submit.prevent="handleCreate">
                    <div class="row">

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Airline</label>
                            <select v-model="form.airlineId" class="form-select" required>
                                <option value="" disabled>Select airline</option>
                                <option v-for="a in airlines" :key="a._id" :value="a._id">{{ a.name }}</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Aircraft</label>
                            <select v-model="form.aircraftId" class="form-select" required>
                                <option value="" disabled>Select aircraft</option>
                                <option v-for="a in aircraft" :key="a._id" :value="a._id">{{ a.model }}</option>
                            </select>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Origin Airport</label>
                            <select v-model="form.originAirportId" class="form-select" required>
                                <option value="" disabled>Select origin</option>
                                <option v-for="a in airports" :key="a._id" :value="a._id">{{ a.iataCode }} — {{ a.city }}</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Destination Airport</label>
                            <select v-model="form.destinationAirportId" class="form-select" required>
                                <option value="" disabled>Select destination</option>
                                <option v-for="a in airports" :key="a._id" :value="a._id">{{ a.iataCode }} — {{ a.city }}</option>
                            </select>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Origin Terminal <span class="text-muted">(optional)</span></label>
                            <input v-model="form.originTerminal" type="text" class="form-control" placeholder="e.g. T1" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Destination Terminal <span class="text-muted">(optional)</span></label>
                            <input v-model="form.destinationTerminal" type="text" class="form-control" placeholder="e.g. T3" />
                        </div>

                        <div class="col-md-4 mb-3">
                            <label class="form-label">Flight Number</label>
                            <input v-model="form.flightNumber" type="text" class="form-control" placeholder="e.g. JL782" required />
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Departure Time</label>
                            <input v-model="form.departureTime" type="datetime-local" class="form-control" required />
                            <div v-if="form.departureTime" class="form-text text-success fw-bold small mt-1">
                                PHT Preview: {{ formatDateTime(formatToPHTPayload(form.departureTime)) }}
                            </div>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Arrival Time</label>
                            <input v-model="form.arrivalTime" type="datetime-local" class="form-control" required />
                            <div v-if="form.arrivalTime" class="form-text text-success fw-bold small mt-1">
                                PHT Preview: {{ formatDateTime(formatToPHTPayload(form.arrivalTime)) }}
                            </div>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Economy Price (₱)</label>
                            <input v-model="form.basePrice" type="number" class="form-control" min="1" placeholder="e.g. 5000" required />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Business Price (₱)</label>
                            <input v-model="form.businessPrice" type="number" class="form-control" min="1" placeholder="e.g. 10000" required />
                        </div>

                    </div>
                    <button type="submit" class="btn btn-success" :disabled="isSubmitting">
                        {{ isSubmitting ? 'Saving...' : 'Save Flight' }}
                    </button>
                </form>
            </div>
        </div>

        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border" role="status"></div>
        </div>

        <div v-else class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Flight No.</th>
                        <th>Airline</th>
                        <th>Route</th>
                        <th>Departure</th>
                        <th>Arrival</th>
                        <th>Travel Time</th>
                        <th>Economy (₱)</th>
                        <th>Business (₱)</th>
                        <th>Flight Status</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="flights.length === 0">
                        <td colspan="11" class="text-center">No flights found.</td>
                    </tr>
                    <tr v-for="flight in flights" :key="flight._id">
                        <td>{{ flight.flightNumber }}</td>
                        <td>{{ getLabel(airlines, flight.airlineId) }}</td>
                        <td>{{ getAirportCode(flight.originAirportId) }} → {{ getAirportCode(flight.destinationAirportId) }}</td>
                        <td>{{ formatDateTime(flight.departureTime) }}</td>
                        <td>{{ formatDateTime(flight.arrivalTime) }}</td>
                        <td>{{ calcTravelTime(flight.departureTime, flight.arrivalTime) }}</td>
                        <td>₱{{ flight.basePrice.toLocaleString() }}</td>
                        <td>₱{{ flight.businessPrice.toLocaleString() }}</td>
                        <td>
                            <span class="badge" :class="statusBadgeClass(flight.status)">
                                {{ flight.status }}
                            </span>
                        </td>
                        <td>
                            <span class="badge" :class="flight.isActive ? 'bg-success' : 'bg-danger'">
                                {{ flight.isActive ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning me-2" @click="openEditModal(flight)">Edit</button>
                            <button
                                class="btn btn-sm"
                                :class="flight.isActive ? 'btn-danger' : 'btn-success'"
                                @click="toggleStatus(flight)"
                            >
                                {{ flight.isActive ? 'Deactivate' : 'Reactivate' }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="showEditModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Flight</h5>
                        <button type="button" class="btn-close" @click="closeEditModal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Airline</label>
                                <select v-model="editForm.airlineId" class="form-select">
                                    <option value="" disabled>Select airline</option>
                                    <option v-for="a in airlines" :key="a._id" :value="a._id">{{ a.name }}</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Aircraft</label>
                                <select v-model="editForm.aircraftId" class="form-select">
                                    <option value="" disabled>Select aircraft</option>
                                    <option v-for="a in aircraft" :key="a._id" :value="a._id">{{ a.model }}</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Origin Airport</label>
                                <select v-model="editForm.originAirportId" class="form-select">
                                    <option value="" disabled>Select origin</option>
                                    <option v-for="a in airports" :key="a._id" :value="a._id">{{ a.iataCode }} — {{ a.city }}</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Destination Airport</label>
                                <select v-model="editForm.destinationAirportId" class="form-select">
                                    <option value="" disabled>Select destination</option>
                                    <option v-for="a in airports" :key="a._id" :value="a._id">{{ a.iataCode }} — {{ a.city }}</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Origin Terminal</label>
                                <input v-model="editForm.originTerminal" type="text" class="form-control" placeholder="e.g. T1" />
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Destination Terminal</label>
                                <input v-model="editForm.destinationTerminal" type="text" class="form-control" placeholder="e.g. T3" />
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Flight Number</label>
                                <input v-model="editForm.flightNumber" type="text" class="form-control" />
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Departure Time</label>
                                <input v-model="editForm.departureTime" type="datetime-local" class="form-control" />
                                <div v-if="editForm.departureTime" class="form-text text-success fw-bold small mt-1">
                                    PHT Preview: {{ formatDateTime(formatToPHTPayload(editForm.departureTime)) }}
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Arrival Time</label>
                                <input v-model="editForm.arrivalTime" type="datetime-local" class="form-control" />
                                <div v-if="editForm.arrivalTime" class="form-text text-success fw-bold small mt-1">
                                    PHT Preview: {{ formatDateTime(formatToPHTPayload(editForm.arrivalTime)) }}
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Economy Price (₱)</label>
                                <input v-model="editForm.basePrice" type="number" min="1" class="form-control" />
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Business Price (₱)</label>
                                <input v-model="editForm.businessPrice" type="number" min="1" class="form-control" />
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Status</label>
                                <select v-model="editForm.status" class="form-select">
                                    <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" @click="closeEditModal">Cancel</button>
                        <button class="btn btn-primary" :disabled="isSubmitting" @click="handleEdit">
                            {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.form-text {
    font-size: 0.825rem;
}
</style>