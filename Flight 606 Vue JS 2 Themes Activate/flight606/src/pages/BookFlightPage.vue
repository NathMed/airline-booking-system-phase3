<script setup>
import { ref, inject, onMounted } from 'vue'

const goNav = inject('goNav')

// Seat map
const takenSeats    = ['1A','1C','2B','3D','4E','4F','5A','7B','8C','9D','10F','11A','11C']
const selectedSeats = ref(['11B'])
const COLS = ['A','B','C', null, 'D','E','F']
const ROWS = Array.from({ length: 12 }, (_, i) => i + 1)

function seatClass(seatId) {
  if (takenSeats.includes(seatId))    return 'seat taken'
  if (selectedSeats.value.includes(seatId)) return 'seat selected'
  return 'seat'
}

function toggleSeat(seatId) {
  if (takenSeats.includes(seatId)) return
  const idx = selectedSeats.value.indexOf(seatId)
  if (idx > -1) selectedSeats.value.splice(idx, 1)
  else { selectedSeats.value = [seatId] } // single select demo
}

// Accordion
const openSections = ref([0, 1, 2, 3, 4]) // all open by default
function toggleSection(i) {
  const idx = openSections.value.indexOf(i)
  if (idx > -1) openSections.value.splice(idx, 1)
  else openSections.value.push(i)
}
</script>

