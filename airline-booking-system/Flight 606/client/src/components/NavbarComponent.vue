<script setup>
	import { storeToRefs } from "pinia";
    import { useGlobalStore } from "../stores/global.js";

    const globalStore = useGlobalStore();
    const { user } = storeToRefs(globalStore);
</script>

<template>
	<nav class="navbar navbar-expand-lg fixed-top" id="mainNav">
        <div class="container-fluid nav-inner">
        <a class="navbar-brand nav-logo" href="#" onclick="showPage('home'); return false;">
            <span class="logo-mark">
            <i class="bi bi-airplane-fill"></i>
            </span>
            Flight<span class="gold">606</span>
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
            <span class="toggler-icon"></span>
            <span class="toggler-icon"></span>
            <span class="toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarContent">
            <ul class="navbar-nav mx-auto gap-lg-2">
            <li class="nav-item">
                <a class="nav-link active" id="nl-home" href="#" onclick="goNav(this,'home'); return false;">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="nl-book" href="#" onclick="goNav(this,'search-flights'); return false;">Flights</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="nl-tour" href="#" onclick="goNav(this,'home','tours'); return false;">Destinations</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="nl-about" href="#" onclick="goNav(this,'home','about'); return false;">Experience</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="nl-contact" href="#" onclick="goNav(this,'contact'); return false;">Contact</a>
            </li>
            </ul>

            <div class="nav-actions d-flex align-items-center gap-2" id="nav-logged-out">
            <a class="btn-ghost" href="#" onclick="showPage('login'); return false;">Login</a>
            <a class="btn-gold" href="#" onclick="showPage('signup'); return false;">Sign Up</a>
            </div>

            <div class="nav-actions d-flex align-items-center gap-2 ms-3" id="nav-logged-in" style="display:none!important">
            <div class="profile-dropdown" id="profileDropdown">
                <button class="profile-trigger" onclick="toggleProfileMenu()">
                <i class="bi bi-person-circle"></i>
                <span class="profile-name-label">My Account</span>
                <i class="bi bi-chevron-down small"></i>
                </button>
                <div class="profile-menu" id="profileMenu">
                <a href="#" onclick="showPage('profile'); closeProfileMenu(); return false;"><i class="bi bi-person"></i> Personal Details</a>
                <a href="#" onclick="showPage('profile'); closeProfileMenu(); return false;"><i class="bi bi-credit-card"></i> Payment Details</a>
                <a href="#" onclick="showPage('profile'); closeProfileMenu(); return false;"><i class="bi bi-wallet2"></i> Wallet</a>
                <a href="#" onclick="showPage('profile'); closeProfileMenu(); return false;"><i class="bi bi-clock-history"></i> Payment History</a>
                <div class="pm-sep"></div>
                <a href="#" class="logout-link" onclick="doLogout(); return false;"><i class="bi bi-box-arrow-right"></i> Log out</a>
                </div>
            </div>
            </div>
        </div>
        </div>
    </nav>

</template>