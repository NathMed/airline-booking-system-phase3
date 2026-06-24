<script setup>
import { ref, onMounted, computed } from 'vue';
import { getAllUsers, updateUserAsAdmin, deactivateUser, reactivateUser } from '../../api.js';

const users = ref([]);
const isLoading = ref(true);
const pageError = ref(null);

// Search/filter
const searchQuery = ref('');
const filterStatus = ref('all');

// Edit modal
const showEditModal = ref(false);
const editTarget = ref(null);
const editForm = ref({ firstName: '', lastName: '', email: '', phone: '', gender: '', isAdmin: false });
const isSaving = ref(false);
const editError = ref(null);

// Action feedback
const actionSuccess = ref(null);
const actionError = ref(null);

const filteredUsers = computed(() => {
    let list = users.value;

    if (filterStatus.value === 'active') list = list.filter(u => u.isActive);
    else if (filterStatus.value === 'inactive') list = list.filter(u => !u.isActive);
    else if (filterStatus.value === 'admin') list = list.filter(u => u.isAdmin);

    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(u =>
            u.firstName?.toLowerCase().includes(q) ||
            u.lastName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        );
    }

    return list;
});

const fetchUsers = async () => {
    isLoading.value = true;
    pageError.value = null;
    try {
        const data = await getAllUsers();
        users.value = data.result;
    } catch (err) {
        if (err.response?.status === 404) {
            users.value = [];
        } else {
            pageError.value = err.response?.data?.message || 'Failed to load users.';
        }
    } finally {
        isLoading.value = false;
    }
};

const openEditModal = (user) => {
    editTarget.value = user;
    editForm.value = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        isAdmin: user.isAdmin
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
        await updateUserAsAdmin(editTarget.value._id, editForm.value);
        await fetchUsers();
        actionSuccess.value = `${editForm.value.firstName} ${editForm.value.lastName}'s profile updated successfully.`;
        closeEditModal();
        setTimeout(() => actionSuccess.value = null, 4000);
    } catch (err) {
        editError.value = err.response?.data?.message || 'Failed to update user.';
    } finally {
        isSaving.value = false;
    }
};

const toggleActive = async (user) => {
    actionError.value = null;
    actionSuccess.value = null;
    try {
        if (user.isActive) {
            await deactivateUser(user._id);
            actionSuccess.value = `${user.firstName} ${user.lastName} has been deactivated.`;
        } else {
            await reactivateUser(user._id);
            actionSuccess.value = `${user.firstName} ${user.lastName} has been reactivated.`;
        }
        await fetchUsers();
        setTimeout(() => actionSuccess.value = null, 4000);
    } catch (err) {
        actionError.value = err.response?.data?.message || 'Action failed.';
        setTimeout(() => actionError.value = null, 4000);
    }
};

onMounted(() => {
    fetchUsers();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-0"><i class="bi bi-people-fill me-2 text-primary"></i>User Management</h4>
        <small class="text-muted">{{ users.length }} total users registered</small>
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
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input
                type="text"
                class="form-control border-start-0"
                placeholder="Search by name or email..."
                v-model="searchQuery"
              >
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="filterStatus">
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="admin">Admins Only</option>
            </select>
          </div>
          <div class="col-md-3 text-end">
            <span class="text-muted small">Showing {{ filteredUsers.length }} of {{ users.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2 small">Loading users...</p>
    </div>

    <!-- Page Error -->
    <div v-else-if="pageError" class="alert alert-danger shadow-sm">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ pageError }}
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredUsers.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-person-x d-block fs-1 mb-2"></i>
      <p>No users match your current filters.</p>
    </div>

    <!-- Users Table -->
    <div v-else class="card shadow-sm border-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Role</th>
              <th>Status</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user._id" :class="{ 'table-secondary text-muted': !user.isActive }">
              <td>
                <div class="fw-semibold">{{ user.firstName }} {{ user.lastName }}</div>
              </td>
              <td class="text-muted small">{{ user.email }}</td>
              <td class="text-muted small">{{ user.phone || '—' }}</td>
              <td class="text-muted small">{{ user.gender || '—' }}</td>
              <td>
                <span v-if="user.isAdmin" class="badge bg-warning text-dark">
                  <i class="bi bi-shield-fill me-1"></i>Admin
                </span>
                <span v-else class="badge bg-secondary">User</span>
              </td>
              <td>
                <span v-if="user.isActive" class="badge bg-success-subtle text-success border border-success-subtle">
                  <i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i>Active
                </span>
                <span v-else class="badge bg-danger-subtle text-danger border border-danger-subtle">
                  <i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i>Inactive
                </span>
              </td>
              <td class="text-end">
                <div class="d-flex gap-1 justify-content-end">
                  <button
                    @click="openEditModal(user)"
                    class="btn btn-sm btn-outline-primary"
                    title="Edit user"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    @click="toggleActive(user)"
                    class="btn btn-sm"
                    :class="user.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                    :title="user.isActive ? 'Deactivate' : 'Reactivate'"
                  >
                    <i class="bi" :class="user.isActive ? 'bi-person-slash' : 'bi-person-check'"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title">
              <i class="bi bi-pencil-square me-2 text-primary"></i>Edit User
            </h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body pt-3">

            <div v-if="editError" class="alert alert-danger py-2 px-3 small mb-3">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ editError }}
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold small">First Name</label>
                <input type="text" class="form-control" v-model="editForm.firstName">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Last Name</label>
                <input type="text" class="form-control" v-model="editForm.lastName">
              </div>
              <div class="col-md-12">
                <label class="form-label fw-semibold small">Email</label>
                <input type="email" class="form-control" v-model="editForm.email">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Phone</label>
                <input type="text" class="form-control" v-model="editForm.phone">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold small">Gender</label>
                <select class="form-select" v-model="editForm.gender">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="col-12">
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="isAdminToggle"
                    v-model="editForm.isAdmin"
                  >
                  <label class="form-check-label fw-semibold small" for="isAdminToggle">
                    Grant Admin Privileges
                    <span class="text-warning ms-1"><i class="bi bi-shield-fill"></i></span>
                  </label>
                </div>
                <div class="form-text text-warning small" v-if="editForm.isAdmin">
                  <i class="bi bi-exclamation-triangle me-1"></i> This user will have full admin access.
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-outline-secondary" @click="closeEditModal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveEdit" :disabled="isSaving">
              <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>