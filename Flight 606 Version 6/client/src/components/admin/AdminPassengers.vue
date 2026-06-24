<script setup>
import { ref, onMounted, computed } from 'vue';
import { getAllPassengers, adminUpdatePassenger, activatePassenger, deactivatePassenger } from '../../api.js';

const passengers = ref([]);
const isLoading = ref(true);
const pageError = ref(null);

// Search/filter
const searchQuery = ref('');
const filterStatus = ref('all');

// Edit modal
const showEditModal = ref(false);
const editTarget = ref(null);
const editForm = ref({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    phone: ''
});
const isSaving = ref(false);
const editError = ref(null);

// Action feedback
const actionSuccess = ref(null);
const actionError = ref(null);

// Passport expiry warning helper
const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
    return diffDays < 90 && diffDays > 0;
};

const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
};

const filteredPassengers = computed(() => {
    let list = passengers.value;

    if (filterStatus.value === 'active') list = list.filter(p => p.isActive);
    else if (filterStatus.value === 'inactive') list = list.filter(p => !p.isActive);
    else if (filterStatus.value === 'guest') list = list.filter(p => !p.userId);
    else if (filterStatus.value === 'registered') list = list.filter(p => !!p.userId);

    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(p =>
            p.firstName?.toLowerCase().includes(q) ||
            p.lastName?.toLowerCase().includes(q) ||
            p.passportNumber?.toLowerCase().includes(q) ||
            p.nationality?.toLowerCase().includes(q) ||
            p.email?.toLowerCase().includes(q)
        );
    }

    return list;
});

const fetchPassengers = async () => {
    isLoading.value = true;
    pageError.value = null;
    try {
        const data = await getAllPassengers();
        passengers.value = data.result;
    } catch (err) {
        if (err.response?.status === 404) {
            passengers.value = [];
        } else {
            pageError.value = err.response?.data?.message || 'Failed to load passengers.';
        }
    } finally {
        isLoading.value = false;
    }
};

const openEditModal = (passenger) => {
    editTarget.value = passenger;
    editForm.value = {
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        gender: passenger.gender,
        email: passenger.email,
        nationality: passenger.nationality,
        passportNumber: passenger.passportNumber,
        passportExpiry: passenger.passportExpiry ? passenger.passportExpiry.substring(0, 10) : '',
        phone: passenger.phone
    };
    editError.value = null;
    showEditModal.value = true;
};

const closeEditModal = () => {
    showEditModal.value = false;
    editTarget.value = null;
};

const saveEdit = async () => {
    isSaving.value = true;
    editError.value = null;
    try {
        await adminUpdatePassenger(editTarget.value._id, editForm.value);
        await fetchPassengers();
        actionSuccess.value = `${editForm.value.firstName} ${editForm.value.lastName}'s profile updated successfully.`;
        closeEditModal();
        setTimeout(() => actionSuccess.value = null, 4000);
    } catch (err) {
        editError.value = err.response?.data?.message || 'Failed to update passenger.';
    } finally {
        isSaving.value = false;
    }
};

const toggleActive = async (passenger) => {
    actionError.value = null;
    actionSuccess.value = null;
    try {
        if (passenger.isActive) {
            await deactivatePassenger(passenger._id);
            actionSuccess.value = `${passenger.firstName} ${passenger.lastName}'s profile has been deactivated.`;
        } else {
            await activatePassenger(passenger._id);
            actionSuccess.value = `${passenger.firstName} ${passenger.lastName}'s profile has been reactivated.`;
        }
        await fetchPassengers();
        setTimeout(() => actionSuccess.value = null, 4000);
    } catch (err) {
        actionError.value = err.response?.data?.message || 'Action failed.';
        setTimeout(() => actionError.value = null, 4000);
    }
};

onMounted(() => {
    fetchPassengers();
});
</script>

