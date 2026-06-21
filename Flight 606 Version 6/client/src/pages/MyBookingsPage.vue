<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGlobalStore } from '../stores/global.js'
import { getMyBookingsUser, getMyBookingsGuest, cancelBookingUser, cancelBookingGuest } from '../api.js'

const globalStore = useGlobalStore()
const isLoggedIn = computed(() => !!globalStore.user.token)

const bookings = ref([])
const loading = ref(false)
const hasSearched = ref(false)
const errorMsg = ref('')
const guestEmailInput = ref('')
const cancellingRef = ref('')

function formatTime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' })
}
function formatDateLabel(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('en-PH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}
function calcTravelTime(departure, arrival) {
  if (!departure || !arrival) return ''
  const diff = new Date(arrival) - new Date(departure)
  if (diff <= 0) return ''
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}
function statusBadgeClass(status) {
  if (status === 'cancelled') return 'fc-badge cancelled'
  if (status === 'pending') return 'fc-badge pending'
  return 'fc-badge success'
}
function isUpcoming(booking) {
  const dep = booking.flightId?.departureTime
  return dep ? new Date(dep) > new Date() : true
}

async function loadMyBookings() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getMyBookingsUser()
    console.log("DEBUG - Full response object from backend:", res)
    bookings.value = res?.bookings || res?.result || (Array.isArray(res) ? res : [])
  } catch (err) {
    console.error("CATCH TARGET EXCEPTION LOG:", err)
    if (err.response?.status === 404) {
      bookings.value = []
    } else {
      errorMsg.value = err.response?.data?.message || 'Could not load your bookings right now.'
    }
  } finally {
    loading.value = false
    hasSearched.value = true
  }
}

async function lookupGuestBookings() {
  if (!guestEmailInput.value || !guestEmailInput.value.includes('@')) {
    errorMsg.value = 'Please enter a valid email address.'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getMyBookingsGuest({ guestEmail: guestEmailInput.value })
    console.log("DEBUG - Guest bookings API response:", res)
    bookings.value = res?.result || res?.data || (Array.isArray(res) ? res : [])
  } catch (err) {
    console.error(err)
    bookings.value = []
    errorMsg.value = err.response?.data?.message || 'No bookings found for that email.'
  } finally {
    loading.value = false
    hasSearched.value = true
  }
}

async function cancelBooking(booking) {
  if (!window.confirm(`Cancel booking ${booking.bookingReference}? This cannot be undone.`)) return
  cancellingRef.value = booking.bookingReference
  errorMsg.value = ''
  try {
    if (isLoggedIn.value) {
      await cancelBookingUser(booking.bookingReference)
    } else {
      await cancelBookingGuest(booking.bookingReference, { guestEmail: guestEmailInput.value })
    }
    booking.status = 'cancelled'
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Could not cancel this booking.'
  } finally {
    cancellingRef.value = ''
  }
}

onMounted(() => {
  if (isLoggedIn.value) loadMyBookings()
})
</script>

<template>
  <div class="page active">
    <div class="inner-page">
      <div class="pt-5">
        <div class="container" style="max-width:900px;">

          <nav class="theme-breadcrumb" aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><RouterLink :to="{ name: 'Home' }">Home</RouterLink></li>
              <li class="breadcrumb-item active">My Bookings</li>
            </ol>
          </nav>

          <h1 class="confirm-headline mb-4">My <em class="gold">Bookings</em></h1>

          <!-- Guest lookup -->
          <div v-if="!isLoggedIn" class="booking-section mb-4">
            <div class="bs-body">
              <label class="f-label">Find your bookings by email</label>
              <div class="row g-2">
                <div class="col-8 col-md-9"><input type="email" class="f-input" v-model="guestEmailInput" placeholder="you@email.com" @keyup.enter="lookupGuestBookings"></div>
                <div class="col-4 col-md-3"><button class="fc-select-btn w-100" @click="lookupGuestBookings">Find</button></div>
              </div>
              <p class="body-text mt-2" style="font-size:0.78rem;">
                Booked while logged in? <RouterLink :to="{ name: 'Login', query: { redirect: '/my-bookings' } }" class="gold-link">Log in</RouterLink> to see everything in one place.
              </p>
            </div>
          </div>

          <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

          <div v-if="loading" class="text-center py-5">
            <span class="spinner-border text-warning"></span>
          </div>

          <div v-else-if="hasSearched && bookings.length === 0" class="text-center py-5">
            <p class="body-text">No bookings found.</p>
            <RouterLink :to="{ name: 'SearchFlights' }" class="gold-link">Search for a flight →</RouterLink>
          </div>

          <div v-for="booking in bookings" :key="booking._id" class="flight-card mb-3" style="cursor:default;">
            <div class="fc-endpoint">
              <div class="fc-time">{{ formatTime(booking.flightId?.departureTime) }}</div>
              <div class="fc-airport">{{ booking.flightId?.originAirportId?.city || booking.flightId?.originAirportId?.iataCode || 'DEP' }}</div>
              <div class="fc-date">{{ formatDateLabel(booking.flightId?.departureTime) }}</div>
            </div>
            <div class="fc-mid">
              <div class="fc-duration">{{ calcTravelTime(booking.flightId?.departureTime, booking.flightId?.arrivalTime) }}</div>
              <div class="fc-line"><span class="fc-plane-icon"><i class="bi bi-airplane-fill"></i></span></div>
              <div class="fc-stops">{{ booking.flightId?.airlineId?.name || '' }}</div>
            </div>
            <div class="fc-endpoint">
              <div class="fc-time">{{ formatTime(booking.flightId?.arrivalTime) }}</div>
              <div class="fc-airport">{{ booking.flightId?.destinationAirportId?.city || booking.flightId?.destinationAirportId?.iataCode || 'ARR' }}</div>
              <div class="fc-date">{{ formatDateLabel(booking.flightId?.arrivalTime) }}</div>
            </div>
            
            <!-- FIXED PRICE/ACTION PANEL BOX CONTAINER -->
            <div class="fc-price-box d-flex flex-column align-items-stretch justify-content-start text-end" style="min-width: 160px; gap: 4px;">
              <div>
                <span :class="statusBadgeClass(booking.status)">{{ booking.status }}</span>
              </div>
              <div class="fc-price-amt mt-1" style="font-size:1.2rem; font-weight: 700;">₱{{ booking.totalAmount?.toLocaleString() }}</div>
              <div class="fc-price-note text-muted" style="font-size: 0.75rem;">Ref: {{ booking.bookingReference }}</div>
              <div class="fc-price-note text-success" style="font-size: 0.75rem;" v-if="booking.checkedIn"><i class="bi bi-check-circle-fill"></i> Checked in</div>

              <!-- Action Buttons Container stacked evenly -->
              <div class="d-flex flex-column gap-2 mt-2 w-100">
                <RouterLink
                  v-if="booking.status === 'confirmed' && !booking.checkedIn && isUpcoming(booking)"
                  :to="{ name: 'CheckIn', query: { ref: booking.bookingReference } }"
                  class="fc-select-btn d-block text-center text-decoration-none w-100"
                  style="padding: 6px 0;"
                >Check-in</RouterLink>

                <button
                  v-if="booking.status !== 'cancelled' && !booking.checkedIn"
                  class="fc-select-btn d-block w-100"
                  style="background: transparent; color: #ff4d4d; border: 1px solid #ff4d4d; padding: 6px 0;"
                  :disabled="cancellingRef === booking.bookingReference"
                  @click="cancelBooking(booking)"
                >{{ cancellingRef === booking.bookingReference ? 'Cancelling…' : 'Cancel' }}</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
