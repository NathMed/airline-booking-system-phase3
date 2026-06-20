<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import BookingWidget from './BookingWidget.vue'

const slides = [
  '',
  '',
  '',
]

const current = ref(0)
let timer = null

function goSlide(i) {
  current.value = (i + slides.length) % slides.length
}
function next() { goSlide(current.value + 1) }
function prev() { goSlide(current.value - 1) }

function start() { timer = setInterval(next, 5000) }
function stop()  { clearInterval(timer) }

onMounted(() => { goSlide(0); start() })
onUnmounted(stop)
</script>

<template>
  <section class="hero-section">
    <div class="hero-overlay"></div>
    <div
      class="hero-slider-bg"
      :style="{ backgroundImage: `url('${slides[current]}')` }"
    ></div>

    <div class="container hero-content">
      <p class="hero-eyebrow">Flight 606 &nbsp;·&nbsp; Luxury Redefined</p>
      <h1 class="hero-title">Paradise <em>Awaits</em><br>Your Arrival</h1>
      <p class="hero-sub">Discover untouched destinations in absolute comfort</p>

      <div class="hero-slider-nav">
        <button class="slider-arrow" @click="prev" aria-label="Previous slide">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div class="slider-dots">
          <button
            v-for="(_, i) in slides"
            :key="i"
            class="dot"
            :class="{ active: i === current }"
            @click="goSlide(i)"
            :aria-label="`Slide ${i + 1}`"
          ></button>
        </div>
        <button class="slider-arrow" @click="next" aria-label="Next slide">
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>

      <BookingWidget />
    </div>
  </section>
</template>