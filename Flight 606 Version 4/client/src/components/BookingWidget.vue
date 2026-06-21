<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CalendarPicker from './CalendarPicker.vue'
import { getAllAirports } from '../api.js'

const router = useRouter()

// ── Live airport data (replaces the old static MNL/CEB option lists) ──
const airports = ref([])
onMounted(async () => {
  try {
    const res = await getAllAirports()
    airports.value = res.result || res || []
    if (airports.value.length > 0) {
      fromVal.value = airports.value[0]._id
      if (airports.value[1]) toVal.value = airports.value[1]._id
    }
  } catch (err) {
    console.error('Failed to load airports for the booking widget:', err)
  }
})

// ── Tabs ───────────────────────────────────────────
const activeTab  = ref('buy')  // 'buy' | 'status'

// ── Trip mode ──────────────────────────────────────
const tripMode   = ref('one')  // 'one' | 'round' | 'multi'

// ── Date models ───────────────────────────────────
const depDate    = ref('')
const rtDepDate  = ref('')
const rtRetDate  = ref('')
const stDate     = ref('')

// ── Field values (now store real Airport _ids once loaded above) ──
const fromVal    = ref('')
const toVal      = ref('')
const paxVal     = ref('2 Adults')

function goToSearch() {
  if (tripMode.value === 'multi') return
  const date = tripMode.value === 'round' ? rtDepDate.value : depDate.value
  if (!fromVal.value || !toVal.value || !date) return
  router.push({
    name: 'SearchFlights',
    query: {
      from: fromVal.value,
      to: toVal.value,
      date,
      type: tripMode.value === 'round' ? 'roundtrip' : 'oneway'
    }
  })
}

const isBookDisabled = () => {
  if (tripMode.value === 'multi') return true
  const date = tripMode.value === 'round' ? rtDepDate.value : depDate.value
  return !fromVal.value || !toVal.value || !date
}

// ── Flight status lookup ───────────────────────────
const flightNumberQuery = ref('')
function goToFlightStatus() {
  if (!flightNumberQuery.value.trim()) return
  router.push({ name: 'FlightStatus', query: { flightNumber: flightNumberQuery.value.trim() } })
}

// ── Multi-city rows ────────────────────────────────
const mcRows = ref([
  { id: 1, from: 'MNL', to: 'MLE', date: '' },
  { id: 2, from: 'CEB', to: 'CDG', date: '' },
])
let mcNextId = 3

function addMcRow() {
  if (mcRows.value.length >= 5) return
  mcRows.value.push({ id: mcNextId++, from: '', to: '', date: '' })
}

function removeMcRow(id) {
  mcRows.value = mcRows.value.filter(r => r.id !== id)
}

const MC_AIRPORTS = [
  { value: '',    label: 'Select Departure…' },
  { value: 'MNL', label: 'Manila (MNL)' },
  { value: 'CEB', label: 'Cebu (CEB)' },
  { value: 'DVO', label: 'Davao (DVO)' },
  { value: 'SIN', label: 'Singapore (SIN)' },
  { value: 'TYO', label: 'Tokyo (TYO)' },
  { value: 'DXB', label: 'Dubai (DXB)' },
]

const MC_DESTS = [
  { value: '',    label: 'Select Destination…' },
  { value: 'CDG', label: 'Paris (CDG)' },
  { value: 'NRT', label: 'Tokyo (NRT)' },
  { value: 'MLE', label: 'Maldives (MLE)' },
  { value: 'GVA', label: 'Geneva (GVA)' },
  { value: 'JFK', label: 'New York (JFK)' },
  { value: 'DXB', label: 'Dubai (DXB)' },
  { value: 'MNL', label: 'Manila (MNL)' },
  { value: 'CEB', label: 'Cebu (CEB)' },
]
</script>

