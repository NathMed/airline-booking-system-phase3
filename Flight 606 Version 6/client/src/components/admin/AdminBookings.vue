<script setup>
import { ref, onMounted, computed } from 'vue';
import {
    getAllBookings,
    updateBookingStatus,
    deactivateBooking,
    reactivateBooking,
    getFlightById,
    getUserById
} from '../../api.js';

const bookings = ref([]);
const isLoading = ref(true);
const pageError = ref(null);

// Enrichment cache
const flightCache = ref({});
const userCache = ref({});

// Search/filter
const searchQuery = ref('');
const filterStatus = ref('all');
const filterActive = ref('all');

// Status modal
const showStatusModal = ref(false);
const statusTarget = ref(null);
const newStatus = ref('');
const isSaving = ref(false);
const statusError = ref(null);

// Detail modal
const showDetailModal = ref(false);
const detailTarget = ref(null);
const isFetchingDetail = ref(false);

// Action feedback
const actionSuccess = ref(null);
const actionError = ref(null);

const STATUS_META = {
    pending:   { color: 'warning',   icon: 'bi-clock-fill',        label: 'Pending'   },
    confirmed: { color: 'success',   icon: 'bi-check-circle-fill', label: 'Confirmed' },
    cancelled: { color: 'danger',    icon: 'bi-x-circle-fill',     label: 'Cancelled' },
};

const getStatusMeta = (status) => STATUS_META[status] || { color: 'secondary', icon: 'bi-question-circle', label: status };

const stats = computed(() => ({
    total:     bookings.value.length,
    pending:   bookings.value.filter(b => b.status === 'pending').length,
    confirmed: bookings.value.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.value.filter(b => b.status === 'cancelled').length,
}));

const filteredBookings = computed(() => {
    let list = bookings.value;

    if (filterStatus.value !== 'all') list = list.filter(b => b.status === filterStatus.value);
    if (filterActive.value === 'active') list = list.filter(b => b.isActive);
    else if (filterActive.value === 'inactive') list = list.filter(b => !b.isActive);

    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(b =>
            b.bookingReference?.toLowerCase().includes(q) ||
            b.guestEmail?.toLowerCase().includes(q) ||
            flightCache.value[b.flightId]?.flightNumber?.toLowerCase().includes(q)
        );
    }

    return list;
});

const fetchFlightForBooking = async (flightId) => {
    if (flightCache.value[flightId]) return;
    try {
        const data = await getFlightById(flightId);
        flightCache.value[flightId] = data.result;
    } catch {
        flightCache.value[flightId] = null;
    }
};

const fetchBookings = async () => {
    isLoading.value = true;
    pageError.value = null;
    try {
        const data = await getAllBookings();
        bookings.value = data.result;

        // Enrich with flight numbers in background
        const uniqueFlightIds = [...new Set(data.result.map(b => b.flightId))];
        await Promise.allSettled(uniqueFlightIds.map(id => fetchFlightForBooking(id)));
    } catch (err) {
        if (err.response?.status === 404) {
            bookings.value = [];
        } else {
            pageError.value = err.response?.data?.message || 'Failed to load bookings.';
        }
    } finally {
        isLoading.value = false;
    }
};

const openStatusModal = (booking) => {
    statusTarget.value = booking;
    newStatus.value = booking.status;
    statusError.value = null;
    showStatusModal.value = true;
};

const closeStatusModal = () => {
    showStatusModal.value = false;
    statusTarget.value = null;
};

const saveStatus = async () => {
    if (newStatus.value === statusTarget.value.status) {
        statusError.value = 'Please select a different status.';
        return;
    }
    isSaving.value = true;
    statusError.value = null;
    try {
        await updateBookingStatus(statusTarget.value._id, { status: newStatus.value });
        await fetchBookings();
        actionSuccess.value = `Booking ${statusTarget.value.bookingReference} status updated to "${newStatus.value}".`;
        closeStatusModal();
        setTimeout(() => actionSuccess.value = null, 4000);
    } catch (err) {
        statusError.value = err.response?.data?.message || 'Failed to update status.';
    } finally {
        isSaving.value = false;
    }
};

const openDetail = async (booking) => {
    detailTarget.value = { ...booking };
    showDetailModal.value = true;
    isFetchingDetail.value = true;
    try {
        if (!flightCache.value[booking.flightId]) {
            await fetchFlightForBooking(booking.flightId);
        }
        detailTarget.value.flight = flightCache.value[booking.flightId];
    } catch {
        // best effort
    } finally {
        isFetchingDetail.value = false;
    }
};

const toggleActive = async (booking) => {
    actionError.value = null;
    actionSuccess.value = null;
    try {
        if (booking.isActive) {
            await deactivateBooking(booking._id);
            actionSuccess.value = `Booking ${booking.bookingReference} has been deactivated.`;
        } else {
            await reactivateBooking(booking._id);
            actionSuccess.value = `Booking ${booking.bookingReference} has been reactivated.`;
        }
        await fetchBookings();
        setTimeout(() => actionSuccess.value = null, 4000);
    } catch (err) {
        actionError.value = err.response?.data?.message || 'Action failed.';
        setTimeout(() => actionError.value = null, 4000);
    }
};

