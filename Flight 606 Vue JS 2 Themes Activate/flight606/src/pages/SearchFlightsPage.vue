<script setup>
import { ref, inject } from 'vue'

const goNav = inject('goNav')

const fromVal = ref('MNL')
const toVal   = ref('CEB')
const sfDate  = ref('')
const pax     = ref('2 Adults')

const airportLabels = {
  MNL: 'Manila (MNL)', CEB: 'Cebu (CEB)', DVO: 'Davao (DVO)',
  SIN: 'Singapore (SIN)', TYO: 'Tokyo (TYO)', DXB: 'Dubai (DXB)',
  CDG: 'Paris (CDG)', NRT: 'Tokyo (NRT)', MLE: 'Maldives (MLE)',
  GVA: 'Geneva (GVA)', JFK: 'New York (JFK)'
}

const fromLabel = ref('Manila (MNL)')
const toLabel   = ref('Cebu (CEB)')

function updateBanner() {
  fromLabel.value = airportLabels[fromVal.value] || fromVal.value
  toLabel.value   = airportLabels[toVal.value]   || toVal.value
}

const activeChipOut = ref(4)
const activeChipRet = ref(4)

function selectFlight(card) {
  const siblings = card.parentElement.querySelectorAll('.flight-card')
  siblings.forEach(c => c.classList.remove('selected'))
  card.classList.add('selected')
}
</script>

