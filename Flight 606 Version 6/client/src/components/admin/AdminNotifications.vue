<script setup>
import { ref, onMounted, computed } from 'vue';
import { getAllNotifications, deactivateNotification } from '../../api.js';

const notifications = ref([]);
const isLoading = ref(true);
const pageError = ref(null);

// Search/filter
const searchQuery = ref('');
const filterType = ref('all');
const filterStatus = ref('all');
const filterRead = ref('all');

// Action feedback
const actionSuccess = ref(null);
const actionError = ref(null);

// Detail modal
const showDetailModal = ref(false);
const detailTarget = ref(null);

const TYPE_LABELS = {
    booking_confirmed:   { label: 'Booking Confirmed',   icon: 'bi-check-circle-fill',     color: 'success' },
    flight_status_change:{ label: 'Flight Status Change', icon: 'bi-airplane-fill',          color: 'warning' },
    itinerary_created:   { label: 'Itinerary Created',    icon: 'bi-map-fill',               color: 'primary' },
};

const getTypeMeta = (type) => TYPE_LABELS[type] || { label: type, icon: 'bi-bell-fill', color: 'secondary' };

const uniqueTypes = computed(() => {
    const types = [...new Set(notifications.value.map(n => n.type))];
    return types;
});

const filteredNotifications = computed(() => {
    let list = notifications.value;

    if (filterType.value !== 'all') list = list.filter(n => n.type === filterType.value);
    if (filterStatus.value === 'active') list = list.filter(n => n.isActive);
    else if (filterStatus.value === 'inactive') list = list.filter(n => !n.isActive);
    if (filterRead.value === 'read') list = list.filter(n => n.isRead);
    else if (filterRead.value === 'unread') list = list.filter(n => !n.isRead);

    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(n =>
            n.message?.toLowerCase().includes(q) ||
            n.guestEmail?.toLowerCase().includes(q) ||
            n.userId?.toLowerCase().includes(q)
        );
    }

    return list;
});

const stats = computed(() => ({
    total:    notifications.value.length,
    unread:   notifications.value.filter(n => !n.isRead && n.isActive).length,
    active:   notifications.value.filter(n => n.isActive).length,
    inactive: notifications.value.filter(n => !n.isActive).length,
}));

const fetchNotifications = async () => {
    isLoading.value = true;
    pageError.value = null;
    try {
        const data = await getAllNotifications();
        notifications.value = data.result;
    } catch (err) {
        if (err.response?.status === 404) {
            notifications.value = [];
        } else {
            pageError.value = err.response?.data?.message || 'Failed to load notifications.';
        }
    } finally {
        isLoading.value = false;
    }
};

const openDetail = (notification) => {
    detailTarget.value = notification;
    showDetailModal.value = true;
};

const deactivate = async (notification) => {
    if (!confirm(`Deactivate this notification? It will be hidden from the user.`)) return;
    actionError.value = null;
    actionSuccess.value = null;
    try {
        await deactivateNotification(notification._id);
        await fetchNotifications();
        actionSuccess.value = 'Notification deactivated successfully.';
        if (showDetailModal.value && detailTarget.value?._id === notification._id) {
            showDetailModal.value = false;
        }
        setTimeout(() => actionSuccess.value = null, 4000);
    } catch (err) {
        actionError.value = err.response?.data?.message || 'Failed to deactivate notification.';
        setTimeout(() => actionError.value = null, 4000);
    }
};

