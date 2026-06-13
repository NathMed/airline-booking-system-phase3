<script setup>
import { watch, ref, onBeforeMount } from 'vue';
import { Notyf } from 'notyf';
import { useRouter } from 'vue-router';
import api from '../api.js';

const router = useRouter();

const email = ref("");
const password = ref("");
const isEnabled = ref(false);
const showPassword = ref(false);

const notyf = new Notyf();

watch([email, password], (currentValue) => {
  isEnabled.value = currentValue.every(input => input !== "");
});

async function handleSubmit() {
  // Clear previous errors
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    notyf.error("Please enter a valid email address.");
    return;
  }

  try {
    const response = await api.post(`/users/login`, {
      email: email.value,
      password: password.value,
    });

    if (response.data) {
      notyf.success("Login Successful");
      localStorage.setItem("token", response.data.access);

      // TODO: implement getUserDetails or remove this line
      // getUserDetails(response.data.access);

      email.value = "";
      password.value = "";
      router.push({ path: '/' });
    } else {
      notyf.error("Login Failed. Please contact administrator.");
    }
  } catch (e) {
    const status = e.response?.status;
    if (status === 404 || status === 401 || status === 400) {
      notyf.error(e.response.data.error);
    } else {
      notyf.error("Login Failed. Please contact administrator.");
    }
  }
}

onBeforeMount(() => {
  if (localStorage.getItem("token")) {
    router.push({ path: '/home' });
  }
});
</script>

<template>
  <div id="page-login">
    <div class="auth-bg">
      <div class="container auth-wrap">
        <div class="row align-items-center min-vh-100 py-5">
          <div class="col-lg-6 auth-left d-none d-lg-flex flex-column justify-content-center pe-5">
            <p class="auth-eyebrow">Flight 606 · Luxury Redefined</p>
            <h1 class="auth-headline">Paradise <em>Awaits</em><br>Your Arrival</h1>
            <p class="auth-sub">Your Exclusive Gateway to <span class="gold">First-class</span> Journey</p>
            <blockquote class="auth-quote">
              <p>"Flight606 is the only Airline where the journey becomes your destination"</p>
              <footer>— Manny Paksiu</footer>
            </blockquote>
          </div>
          <div class="col-lg-6">
            <div class="auth-card">
              <p class="a-tag">Welcome back</p>
              <h2 class="a-title">Login to your <span class="gold">account</span></h2>
              <div class="mb-3">
                <label class="f-label">E-Mail</label>
                <input
                  v-model="email"
                  type="email"
                  class="f-input"
                  placeholder="example@email.com"
                />
              </div>
              <div class="mb-3">
                <label class="f-label">Password</label>
                <div class="input-wrap">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="f-input"
                    placeholder="••••••••••"
                  />
                  <span class="input-eye" @click="showPassword = !showPassword">
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-4">
                <label class="r-lbl"><input type="checkbox"> <span>Remember me</span></label>
                <a href="#" class="gold-link">Forgot password?</a>
              </div>
              <button
                class="btn-gold-full"
                :disabled="!isEnabled"
                @click="handleSubmit"
              >
                Login Now
              </button>
              <button class="oauth-btn">
                <img src="https://www.google.com/favicon.ico" width="14" alt="G"> Continue with Google
              </button>
              <button class="oauth-btn">
                <i class="bi bi-apple"></i> Continue with Apple
              </button>
              <p class="switch-link">
                Don't have an account?
                <a href="#" class="gold-link">Sign Up</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
	
</style>