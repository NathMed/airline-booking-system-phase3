<script setup>
	import { RouterLink, RouterView } from 'vue-router';
  import { useGlobalStore } from './stores/global';
  import NavbarComponent from './components/NavbarComponent.vue';
  import FooterComponent from './components/FooterComponent.vue';

  const globalStore = useGlobalStore();
</script>

<template>
  <div>
    <NavbarComponent />
      <main>
          <RouterView />
      </main>
    <FooterComponent />
  </div>
  
</template>