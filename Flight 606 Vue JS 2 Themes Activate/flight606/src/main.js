import { createApp } from 'vue'
import App from './App.vue'

// 1. Import Third-Party Framework Styles first
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@tabler/icons-webfont/dist/tabler-icons.css'

// 2. Import Your Custom Design Tokens & Styles last (so they override defaults)
import './style.css'

// 3. Import Bootstrap's Javascript triggers
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const saved = localStorage.getItem('f606-theme') || 'dark'
document.documentElement.setAttribute('data-theme', saved)

createApp(App).mount('#app')
