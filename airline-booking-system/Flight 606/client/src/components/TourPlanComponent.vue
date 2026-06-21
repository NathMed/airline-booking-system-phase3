<script setup>

</script>

<template>
    <section id="tours" class="section-pad bg-dark-base">
      <div class="container">
        <p class="section-eyebrow">Curated Routes</p>
        <div class="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-5">
          <h2 class="section-title">Tour <em>Plan</em></h2>
          <a href="#" class="view-all-link" onclick="goNav(null,'search-flights'); return false;">View All Routes &nbsp;→</a>
        </div>
        <div class="dest-grid row g-3">
          <div class="col-6 col-lg-3">
            <div class="dest-card" onclick="goNav(null,'search-flights')">
              <img src="https://images.unsplash.com/photo-1431274172761-fca41d930114?w=600&q=70" alt="Paris">
              <div class="dest-overlay">
                <span class="dest-tag">The City of Lights</span>
                <span class="dest-name">Paris</span>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="dest-card" onclick="goNav(null,'search-flights')">
              <img src="https://images.unsplash.com/photo-1618238832760-7e4129ef4a43?w=600&q=70" alt="Maldives">
              <div class="dest-overlay">
                <span class="dest-tag">Ocean Sanctuary</span>
                <span class="dest-name">Maldives</span>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="dest-card" onclick="goNav(null,'search-flights')">
              <img src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600&q=70" alt="Tokyo">
              <div class="dest-overlay">
                <span class="dest-tag">Neon Meets Tradition</span>
                <span class="dest-name">Tokyo</span>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="dest-card" onclick="goNav(null,'search-flights')">
              <img src="https://images.unsplash.com/photo-1598258710957-db8614c2881e?w=600&q=70" alt="Manila">
              <div class="dest-overlay">
                <span class="dest-tag">It's More Fun Here</span>
                <span class="dest-name">Manila</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

</template>