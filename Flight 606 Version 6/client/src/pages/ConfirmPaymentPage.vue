<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  createPassengerUser, createPassengerGuest, getMyPassengers, getPassengerForGuest,
  createBookingUser, createBookingGuest,
  createBookingPassenger, createBookingPassengerGuest,
  createPaymentUser, createPaymentGuest
} from '../api.js'
import { useBookingStore } from '../stores/booking.js'

const router = useRouter()
const bookingStore = useBookingStore()

const paymentMethod = ref('credit_card')
const card = ref({ name: '', number: '', expiry: '', cvv: '' })
const isProcessing = ref(false)
const errorMsg = ref('')

onMounted(() => {
  if (bookingStore.legs.length === 0) {
    router.replace({ name: 'SearchFlights' })
  }
})

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
function legSubtotal(i) {
  const leg = bookingStore.legs[i]
  if (!leg) return 0
  return leg.selectedSeatIds.reduce((sum, seatId) => sum + bookingStore.seatPrice(leg, seatId), 0)
}
function seatFor(leg, pIdx) {
  const seatId = leg.selectedSeatIds[pIdx]
  return leg.seats.find(s => s._id === seatId) || null
}

function formatCardNumber(e) {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 19)
  card.value.number = digits.match(/.{1,4}/g)?.join(' ') || digits
}
function formatExpiry(e) {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
  card.value.expiry = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits
}
function formatCvv(e) {
  card.value.cvv = e.target.value.replace(/\D/g, '').slice(0, 4)
}

function validatePayment() {
  if (!paymentMethod.value) return 'Please choose a payment method.'
  if (paymentMethod.value === 'credit_card' || paymentMethod.value === 'debit_card') {
    const digits = card.value.number.replace(/\s/g, '')
    if (!card.value.name.trim()) return 'Cardholder name is required.'
    if (digits.length < 13 || digits.length > 19) return 'Please enter a valid card number.'
    if (!/^\d{2}\/\d{2}$/.test(card.value.expiry)) return 'Please enter the expiry as MM/YY.'
    if (card.value.cvv.length < 3) return 'Please enter a valid CVV.'
  }
  return ''
}