<template>
  <div class="page active">
    <div class="inner-page">
      <div class="inner-hero">
        <div class="container text-center">
          <p class="hero-eyebrow">Flight 606 · Luxury Redefined</p>
          <h1 class="hero-title">Paradise <em>Awaits</em> Your Arrival</h1>
          <p class="hero-sub">Discover untouched destinations in absolute comfort</p>
        </div>
      </div>

      <div class="mt-5">
        <div class="container">
          <nav class="theme-breadcrumb" aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><a href="#" @click.prevent="goNav('home')">Home</a></li>
              <li class="breadcrumb-item active" aria-current="page">Flights</li>
            </ol>
          </nav>

          <!-- Search bar -->
          <div class="sf-search-bar">
            <div class="d-flex gap-4 mb-3 flex-wrap">
              <label class="r-lbl"><input type="radio" name="sf-trip" value="one" checked><span>One way</span></label>
              <label class="r-lbl"><input type="radio" name="sf-trip" value="round"><span>Round trip</span></label>
              <label class="r-lbl"><input type="radio" name="sf-trip" value="multi"><span>Multi-city</span></label>
            </div>
            <div class="sf-bar-row">
              <div>
                <div class="sf-label">From</div>
                <select class="sf-select" v-model="fromVal">
                  <option value="MNL">Manila (MNL)</option>
                  <option value="CEB">Cebu (CEB)</option>
                  <option value="DVO">Davao (DVO)</option>
                  <option value="SIN">Singapore (SIN)</option>
                  <option value="TYO">Tokyo (TYO)</option>
                  <option value="DXB">Dubai (DXB)</option>
                </select>
              </div>
              <div>
                <div class="sf-label">To</div>
                <select class="sf-select" v-model="toVal">
                  <option value="CDG">Paris (CDG)</option>
                  <option value="NRT">Tokyo (NRT)</option>
                  <option value="MLE">Maldives (MLE)</option>
                  <option value="GVA">Geneva (GVA)</option>
                  <option value="JFK">New York (JFK)</option>
                  <option value="DXB">Dubai (DXB)</option>
                  <option value="CEB">Cebu (CEB)</option>
                </select>
              </div>
              <div>
                <div class="sf-label">Departure Date</div>
                <input type="date" class="sf-input" v-model="sfDate">
              </div>
              <div>
                <div class="sf-label">Passengers</div>
                <select class="sf-select" v-model="pax">
                  <option>1 Adult</option>
                  <option>2 Adults</option>
                  <option>3 Adults</option>
                  <option>2 Adults, 1 Child</option>
                </select>
              </div>
              <div>
                <button class="sf-search-btn" @click="updateBanner">Search</button>
              </div>
            </div>
          </div>

          <!-- Outbound -->
          <div class="results-banner gold-banner">
            ✈ Select departure flight from <strong>{{ fromLabel }}</strong> to <strong>{{ toLabel }}</strong>
          </div>
          <div class="date-scroll-row">
            <span class="date-arrow">‹</span>
            <div class="date-chips">
              <span v-for="(chip, i) in ['Mon 13 May','Tue 14 May','Wed 15 May','Thu 16 May','Fri 17 May','Sat 18 May','Sun 19 May']"
                :key="i" class="date-chip" :class="{ active: i === activeChipOut }" @click="activeChipOut = i">{{ chip }}</span>
            </div>
            <span class="date-arrow">›</span>
          </div>

          <div class="flight-card selected" @click="$event.currentTarget.parentElement.querySelectorAll('.flight-card').forEach(c => c.classList.remove('selected')); $event.currentTarget.classList.add('selected')">
            <div class="fc-endpoint">
              <div class="fc-time">08:10</div>
              <div class="fc-airport">{{ fromLabel.split('(')[0].trim() }} · {{ fromVal }}</div>
              <div class="fc-date">Fri, 17 May 2025</div>
            </div>
            <div class="fc-mid">
              <div class="fc-duration">1h 15m</div>
              <div class="fc-line"><span class="fc-plane-icon"><i class="bi bi-airplane-fill"></i></span></div>
              <div class="fc-stops">Direct</div>
            </div>
            <div class="fc-endpoint">
              <div class="fc-time">09:25</div>
              <div class="fc-airport">{{ toLabel.split('(')[0].trim() }} · {{ toVal }}</div>
              <div class="fc-date">Fri, 17 May 2025</div>
            </div>
            <div class="fc-price-box">
              <span class="fc-badge">Cheapest Price</span>
              <div class="fc-price-amt">₱2,490</div>
              <div class="fc-price-note">operated by Flight606</div>
              <button class="fc-select-btn" @click.stop="goNav('book-flight')">Select →</button>
            </div>
          </div>

          <div class="flight-card" @click="$event.currentTarget.parentElement.querySelectorAll('.flight-card').forEach(c => c.classList.remove('selected')); $event.currentTarget.classList.add('selected')">
            <div class="fc-endpoint">
              <div class="fc-time">14:30</div>
              <div class="fc-airport">{{ fromLabel.split('(')[0].trim() }} · {{ fromVal }}</div>
              <div class="fc-date">Fri, 17 May 2025</div>
            </div>
            <div class="fc-mid">
              <div class="fc-duration">1h 20m</div>
              <div class="fc-line"><span class="fc-plane-icon"><i class="bi bi-airplane-fill"></i></span></div>
              <div class="fc-stops">Direct</div>
            </div>
            <div class="fc-endpoint">
              <div class="fc-time">15:50</div>
              <div class="fc-airport">{{ toLabel.split('(')[0].trim() }} · {{ toVal }}</div>
              <div class="fc-date">Fri, 17 May 2025</div>
            </div>
            <div class="fc-price-box">
              <div class="fc-price-amt" style="color:#e05252;">₱3,800</div>
              <div class="fc-price-note">operated by AirAsia</div>
              <button class="fc-select-btn" @click.stop="goNav('book-flight')">Select →</button>
            </div>
          </div>

          <div class="view-more-wrap"><button class="view-more-btn">View more ↓</button></div>

          <!-- Return -->
          <div class="results-banner gold-banner-dim mt-5">
            ✈ Select return flight from <strong>{{ toLabel }}</strong> to <strong>{{ fromLabel }}</strong>
          </div>
          <div class="date-scroll-row">
            <span class="date-arrow">‹</span>
            <div class="date-chips">
              <span v-for="(chip, i) in ['Mon 27 May','Tue 28 May','Wed 29 May','Thu 30 May','Fri 31 May','Sat 1 Jun']"
                :key="i" class="date-chip" :class="{ active: i === activeChipRet }" @click="activeChipRet = i">{{ chip }}</span>
            </div>
            <span class="date-arrow">›</span>
          </div>

          <div class="flight-card selected">
            <div class="fc-endpoint">
              <div class="fc-time">10:00</div>
              <div class="fc-airport">{{ toLabel.split('(')[0].trim() }} · {{ toVal }}</div>
              <div class="fc-date">Fri, 31 May 2025</div>
            </div>
            <div class="fc-mid">
              <div class="fc-duration">1h 15m</div>
              <div class="fc-line"><span class="fc-plane-icon"><i class="bi bi-airplane-fill"></i></span></div>
              <div class="fc-stops">Direct</div>
            </div>
            <div class="fc-endpoint">
              <div class="fc-time">11:15</div>
              <div class="fc-airport">{{ fromLabel.split('(')[0].trim() }} · {{ fromVal }}</div>
              <div class="fc-date">Fri, 31 May 2025</div>
            </div>
            <div class="fc-price-box">
              <span class="fc-badge">Cheapest Price</span>
              <div class="fc-price-amt">₱2,490</div>
              <div class="fc-price-note">operated by Flight606</div>
              <button class="fc-select-btn" @click.stop="goNav('book-flight')">Select →</button>
            </div>
          </div>

          <div class="view-more-wrap mb-5"><button class="view-more-btn">View more ↓</button></div>
        </div>
      </div>

      <footer class="site-footer">
        <div class="container">
          <div class="footer-bottom" style="border-top:none; padding-top:0">
            <div class="footer-legal">
              <a href="#">Legal</a><a href="#">Privacy</a><a href="#">Accessibility</a>
            </div>
            <span class="footer-copy">© Batch 606</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>