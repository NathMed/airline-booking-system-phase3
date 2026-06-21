<script setup>
import { reactive, ref, onMounted } from 'vue'
import {
  getAllAirlines,
  getAllAirports,
  getAllAircraft,
  createFlight
} from '../api.js'

// NOTE: Airline/Airport/Aircraft model field names weren't in the files I
// was given (no Airline.js / Airport.js / Aircraft.js / their controllers),
// so the label fallbacks below (airlineLabel/airportLabel/aircraftLabel)
// guess at common field names. Once you confirm the real field names, trim
// each fallback chain down to the one that's actually correct.

const airlines  = ref([])
const airports  = ref([])
const aircraft  = ref([])
const loadingOptions = ref(true)
const optionsError   = ref('')

const form = reactive({
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
})

const submitting = ref(false)
const formError   = ref('')
const formSuccess = ref('')

function airlineLabel(a) {
  return a.name || a.airlineName || a.code || a.iataCode || a._id
}
function airportLabel(a) {
  const code = a.iataCode || a.code
  const city = a.city || a.name
  return code && city ? `${code} — ${city}` : (code || city || a._id)
}
function aircraftLabel(a) {
  return a.model || a.name || a.tailNumber || a.registration || a._id
}

async function loadOptions() {
  loadingOptions.value = true
  optionsError.value = ''
  try {
    const [airlineRes, airportRes, aircraftRes] = await Promise.all([
      getAllAirlines(),
      getAllAirports(),
      getAllAircraft()
    ])
    airlines.value = airlineRes.result || []
    airports.value = airportRes.result || []
    aircraft.value = aircraftRes.result || []
  } catch (err) {
    optionsError.value = err?.response?.data?.message || 'Could not load airlines, airports, or aircraft.'
  } finally {
    loadingOptions.value = false
  }
}

onMounted(loadOptions)

function resetForm() {
  form.airlineId = ''
  form.aircraftId = ''
  form.originAirportId = ''
  form.destinationAirportId = ''
  form.flightNumber = ''
  form.departureTime = ''
  form.arrivalTime = ''
  form.basePrice = ''
  form.businessPrice = ''
  form.originTerminal = ''
  form.destinationTerminal = ''
}

