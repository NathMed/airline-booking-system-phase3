<script setup>
import { ref, inject, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalStore } from '../stores/global.js'

const theme       = inject('theme')
const toggleTheme = inject('toggleTheme')

const store = useGlobalStore()
const router = useRouter()
const globalStore = useGlobalStore()

// ── Scroll state ───────────────────────────────────
const isScrolled      = ref(false)
const profileMenuOpen = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 40
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// ── Auth state, derived directly from the store so a page refresh ─
// ── never disagrees with the actual session (see App.vue) ────────
const isLoggedIn = computed(() => !!globalStore.user.token)

function toggleProfileMenu() {
  profileMenuOpen.value = !profileMenuOpen.value
}

function closeProfileMenu() {
  profileMenuOpen.value = false
}

function doLogout() {
  globalStore.getUserDetails(null)
  profileMenuOpen.value = false
  router.push({ name: 'Home' })
}
</script>

<template>
  <nav
    class="navbar navbar-expand-lg fixed-top"
    id="mainNav"
    :class="{ scrolled: isScrolled }"
  >
    <div class="container-fluid nav-inner">

      <!-- Logo — image placeholder (swap src when you have an asset) -->
      <RouterLink class="navbar-brand" :to="{ name: 'Home' }">
        <img src="https://placeholder.com" alt="Logo" class="nav-logo" />
      </RouterLink>

      <!-- Hamburger -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
        aria-controls="navbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="toggler-icon"></span>
        <span class="toggler-icon"></span>
        <span class="toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav mx-auto gap-lg-2">
          <li class="nav-item">
            <RouterLink class="nav-link" active-class="active" :to="{ name: 'Home' }">Home</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" active-class="active" :to="{ name: 'SearchFlights' }">Flights</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" active-class="active" :to="{ path: '/', hash: '#tours' }">Destinations</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" active-class="active" :to="{ name: 'FlightStatus' }">Flight Status</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" active-class="active" :to="{ name: 'CheckIn' }">Check-in</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" active-class="active" :to="{ name: 'Contact' }">Contact</RouterLink>
          </li>
        </ul>

        <div class="nav-actions d-flex align-items-center gap-2">

          <!-- Theme toggle -->
          <button
            class="theme-toggle"
            @click="toggleTheme"
            aria-label="Toggle light/dark mode"
            title="Toggle light/dark mode"
          >
            <i class="ti ti-moon icon-dark"></i>
            <i class="ti ti-sun icon-light"></i>
          </button>

          <!-- Logged out -->
          <div v-if="!isLoggedIn" class="d-flex align-items-center gap-2">
            <RouterLink class="btn-ghost" :to="{ name: 'Login' }">Login</RouterLink>
            <RouterLink class="btn-gold" :to="{ name: 'Signup' }">Sign Up</RouterLink>
          </div>

          <!-- Logged in -->
          <div v-else class="profile-dropdown" id="profileDropdown">
            <button class="profile-trigger" @click="toggleProfileMenu">
              <i class="bi bi-person-circle"></i>
              <span class="profile-name-label">{{store.user.firstName}}</span>
              <i class="bi bi-chevron-down small"></i>
            </button>
            <div class="profile-menu" :class="{ open: profileMenuOpen }">
              <RouterLink :to="{ name: 'Profile' }" @click="closeProfileMenu">
                <i class="bi bi-person"></i> Personal Details
              </RouterLink>
              <RouterLink :to="{ name: 'MyBookings' }" @click="closeProfileMenu">
                <i class="bi bi-wallet2"></i> My Bookings
              </RouterLink>
              <RouterLink :to="{ name: 'CheckIn' }" @click="closeProfileMenu">
                <i class="bi bi-qr-code-scan"></i> Check-in
              </RouterLink>
              <div class="pm-sep"></div>
              <a href="#" class="logout-link" @click.prevent="doLogout">
                <i class="bi bi-box-arrow-right"></i> Log out
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Nav logo image — sized for the navbar bar */
.nav-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
  display: block;
}
</style>
