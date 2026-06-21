<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFlightById, getSeatsByFlight, getMyPassengers } from '../api.js'
import { useGlobalStore } from '../stores/global.js'
import { useBookingStore } from '../stores/booking.js'

const route = useRoute()
const router = useRouter()
const globalStore = useGlobalStore()
const bookingStore = useBookingStore()

const isGuestRoute = computed(() => route.name === 'GuestCheckout')

const loading = ref(true)
const loadError = ref('')
const errorMsg = ref('')
const passengerErrors = ref([])
const savedPassengers = ref([])

const activeLegIndex = ref(0)
const activePassengerIndex = ref(0)
const closedSections = ref([]) // empty = everything open by default

const COLS = ['A', 'B', 'C', null, 'D', 'E', 'F']

function isOpen(key) {
  return !closedSections.value.includes(key)
}
function toggleSection(key) {
  const i = closedSections.value.indexOf(key)
  if (i > -1) closedSections.value.splice(i, 1)
  else closedSections.value.push(key)
}

const currentLeg = computed(() => bookingStore.legs[activeLegIndex.value] || null)

function seatRows(leg) {
  if (!leg) return []
  const rows = new Set()
  leg.seats.forEach(s => {
    const m = s.seatNumber.match(/^(\d+)/)
    if (m) rows.add(Number(m[1]))
  })
  return Array.from(rows).sort((a, b) => a - b)
}
function seatAt(leg, row, col) {
  if (!leg) return null
  return leg.seats.find(s => s.seatNumber === `${row}${col}`) || null
}
function seatBtnClass(legIndex, seat) {
  const classes = ['seat']
  if (!seat) return classes.concat('taken').join(' ')
  if (seat.class === 'business') classes.push('business')
  if (seat.isOccupied) { classes.push('taken'); return classes.join(' ') }

  const leg = bookingStore.legs[legIndex]
  const ownerIdx = leg.selectedSeatIds.indexOf(seat._id)
  if (ownerIdx === activePassengerIndex.value) classes.push('selected')
  else if (ownerIdx > -1) classes.push('selected-other')
  return classes.join(' ')
}
function onSeatClick(legIndex, seat) {
  if (!seat || seat.isOccupied) return
  bookingStore.selectSeatForLeg(legIndex, activePassengerIndex.value, seat._id)
}

function legLabel(leg, i) {
  const f = leg.flight
  const origin = f.originAirportId?.iataCode || 'DEP'
  const dest = f.destinationAirportId?.iataCode || 'ARR'
  const dateLabel = f.departureTime
    ? new Date(f.departureTime).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
    : ''
  const prefix = bookingStore.legs.length > 1 ? (i === 0 ? 'Outbound · ' : 'Return · ') : ''
  return `${prefix}${origin} → ${dest} · ${dateLabel} · ${f.flightNumber || ''}`
}
const legsSummaryText = computed(() =>
  bookingStore.legs.map((leg, i) => legLabel(leg, i)).join('     |     ')
)
function legSubtotal(i) {
  const leg = bookingStore.legs[i]
  if (!leg) return 0
  return leg.selectedSeatIds.reduce((sum, seatId) => sum + bookingStore.seatPrice(leg, seatId), 0)
}

function applySaved(pIdx, savedId) {
  const sp = savedPassengers.value.find(s => s._id === savedId)
  if (!sp) return
  const p = bookingStore.passengers[pIdx]
  p.firstName = sp.firstName || ''
  p.lastName = sp.lastName || ''
  p.gender = sp.gender || ''
  p.dateOfBirth = sp.dateOfBirth ? sp.dateOfBirth.substring(0, 10) : ''
  p.nationality = sp.nationality || ''
  p.passportNumber = sp.passportNumber || ''
  p.passportExpiry = sp.passportExpiry ? sp.passportExpiry.substring(0, 10) : ''
  p.phone = sp.phone || ''
}
function digitsOnly(p) {
  p.phone = (p.phone || '').replace(/\D/g, '').slice(0, 11)
}

function validatePhone(v) {
  return /^\d{11}$/.test(v || '')
}
function validateAndContinue() {
  errorMsg.value = ''
  passengerErrors.value = []

  if (!bookingStore.isSeatSelectionComplete) {
    errorMsg.value = 'Please select a seat for every passenger on every flight before continuing.'
    return
  }
  if (isGuestRoute.value &&
      (!bookingStore.guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingStore.guestEmail))) {
    errorMsg.value = 'A valid email is required so we can send your booking confirmation.'
    return
  }

  let hasError = false
  bookingStore.passengers.forEach((p, i) => {
    if (!p.firstName.trim() || !p.lastName.trim() || !p.gender || !p.dateOfBirth ||
        !p.nationality.trim() || !p.passportNumber.trim() || !p.passportExpiry || !validatePhone(p.phone)) {
      passengerErrors.value[i] = 'Please complete every field — phone number must be exactly 11 digits.'
      hasError = true
    }
  })
  if (hasError) {
    errorMsg.value = 'Please complete all passenger details before continuing.'
    return
  }

  if (isGuestRoute.value) {
    bookingStore.passengers.forEach(p => { p.email = bookingStore.guestEmail })
  }

  router.push({ name: 'ConfirmPayment' })
}

