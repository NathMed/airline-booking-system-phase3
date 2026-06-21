<script setup>
	import HeroComponent from '../components/HeroComponent.vue';
    import TourPlanComponent from '../components/TourPlanComponent.vue';
    import AboutComponent from '../components/AboutComponent.vue';
</script>

<template>
	<div class="min-h-screen overflow-hidden relative main-wrapper">
    
    <!-- 1. Combined Header & Banner inside the Video Container -->
    <div>
      <HeroComponent />
    </div>

    <!-- Main Content Layout Holder (Rest of your sections remain below) -->
    <main class="relative z-10">
        <TourPlanComponent />
        <AboutComponent />
    </main>
  </div>
</template>