onMounted(() => {
    fetchNotifications();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-0">
          <i class="bi bi-bell-fill me-2 text-primary"></i>Notification Management
        </h4>
        <small class="text-muted">{{ notifications.length }} total notifications sent</small>
      </div>
      <button @click="fetchNotifications" class="btn btn-outline-secondary btn-sm rounded-pill">
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
          <div class="fs-3 fw-bold text-danger">{{ stats.unread }}</div>
          <div class="small text-muted">Unread</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm text-center py-3">
          <div class="fs-3 fw-bold text-success">{{ stats.active }}</div>
          <div class="small text-muted">Active</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm text-center py-3">
          <div class="fs-3 fw-bold text-secondary">{{ stats.inactive }}</div>
          <div class="small text-muted">Deactivated</div>
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
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search message or recipient..."
                v-model="searchQuery"
              >
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="filterType">
              <option value="all">All Types</option>
              <option v-for="type in uniqueTypes" :key="type" :value="type">
                {{ getTypeMeta(type).label }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" v-model="filterStatus">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" v-model="filterRead">
              <option value="all">Read & Unread</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>
          <div class="col-md-1 text-end">
            <span class="text-muted small">{{ filteredNotifications.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2 small">Loading notifications...</p>
    </div>

    <!-- Page Error -->
    <div v-else-if="pageError" class="alert alert-danger shadow-sm">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ pageError }}
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredNotifications.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-bell-slash d-block fs-1 mb-2"></i>
      <p>No notifications match your current filters.</p>
    </div>

    <!-- Notifications Table -->
    <div v-else class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Type</th>
              <th>Message</th>
              <th>Recipient</th>
              <th>Read</th>
              <th>Email Sent</th>
              <th>Status</th>
              <th>Sent At</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="notification in filteredNotifications"
              :key="notification._id"
              :class="{ 'table-secondary': !notification.isActive }"
            >
              <!-- Type -->
              <td>
                <span
                  class="badge d-inline-flex align-items-center gap-1"
                  :class="`bg-${getTypeMeta(notification.type).color}-subtle text-${getTypeMeta(notification.type).color} border border-${getTypeMeta(notification.type).color}-subtle`"
                >
                  <i class="bi" :class="getTypeMeta(notification.type).icon"></i>
                  {{ getTypeMeta(notification.type).label }}
                </span>
              </td>

              <!-- Message (truncated) -->
              <td style="max-width: 250px;">
                <span class="small text-truncate d-block" style="max-width: 230px;" :title="notification.message">
                  {{ notification.message }}
                </span>
              </td>

              <!-- Recipient -->
              <td class="small">
                <span v-if="notification.guestEmail" class="text-muted">
                  <i class="bi bi-person me-1"></i>{{ notification.guestEmail }}
                </span>
                <span v-else-if="notification.userId" class="text-muted font-monospace" style="font-size: 0.75rem;">
                  <i class="bi bi-person-check me-1"></i>{{ String(notification.userId).substring(0, 12) }}...
                </span>
                <span v-else class="text-muted">—</span>
              </td>

              <!-- Read -->
              <td class="text-center">
                <i v-if="notification.isRead" class="bi bi-check-circle-fill text-success"></i>
                <i v-else class="bi bi-circle text-muted"></i>
              </td>

              <!-- Email Sent -->
              <td class="text-center">
                <i v-if="notification.emailSent" class="bi bi-envelope-check-fill text-primary"></i>
                <i v-else class="bi bi-envelope-x text-muted"></i>
              </td>

              <!-- Active Status -->
              <td>
                <span v-if="notification.isActive" class="badge bg-success-subtle text-success border border-success-subtle">
                  <i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i>Active
                </span>
                <span v-else class="badge bg-danger-subtle text-danger border border-danger-subtle">
                  <i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i>Inactive
                </span>
              </td>

              <!-- Sent At -->
              <td class="text-muted small">
                {{ notification.emailSentAt ? new Date(notification.emailSentAt).toLocaleDateString() : '—' }}
              </td>

              <!-- Actions -->
              <td class="text-end">
                <div class="d-flex gap-1 justify-content-end">
                  <button
                    @click="openDetail(notification)"
                    class="btn btn-sm btn-outline-secondary"
                    title="View full message"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button
                    v-if="notification.isActive"
                    @click="deactivate(notification)"
                    class="btn btn-sm btn-outline-danger"
                    title="Deactivate notification"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal && detailTarget" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title">
              <i class="bi me-2 text-primary" :class="getTypeMeta(detailTarget.type).icon"></i>
              Notification Detail
            </h5>
            <button type="button" class="btn-close" @click="showDetailModal = false"></button>
          </div>
          <div class="modal-body">

            <div class="mb-3">
              <span
                class="badge d-inline-flex align-items-center gap-1 mb-3"
                :class="`bg-${getTypeMeta(detailTarget.type).color}-subtle text-${getTypeMeta(detailTarget.type).color} border border-${getTypeMeta(detailTarget.type).color}-subtle`"
              >
                <i class="bi" :class="getTypeMeta(detailTarget.type).icon"></i>
                {{ getTypeMeta(detailTarget.type).label }}
              </span>
            </div>

            <div class="bg-light rounded-3 p-3 mb-3">
              <p class="mb-0 small">{{ detailTarget.message }}</p>
            </div>

            <table class="table table-sm table-borderless small mb-0">
              <tbody>
                <tr>
                  <td class="text-muted fw-semibold" style="width: 130px;">Recipient</td>
                  <td>{{ detailTarget.guestEmail || detailTarget.userId || '—' }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-semibold">Read</td>
                  <td>
                    <i v-if="detailTarget.isRead" class="bi bi-check-circle-fill text-success me-1"></i>
                    <i v-else class="bi bi-circle text-muted me-1"></i>
                    {{ detailTarget.isRead ? 'Yes' : 'No' }}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted fw-semibold">Email Sent</td>
                  <td>
                    <i v-if="detailTarget.emailSent" class="bi bi-envelope-check-fill text-primary me-1"></i>
                    {{ detailTarget.emailSent ? 'Yes' : 'No' }}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted fw-semibold">Sent At</td>
                  <td>{{ detailTarget.emailSentAt ? new Date(detailTarget.emailSentAt).toLocaleString() : '—' }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-semibold">Status</td>
                  <td>
                    <span v-if="detailTarget.isActive" class="text-success">Active</span>
                    <span v-else class="text-danger">Inactive</span>
                  </td>
                </tr>
                <tr v-if="detailTarget.referenceModel">
                  <td class="text-muted fw-semibold">Reference</td>
                  <td class="font-monospace" style="font-size: 0.75rem;">
                    {{ detailTarget.referenceModel }}: {{ String(detailTarget.referenceId).substring(0, 16) }}...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-outline-secondary" @click="showDetailModal = false">Close</button>
            <button
              v-if="detailTarget.isActive"
              type="button"
              class="btn btn-danger"
              @click="deactivate(detailTarget)"
            >
              <i class="bi bi-trash me-1"></i> Deactivate
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>