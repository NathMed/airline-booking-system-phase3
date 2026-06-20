import { createRouter, createWebHistory } from 'vue-router'
import { useGlobalStore } from '../stores/global.js'

import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import SignupPage from '../pages/SignupPage.vue'
import SearchFlightsPage from '../pages/SearchFlightsPage.vue'
import BookFlightPage from '../pages/BookFlightPage.vue'
import ConfirmPaymentPage from '../pages/ConfirmPaymentPage.vue'
import PaymentSuccessPage from '../pages/PaymentSuccessPage.vue'
import ContactPage from '../pages/ContactPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import MyBookingsPage from '../pages/MyBookingsPage.vue'
import CheckInPage from '../pages/CheckInPage.vue'
import FlightStatusPage from '../pages/FlightStatusPage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/login', name: 'Login', component: LoginPage, meta: { guestOnly: true } },
  { path: '/signup', name: 'Signup', component: SignupPage, meta: { guestOnly: true } },
  { path: '/flights', name: 'SearchFlights', component: SearchFlightsPage },

  // Checkout / GuestCheckout share the same seat + passenger-details component.
  // flightId is a comma-joined list of one (one-way) or two (round-trip) Flight _ids,
  // built by SearchFlightsPage.selectFlight().
  { path: '/checkout/:flightId', name: 'Checkout', component: BookFlightPage, meta: { requiresAuth: true } },
  { path: '/guest-checkout/:flightId', name: 'GuestCheckout', component: BookFlightPage },

  { path: '/confirm-payment', name: 'ConfirmPayment', component: ConfirmPaymentPage },
  { path: '/payment-success', name: 'PaymentSuccess', component: PaymentSuccessPage },

  { path: '/contact', name: 'Contact', component: ContactPage },
  { path: '/profile', name: 'Profile', component: ProfilePage, meta: { requiresAuth: true } },
  { path: '/my-bookings', name: 'MyBookings', component: MyBookingsPage },
  { path: '/check-in', name: 'CheckIn', component: CheckInPage },
  { path: '/flight-status', name: 'FlightStatus', component: FlightStatusPage },

  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  }
})

// Route guards: keep logged-out users out of account-only pages, and
// keep logged-in users from re-visiting the login/signup forms.
router.beforeEach((to) => {
  const globalStore = useGlobalStore()
  const isLoggedIn = !!globalStore.user.token

  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && isLoggedIn) {
    return { name: 'Home' }
  }
  return true
})

export default router
