<script setup>
import { inject } from 'vue'
const goNav       = inject('goNav')
const setLoggedIn = inject('setLoggedIn')
const showPage    = inject('showPage')

function doLogout() {
  setLoggedIn(false)
  showPage('home')
}
</script>
<template>
  <div class="page active">
    <div class="inner-page">
      <div class="pt-5">
        <div class="container">
          <div class="profile-layout">
            <div class="profile-sidebar">
              <div class="profile-avatar-wrap">
                <div class="profile-avatar"><i class="bi bi-person-circle"></i><div class="avatar-edit"><i class="bi bi-pencil"></i></div></div>
                <div class="profile-name-display">Passenger One</div>
              </div>
              <nav class="profile-nav">
                <a href="#" class="active"><i class="bi bi-person"></i> Personal Details</a>
                <a href="#"><i class="bi bi-credit-card"></i> My Credit Cards</a>
                <a href="#"><i class="bi bi-universal-access"></i> Disabilities</a>
                <a href="#"><i class="bi bi-headset"></i> Support</a>
                <a href="#"><i class="bi bi-wallet2"></i> Wallet</a>
                <a href="#"><i class="bi bi-clock-history"></i> Payment History</a>
                <div class="pn-sep"></div>
                <a href="#" class="logout-nav" @click.prevent="doLogout"><i class="bi bi-box-arrow-right"></i> Log out</a>
              </nav>
            </div>
            <div class="profile-main">
              <div class="profile-section">
                <div class="ps-header"><h3>Personal Details</h3></div>
                <div class="ps-body">
                  <div class="row g-3">
                    <div class="col-4"><label class="f-label">First Name</label><input type="text" class="f-input" value="Passenger"></div>
                    <div class="col-4"><label class="f-label">Middle Name</label><input type="text" class="f-input" placeholder="Middle"></div>
                    <div class="col-4"><label class="f-label">Last Name</label><input type="text" class="f-input" value="One"></div>
                    <div class="col-4"><label class="f-label">Pronouns</label><select class="f-input"><option>They/them</option><option>He/him</option><option>She/her</option></select></div>
                    <div class="col-4"><label class="f-label">Gender</label><select class="f-input"><option>Gender fluid</option><option>Male</option><option>Female</option></select></div>
                    <div class="col-4"><label class="f-label">Citizenship</label><select class="f-input"><option>Filipino</option><option>American</option><option>British</option></select></div>
                    <div class="col-12"><label class="f-label">Phone Number</label><input type="tel" class="f-input" value="(+63) 123-456-789"></div>
                  </div>
                  <button class="btn-gold mt-3">Save</button>
                </div>
              </div>
              <div class="profile-section">
                <div class="ps-header"><h3>Account Details</h3></div>
                <div class="ps-body">
                  <div class="ps-account-row"><span class="ps-account-label">Email</span><span>passenger@flight606.com</span></div>
                  <div class="ps-account-row"><span class="ps-account-label">Account number</span><span style="font-family:monospace;">784652739272434</span></div>
                </div>
              </div>
              <div class="profile-section">
                <div class="ps-header"><h3>Payment Methods</h3></div>
                <div class="ps-body">
                  <label class="pay-card selected mb-3">
                    <input type="radio" name="profile-pay" checked>
                    <div class="pay-logo visa-logo">VISA</div>
                    <div><div class="pay-num">visa ••••••••5174</div><div class="pay-exp">Expires Jan 01, 2026</div></div>
                  </label>
                  <button class="btn-gold mt-3">+ Add new card</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>