onMounted(async () => {
  try {
    if (bookingStore.legs.length === 0) {
      const ids = (route.params.flightId || '').split(',').filter(Boolean)
      if (ids.length === 0) {
        loadError.value = 'No flight selected. Please search again.'
        loading.value = false
        return
      }
      const flights = []
      for (const id of ids) {
        const res = await getFlightById(id)
        flights.push(res.result)
      }
      bookingStore.startFunnel({ flights, isGuest: isGuestRoute.value })
    }

    for (let i = 0; i < bookingStore.legs.length; i++) {
      const leg = bookingStore.legs[i]
      if (!leg.seats || leg.seats.length === 0) {
        const res = await getSeatsByFlight(leg.flightId)
        bookingStore.setSeatsForLeg(i, res.seats || [])
      }
    }

    if (!isGuestRoute.value && globalStore.user.token) {
      try {
        const res = await getMyPassengers()
        savedPassengers.value = res.passengers || []
      } catch {
        savedPassengers.value = []
      }
    }
  } catch (err) {
    console.error(err)
    loadError.value = 'We could not load this flight. Please search again.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page active">
    <div class="inner-page">
      <div class="pt-5">
        <div class="container">

          <div v-if="loading" class="text-center py-5">
            <span class="spinner-border text-warning"></span>
            <p class="mt-3">Loading your flight details…</p>
          </div>

          <div v-else-if="loadError" class="alert alert-danger my-5">
            {{ loadError }}
            <RouterLink :to="{ name: 'SearchFlights' }" class="gold-link ms-2">Search again →</RouterLink>
          </div>

          <div v-else class="booking-layout">
            <div class="booking-form">

              <nav class="theme-breadcrumb" aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                  <li class="breadcrumb-item"><RouterLink :to="{ name: 'Home' }">Home</RouterLink></li>
                  <li class="breadcrumb-item"><RouterLink :to="{ name: 'SearchFlights' }">Flights</RouterLink></li>
                  <li class="breadcrumb-item active">Booking Form</li>
                </ol>
              </nav>

              <div class="flight-summary-strip">
                <span class="fs-label">Selected Flights</span>
                <span>{{ legsSummaryText }}</span>
              </div>

              <!-- Guest email -->
              <div class="booking-section" v-if="isGuestRoute">
                <div class="bs-header" @click="toggleSection('guest')">
                  <div class="bs-header-left">
                    <div class="bs-icon"><i class="bi bi-envelope"></i></div>
                    <div><div class="bs-title">Contact Email</div><div class="bs-sub">Where we'll send your confirmation</div></div>
                  </div>
                  <span class="bs-toggle"><i :class="isOpen('guest') ? 'bi bi-chevron-up' : 'bi bi-chevron-right'"></i></span>
                </div>
                <div class="bs-body" v-if="isOpen('guest')">
                  <label class="f-label">Email Address</label>
                  <input type="email" class="f-input" v-model="bookingStore.guestEmail" placeholder="you@email.com">
                </div>
              </div>

              <!-- Passenger sections -->
              <div class="booking-section" v-for="(p, pIdx) in bookingStore.passengers" :key="pIdx">
                <div class="bs-header" @click="toggleSection(pIdx)">
                  <div class="bs-header-left">
                    <div class="bs-icon"><i class="bi bi-person"></i></div>
                    <div><div class="bs-title">Adult {{ pIdx + 1 }}</div><div class="bs-sub">Passenger &amp; passport details</div></div>
                  </div>
                  <span class="bs-toggle"><i :class="isOpen(pIdx) ? 'bi bi-chevron-up' : 'bi bi-chevron-right'"></i></span>
                </div>
                <div class="bs-body" v-if="isOpen(pIdx)">
                  <span class="passenger-tag"><i class="bi bi-person"></i> Adult {{ pIdx + 1 }}</span>

                  <div class="mt-3 mb-2" v-if="!isGuestRoute && savedPassengers.length">
                    <label class="f-label">Use a saved passenger</label>
                    <select class="f-input" @change="applySaved(pIdx, $event.target.value)">
                      <option value="">— Select a saved profile —</option>
                      <option v-for="sp in savedPassengers" :key="sp._id" :value="sp._id">
                        {{ sp.firstName }} {{ sp.lastName }} · {{ sp.passportNumber }}
                      </option>
                    </select>
                  </div>

                  <div class="row g-3 mt-2">
                    <div class="col-6"><label class="f-label">First Name</label><input type="text" class="f-input" v-model="p.firstName" placeholder="First name"></div>
                    <div class="col-6"><label class="f-label">Last Name</label><input type="text" class="f-input" v-model="p.lastName" placeholder="Last name"></div>
                    <div class="col-6"><label class="f-label">Date of Birth</label><input type="date" class="f-input" v-model="p.dateOfBirth"></div>
                    <div class="col-6">
                      <label class="f-label">Gender</label>
                      <select class="f-input" v-model="p.gender">
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div class="col-6"><label class="f-label">Nationality</label><input type="text" class="f-input" v-model="p.nationality" placeholder="e.g. Filipino"></div>
                    <div class="col-6">
                      <label class="f-label">Phone Number</label>
                      <input type="tel" class="f-input" v-model="p.phone" maxlength="11" @input="digitsOnly(p)" placeholder="09171234567">
                    </div>
                    <div class="col-6"><label class="f-label">Passport Number</label><input type="text" class="f-input" v-model="p.passportNumber" placeholder="Passport number"></div>
                    <div class="col-6"><label class="f-label">Passport Expiry</label><input type="date" class="f-input" v-model="p.passportExpiry"></div>
                  </div>
                  <p v-if="passengerErrors[pIdx]" class="err-msg mt-2">{{ passengerErrors[pIdx] }}</p>
                </div>
              </div>

              <!-- Seat Map -->
              <div class="booking-section">
                <div class="bs-header" @click="toggleSection('seats')">
                  <div class="bs-header-left">
                    <div class="bs-icon"><i class="bi bi-ui-checks-grid"></i></div>
                    <div><div class="bs-title">Select Seats</div><div class="bs-sub">Choose a seat for each passenger</div></div>
                  </div>
                  <span class="bs-toggle"><i :class="isOpen('seats') ? 'bi bi-chevron-up' : 'bi bi-chevron-right'"></i></span>
                </div>
                <div class="bs-body" v-if="isOpen('seats')">

                  <!-- Leg tabs (round-trip) -->
                  <div v-if="bookingStore.legs.length > 1" class="seat-flights">
                    <button
                      v-for="(leg, i) in bookingStore.legs" :key="i"
                      type="button"
                      class="seat-flight-btn"
                      :class="{ active: activeLegIndex === i }"
                      @click="activeLegIndex = i"
                    >{{ legLabel(leg, i) }}</button>
                  </div>

                  <!-- Passenger picker -->
                  <div v-if="bookingStore.passengers.length > 1" class="seat-flights">
                    <button
                      v-for="(p, i) in bookingStore.passengers" :key="i"
                      type="button"
                      class="seat-flight-btn"
                      :class="{ active: activePassengerIndex === i }"
                      @click="activePassengerIndex = i"
                    >Selecting for: Adult {{ i + 1 }}</button>
                  </div>

                  <!-- Column labels -->
                  <div class="seat-col-labels">
                    <div style="width:20px"></div>
                    <template v-for="col in COLS" :key="col ?? 'aisle'">
                      <div :class="col === null ? 'seat-aisle-gap' : 'seat-col-label'">{{ col }}</div>
                    </template>
                  </div>
                  <!-- Rows -->
                  <div class="seat-map">
                    <div v-for="r in seatRows(currentLeg)" :key="r" class="seat-row">
                      <div class="seat-row-num">{{ r }}</div>
                      <template v-for="col in COLS" :key="col ?? 'aisle'">
                        <div v-if="col === null" class="seat-aisle"></div>
                        <button
                          v-else
                          :class="seatBtnClass(activeLegIndex, seatAt(currentLeg, r, col))"
                          :disabled="!seatAt(currentLeg, r, col) || seatAt(currentLeg, r, col).isOccupied"
                          @click="onSeatClick(activeLegIndex, seatAt(currentLeg, r, col))"
                          type="button"
                        >{{ r }}{{ col }}</button>
                      </template>
                    </div>
                  </div>
                  <div class="seat-legend mt-3">
                    <div class="sl-item"><div class="sl-box sl-available"></div> Available</div>
                    <div class="sl-item"><div class="sl-box sl-selected"></div> Selected (this passenger)</div>
                    <div class="sl-item"><div class="sl-box sl-taken"></div> Taken / Other passenger</div>
                    <div class="sl-item"><div class="sl-box sl-business"></div> Business</div>
                  </div>
                </div>
              </div>

              <div v-if="errorMsg" class="alert alert-danger my-3">{{ errorMsg }}</div>

              <div class="d-flex justify-content-end mt-3 mb-5">
                <button class="complete-btn" @click="validateAndContinue">Continue to Payment →</button>
              </div>
            </div>

            <!-- Receipt -->
            <div class="receipt-card">
              <div class="receipt-title"><i class="bi bi-receipt"></i> Receipt</div>
              <div class="receipt-sub">{{ bookingStore.passengers.length }} passenger(s) · {{ bookingStore.legs.length }} flight(s)</div>
              <div class="receipt-row" v-for="(leg, i) in bookingStore.legs" :key="i">
                <span>{{ legLabel(leg, i) }}</span>
                <span>₱{{ legSubtotal(i).toLocaleString() }}</span>
              </div>
              <div class="receipt-total"><span>Total</span><span class="receipt-total-amt">₱{{ bookingStore.totalAmount.toLocaleString() }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