<template>
  <div class="page active">
    <div class="inner-page">
      <div class="pt-5">
        <div class="container">
          <div class="booking-layout">
            <div class="booking-form">

              <nav class="theme-breadcrumb" aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                  <li class="breadcrumb-item"><a href="#" @click.prevent="goNav('home')">Home</a></li>
                  <li class="breadcrumb-item"><a href="#" @click.prevent="goNav('search-flights')">Flights</a></li>
                  <li class="breadcrumb-item active">Booking Form</li>
                </ol>
              </nav>

              <div class="flight-summary-strip">
                <span class="fs-label">Selected Flights</span>
                <span>Fri May 17 &nbsp; MNL – CEB &nbsp;|&nbsp; Fri May 31 &nbsp; CEB – MNL</span>
              </div>

              <!-- Passenger 1 -->
              <div class="booking-section">
                <div class="bs-header" @click="toggleSection(0)">
                  <div class="bs-header-left">
                    <div class="bs-icon"><i class="bi bi-person"></i></div>
                    <div><div class="bs-title">Adult 1</div><div class="bs-sub">+26 years old</div></div>
                  </div>
                  <span class="bs-toggle"><i :class="openSections.includes(0) ? 'bi bi-chevron-up' : 'bi bi-chevron-right'"></i></span>
                </div>
                <div class="bs-body" v-if="openSections.includes(0)">
                  <span class="passenger-tag"><i class="bi bi-person"></i> Adult 1</span>
                  <div class="row g-3 mt-2">
                    <div class="col-6"><label class="f-label">First Name</label><input type="text" class="f-input" placeholder="First name"></div>
                    <div class="col-6"><label class="f-label">Last Name</label><input type="text" class="f-input" placeholder="Last name"></div>
                    <div class="col-6"><label class="f-label">Date of Birth</label><input type="date" class="f-input"></div>
                    <div class="col-6"><label class="f-label">Gender</label>
                      <select class="f-input"><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Luggage -->
              <div class="booking-section">
                <div class="bs-header" @click="toggleSection(2)">
                  <div class="bs-header-left">
                    <div class="bs-icon"><i class="bi bi-luggage"></i></div>
                    <div><div class="bs-title">Luggage</div><div class="bs-sub">Hand and hold baggage</div></div>
                  </div>
                  <span class="bs-toggle"><i :class="openSections.includes(2) ? 'bi bi-chevron-up' : 'bi bi-chevron-right'"></i></span>
                </div>
                <div class="bs-body" v-if="openSections.includes(2)">
                  <div class="row g-4">
                    <div class="col-6">
                      <h6 class="luggage-heading"><i class="bi bi-airplane-fill"></i> Outbound <small>MNL → CEB</small></h6>
                      <div class="luggage-item"><div class="luggage-label">Hand luggage</div><span class="luggage-included">✓ Included</span></div>
                      <div class="luggage-item"><div class="luggage-label">Additional luggage</div>
                        <select class="luggage-select"><option>No hold luggage</option><option>1 × 20kg – ₱800</option><option>1 × 32kg – ₱1,200</option></select>
                      </div>
                    </div>
                    <div class="col-6">
                      <h6 class="luggage-heading"><i class="bi bi-airplane"></i> Return <small>CEB → MNL</small></h6>
                      <div class="luggage-item"><div class="luggage-label">Hand luggage</div><span class="luggage-included">✓ Included</span></div>
                      <div class="luggage-item"><div class="luggage-label">Additional luggage</div>
                        <select class="luggage-select"><option>No hold luggage</option><option>1 × 20kg – ₱800</option><option>1 × 32kg – ₱1,200</option></select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Seat Map -->
              <div class="booking-section">
                <div class="bs-header" @click="toggleSection(3)">
                  <div class="bs-header-left">
                    <div class="bs-icon"><i class="bi bi-ui-checks-grid"></i></div>
                    <div><div class="bs-title">Select Seats</div><div class="bs-sub">Choose your seats</div></div>
                  </div>
                  <span class="bs-toggle"><i :class="openSections.includes(3) ? 'bi bi-chevron-up' : 'bi bi-chevron-right'"></i></span>
                </div>
                <div class="bs-body" v-if="openSections.includes(3)">
                  <!-- Column labels -->
                  <div class="seat-col-labels" style="padding-left:25px; display:flex; gap:5px; margin-bottom:4px;">
                    <div style="width:20px"></div>
                    <template v-for="col in COLS" :key="col ?? 'aisle'">
                      <div :class="col === null ? 'seat-aisle-gap' : 'seat-col-label'" style="width:30px; text-align:center; font-size:0.56rem; color:var(--muted);">{{ col }}</div>
                    </template>
                  </div>
                  <!-- Rows -->
                  <div class="seat-map">
                    <div v-for="r in ROWS" :key="r" class="seat-row" style="display:flex; align-items:center; gap:5px;">
                      <div class="seat-row-num" style="width:20px; text-align:right; font-size:0.6rem; color:var(--muted);">{{ r }}</div>
                      <template v-for="col in COLS" :key="col ?? 'aisle'">
                        <div v-if="col === null" class="seat-aisle" style="width:14px;"></div>
                        <button
                          v-else
                          :class="seatClass(r + col)"
                          :disabled="takenSeats.includes(r + col)"
                          @click="toggleSeat(r + col)"
                          type="button"
                        >{{ r }}{{ col }}</button>
                      </template>
                    </div>
                  </div>
                  <div class="seat-legend mt-3">
                    <div class="sl-item"><div class="sl-box sl-available"></div> Available</div>
                    <div class="sl-item"><div class="sl-box sl-selected"></div> Selected</div>
                    <div class="sl-item"><div class="sl-box sl-taken"></div> Taken</div>
                  </div>
                </div>
              </div>

              <!-- Payment -->
              <div class="booking-section">
                <div class="bs-header" @click="toggleSection(4)">
                  <div class="bs-header-left">
                    <div class="bs-icon"><i class="bi bi-credit-card"></i></div>
                    <div><div class="bs-title">Payment Method</div></div>
                  </div>
                  <span class="bs-toggle"><i :class="openSections.includes(4) ? 'bi bi-chevron-up' : 'bi bi-chevron-right'"></i></span>
                </div>
                <div class="bs-body" v-if="openSections.includes(4)">
                  <div class="pay-cards">
                    <label class="pay-card selected">
                      <input type="radio" name="pay" checked>
                      <div class="pay-logo visa-logo">VISA</div>
                      <div><div class="pay-num">visa ••••••••5174</div><div class="pay-exp">Expires Jan 01, 2026</div></div>
                    </label>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-end mt-3 mb-5">
                <button class="complete-btn" @click="goNav('confirm-payment')">Complete Booking and Pay →</button>
              </div>
            </div>

            <!-- Receipt -->
            <div class="receipt-card">
              <div class="receipt-title"><i class="bi bi-receipt"></i> Receipt</div>
              <div class="receipt-sub">Flight tickets</div>
              <div class="receipt-row"><span>2× Flight tickets</span><span>₱ 4,980.00</span></div>
              <div class="receipt-row"><span>1× Ticket discount</span><span class="text-success">− ₱ 50.00</span></div>
              <div class="receipt-total"><span>Total</span><span class="receipt-total-amt">₱ 4,930.00</span></div>
            </div>
          </div>
        </div>
      </div>
      <footer class="site-footer"><div class="container"><div class="footer-bottom" style="border-top:none;padding-top:0"><div class="footer-legal"><a href="#">Legal</a><a href="#">Privacy</a></div><span class="footer-copy">© Batch 606</span></div></div></footer>
    </div>
  </div>
</template>