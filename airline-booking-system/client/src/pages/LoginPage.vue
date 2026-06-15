<script setup>
  import { watch, ref, onBeforeMount } from 'vue';
  import { Notyf } from 'notyf';
  import { useRouter } from 'vue-router';
  import api from '../api.js';

  const notyf = new Notyf();

  const router = useRouter();

  const email = ref("");
  const password = ref("");
  const isEnabled = ref(false);
  const showPassword = ref(false);
  const isLoading = ref(false);


  watch([email, password], (currentValue) => {
      isEnabled.value = currentValue.every(input => input !== "");
  });

  async function handleSubmit() {
    if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      notyf.error("Please enter a valid email address.");
      return;
    }

    isLoading.value = true;

    try {
      const response = await api.post(`/users/login`, {
        email: email.value,
        password: password.value,
      });

      if (response.data.access) {
        localStorage.setItem("token", response.data.access);

        notyf.success(response.data.message);
            
            email.value = "";
            password.value = "";
            router.push({ path: '/' });

        } else {
          notyf.error("Login Failed. Please contact administrator.");
      }
    } catch (e) {
      const message = e.response?.data?.message;

      if (message) {
            notyf.error(message);
        } else {
            notyf.error("Login Failed. Please contact administrator.");
        }
    } finally {
        isLoading.value = false;
    }
  }

  onBeforeMount(() => {
    if (localStorage.getItem("token")) {
      router.push({ path: '/' });
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
              <footer>— Manny Paksiw</footer>
            </blockquote>
          </div>
          <div class="col-lg-6">
            <form class="auth-card" @submit.prevent="handleSubmit" novalidate>
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
                :style="{ opacity: isEnabled ? 1 : 0.5, cursor: isEnabled ? 'pointer' : 'not-allowed' }"
                @click="handleSubmit"
              >
                {{ isEnabled ? 'Login Now' : 'Enter your credentials' }}
              </button>
              <button class="oauth-btn">
                <img src="https://www.google.com/favicon.ico" width="14" alt="G"> Continue with Google
              </button>
              <button class="oauth-btn">
                <i class="bi bi-apple"></i> Continue with Apple
              </button>
              <p class="switch-link">
                Don't have an account?
                <router-link to='/register' class="gold-link">Sign Up</router-link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
	
</style>