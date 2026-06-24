<script setup>
import { ref, onMounted } from 'vue';
import { getAllAirports, createAirport, deactivateAirport, reactivateAirport } from '../../api.js';

const airports = ref([]);
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const isSubmitting = ref(false);
const showCreateForm = ref(false);

const form = ref({
    name: '',
    iataCode: '',
    city: '',
    country: ''
});

async function loadAirports() {
    try {
        isLoading.value = true;
        const res = await getAllAirports();
        airports.value = res.result;
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Failed to load airports.';
    } finally {
        isLoading.value = false;
    }
}

async function handleCreate() {
    errorMessage.value = '';
    successMessage.value = '';

    if (!form.value.name.trim()) { errorMessage.value = 'Name is required.'; return; }
    if (!form.value.iataCode.trim() || form.value.iataCode.length !== 3) { errorMessage.value = 'IATA code must be 3 letters.'; return; }
    if (!form.value.city.trim()) { errorMessage.value = 'City is required.'; return; }
    if (!form.value.country.trim()) { errorMessage.value = 'Country is required.'; return; }

    try {
        isSubmitting.value = true;
        await createAirport({
            name: form.value.name,
            iataCode: form.value.iataCode,
            city: form.value.city,
            country: form.value.country
        });
        successMessage.value = 'Airport created successfully.';
        form.value = { name: '', iataCode: '', city: '', country: '' };
        showCreateForm.value = false;
        await loadAirports();
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Failed to create airport.';
    } finally {
        isSubmitting.value = false;
    }
}

async function toggleStatus(airport) {
    errorMessage.value = '';
    successMessage.value = '';
    try {
        if (airport.isActive) {
            await deactivateAirport(airport._id);
        } else {
            await reactivateAirport(airport._id);
        }
        await loadAirports();
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Failed to update airport status.';
    }
}

onMounted(loadAirports);
</script>

<template>
    <div class="profile-section">

        <!-- Header -->
        <div class="ps-header">
            <h3>Airports</h3>
            <button class="btn-gold" @click="showCreateForm = !showCreateForm">
                {{ showCreateForm ? 'Cancel' : '+ New Airport' }}
            </button>
        </div>

        <div class="ps-body">

            <p v-if="successMessage" class="alert-msg alert-success">{{ successMessage }}</p>
            <p v-if="errorMessage"   class="alert-msg alert-error">{{ errorMessage }}</p>

            <!-- Create Form -->
            <div v-if="showCreateForm" class="admin-create-form">
                <h4 class="form-section-title">New Airport</h4>
                <form @submit.prevent="handleCreate">
                    <div class="admin-form-grid">
                        <div class="col-span-2">
                            <label class="f-label">Airport Name</label>
                            <input v-model="form.name" type="text" class="f-input" placeholder="e.g. Ninoy Aquino International Airport" />
                        </div>
                        <div>
                            <label class="f-label">IATA Code</label>
                            <input v-model="form.iataCode" type="text" class="f-input" placeholder="e.g. MNL" maxlength="3" />
                        </div>
                        <div>
                            <label class="f-label">City</label>
                            <input v-model="form.city" type="text" class="f-input" placeholder="e.g. Manila" />
                        </div>
                        <div>
                            <label class="f-label">Country</label>
                            <input v-model="form.country" type="text" class="f-input" placeholder="e.g. Philippines" />
                        </div>
                    </div>
                    <button type="submit" class="btn-gold-full" style="margin-top: 20px;" :disabled="isSubmitting">
                        {{ isSubmitting ? 'Saving…' : 'Save Airport' }}
                    </button>
                </form>
            </div>

            <!-- Loading -->
            <div v-if="isLoading" class="admin-loading">Loading…</div>

            <!-- Table -->
            <div v-else class="admin-table-wrap">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>IATA</th>
                            <th>City</th>
                            <th>Country</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="airports.length === 0">
                            <td colspan="6" class="empty-row">No airports found.</td>
                        </tr>
                        <tr v-for="airport in airports" :key="airport._id">
                            <td>{{ airport.name }}</td>
                            <td>{{ airport.iataCode }}</td>
                            <td>{{ airport.city }}</td>
                            <td>{{ airport.country }}</td>
                            <td>
                                <span class="status-badge" :class="airport.isActive ? 'active' : 'inactive'">
                                    {{ airport.isActive ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="actions-cell">
                                <button
                                    class="btn-table-toggle"
                                    :class="airport.isActive ? 'deactivate' : 'reactivate'"
                                    @click="toggleStatus(airport)"
                                >
                                    {{ airport.isActive ? 'Deactivate' : 'Reactivate' }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</template>

<style scoped>
/* ── Shared admin page styles ─────────────────────────────────────────────── */

/* Header row inside ps-header: title left, action button right */
.ps-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Outline gold button for header actions */
.btn-gold {
  background: transparent;
  border: 1px solid var(--color-gold, #c9a84c);
  color: var(--color-gold, #c9a84c);
  padding: 7px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
}
.btn-gold:hover {
  background: var(--color-gold, #c9a84c);
  color: #000;
}

/* Create form panel */
.admin-create-form {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 20px 24px;
  margin-bottom: 28px;
}

.form-section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Two-column form grid */
.admin-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
}
.admin-form-grid .col-span-2 {
  grid-column: span 2;
}

@media (max-width: 640px) {
  .admin-form-grid { grid-template-columns: 1fr; }
  .admin-form-grid .col-span-2 { grid-column: span 1; }
}

/* Loading state */
.admin-loading {
  padding: 48px 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
}

/* Table wrapper — horizontal scroll on small screens */
.admin-table-wrap {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.admin-table th {
  text-align: left;
  padding: 10px 14px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}

.admin-table td {
  padding: 12px 14px;
  color: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
}

.admin-table tbody tr:last-child td {
  border-bottom: none;
}

.admin-table tbody tr:hover td {
  background: rgba(255, 255, 255, 0.03);
}

.empty-row {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  padding: 40px 0 !important;
}

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.status-badge.active   { background: rgba(52, 199, 89, 0.15);  color: #34c759; }
.status-badge.inactive { background: rgba(255, 59, 48, 0.15);  color: #ff3b30; }

/* Table action buttons */
.actions-cell { white-space: nowrap; }

.btn-table-edit {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.75);
  padding: 5px 12px;
  border-radius: 5px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-right: 6px;
  transition: background 0.2s;
}
.btn-table-edit:hover { background: rgba(255, 255, 255, 0.12); }

.btn-table-toggle {
  padding: 5px 12px;
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}
.btn-table-toggle.deactivate  { background: rgba(255, 59, 48, 0.15);  color: #ff3b30; }
.btn-table-toggle.reactivate  { background: rgba(52, 199, 89, 0.15);  color: #34c759; }
.btn-table-toggle:hover { opacity: 0.8; }

/* ── Modal ────────────────────────────────────────────────────────────────── */
.admin-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.admin-modal {
  background: var(--color-dark-card, #1a1a2e);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  overflow: hidden;
}

.admin-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-modal-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #fff;
}

.modal-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}
.modal-close:hover { color: #fff; }

.admin-modal-body {
  padding: 20px 24px;
}

.admin-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

</style>