async function confirmAndPay() {
  errorMsg.value = ''
  const payErr = validatePayment()
  if (payErr) { errorMsg.value = payErr; return }

  isProcessing.value = true
  const results = []
  const isGuest = bookingStore.mode === 'guest'

  try {
    for (let li = 0; li < bookingStore.legs.length; li++) {
      const leg = bookingStore.legs[li]

      for (let pi = 0; pi < bookingStore.passengers.length; pi++) {
        const p = bookingStore.passengers[pi]
        const seatId = leg.selectedSeatIds[pi]

        // 1. Create (or reuse) the passenger profile
        let passengerId
        const passengerPayload = {
          firstName: p.firstName, lastName: p.lastName, gender: p.gender,
          dateOfBirth: p.dateOfBirth, nationality: p.nationality,
          passportNumber: p.passportNumber, passportExpiry: p.passportExpiry, phone: p.phone
        }
        try {
          const res = isGuest
            ? await createPassengerGuest({ ...passengerPayload, email: p.email || bookingStore.guestEmail })
            : await createPassengerUser(passengerPayload)
          passengerId = res.result._id
        } catch (err) {
          if (err.response?.status === 409) {
            // Passport already on file — reuse the existing passenger record.
            const existing = isGuest
              ? await getPassengerForGuest({ passportNumber: p.passportNumber })
              : { passenger: (await getMyPassengers()).passengers.find(x => x.passportNumber === p.passportNumber) }
            passengerId = existing.passenger?._id
            if (!passengerId) throw err
          } else {
            throw err
          }
        }

        // 2. Create the booking (one per passenger per flight leg)
        const bookingPayload = isGuest
          ? { flightId: leg.flightId, seatId, guestEmail: bookingStore.guestEmail }
          : { flightId: leg.flightId, seatId }
        const bookingRes = isGuest
          ? await createBookingGuest(bookingPayload)
          : await createBookingUser(bookingPayload)

        // 3. Link the passenger + seat to that booking
        const bkpPayload = isGuest
          ? { bookingId: bookingRes.bookingId, passengerId, seatId, guestEmail: bookingStore.guestEmail }
          : { bookingId: bookingRes.bookingId, passengerId, seatId }
        if (isGuest) await createBookingPassengerGuest(bkpPayload)
        else await createBookingPassenger(bkpPayload)

        // 4. Pay (this also flips the booking to "confirmed" server-side)
        const paymentPayload = isGuest
          ? { bookingId: bookingRes.bookingId, paymentMethod: paymentMethod.value, amount: bookingRes.totalAmount, guestEmail: bookingStore.guestEmail }
          : { bookingId: bookingRes.bookingId, paymentMethod: paymentMethod.value, amount: bookingRes.totalAmount }
        if (isGuest) await createPaymentGuest(paymentPayload)
        else await createPaymentUser(paymentPayload)

        results.push({
          bookingReference: bookingRes.bookingReference,
          passengerName: `${p.firstName} ${p.lastName}`,
          leg: legLabel(leg, li),
          seat: leg.seats.find(s => s._id === seatId)?.seatNumber || '',
          amount: bookingRes.totalAmount
        })
      }
    }

    bookingStore.setLastOrder({
      bookings: results,
      totalPaid: results.reduce((sum, r) => sum + r.amount, 0),
      paymentMethod: paymentMethod.value,
      guestEmail: bookingStore.guestEmail
    })
    bookingStore.clearFunnel()
    router.push({ name: 'PaymentSuccess' })
  } catch (err) {
    console.error(err)
    errorMsg.value = err.response?.data?.message ||
      'Something went wrong while processing your payment. A seat may have just been taken — please go back and try again.'
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="page active">
    <div class="inner-page">
      <div class="pt-5">
        <div class="container" style="max-width:800px;">
          <h1 class="confirm-headline">Confirm<br><em class="gold">information</em></h1>
          <nav class="theme-breadcrumb" aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><RouterLink :to="{ name: 'Home' }">Home</RouterLink></li>
              <li class="breadcrumb-item"><RouterLink :to="{ name: 'SearchFlights' }">Flights</RouterLink></li>
              <li class="breadcrumb-item active">Confirm Payment</li>
            </ol>
          </nav>

          <div class="confirm-section mt-3" v-for="(leg, li) in bookingStore.legs" :key="li">
            <h3 class="confirm-section-title"><i class="bi bi-airplane-fill"></i> {{ legLabel(leg, li) }}</h3>
            <div class="confirm-row" v-for="(p, pi) in bookingStore.passengers" :key="pi">
              <div class="confirm-pax">
                <div class="confirm-pax-icon"><i class="bi bi-person"></i></div>
                <div class="confirm-pax-name">Adult {{ pi + 1 }} – {{ p.firstName }} {{ p.lastName }}</div>
              </div>
              <div class="confirm-detail"><i class="bi bi-ui-checks-grid"></i><span>{{ seatFor(leg, pi)?.seatNumber || '—' }}</span></div>
              <div class="confirm-detail"><i class="bi bi-tag"></i><span>{{ seatFor(leg, pi)?.class === 'business' ? 'Business' : 'Economy' }}</span></div>
            </div>
          </div>

          <div class="confirm-section">
            <h3 class="confirm-section-title"><i class="bi bi-credit-card"></i> Payment Method</h3>
            <div class="pay-cards">
              <label class="pay-card" :class="{ selected: paymentMethod === 'credit_card' }">
                <input type="radio" value="credit_card" v-model="paymentMethod">
                <div class="pay-logo visa-logo">CARD</div>
                <div><div class="pay-num">Credit Card</div></div>
              </label>
              <label class="pay-card" :class="{ selected: paymentMethod === 'debit_card' }">
                <input type="radio" value="debit_card" v-model="paymentMethod">
                <div class="pay-logo visa-logo">DEBIT</div>
                <div><div class="pay-num">Debit Card</div></div>
              </label>
              <label class="pay-card" :class="{ selected: paymentMethod === 'gcash' }">
                <input type="radio" value="gcash" v-model="paymentMethod">
                <div class="pay-logo visa-logo">GC</div>
                <div><div class="pay-num">GCash</div></div>
              </label>
              <label class="pay-card" :class="{ selected: paymentMethod === 'cash' }">
                <input type="radio" value="cash" v-model="paymentMethod">
                <div class="pay-logo visa-logo">₱</div>
                <div><div class="pay-num">Pay at Counter</div></div>
              </label>
            </div>

            <div v-if="paymentMethod === 'credit_card' || paymentMethod === 'debit_card'" class="row g-3 mt-3">
              <div class="col-12"><label class="f-label">Cardholder Name</label><input class="f-input" v-model="card.name" placeholder="Name on card"></div>
              <div class="col-12">
                <label class="f-label">Card Number</label>
                <input class="f-input" :value="card.number" @input="formatCardNumber" maxlength="19" placeholder="1234 5678 9012 3456">
              </div>
              <div class="col-6">
                <label class="f-label">Expiry (MM/YY)</label>
                <input class="f-input" :value="card.expiry" @input="formatExpiry" maxlength="5" placeholder="MM/YY">
              </div>
              <div class="col-6">
                <label class="f-label">CVV</label>
                <input class="f-input" type="password" :value="card.cvv" @input="formatCvv" maxlength="4" placeholder="•••">
              </div>
            </div>
            <p v-else class="body-text mt-3" style="font-size:0.85rem;">
              {{ paymentMethod === 'gcash' ? "You'll be redirected to GCash to complete payment (simulated for this demo)." : "Settle payment in cash at the airport counter using this booking reference." }}
            </p>
          </div>

          <div class="confirm-section">
            <h3 class="confirm-section-title"><i class="bi bi-receipt"></i> Subtotal</h3>
            <div class="subtotal-row" v-for="(leg, li) in bookingStore.legs" :key="li">
              <span><span class="subtotal-qty">{{ bookingStore.passengers.length }}×</span> {{ legLabel(leg, li) }}</span>
              <span>₱{{ legSubtotal(li).toLocaleString() }}</span>
            </div>
            <div class="confirm-total"><span>Total :</span><span class="confirm-total-amt">₱{{ bookingStore.totalAmount.toLocaleString() }}</span></div>
          </div>

          <div v-if="errorMsg" class="alert alert-danger my-3">{{ errorMsg }}</div>

          <div class="d-flex justify-content-end mt-3 mb-5">
            <button class="complete-btn" @click="confirmAndPay" :disabled="isProcessing">
              <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
              {{ isProcessing ? 'Processing…' : 'Confirm and Pay →' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
