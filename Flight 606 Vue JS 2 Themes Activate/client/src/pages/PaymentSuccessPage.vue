<script setup>
import { inject } from 'vue'
const goNav = inject('goNav')
</script>
<template>
  <div class="page active">
    <div class="inner-page">
      <div class="success-page">
        <div class="success-icon">✓</div>
        <h1 class="success-title">Booking Confirmed!</h1>
        <p class="success-sub">Your payment has been <strong>successfully processed</strong>.<br>
          Check the <a href="#" @click.prevent="goNav('profile')" class="gold-link">wallet section</a> from your profile to see all available tickets.</p>
        <p class="success-note">We will notify you two days before departure to prepare.</p>
        <div class="success-plane"><i class="bi bi-airplane-fill"></i></div>
        <div class="success-actions">
          <button class="btn-gold-full" @click="goNav('home')">Back to Home</button>
          <button class="btn-gold-full" @click="goNav('profile')">View My Bookings</button>
        </div>
      </div>
    </div>
  </div>
</template>