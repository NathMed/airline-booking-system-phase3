<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'

const theme       = inject('theme')
const toggleTheme = inject('toggleTheme')
const showPage    = inject('showPage')
const goNav       = inject('goNav')
const isLoggedIn  = inject('isLoggedIn')
const setLoggedIn = inject('setLoggedIn')

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

// ── Nav active link ────────────────────────────────
const activeLink = ref('home')

function navigate(page, section = null) {
  activeLink.value = page
  goNav(page, section)
  profileMenuOpen.value = false
}

// ── Profile menu ───────────────────────────────────
function toggleProfileMenu() {
  profileMenuOpen.value = !profileMenuOpen.value
}

function doLogout() {
  setLoggedIn(false)
  profileMenuOpen.value = false
  showPage('home')
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
      <a class="navbar-brand" href="#" @click.prevent="navigate('home')">
        <img src="https://placeholder.com" alt="Logo" class="nav-logo" />
      </a>

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
            <a class="nav-link" :class="{ active: activeLink === 'home' }"
               href="#" @click.prevent="navigate('home')">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeLink === 'search-flights' }"
               href="#" @click.prevent="navigate('search-flights')">Flights</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeLink === 'destinations' }"
               href="#" @click.prevent="navigate('home', 'tours')">Destinations</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeLink === 'experience' }"
               href="#" @click.prevent="navigate('home', 'about')">Experience</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeLink === 'contact' }"
               href="#" @click.prevent="navigate('contact')">Contact</a>
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
            <a class="btn-ghost" href="#" @click.prevent="showPage('login')">Login</a>
            <a class="btn-gold"  href="#" @click.prevent="showPage('signup')">Sign Up</a>
          </div>

          <!-- Logged in -->
          <div v-else class="profile-dropdown" id="profileDropdown">
            <button class="profile-trigger" @click="toggleProfileMenu">
              <i class="bi bi-person-circle"></i>
              <span class="profile-name-label">My Account</span>
              <i class="bi bi-chevron-down small"></i>
            </button>
            <div class="profile-menu" :class="{ open: profileMenuOpen }">
              <a href="#" @click.prevent="showPage('profile'); profileMenuOpen = false">
                <i class="bi bi-person"></i> Personal Details
              </a>
              <a href="#" @click.prevent="showPage('profile'); profileMenuOpen = false">
                <i class="bi bi-credit-card"></i> Payment Details
              </a>
              <a href="#" @click.prevent="showPage('profile'); profileMenuOpen = false">
                <i class="bi bi-wallet2"></i> Wallet
              </a>
              <a href="#" @click.prevent="showPage('profile'); profileMenuOpen = false">
                <i class="bi bi-clock-history"></i> Payment History
              </a>
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