<template>
  <div class="booking-widget" aria-label="Flight booking widget">

    <!-- Header: tabs + CTA -->
    <div class="widget-header">
      <div class="widget-tabs">
        <button
          class="w-tab"
          :class="{ active: activeTab === 'buy' }"
          @click="activeTab = 'buy'"
        >Buy Tickets</button>
        <button
          class="w-tab"
          :class="{ active: activeTab === 'status' }"
          @click="activeTab = 'status'"
        >Check Flight Status</button>
      </div>
      <button
        class="btn-gold"
        :disabled="isBookDisabled()"
        :title="tripMode === 'multi' ? 'Multi-city search isn\'t available yet — try one-way or round-trip.' : ''"
        @click="goToSearch"
      >Book Now</button>
    </div>

    <!-- ── BUY TICKETS ── -->
    <div v-if="activeTab === 'buy'">

      <div class="trip-radios">
        <label class="r-lbl">
          <input type="radio" name="trip" value="one" v-model="tripMode">
          <span>One way</span>
        </label>
        <label class="r-lbl">
          <input type="radio" name="trip" value="round" v-model="tripMode">
          <span>Round trip</span>
        </label>
        <label class="r-lbl">
          <input type="radio" name="trip" value="multi" v-model="tripMode">
          <span>Multi-city</span>
        </label>
      </div>

      <!-- ONE WAY -->
      <div v-if="tripMode === 'one'" class="wf wf-1">
        <div class="w-field">
          <label class="w-flabel"><i class="ti ti-plane-departure"></i> From</label>
          <select class="w-sel" v-model="fromVal">
            <option value="">Select Departure…</option>
            <option v-for="a in airports" :key="a._id" :value="a._id">{{ a.city }} ({{ a.iataCode }})</option>
          </select>
        </div>
        <div class="w-field">
          <label class="w-flabel"><i class="ti ti-plane-arrival"></i> To</label>
          <select class="w-sel" v-model="toVal">
            <option value="">Select Destination…</option>
            <option v-for="a in airports" :key="a._id" :value="a._id">{{ a.city }} ({{ a.iataCode }})</option>
          </select>
        </div>
        <div class="w-field" style="position:relative; overflow:visible;">
          <label class="w-flabel"><i class="ti ti-calendar"></i> Departure Date</label>
          <CalendarPicker v-model="depDate" placeholder="Select date…" />
        </div>
        <div class="w-field">
          <label class="w-flabel"><i class="ti ti-users"></i> Passengers</label>
          <select class="w-sel" v-model="paxVal">
            <option>1 Adult</option>
            <option>2 Adults</option>
            <option>3 Adults</option>
            <option>2 Adults, 1 Child</option>
            <option>2 Adults, 2 Children</option>
          </select>
        </div>
      </div>

      <!-- ROUND TRIP -->
      <div v-else-if="tripMode === 'round'" class="wf wf-rt">
        <div class="w-field">
          <label class="w-flabel"><i class="ti ti-plane-departure"></i> From</label>
          <select class="w-sel" v-model="fromVal">
            <option value="">Select Departure…</option>
            <option v-for="a in airports" :key="a._id" :value="a._id">{{ a.city }} ({{ a.iataCode }})</option>
          </select>
        </div>
        <div class="w-field">
          <label class="w-flabel"><i class="ti ti-plane-arrival"></i> To</label>
          <select class="w-sel" v-model="toVal">
            <option value="">Select Destination…</option>
            <option v-for="a in airports" :key="a._id" :value="a._id">{{ a.city }} ({{ a.iataCode }})</option>
          </select>
        </div>
        <div class="w-field" style="position:relative; overflow:visible;">
          <label class="w-flabel"><i class="ti ti-calendar"></i> Departure</label>
          <CalendarPicker v-model="rtDepDate" placeholder="Select date…" />
        </div>
        <div class="w-field" style="position:relative; overflow:visible;">
          <label class="w-flabel"><i class="ti ti-calendar-event"></i> Return</label>
          <CalendarPicker v-model="rtRetDate" placeholder="Select date…" :align-right="true" :min-date="rtDepDate" />
        </div>
        <div class="w-field">
          <label class="w-flabel"><i class="ti ti-users"></i> Passengers</label>
          <select class="w-sel" v-model="paxVal">
            <option>1 Adult</option>
            <option>2 Adults</option>
            <option>3 Adults</option>
            <option>2 Adults, 1 Child</option>
            <option>2 Adults, 2 Children</option>
          </select>
        </div>
      </div>

      <!-- MULTI-CITY -->
      <div v-else-if="tripMode === 'multi'">
        <div
          v-for="row in mcRows"
          :key="row.id"
          class="mc-row"
        >
          <div class="w-field">
            <label class="w-flabel"><i class="ti ti-plane-departure"></i> From</label>
            <select class="w-sel" v-model="row.from">
              <option v-for="a in MC_AIRPORTS" :key="a.value" :value="a.value">{{ a.label }}</option>
            </select>
          </div>
          <div class="w-field">
            <label class="w-flabel"><i class="ti ti-plane-arrival"></i> To</label>
            <select class="w-sel" v-model="row.to">
              <option v-for="d in MC_DESTS" :key="d.value" :value="d.value">{{ d.label }}</option>
            </select>
          </div>
          <div class="w-field" style="position:relative; overflow:visible;">
            <label class="w-flabel"><i class="ti ti-calendar"></i> Date</label>
            <CalendarPicker v-model="row.date" placeholder="Select date…" />
          </div>
          <button class="mc-remove" @click="removeMcRow(row.id)" :aria-label="`Remove flight ${row.id}`">
            <i class="ti ti-x" style="font-size:14px"></i>
          </button>
        </div>

        <button
          v-if="mcRows.length < 5"
          class="mc-add"
          @click="addMcRow"
        >
          <i class="ti ti-plus" style="font-size:14px"></i> Add another flight
        </button>

        <div class="pax-row">
          <div class="w-field">
            <label class="w-flabel"><i class="ti ti-users"></i> Passengers</label>
            <select class="w-sel" v-model="paxVal">
              <option>1 Adult</option>
              <option>2 Adults</option>
              <option>3 Adults</option>
              <option>2 Adults, 1 Child</option>
              <option>2 Adults, 2 Children</option>
            </select>
          </div>
        </div>
      </div>

    </div><!-- /buy -->

    <!-- ── FLIGHT STATUS ── -->
    <div v-else-if="activeTab === 'status'">
      <div class="wf wf-st">
        <div class="w-field">
          <label class="w-flabel"><i class="ti ti-plane"></i> Flight Number</label>
          <input type="text" class="w-inp" v-model="flightNumberQuery" placeholder="e.g. F606-001" @keyup.enter="goToFlightStatus">
        </div>
        <div class="w-field" style="position:relative; overflow:visible;">
          <label class="w-flabel"><i class="ti ti-calendar"></i> Date</label>
          <CalendarPicker v-model="stDate" placeholder="Select date…" />
        </div>
      </div>
      <button class="btn-gold-full mt-3" :disabled="!flightNumberQuery.trim()" @click="goToFlightStatus">Track Flight</button>
    </div>

  </div>
</template>