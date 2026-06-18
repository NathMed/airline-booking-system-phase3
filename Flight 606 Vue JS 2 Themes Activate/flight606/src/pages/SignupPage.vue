<script setup>
import { ref, inject } from 'vue'

const showPage = inject('showPage')

const fn    = ref(''); const fnErr  = ref(false)
const ln    = ref(''); const lnErr  = ref(false)
const em    = ref(''); const emErr  = ref(false)
const dob   = ref('')
const pw    = ref(''); const pwErr  = ref(false)
const cp    = ref(''); const cpErr  = ref(false)
const terms = ref(false); const termsErr = ref(false)
const showPw  = ref(false)
const showCp  = ref(false)
const success = ref(false)

function doSignup() {
  fnErr.value = !fn.value.trim()
  lnErr.value = !ln.value.trim()
  emErr.value = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)
  pwErr.value = pw.value.length < 8
  cpErr.value = pw.value !== cp.value
  termsErr.value = !terms.value

  if (fnErr.value || lnErr.value || emErr.value || pwErr.value || cpErr.value || termsErr.value) return

  success.value = true
  setTimeout(() => showPage('login'), 1800)
}
</script>

<template>
  <div class="page active">
    <div class="auth-bg">
      <div class="container">
        <div class="row align-items-center min-vh-100 py-5">
          <div class="col-lg-6 d-none d-lg-flex flex-column justify-content-center pe-5">
            <p class="auth-eyebrow">Flight 606 · Luxury Redefined</p>
            <h1 class="auth-headline">Experience the<br><em>Art of Travel</em></h1>
            <p class="auth-sub">Crafted for the <span class="gold">Modern Traveler</span></p>
            <blockquote class="auth-quote">
              <p>"Flight606 is the only Airline where the journey becomes your destination"</p>
              <footer>— Manny Paksiu</footer>
            </blockquote>
          </div>
          <div class="col-lg-6">
            <div class="auth-card">
              <p class="a-tag">Welcome to Flight606</p>
              <h2 class="a-title">Create <span class="gold">account</span></h2>
              <div v-if="success" class="alert-msg alert-success">Account created! Redirecting to login…</div>
              <div class="row g-3">
                <div class="col-6">
                  <label class="f-label">First Name</label>
                  <input type="text" class="f-input" :class="{ err: fnErr }" v-model="fn" placeholder="First name">
                  <p v-if="fnErr" class="err-msg">First name is required.</p>
                </div>
                <div class="col-6">
                  <label class="f-label">Last Name</label>
                  <input type="text" class="f-input" :class="{ err: lnErr }" v-model="ln" placeholder="Last name">
                  <p v-if="lnErr" class="err-msg">Last name is required.</p>
                </div>
                <div class="col-6">
                  <label class="f-label">E-Mail</label>
                  <input type="email" class="f-input" :class="{ err: emErr }" v-model="em" placeholder="your.email@mail.com">
                  <p v-if="emErr" class="err-msg">Valid email required.</p>
                </div>
                <div class="col-6">
                  <label class="f-label">Date of Birth</label>
                  <input type="date" class="f-input" v-model="dob">
                </div>
                <div class="col-6">
                  <label class="f-label">Password</label>
                  <div class="input-wrap">
                    <input :type="showPw ? 'text' : 'password'" class="f-input" :class="{ err: pwErr }" v-model="pw" placeholder="Password">
                    <span class="input-eye" @click="showPw = !showPw"><i class="bi bi-eye"></i></span>
                  </div>
                  <p v-if="pwErr" class="err-msg">Min. 8 characters required.</p>
                </div>
                <div class="col-6">
                  <label class="f-label">Confirm Password</label>
                  <div class="input-wrap">
                    <input :type="showCp ? 'text' : 'password'" class="f-input" :class="{ err: cpErr }" v-model="cp" placeholder="••••••••••">
                    <span class="input-eye" @click="showCp = !showCp"><i class="bi bi-eye"></i></span>
                  </div>
                  <p v-if="cpErr" class="err-msg">Passwords do not match.</p>
                </div>
              </div>
              <label class="r-lbl mt-3">
                <input type="checkbox" v-model="terms">
                <span>I agree to all the <a href="#" class="gold-link">Terms</a> and <a href="#" class="gold-link">Privacy Policy</a></span>
              </label>
              <p v-if="termsErr" class="err-msg mt-1">You must agree to the terms.</p>
              <button class="btn-gold-full mt-3" @click="doSignup">Create Account</button>
              <button class="oauth-btn"><img src="https://www.google.com/favicon.ico" width="14" alt="G"> Continue with Google</button>
              <button class="oauth-btn"><i class="bi bi-apple"></i> Continue with Apple</button>
              <p class="switch-link">Already have an account? <a href="#" @click.prevent="showPage('login')" class="gold-link">Log In</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>