<script setup>
import { ref, onMounted } from 'vue';
import { getAllAirlines, createAirline, updateAirline, deactivateAirline, reactivateAirline } from '../../api.js';

const airlines = ref([]);
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const isSubmitting = ref(false);
const showCreateForm = ref(false);

const form = ref({
    name: '',
    iataCode: '',
    logoURL: ''
});

const editForm = ref({
    id: null,
    logoURL: ''
});

const showEditModal = ref(false);

async function loadAirlines() {
    try {
        isLoading.value = true;
        const res = await getAllAirlines();
        airlines.value = res.result;
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Failed to load airlines.';
    } finally {
        isLoading.value = false;
    }
}

async function handleCreate() {
    errorMessage.value = '';
    successMessage.value = '';

    if (!form.value.name.trim()) { errorMessage.value = 'Name is required.'; return; }
    if (!form.value.iataCode.trim() || form.value.iataCode.length !== 2) { errorMessage.value = 'IATA code must be 2 letters.'; return; }
    if (!form.value.logoURL.trim()) { errorMessage.value = 'Logo URL is required.'; return; }

    try {
        isSubmitting.value = true;
        await createAirline({
            name: form.value.name,
            iataCode: form.value.iataCode,
            logoURL: form.value.logoURL
        });
        successMessage.value = 'Airline created successfully.';
        form.value = { name: '', iataCode: '', logoURL: '' };
        showCreateForm.value = false;
        await loadAirlines();
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Failed to create airline.';
    } finally {
        isSubmitting.value = false;
    }
}

function openEditModal(airline) {
    editForm.value.id = airline._id;
    editForm.value.logoURL = airline.logoURL;
    showEditModal.value = true;
}

function closeEditModal() {
    showEditModal.value = false;
    editForm.value = { id: null, logoURL: '' };
}

async function handleEdit() {
    errorMessage.value = '';
    successMessage.value = '';

    if (!editForm.value.logoURL.trim()) { errorMessage.value = 'Logo URL is required.'; return; }

    try {
        isSubmitting.value = true;
        await updateAirline(editForm.value.id, { logoURL: editForm.value.logoURL });
        successMessage.value = 'Airline updated successfully.';
        closeEditModal();
        await loadAirlines();
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Failed to update airline.';
    } finally {
        isSubmitting.value = false;
    }
}

async function toggleStatus(airline) {
    errorMessage.value = '';
    successMessage.value = '';
    try {
        if (airline.isActive) {
            await deactivateAirline(airline._id);
        } else {
            await reactivateAirline(airline._id);
        }
        await loadAirlines();
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Failed to update airline status.';
    }
}

onMounted(loadAirlines);
</script>

<template>
    <div class="profile-section">

        <!-- Header -->
        <div class="ps-header">
            <h3>Airlines</h3>
            <button class="btn-gold" @click="showCreateForm = !showCreateForm">
                {{ showCreateForm ? 'Cancel' : '+ New Airline' }}
            </button>
        </div>

        <div class="ps-body">

            <p v-if="successMessage" class="alert-msg alert-success">{{ successMessage }}</p>
            <p v-if="errorMessage"   class="alert-msg alert-error">{{ errorMessage }}</p>

            <!-- Create Form -->
            <div v-if="showCreateForm" class="admin-create-form">
                <h4 class="form-section-title">New Airline</h4>
                <form @submit.prevent="handleCreate">
                    <div class="admin-form-grid">
                        <div>
                            <label class="f-label">Airline Name</label>
                            <input v-model="form.name" type="text" class="f-input" placeholder="e.g. Philippine Airlines" />
                        </div>
                        <div>
                            <label class="f-label">IATA Code</label>
                            <input v-model="form.iataCode" type="text" class="f-input" placeholder="e.g. PR" maxlength="2" />
                        </div>
                        <div class="col-span-2">
                            <label class="f-label">Logo URL</label>
                            <input v-model="form.logoURL" type="text" class="f-input" placeholder="https://example.com/logo.png" />
                        </div>
                    </div>
                    <button type="submit" class="btn-gold-full" style="margin-top: 20px;" :disabled="isSubmitting">
                        {{ isSubmitting ? 'Saving…' : 'Save Airline' }}
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
                            <th>Logo</th>
                            <th>Name</th>
                            <th>IATA</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="airlines.length === 0">
                            <td colspan="5" class="empty-row">No airlines found.</td>
                        </tr>
                        <tr v-for="airline in airlines" :key="airline._id">
                            <td>
                                <img :src="airline.logoURL" :alt="airline.name" class="airline-logo" />
                            </td>
                            <td>{{ airline.name }}</td>
                            <td>{{ airline.iataCode }}</td>
                            <td>
                                <span class="status-badge" :class="airline.isActive ? 'active' : 'inactive'">
                                    {{ airline.isActive ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="actions-cell">
                                <button class="btn-table-edit" @click="openEditModal(airline)">Edit</button>
                                <button
                                    class="btn-table-toggle"
                                    :class="airline.isActive ? 'deactivate' : 'reactivate'"
                                    @click="toggleStatus(airline)"
                                >
                                    {{ airline.isActive ? 'Deactivate' : 'Reactivate' }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>

        <!-- Edit Modal -->
        <div v-if="showEditModal" class="admin-modal-overlay" @click.self="closeEditModal">
            <div class="admin-modal">
                <div class="admin-modal-header">
                    <h4>Edit Airline Logo</h4>
                    <button class="modal-close" @click="closeEditModal">✕</button>
                </div>
                <div class="admin-modal-body">
                    <label class="f-label">Logo URL</label>
                    <input v-model="editForm.logoURL" type="text" class="f-input" placeholder="https://example.com/logo.png" />
                </div>
                <div class="admin-modal-footer">
                    <button class="btn-table-edit" @click="closeEditModal">Cancel</button>
                    <button class="btn-gold-full" :disabled="isSubmitting" @click="handleEdit">
                        {{ isSubmitting ? 'Saving…' : 'Save Changes' }}
                    </button>
                </div>
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

.airline-logo { height: 28px; object-fit: contain; }
</style>