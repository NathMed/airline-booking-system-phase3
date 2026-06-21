<script setup>
    import { watch, ref, onBeforeMount } from 'vue';
    import { Notyf } from 'notyf';
    import { useRouter } from 'vue-router';
    import api from '../api.js';

    const firstName = ref("");
    const lastName = ref("");
    const email = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const phone = ref("");
    const gender = ref("");
    const isEnabled = ref(false);
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const isLoading = ref(false);
    const termsAccepted = ref(false);

    const notyf = new Notyf();
    const router = useRouter();


    watch([firstName, lastName, email, password, confirmPassword, phone, gender, termsAccepted], (currentValue) => {
        const [fn, ln, em, pw, cp, ph, gen, terms] = currentValue;
        const allFilled = [fn, ln, em, pw, cp, ph, gen].every(v => v !== "");
        const passwordsMatch = pw === cp;
        isEnabled.value = allFilled && passwordsMatch && terms;
    });

    async function handleSubmit() {
        if (!isEnabled.value || isLoading.value) return;
        isLoading.value = true;

        try {
            const response = await api.post('users/register', {
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                password: password.value,
                confirmPassword: confirmPassword.value,  // backend validates this too
                phone: phone.value,
                gender: gender.value
            });

            if (response.status === 201) {
                notyf.success(response.data.message);

                firstName.value = "";
                lastName.value = "";
                email.value = "";
                password.value = "";
                confirmPassword.value = "";
                phone.value = "";
                gender.value = "";
                termsAccepted.value = false;

                router.push({ path: '/login' });
            } else {
                notyf.error("Registration Failed. Please contact administrator.");
            }
        } catch (e) {
            const message = e.response?.data?.message;

            if (message) {
                notyf.error(message);
            } else {
                notyf.error("Registration Failed. Please contact administrator.");
            }
        } finally {
            isLoading.value = false;
        }
    }

    function togglePass(field) {
        if (field === 'password') showPassword.value = !showPassword.value;
        else showConfirmPassword.value = !showConfirmPassword.value;
    }

    onBeforeMount(() => {
        if (localStorage.getItem("token")) {
            router.push({ path: '/' });
        }
    });
</script>

<template>
    <div class="auth-bg">
        <div class="container">
            <div class="row align-items-center min-vh-100 py-5">

                <!-- Left panel -->
                <div class="col-lg-6 d-none d-lg-flex flex-column justify-content-center pe-5">
                    <p class="auth-eyebrow">Flight 606 · Luxury Redefined</p>
                    <h1 class="auth-headline">Experience the<br><em>Art of Travel</em></h1>
                    <p class="auth-sub">Crafted for the <span class="gold">Modern Traveler</span></p>
                    <blockquote class="auth-quote">
                        <p>"Flight606 is the only Airline where the journey becomes your destination"</p>
                        <footer>— Manny Paksiw</footer>
                    </blockquote>
                </div>

                <!-- Auth card -->
                <div class="col-lg-6">
                    <div class="auth-card">
                        <p class="a-tag">Welcome to Flight606</p>
                        <h2 class="a-title">Create <span class="gold">account</span></h2>

                        <form @submit.prevent="handleSubmit" novalidate>
                            <div class="row g-3">

                                <div class="col-6">
                                    <label class="f-label">First Name</label>
                                    <input
                                        v-model="firstName"
                                        type="text"
                                        class="f-input"
                                        placeholder="First name"
                                    />
                                    <p v-if="firstName === '' && isLoading" class="err-msg">First name is required.</p>
                                </div>

                                <div class="col-6">
                                    <label class="f-label">Last Name</label>
                                    <input
                                        v-model="lastName"
                                        type="text"
                                        class="f-input"
                                        placeholder="Last name"
                                    />
                                    <p v-if="lastName === '' && isLoading" class="err-msg">Last name is required.</p>
                                </div>

                                <div class="col-6">
                                    <label class="f-label">E-Mail</label>
                                    <input
                                        v-model="email"
                                        type="email"
                                        class="f-input"
                                        placeholder="your.email@mail.com"
                                    />
                                </div>

                                <div class="col-6">
                                    <label class="f-label">Date of Birth</label>
                                    <input type="date" class="f-input" />
                                </div>

                                <div class="col-6">
                                    <label class="f-label">Phone Number</label>
                                    <input
                                        v-model="phone"
                                        type="tel"
                                        class="f-input"
                                        placeholder="09XXXXXXXXX"
                                        maxlength="11"
                                        @input="phone = phone.replace(/\D/g, '')"
                                    />
                                    <p v-if="phone.length > 0 && phone.length !== 11" class="err-msg">
                                        Phone number must be 11 digits.
                                    </p>
                                </div>

                                <div class="col-6">
                                    <label class="f-label">Gender</label>
                                    <select v-model="gender" class="f-input">
                                        <option value="" disabled>Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div class="col-6">
                                    <label class="f-label">Password</label>
                                    <div class="input-wrap">
                                        <input
                                            v-model="password"
                                            :type="showPassword ? 'text' : 'password'"
                                            class="f-input"
                                            placeholder="Password"
                                        />
                                        <span class="input-eye" @click="togglePass('password')">
                                            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                                        </span>
                                    </div>
                                    <p v-if="password.length > 0 && password.length < 8" class="err-msg">
                                        Min. 8 characters required.
                                    </p>
                                </div>

                                <div class="col-6">
                                    <label class="f-label">Confirm Password</label>
                                    <div class="input-wrap">
                                        <input
                                            v-model="confirmPassword"
                                            :type="showConfirmPassword ? 'text' : 'password'"
                                            class="f-input"
                                            placeholder="••••••••••"
                                        />
                                        <span class="input-eye" @click="togglePass('confirm')">
                                            <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                                        </span>
                                    </div>
                                    <p v-if="confirmPassword.length > 0 && password !== confirmPassword" class="err-msg">
                                        Passwords do not match.
                                    </p>
                                </div>

                            </div>

                            <label class="r-lbl mt-3">
                                <input v-model="termsAccepted" type="checkbox" />
                                <span>
                                    I agree to all the
                                    <a href="#" class="gold-link">Terms</a> and
                                    <a href="#" class="gold-link">Privacy Policy</a>
                                </span>
                            </label>

                            <button
                                type="submit"
                                class="btn-gold-full mt-3"
                                :disabled="!isEnabled"
                                :style="{ opacity: isEnabled ? 1 : 0.5, cursor: isEnabled ? 'pointer' : 'not-allowed' }"
                            >
                                {{ isLoading ? 'Creating Account…' : 'Create Account' }}
                            </button>

                            <button type="button" class="oauth-btn">
                                <img src="https://www.google.com/favicon.ico" width="14" alt="G" /> Continue with Google
                            </button>
                            <button type="button" class="oauth-btn">
                                <i class="bi bi-apple"></i> Continue with Apple
                            </button>

                        </form>

                        <p class="switch-link">
                            Already have an account?
                            <router-link to="/login" class="gold-link">Log In</router-link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>