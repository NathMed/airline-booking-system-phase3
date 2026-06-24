<script setup>
import { ref, onMounted, computed } from 'vue';
import { getAllFlights, getAllSeats, getAllAirports } from '../../api'; 
import { useRouter } from 'vue-router';

const router = useRouter();
const flightSummaries = ref([]);
const airportsList = ref([]); // Store airports for translation
const isLoading = ref(true);
const pageError = ref(null);
const searchQuery = ref('');

// Translator function: turns raw ID into an Airport Code (e.g., "JFK")
// Translator function: turns raw ID into an IATA Code (e.g., "JFK")
const getAirportCode = (id) => {
    if (!id) return 'TBA';
    // If backend ever populates it, use it directly
    if (id.iataCode) return id.iataCode; 
    if (id.airportCode) return id.airportCode; 
    
    // Otherwise, search our local list of airports
    const found = airportsList.value.find(a => a._id === id.toString());
    // Look for iataCode first, fallback to name, then TBA
    return found ? (found.iataCode || found.name) : 'TBA';
};

const fetchData = async () => {
    isLoading.value = true;
    pageError.value = null;
    try {
        // Fetch flights, seats, AND airports simultaneously
        const [flightsData, seatsData, airportsData] = await Promise.all([
            getAllFlights().catch(() => ({ result: [] })),
            getAllSeats().catch(() => ({ result: [] })),
            getAllAirports().catch(() => ({ result: [] }))
        ]);

        const flights = flightsData.result || flightsData.flights || [];
        const allSeats = seatsData.result || seatsData.seats || [];
        airportsList.value = airportsData.result || airportsData.airports || [];

        flightSummaries.value = flights.map(flight => {
            const flightSeats = allSeats.filter(seat => seat.flightId === flight._id);
            const total = flightSeats.length;
            const occupied = flightSeats.filter(seat => seat.isOccupied).length;
            
            // Format the date using departureTime from your backend
            const dateVal = flight.departureTime; 
            const displayDate = dateVal ? new Date(dateVal).toLocaleString() : 'Date TBA';
            
            return {
                ...flight,
                displayOrigin: getAirportCode(flight.originAirportId),
                displayDest: getAirportCode(flight.destinationAirportId),
                displayDate: displayDate,
                seatStats: { total, occupied, available: total - occupied }
            };
        });
    } catch (error) {
        pageError.value = "Failed to load flight and seat data.";
    } finally {
        isLoading.value = false;
    }
};

const filteredFlights = computed(() => {
    if (!searchQuery.value) return flightSummaries.value;
    const query = searchQuery.value.toLowerCase();
    return flightSummaries.value.filter(f => 
        f._id.toLowerCase().includes(query) || 
        f.displayOrigin.toLowerCase().includes(query) ||
        f.displayDest.toLowerCase().includes(query)
    );
});

const navigateToDetails = (flightId) => {
    router.push(`/admin/seats/${flightId}`);
};

onMounted(() => fetchData());
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0"><i class="bi bi-grid-3x3 me-2"></i>Seat Capacity Overview</h4>
      <button @click="fetchData" class="btn btn-outline-secondary btn-sm" :disabled="isLoading">
        <i class="bi bi-arrow-clockwise"></i> Refresh
      </button>
    </div>

    <div v-if="pageError" class="alert alert-danger shadow-sm py-2 px-3 mb-4">
      <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ pageError }}
    </div>

    <div class="card shadow-sm border-0 mb-4">
        <div class="card-body py-3">
            <div class="input-group">
                <span class="input-group-text bg-white text-muted border-end-0">
                    <i class="bi bi-search"></i>
                </span>
                <input type="text" class="form-control border-start-0 ps-0" v-model="searchQuery" placeholder="Search by Flight ID or Airport Code...">
            </div>
        </div>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="filteredFlights.length === 0" class="alert alert-light shadow-sm text-center py-5 border">
      <i class="bi bi-airplane text-muted d-block fs-1 mb-3"></i>
      <h6 class="text-secondary">No Flights Found</h6>
    </div>

    <div v-else class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover table-striped mb-0 align-middle">
          <thead class="table-dark">
            <tr>
              <th>Route</th>
              <th>Date</th>
              <th>Occupancy Status</th>
              <th>Capacity</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="flight in filteredFlights" :key="flight._id">
              <td>
                <span class="fw-bold fs-6">
                    {{ flight.displayOrigin }} 
                    <i class="bi bi-arrow-right mx-1 text-muted"></i> 
                    {{ flight.displayDest }}
                </span>
                <br>
                <small class="text-muted"><i class="bi bi-fingerprint"></i> {{ flight._id }}</small>
              </td>
              <td>{{ flight.displayDate }}</td>
              <td>
                  <div class="progress" style="height: 10px; width: 150px;">
                      <div class="progress-bar bg-primary" role="progressbar" 
                           :style="{ width: (flight.seatStats.total > 0 ? (flight.seatStats.occupied / flight.seatStats.total) * 100 : 0) + '%' }">
                      </div>
                  </div>
                  <small class="text-muted">{{ flight.seatStats.occupied }} / {{ flight.seatStats.total }} Occupied</small>
              </td>
              <td>
                  <span v-if="flight.seatStats.total === 0" class="badge bg-warning text-dark">No Seats Generated</span>
                  <span v-else class="badge" :class="flight.seatStats.available > 0 ? 'bg-success' : 'bg-danger'">
                      {{ flight.seatStats.available }} Available
                  </span>
              </td>
              <td class="text-center">
                <button @click="navigateToDetails(flight._id)" class="btn btn-outline-primary btn-sm rounded-pill">
                  Manage Seats <i class="bi bi-arrow-right"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>