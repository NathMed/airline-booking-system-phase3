<script setup>
import { ref, onMounted } from 'vue';
import { getAllPayments, updatePaymentStatus } from '../../api.js'; // Adjust path if needed

const payments = ref([]);
const isLoading = ref(true);
const pageError = ref(null);
const successMessage = ref(null);

// Modal state
const selectedPayment = ref(null);
const newStatus = ref('');
const isUpdating = ref(false);
const validStatuses = ["pending", "paid", "failed", "refunded"];

const fetchPayments = async () => {
    isLoading.value = true;
    pageError.value = null;
    try {
        const data = await getAllPayments();
        // The backend returns { message, payments: [...] }
        payments.value = data.payments;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            payments.value = [];
        } else {
            pageError.value = error.response?.data?.message || "Failed to load payments.";
        }
    } finally {
        isLoading.value = false;
    }
};

const openStatusModal = (payment) => {
    selectedPayment.value = payment;
    newStatus.value = payment.status;
    // Clear previous alerts
    pageError.value = null;
    successMessage.value = null;
};

const submitStatusUpdate = async () => {
    if (!selectedPayment.value || !newStatus.value) return;
    
    // Prevent unnecessary API calls if the status hasn't actually changed
    if (newStatus.value === selectedPayment.value.status) {
        document.getElementById('closeModalBtn').click();
        return;
    }

    isUpdating.value = true;
    pageError.value = null;

    try {
        await updatePaymentStatus(selectedPayment.value._id, { status: newStatus.value });
        successMessage.value = `Payment ${selectedPayment.value.transactionId} successfully updated to '${newStatus.value}'.`;
        
        // Programmatically click the hidden close button to dismiss the modal
        document.getElementById('closeModalBtn').click();
        
        // Refresh the list to reflect the new data
        await fetchPayments();
    } catch (error) {
        pageError.value = error.response?.data?.message || "Failed to update payment status.";
        // Hide modal so user can see the error on the main screen
        document.getElementById('closeModalBtn').click();
    } finally {
        isUpdating.value = false;
    }
};

// UI Helper Functions
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'Php' }).format(amount);
};

const getStatusBadge = (status) => {
    const badges = {
        paid: 'bg-success',
        pending: 'bg-warning text-dark',
        failed: 'bg-danger',
        refunded: 'bg-secondary'
    };
    return badges[status] || 'bg-dark';
};

onMounted(() => {
    fetchPayments();
});
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0"><i class="bi bi-credit-card me-2"></i>Payment Management</h4>
      <button @click="fetchPayments" class="btn btn-outline-secondary btn-sm" :disabled="isLoading">
        <i class="bi bi-arrow-clockwise"></i> Refresh
      </button>
    </div>

    <div v-if="pageError" class="alert alert-danger shadow-sm alert-dismissible fade show py-2 px-3 mb-4">
      <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ pageError }}
      <button type="button" class="btn-close btn-sm" @click="pageError = null"></button>
    </div>
    <div v-if="successMessage" class="alert alert-success shadow-sm alert-dismissible fade show py-2 px-3 mb-4">
      <i class="bi bi-check-circle-fill me-2"></i> {{ successMessage }}
      <button type="button" class="btn-close btn-sm" @click="successMessage = null"></button>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="payments.length === 0" class="alert alert-light shadow-sm text-center py-5 border">
      <i class="bi bi-receipt text-muted d-block fs-1 mb-3"></i>
      <h6 class="text-secondary">No Payments Found</h6>
      <p class="text-muted mb-0 small">There are currently no transactions in the system.</p>
    </div>

    <div v-else class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover table-striped mb-0 align-middle">
          <thead class="table-dark">
            <tr>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment._id">
              <td>
                <span class="fw-bold">{{ payment.transactionId }}</span>
                <br>
                <small class="text-muted" title="Booking ID">
                  <i class="bi bi-link-45deg"></i> {{ payment.bookingId }}
                </small>
              </td>
              <td>{{ new Date(payment.createdAt).toLocaleString() }}</td>
              <td class="text-capitalize">{{ payment.paymentMethod }}</td>
              <td class="fw-bold">{{ formatCurrency(payment.amount) }}</td>
              <td>
                <span class="badge" :class="getStatusBadge(payment.status)">
                  {{ payment.status.toUpperCase() }}
                </span>
              </td>
              <td class="text-center">
                <button 
                  @click="openStatusModal(payment)" 
                  class="btn btn-outline-primary btn-sm rounded-pill"
                  data-bs-toggle="modal" 
                  data-bs-target="#updateStatusModal">
                  Update Status
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal fade" id="updateStatusModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Update Payment Status</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeModalBtn"></button>
          </div>
          <div class="modal-body" v-if="selectedPayment">
            
            <div class="alert alert-info py-2 px-3 small">
              <strong>Transaction:</strong> {{ selectedPayment.transactionId }}<br>
              <strong>Amount:</strong> {{ formatCurrency(selectedPayment.amount) }}
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Select New Status</label>
              <select v-model="newStatus" class="form-select">
                <option v-for="status in validStatuses" :key="status" :value="status" class="text-capitalize">
                  {{ status }}
                </option>
              </select>
            </div>
            
            <div v-if="newStatus === 'paid' && selectedPayment.status !== 'paid'" class="text-success small mt-2">
                <i class="bi bi-info-circle me-1"></i>
                Marking this as paid will automatically confirm the booking and dispatch an email notification to the user.
            </div>

          </div>
          <div class="modal-footer d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
                type="button" 
                class="btn btn-primary" 
                @click="submitStatusUpdate"
                :disabled="isUpdating || (selectedPayment && newStatus === selectedPayment.status)">
              <span v-if="isUpdating" class="spinner-border spinner-border-sm me-2"></span>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Optional: Ensures table doesn't wrap awkwardly on smaller screens */
.table td, .table th {
    white-space: nowrap;
}
</style>