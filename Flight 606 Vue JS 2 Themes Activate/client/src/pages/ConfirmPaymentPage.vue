<script setup>
import { inject } from 'vue'
const goNav = inject('goNav')
</script>
<template>
  <div class="page active">
    <div class="inner-page">
      <div class="pt-5">
        <div class="container" style="max-width:800px;">
          <h1 class="confirm-headline">Confirm<br><em class="gold">information</em></h1>
          <nav class="theme-breadcrumb" aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><a href="#" @click.prevent="goNav('home')">Home</a></li>
              <li class="breadcrumb-item"><a href="#" @click.prevent="goNav('search-flights')">Flights</a></li>
              <li class="breadcrumb-item"><a href="#" @click.prevent="goNav('book-flight')">Booking Form</a></li>
              <li class="breadcrumb-item active">Confirm Payment</li>
            </ol>
          </nav>
          <div class="confirm-section mt-3">
            <div class="confirm-row">
              <div class="confirm-pax"><div class="confirm-pax-icon"><i class="bi bi-person"></i></div><div class="confirm-pax-name">Adult 1 – Passenger One</div></div>
              <div class="confirm-detail"><i class="bi bi-luggage"></i><span>Hand and hold baggage</span></div>
              <div class="confirm-detail"><i class="bi bi-ui-checks-grid"></i><span>11B</span></div>
            </div>
          </div>
          <div class="confirm-section">
            <h3 class="confirm-section-title"><i class="bi bi-credit-card"></i> Payment Method</h3>
            <label class="pay-card selected" style="max-width:280px;">
              <div class="pay-logo visa-logo">VISA</div>
              <div><div class="pay-num">visa ••••••••5174</div><div class="pay-exp">Expires Jan 01, 2026</div></div>
            </label>
          </div>
          <div class="confirm-section">
            <h3 class="confirm-section-title"><i class="bi bi-receipt"></i> Subtotal</h3>
            <div class="subtotal-row"><span><span class="subtotal-qty">2×</span> Flight tickets</span><span>₱ 4,980.00</span></div>
            <div class="subtotal-row"><span><span class="subtotal-qty">2×</span> Hold Luggage</span><span>₱ 1,600.00</span></div>
            <div class="confirm-total"><span>Total :</span><span class="confirm-total-amt">₱ 6,580.00</span></div>
          </div>
          <div class="d-flex justify-content-end mt-3 mb-5">
            <button class="complete-btn" @click="goNav('payment-success')">Confirm and Pay →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>