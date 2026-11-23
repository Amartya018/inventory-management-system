/**
 * Supplier Management - Live Spring Boot REST API Client
 */

const table = document.getElementById("supplierTable");
const supplierForm = document.getElementById("supplierForm");
const saveBtnText = document.getElementById("saveBtnText");
const cancelBtn = document.getElementById("cancelSupplierBtn");
const searchInput = document.getElementById("searchSupplier");
const formTitle = document.getElementById("formTitle");

const nameInput = document.getElementById("supplierName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");

let suppliers = [];
let editId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadSuppliers();
    supplierForm.addEventListener("submit", handleSaveSupplier);
    searchInput.addEventListener("input", filterSuppliers);
});

async function loadSuppliers() {
    try {
        suppliers = await apiRequest('/suppliers');
        renderSuppliers(suppliers);
    } catch (err) {
        table.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#dc2626;">Failed to load suppliers: ${err.message}</td></tr>`;
    }
}

function renderSuppliers(data) {
    table.innerHTML = "";

    if (!data || data.length === 0) {
        table.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#6b7280;">No suppliers found. Add your first supplier above.</td></tr>`;
        return;
    }

    data.forEach(s => {
        table.innerHTML += `
            <tr>
                <td><strong>SUP-${s.id}</strong></td>
                <td><strong>${escapeHtml(s.supplierName)}</strong></td>
                <td>${escapeHtml(s.email || '-')}</td>
                <td>${escapeHtml(s.phone || '-')}</td>
                <td>${escapeHtml(s.address || '-')}</td>
                <td>
                    <button class="edit-btn" onclick="editSupplier(${s.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteSupplier(${s.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function filterSuppliers() {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) {
        renderSuppliers(suppliers);
        return;
    }

    const filtered = suppliers.filter(s =>
        (s.supplierName && s.supplierName.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.phone && s.phone.toLowerCase().includes(q))
    );

    renderSuppliers(filtered);
}

async function handleSaveSupplier(e) {
    e.preventDefault();

    const supplierPayload = {
        supplierName: nameInput.value.trim(),
        email: emailInput.value.trim() || null,
        phone: phoneInput.value.trim() || null,
        address: addressInput.value.trim() || null
    };

    try {
        if (editId) {
            await apiRequest(`/suppliers/${editId}`, {
                method: 'PUT',
                body: JSON.stringify(supplierPayload)
            });
            showToast("Supplier updated successfully", "success");
        } else {
            await apiRequest('/suppliers', {
                method: 'POST',
                body: JSON.stringify(supplierPayload)
            });
            showToast("Supplier created successfully", "success");
        }

        cancelSupplierEdit();
        await loadSuppliers();
    } catch (err) {
        showToast(err.message, "error");
    }
}

function editSupplier(id) {
    const s = suppliers.find(item => item.id === id);
    if (!s) return;

    editId = id;
    nameInput.value = s.supplierName || '';
    emailInput.value = s.email || '';
    phoneInput.value = s.phone || '';
    addressInput.value = s.address || '';

    formTitle.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color:#16a34a;"></i> Edit Supplier: ${escapeHtml(s.supplierName)}`;
    saveBtnText.innerText = "Update Supplier";
    cancelBtn.style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelSupplierEdit() {
    editId = null;
    supplierForm.reset();
    formTitle.innerHTML = `<i class="fa-solid fa-truck-ramp-box" style="color:#2563eb;"></i> Add New Supplier`;
    saveBtnText.innerText = "Add Supplier";
    cancelBtn.style.display = "none";
}

async function deleteSupplier(id) {
    const s = suppliers.find(item => item.id === id);
    const sName = s ? s.supplierName : `ID ${id}`;

    if (!confirm(`Delete supplier "${sName}"? Any products associated with this supplier will remain in inventory.`)) {
        return;
    }

    try {
        await apiRequest(`/suppliers/${id}`, { method: 'DELETE' });
        showToast("Supplier deleted successfully", "success");
        await loadSuppliers();
    } catch (err) {
        showToast(`Cannot delete supplier: ${err.message}`, "error");
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}