<template>
    <div class="profile-section">

        <!-- Header -->
        <div class="ps-header">
            <h3>Passenger Management</h3>
            <span style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.45);">
                {{ passengers.length }} total records
            </span>
        </div>

        <div class="ps-body">

            <!-- Alerts -->
            <p v-if="actionSuccess" class="alert-msg alert-success">{{ actionSuccess }}</p>
            <p v-if="actionError || pageError" class="alert-msg alert-error">{{ actionError || pageError }}</p>

            <!-- Search & Filters Panel using the create form wrapper style -->
            <div class="admin-create-form">
                <h4 class="form-section-title">Filters & Search</h4>
                <div class="admin-form-grid">
                    <div class="col-span-2">
                        <label class="f-label">Search Passengers</label>
                        <input
                            type="text"
                            class="f-input"
                            placeholder="Search by name, passport, nationality, email..."
                            v-model="searchQuery"
                        />
                    </div>
                    <div>
                        <label class="f-label">Status Filter</label>
                        <select class="f-input" v-model="filterStatus">
                            <option value="all">All Passengers</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                            <option value="registered">Registered Users</option>
                            <option value="guest">Guests Only</option>
                        </select>
                    </div>
                    <div style="display: flex; align-items: flex-end; justify-content: flex-end; color: rgba(255,255,255,0.4); font-size: 0.85rem; padding-bottom: 8px;">
                        Showing {{ filteredPassengers.length }} of {{ passengers.length }}
                    </div>
                </div>
            </div>

            <!-- Loading -->
            <div v-if="isLoading" class="admin-loading">Loading passengers…</div>

            <!-- Table -->
            <div v-else class="admin-table-wrap">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Passport</th>
                            <th>Nationality</th>
                            <th>Passport Expiry</th>
                            <th>Phone</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="filteredPassengers.length === 0">
                            <td colspan="8" class="empty-row">No passengers match your current filters.</td>
                        </tr>
                        <tr v-for="passenger in filteredPassengers" :key="passenger._id">
                            <td>
                                <div style="font-weight: 600;">{{ passenger.firstName }} {{ passenger.lastName }}</div>
                                <small style="color: rgba(255,255,255,0.4);">{{ passenger.gender || '—' }}</small>
                            </td>
                            <td style="font-family: monospace;">{{ passenger.passportNumber }}</td>
                            <td>{{ passenger.nationality }}</td>
                            <td>
                                <span v-if="isExpired(passenger.passportExpiry)" class="status-badge inactive">
                                    Expired
                                </span>
                                <span v-else-if="isExpiringSoon(passenger.passportExpiry)" class="status-badge" style="background: rgba(255, 204, 0, 0.15); color: #ffcc00;">
                                    Expiring Soon
                                </span>
                                <span v-else style="font-size: 0.85rem;">
                                    {{ passenger.passportExpiry ? new Date(passenger.passportExpiry).toLocaleDateString() : '—' }}
                                </span>
                            </td>
                            <td>{{ passenger.phone || '—' }}</td>
                            <td>
                                <span class="status-badge" :class="passenger.userId ? 'active' : 'type-guest'">
                                    {{ passenger.userId ? 'Registered' : 'Guest' }}
                                </span>
                            </td>
                            <td>
                                <span class="status-badge" :class="passenger.isActive ? 'active' : 'inactive'">
                                    {{ passenger.isActive ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="actions-cell">
                                <button class="btn-table-edit" @click="openEditModal(passenger)">Edit</button>
                                <button
                                    class="btn-table-toggle"
                                    :class="passenger.isActive ? 'deactivate' : 'reactivate'"
                                    @click="toggleActive(passenger)"
                                >
                                    {{ passenger.isActive ? 'Deactivate' : 'Reactivate' }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>

        <!-- Edit Modal -->
        <div v-if="showEditModal" class="admin-modal-overlay" @click.self="closeEditModal">
            <div class="admin-modal" style="max-width: 640px;">
                <div class="admin-modal-header">
                    <h4>Edit Passenger <span style="font-size: 0.8rem; color: rgba(255,255,255,0.4); font-weight: normal; margin-left: 6px;">(Admin Action)</span></h4>
                    <button class="modal-close" @click="closeEditModal">✕</button>
                </div>
                <div class="admin-modal-body">
                    <p v-if="editError" class="alert-msg alert-error" style="margin-bottom: 16px;">{{ editError }}</p>

                    <div class="admin-form-grid">
                        <div>
                            <label class="f-label">First Name</label>
                            <input type="text" class="f-input" v-model="editForm.firstName" />
                        </div>
                        <div>
                            <label class="f-label">Last Name</label>
                            <input type="text" class="f-input" v-model="editForm.lastName" />
                        </div>
                        <div>
                            <label class="f-label">Gender</label>
                            <select class="f-input" v-model="editForm.gender">
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label class="f-label">Email</label>
                            <input type="email" class="f-input" v-model="editForm.email" />
                        </div>
                        <div>
                            <label class="f-label">Nationality</label>
                            <input type="text" class="f-input" v-model="editForm.nationality" />
                        </div>
                        <div>
                            <label class="f-label">Phone</label>
                            <input type="text" class="f-input" v-model="editForm.phone" />
                        </div>
                        <div>
                            <label class="f-label">Passport Number</label>
                            <input type="text" class="f-input" style="font-family: monospace;" v-model="editForm.passportNumber" />
                        </div>
                        <div>
                            <label class="f-label">Passport Expiry</label>
                            <input type="date" class="f-input" v-model="editForm.passportExpiry" />
                            <div v-if="isExpired(editForm.passportExpiry)" style="color: #ff3b30; font-size: 0.75rem; margin-top: 4px;">
                                ✕ This passport is expired.
                            </div>
                            <div v-else-if="isExpiringSoon(editForm.passportExpiry)" style="color: #ffcc00; font-size: 0.75rem; margin-top: 4px;">
                                ⚠ Expiring within 90 days.
                            </div>
                        </div>
                    </div>
                </div>
                <div class="admin-modal-footer">
                    <button class="btn-table-edit" @click="closeEditModal">Cancel</button>
                    <button class="btn-gold-full" :disabled="isSaving" @click="saveEdit">
                        {{ isSaving ? 'Saving…' : 'Save Changes' }}
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
.status-badge.type-guest { background: rgba(255, 255, 255, 0.07); color: rgba(255, 255, 255, 0.6); }

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