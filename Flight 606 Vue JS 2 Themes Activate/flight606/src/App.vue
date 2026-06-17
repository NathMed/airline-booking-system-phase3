<script setup>
import { ref, provide, onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import HomePage from './pages/HomePage.vue'
import LoginPage from './pages/LoginPage.vue'
import SignupPage from './pages/SignupPage.vue'
import SearchFlightsPage from './pages/SearchFlightsPage.vue'
import BookFlightPage from './pages/BookFlightPage.vue'
import ConfirmPaymentPage from './pages/ConfirmPaymentPage.vue'
import PaymentSuccessPage from './pages/PaymentSuccessPage.vue'
import ContactPage from './pages/ContactPage.vue'
import ProfilePage from './pages/ProfilePage.vue'

// ── Theme ──────────────────────────────────────────
const theme = ref(localStorage.getItem('f606-theme') || 'dark')

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('f606-theme', theme.value)
}

// ── Page Router ────────────────────────────────────
const currentPage = ref('home')
const currentSection = ref(null)

function showPage(name) {
  currentPage.value = name
  currentSection.value = null
  window.scrollTo({ top: 0, behavior: 'instant' })
}

function goNav(page, section = null) {
  currentPage.value = page
  currentSection.value = section
  window.scrollTo({ top: 0, behavior: 'instant' })
  if (section) {
    setTimeout(() => {
      const el = document.getElementById(section)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }
}

// ── Auth State ─────────────────────────────────────
const isLoggedIn = ref(false)

function setLoggedIn(state) {
  isLoggedIn.value = state
}

// ── Provide globals to all children ───────────────
provide('theme', theme)
provide('toggleTheme', toggleTheme)
provide('currentPage', currentPage)
provide('showPage', showPage)
provide('goNav', goNav)
provide('isLoggedIn', isLoggedIn)
provide('setLoggedIn', setLoggedIn)
</script>

<template>
  <div :data-theme="theme">
    <Navbar />

    <HomePage        v-if="currentPage === 'home'" />
    <LoginPage       v-else-if="currentPage === 'login'" />
    <SignupPage      v-else-if="currentPage === 'signup'" />
    <SearchFlightsPage v-else-if="currentPage === 'search-flights'" />
    <BookFlightPage  v-else-if="currentPage === 'book-flight'" />
    <ConfirmPaymentPage v-else-if="currentPage === 'confirm-payment'" />
    <PaymentSuccessPage v-else-if="currentPage === 'payment-success'" />
    <ContactPage     v-else-if="currentPage === 'contact'" />
    <ProfilePage     v-else-if="currentPage === 'profile'" />
  </div>
</template>