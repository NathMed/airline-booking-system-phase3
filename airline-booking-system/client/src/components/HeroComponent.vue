<script setup>
    import { useRouter } from 'vue-router';

    const router = useRouter();

    function scrollToProduct() {
        const productEl = document.querySelector('.product-section') || document.querySelector('.gsap-animate:nth-child(2)');
        if (productEl) {
            productEl.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        }
        }

        function goToProducts() {
        router.push('/products');
        }
</script>

<template>
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-slider-bg" id="heroBg"></div>

      <div class="container hero-content">
        <p class="hero-eyebrow">Flight 606 &nbsp;·&nbsp; Luxury Redefined</p>
        <h1 class="hero-title">Paradise <em>Awaits</em><br>Your Arrival</h1>
        <p class="hero-sub">Discover untouched destinations in absolute comfort</p>

        <div class="hero-slider-nav">
          <button class="slider-arrow" onclick="prevSlide()"><i class="bi bi-arrow-left"></i></button>
          <div class="slider-dots" id="sliderDots">
            <button class="dot active" onclick="goSlide(0)"></button>
            <button class="dot" onclick="goSlide(1)"></button>
            <button class="dot" onclick="goSlide(2)"></button>
          </div>
          <button class="slider-arrow" onclick="nextSlide()"><i class="bi bi-arrow-right"></i></button>
        </div>

        <!-- Booking Widget -->
        <div class="booking-widget">
          <div class="widget-header">
            <div class="widget-tabs">
              <button class="w-tab active" id="wtb-buy" onclick="wTab('buy')">Buy Tickets</button>
              <button class="w-tab" id="wtb-status" onclick="wTab('status')">Check Flight Status</button>
            </div>
            <a href="#" class="btn-gold" onclick="goNav(null,'search-flights'); return false;">Book Now</a>
          </div>

          <div id="wp-buy">
            <div class="trip-radios">
              <label class="r-lbl"><input type="radio" name="trip" value="one" checked><span>One way</span></label>
              <label class="r-lbl"><input type="radio" name="trip" value="round"><span>Round trip</span></label>
              <label class="r-lbl"><input type="radio" name="trip" value="multi"><span>Multi-city</span></label>
            </div>
            <div class="widget-fields">
              <div class="w-field">
                <label class="w-flabel"><i class="bi bi-airplane-fill gold-icon"></i> From</label>
                <select class="w-select" id="hw-from" onchange="syncSearchFrom()">
                  <option value="">Select Departure…</option>
                  <option value="MNL">Manila (MNL)</option>
                  <option value="CEB">Cebu (CEB)</option>
                  <option value="DVO">Davao (DVO)</option>
                  <option value="SIN">Singapore (SIN)</option>
                  <option value="TYO">Tokyo (TYO)</option>
                  <option value="DXB">Dubai (DXB)</option>
                </select>
              </div>
              <div class="w-field">
                <label class="w-flabel"><i class="bi bi-geo-alt-fill gold-icon"></i> To</label>
                <select class="w-select" id="hw-to" onchange="syncSearchTo()">
                  <option value="">Select Destination…</option>
                  <option value="CDG">Paris (CDG)</option>
                  <option value="NRT">Tokyo (NRT)</option>
                  <option value="MLE">Maldives (MLE)</option>
                  <option value="GVA">Geneva (GVA)</option>
                  <option value="JFK">New York (JFK)</option>
                  <option value="DXB">Dubai (DXB)</option>
                  <option value="MNL">Manila (MNL)</option>
                  <option value="CEB">Cebu (CEB)</option>
                </select>
              </div>
              <div class="w-field">
                <label class="w-flabel"><i class="bi bi-calendar3 gold-icon"></i> Departure Date</label>
                <input type="date" class="w-input" id="hw-date" onchange="syncSearchDate()">
              </div>
              <div class="w-field">
                <label class="w-flabel"><i class="bi bi-people-fill gold-icon"></i> Passengers</label>
                <select class="w-select" id="hw-pax" onchange="syncSearchPax()">
                  <option>1 Adult</option>
                  <option selected>2 Adults</option>
                  <option>3 Adults</option>
                  <option>2 Adults, 1 Child</option>
                  <option>2 Adults, 2 Children</option>
                </select>
              </div>
            </div>
          </div>

          <div id="wp-status" style="display:none">
            <div class="widget-fields" style="grid-template-columns: 1fr 1fr;">
              <div class="w-field">
                <label class="w-flabel"><i class="bi bi-airplane gold-icon"></i> Flight Number</label>
                <input type="text" class="w-input" placeholder="e.g. F606 001">
              </div>
              <div class="w-field">
                <label class="w-flabel"><i class="bi bi-calendar3 gold-icon"></i> Date</label>
                <input type="date" class="w-input">
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

</template>