onMounted(() => {
    fetchBookings();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-0"><i class="bi bi-ticket-perforated-fill me-2 text-primary"></i>Booking Management</h4>
        <small class="text-muted">{{ bookings.length }} total bookings</small>
      </div>
      <button @click="fetchBookings" class="btn btn-outline-secondary btn-sm rounded-pill">
        <i class="bi bi-arrow-clockwise me-1"></i> Refresh
      </button>
    </div>

    <!-- Stats Row -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm text-center py-3">
          <div class="fs-3 fw-bold text-primary">{{ stats.total }}</div>
          <div class="small text-muted">Total</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm text-center py-3">
          <div class="fs-3 fw-bold text-warning">{{ stats.pending }}</div>
          <div class="small text-muted">Pending</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm text-center py-3">
          <div class="fs-3 fw-bold text-success">{{ stats.confirmed }}</div>
          <div class="small text-muted">Confirmed</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm text-center py-3">
          <div class="fs-3 fw-bold text-danger">{{ stats.cancelled }}</div>
          <div class="small text-muted">Cancelled</div>
        </div>
      </div>
    </div>

    <!-- Feedback Alerts -->
    <div v-if="actionSuccess" class="alert alert-success alert-dismissible shadow-sm py-2 px-3 mb-3 small">
      <i class="bi bi-check-circle-fill me-2"></i>{{ actionSuccess }}
      <button type="button" class="btn-close btn-sm" @click="actionSuccess = null"></button>
    </div>
    <div v-if="actionError" class="alert alert-danger alert-dismissible shadow-sm py-2 px-3 mb-3 small">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ actionError }}
      <button type="button" class="btn-close btn-sm" @click="actionError = null"></button>
    </div>

    <!-- Filters -->
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body py-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search by reference, email, or flight number..."
                v-model="searchQuery"
              >
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="filterStatus">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" v-model="filterActive">
              <option value="all">Active & Inactive</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
          <div class="col-md-2 text-end">
            <span class="text-muted small">Showing {{ filteredBookings.length }} of {{ bookings.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2 small">Loading bookings...</p>
    </div>

    <!-- Page Error -->
    <div v-else-if="pageError" class="alert alert-danger shadow-sm">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ pageError }}
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredBookings.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-ticket-perforated d-block fs-1 mb-2"></i>
      <p>No bookings match your current filters.</p>
    </div>

    <!-- Bookings Table -->
    <div v-else class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Reference</th>
              <th>Flight</th>
              <th>Booker</th>
              <th>Amount</th>
              <th>Booking Status</th>
              <th>Active</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="booking in filteredBookings"
              :key="booking._id"
              :class="{ 'table-secondary': !booking.isActive }"
            >
              <!-- Reference -->
              <td>
                <span class="font-monospace fw-semibold small">{{ booking.bookingReference }}</span>
              </td>

              <!-- Flight -->
              <td class="small">
                <span v-if="flightCache[booking.flightId]" class="fw-semibold text-primary">
                  {{ flightCache[booking.flightId].flightNumber }}
                </span>
                <span v-else class="text-muted">Loading...</span>
              </td>

              <!-- Booker -->
              <td class="small">
                <span v-if="booking.guestEmail">
                  <i class="bi bi-person me-1 text-muted"></i>{{ booking.guestEmail }}
                </span>
                <span v-else-if="booking.userId" class="text-muted font-monospace" style="font-size: 0.75rem;">
                  <i class="bi bi-person-check me-1"></i>{{ String(booking.userId).substring(0, 14) }}...
                </span>
                <span v-else class="text-muted">—</span>
              </td>

              <!-- Amount -->
              <td class="fw-semibold small">
                ₱{{ Number(booking.totalAmount).toLocaleString() }}
              </td>

              <!-- Booking Status -->
              <td>
                <span
                  class="badge d-inline-flex align-items-center gap-1"
                  :class="`bg-${getStatusMeta(booking.status).color}-subtle text-${getStatusMeta(booking.status).color} border border-${getStatusMeta(booking.status).color}-subtle`"
                >
                  <i class="bi" :class="getStatusMeta(booking.status).icon"></i>
                  {{ getStatusMeta(booking.status).label }}
                </span>
              </td>

              <!-- Active -->
              <td>
                <span v-if="booking.isActive" class="badge bg-success-subtle text-success border border-success-subtle">
                  <i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i>Active
                </span>
                <span v-else class="badge bg-danger-subtle text-danger border border-danger-subtle">
                  <i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i>Inactive
                </span>
              </td>

              <!-- Actions -->
              <td class="text-end">
                <div class="d-flex gap-1 justify-content-end">
                  <button
                    @click="openDetail(booking)"
                    class="btn btn-sm btn-outline-secondary"
                    title="View details"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button
                    @click="openStatusModal(booking)"
                    class="btn btn-sm btn-outline-primary"
                    title="Update status"
                  >
                    <i class="bi bi-arrow-repeat"></i>
                  </button>
                  <button
                    @click="toggleActive(booking)"
                    class="btn btn-sm"
                    :class="booking.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                    :title="booking.isActive ? 'Deactivate' : 'Reactivate'"
                  >
                    <i class="bi" :class="booking.isActive ? 'bi-toggle-off' : 'bi-toggle-on'"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Update Status Modal -->
    <div v-if="showStatusModal && statusTarget" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title">
              <i class="bi bi-arrow-repeat me-2 text-primary"></i>Update Booking Status
            </h5>
            <button type="button" class="btn-close" @click="closeStatusModal"></button>
          </div>
          <div class="modal-body">

            <div v-if="statusError" class="alert alert-danger py-2 px-3 small mb-3">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ statusError }}
            </div>

            <p class="text-muted small mb-3">
              Booking reference: <strong class="font-monospace">{{ statusTarget.bookingReference }}</strong>
            </p>

            <p class="small mb-1 fw-semibold">Current Status</p>
            <span
              class="badge d-inline-flex align-items-center gap-1 mb-4"
              :class="`bg-${getStatusMeta(statusTarget.status).color}-subtle text-${getStatusMeta(statusTarget.status).color} border border-${getStatusMeta(statusTarget.status).color}-subtle`"
            >
              <i class="bi" :class="getStatusMeta(statusTarget.status).icon"></i>
              {{ getStatusMeta(statusTarget.status).label }}
            </span>

            <div>
              <label class="form-label fw-semibold small">New Status</label>
              <div class="d-flex gap-2 flex-wrap">
                <div
                  v-for="option in ['pending', 'confirmed', 'cancelled']"
                  :key="option"
                  class="form-check border rounded-3 px-3 py-2 flex-fill text-center"
                  :class="{
                    [`border-${getStatusMeta(option).color}`]: newStatus === option,
                    'bg-light': newStatus !== option
                  }"
                  style="cursor: pointer; min-width: 100px;"
                  @click="newStatus = option"
                >
                  <input
                    class="form-check-input visually-hidden"
                    type="radio"
                    :value="option"
                    v-model="newStatus"
                  >
                  <i class="bi d-block fs-4 mb-1" :class="[getStatusMeta(option).icon, `text-${getStatusMeta(option).color}`]"></i>
                  <label class="form-check-label small fw-semibold text-capitalize" style="cursor: pointer;">
                    {{ option }}
                  </label>
                </div>
              </div>
            </div>

            <div v-if="newStatus === 'confirmed'" class="alert alert-info py-2 px-3 small mt-3 mb-0">
              <i class="bi bi-info-circle me-1"></i> A confirmation notification will be sent to the booker.
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-outline-secondary" @click="closeStatusModal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveStatus" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal && detailTarget" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title">
              <i class="bi bi-ticket-perforated-fill me-2 text-primary"></i>Booking Detail
            </h5>
            <button type="button" class="btn-close" @click="showDetailModal = false"></button>
          </div>
          <div class="modal-body">

            <div v-if="isFetchingDetail" class="text-center py-3">
              <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
              <span class="ms-2 small text-muted">Fetching flight info...</span>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="font-monospace fw-bold fs-5">{{ detailTarget.bookingReference }}</span>
              <span
                class="badge d-inline-flex align-items-center gap-1"
                :class="`bg-${getStatusMeta(detailTarget.status).color}-subtle text-${getStatusMeta(detailTarget.status).color} border border-${getStatusMeta(detailTarget.status).color}-subtle`"
              >
                <i class="bi" :class="getStatusMeta(detailTarget.status).icon"></i>
                {{ getStatusMeta(detailTarget.status).label }}
              </span>
            </div>

            <table class="table table-sm table-borderless small mb-0">
              <tbody>
                <tr>
                  <td class="text-muted fw-semibold" style="width: 130px;">Flight</td>
                  <td class="fw-semibold text-primary">
                    {{ detailTarget.flight?.flightNumber || '—' }}
                  </td>
                </tr>
                <tr v-if="detailTarget.flight">
                  <td class="text-muted fw-semibold">Departure</td>
                  <td>{{ new Date(detailTarget.flight.departureTime).toLocaleString() }}</td>
                </tr>
                <tr v-if="detailTarget.flight">
                  <td class="text-muted fw-semibold">Arrival</td>
                  <td>{{ new Date(detailTarget.flight.arrivalTime).toLocaleString() }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-semibold">Booker</td>
                  <td>{{ detailTarget.guestEmail || detailTarget.userId || '—' }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-semibold">Type</td>
                  <td>{{ detailTarget.guestEmail ? 'Guest' : 'Registered User' }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-semibold">Total Amount</td>
                  <td class="fw-bold">₱{{ Number(detailTarget.totalAmount).toLocaleString() }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-semibold">Active</td>
                  <td>
                    <span v-if="detailTarget.isActive" class="text-success">Yes</span>
                    <span v-else class="text-danger">No</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-outline-secondary" @click="showDetailModal = false">Close</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="() => { showDetailModal = false; openStatusModal(detailTarget); }"
            >
              <i class="bi bi-arrow-repeat me-1"></i> Update Status
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