async function submitFlight() {
  formError.value = ''
  formSuccess.value = ''

  // Light client-side checks mirroring the backend's own validation —
  // the backend (verify + verifyAdmin + the checks in createFlight) is the
  // real boundary here, this is just to save the admin a round trip.
  if (!form.airlineId || !form.aircraftId || !form.originAirportId || !form.destinationAirportId) {
    formError.value = 'Airline, aircraft, origin, and destination are all required.'
    return
  }
  if (form.originAirportId === form.destinationAirportId) {
    formError.value = 'Origin and destination airports must be different.'
    return
  }
  if (!form.flightNumber || !form.departureTime || !form.arrivalTime) {
    formError.value = 'Flight number, departure time, and arrival time are required.'
    return
  }
  if (form.basePrice === '' || form.businessPrice === '') {
    formError.value = 'Both economy and business prices are required.'
    return
  }
  if (Number(form.businessPrice) <= Number(form.basePrice)) {
    formError.value = 'Business class price must be greater than economy price.'
    return
  }

  submitting.value = true
  try {
    const payload = {
      airlineId: form.airlineId,
      aircraftId: form.aircraftId,
      originAirportId: form.originAirportId,
      destinationAirportId: form.destinationAirportId,
      flightNumber: form.flightNumber.trim().toUpperCase(),
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      basePrice: Number(form.basePrice),
      businessPrice: Number(form.businessPrice),
      originTerminal: form.originTerminal || undefined,
      destinationTerminal: form.destinationTerminal || undefined
    }
    const res = await createFlight(payload)
    formSuccess.value = res.message || 'Flight created successfully.'
    resetForm()
  } catch (err) {
    formError.value = err?.response?.data?.message || 'Could not create the flight. Please check the details and try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page inner-page active">

    <!-- Hero, matching every other inner page (Search Flights, Flight Status, etc.) -->
    <section class="inner-hero">
      <div class="container">
        <p class="hero-eyebrow">Admin</p>
        <h1 class="hero-title">New Flight <em>Path</em></h1>
        <p class="hero-sub">Add a new scheduled flight to the network. Seats are generated automatically from the assigned aircraft's configuration.</p>
      </div>
    </section>

    <section class="section-pad bg-dark-base" style="padding-top: 56px; padding-bottom: 80px;">
      <div class="container" style="max-width: 760px;">

        <div class="profile-section">
          <div class="ps-header">
            <h3>Flight Details</h3>
          </div>
          <div class="ps-body">

            <p v-if="optionsError" class="alert-msg alert-error">{{ optionsError }}</p>
            <p v-if="formError" class="alert-msg alert-error">{{ formError }}</p>
            <p v-if="formSuccess" class="alert-msg alert-success">{{ formSuccess }}</p>

            <form @submit.prevent="submitFlight">
              <div class="admin-form-grid">

                <div>
                  <label class="f-label" for="airlineId">Airline</label>
                  <select id="airlineId" class="f-input" v-model="form.airlineId" :disabled="loadingOptions">
                    <option value="" disabled>{{ loadingOptions ? 'Loading…' : 'Select airline' }}</option>
                    <option v-for="a in airlines" :key="a._id" :value="a._id">{{ airlineLabel(a) }}</option>
                  </select>
                </div>

                <div>
                  <label class="f-label" for="aircraftId">Aircraft</label>
                  <select id="aircraftId" class="f-input" v-model="form.aircraftId" :disabled="loadingOptions">
                    <option value="" disabled>{{ loadingOptions ? 'Loading…' : 'Select aircraft' }}</option>
                    <option v-for="a in aircraft" :key="a._id" :value="a._id">{{ aircraftLabel(a) }}</option>
                  </select>
                </div>

                <div>
                  <label class="f-label" for="originAirportId">Departure Airport</label>
                  <select id="originAirportId" class="f-input" v-model="form.originAirportId" :disabled="loadingOptions">
                    <option value="" disabled>{{ loadingOptions ? 'Loading…' : 'Select origin' }}</option>
                    <option v-for="a in airports" :key="a._id" :value="a._id">{{ airportLabel(a) }}</option>
                  </select>
                </div>

                <div>
                  <label class="f-label" for="destinationAirportId">Arrival Airport</label>
                  <select id="destinationAirportId" class="f-input" v-model="form.destinationAirportId" :disabled="loadingOptions">
                    <option value="" disabled>{{ loadingOptions ? 'Loading…' : 'Select destination' }}</option>
                    <option v-for="a in airports" :key="a._id" :value="a._id">{{ airportLabel(a) }}</option>
                  </select>
                </div>

                <div>
                  <label class="f-label" for="flightNumber">Flight Number</label>
                  <input id="flightNumber" class="f-input" type="text" v-model="form.flightNumber" placeholder="e.g. FL606" />
                </div>

                <div></div>

                <div>
                  <label class="f-label" for="departureTime">Departure Time</label>
                  <input id="departureTime" class="f-input" type="datetime-local" v-model="form.departureTime" />
                </div>

                <div>
                  <label class="f-label" for="arrivalTime">Arrival Time</label>
                  <input id="arrivalTime" class="f-input" type="datetime-local" v-model="form.arrivalTime" />
                </div>

                <div>
                  <label class="f-label" for="originTerminal">Departure Terminal <span style="text-transform:none;">(optional)</span></label>
                  <input id="originTerminal" class="f-input" type="text" v-model="form.originTerminal" placeholder="e.g. T2" />
                </div>

                <div>
                  <label class="f-label" for="destinationTerminal">Arrival Terminal <span style="text-transform:none;">(optional)</span></label>
                  <input id="destinationTerminal" class="f-input" type="text" v-model="form.destinationTerminal" placeholder="e.g. T4" />
                </div>

                <div>
                  <label class="f-label" for="basePrice">Economy Price</label>
                  <input id="basePrice" class="f-input" type="number" min="0" step="0.01" v-model="form.basePrice" placeholder="0.00" />
                </div>

                <div>
                  <label class="f-label" for="businessPrice">Business Price</label>
                  <input id="businessPrice" class="f-input" type="number" min="0" step="0.01" v-model="form.businessPrice" placeholder="0.00" />
                </div>

              </div>

              <button type="submit" class="btn-gold-full" style="margin-top: 24px;" :disabled="submitting">
                {{ submitting ? 'Creating…' : 'Create Flight' }}
              </button>
            </form>

          </div>
        </div>

      </div>
    </section>
  </div>
</template>

<style scoped>
/* Two-column responsive grid for the form fields — everything inside still
   uses the global .f-label / .f-input tokens, so light/dark theming is
   inherited automatically and nothing here hardcodes a color. */
.admin-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 20px;
}

@media (max-width: 640px) {
  .admin-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
