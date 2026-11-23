/**
 * Customer Management - Live Spring Boot REST API Client
 */

const table = document.getElementById("customerTable");
const customerForm = document.getElementById("customerForm");
const saveBtnText = document.getElementById("saveBtnText");
const cancelBtn = document.getElementById("cancelCustomerBtn");
const searchInput = document.getElementById("searchCustomer");
const formTitle = document.getElementById("formTitle");

const nameInput = document.getElementById("customerName");
const emailInput = document.getElementById("customerEmail");
const phoneInput = document.getElementById("customerPhone");
const addressInput = document.getElementById("customerAddress");

let customers = [];
let editId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadCustomers();
    customerForm.addEventListener("submit", handleSaveCustomer);
    searchInput.addEventListener("input", filterCustomers);
});

async function loadCustomers() {
    try {
        customers = await apiRequest('/customers');
        renderCustomers(customers);
    } catch (err) {
        table.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#dc2626;">Failed to load customers: ${err.message}</td></tr>`;
    }
}

function renderCustomers(data) {
    table.innerHTML = "";

    if (!data || data.length === 0) {
        table.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#6b7280;">No customers registered yet. Add one above.</td></tr>`;
        return;
    }

    data.forEach(c => {
        table.innerHTML += `
            <tr>
                <td><strong>CUST-${c.id}</strong></td>
                <td><strong>${escapeHtml(c.customerName)}</strong></td>
                <td>${escapeHtml(c.email || '-')}</td>
                <td>${escapeHtml(c.phone || '-')}</td>
                <td>${escapeHtml(c.address || '-')}</td>
                <td>
                    <button class="edit-btn" onclick="editCustomer(${c.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteCustomer(${c.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function filterCustomers() {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) {
        renderCustomers(customers);
        return;
    }

    const filtered = customers.filter(c =>
        (c.customerName && c.customerName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );

    renderCustomers(filtered);
}

async function handleSaveCustomer(e) {
    e.preventDefault();

    const payload = {
        customerName: nameInput.value.trim(),
        email: emailInput.value.trim() || null,
        phone: phoneInput.value.trim() || null,
        address: addressInput.value.trim() || null
    };

    try {
        if (editId) {
            await apiRequest(`/customers/${editId}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            showToast("Customer updated successfully", "success");
        } else {
            await apiRequest('/customers', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            showToast("Customer created successfully", "success");
        }

        cancelCustomerEdit();
        await loadCustomers();
    } catch (err) {
        showToast(err.message, "error");
    }
}

function editCustomer(id) {
    const c = customers.find(item => item.id === id);
    if (!c) return;

    editId = id;
    nameInput.value = c.customerName || '';
    emailInput.value = c.email || '';
    phoneInput.value = c.phone || '';
    addressInput.value = c.address || '';

    formTitle.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color:#16a34a;"></i> Edit Customer: ${escapeHtml(c.customerName)}`;
    saveBtnText.innerText = "Update Customer";
    cancelBtn.style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelCustomerEdit() {
    editId = null;
    customerForm.reset();
    formTitle.innerHTML = `<i class="fa-solid fa-user-plus" style="color:#2563eb;"></i> Add New Customer`;
    saveBtnText.innerText = "Add Customer";
    cancelBtn.style.display = "none";
}

async function deleteCustomer(id) {
    const c = customers.find(item => item.id === id);
    const cName = c ? c.customerName : `ID ${id}`;

    if (!confirm(`Delete customer "${cName}"? Past sales linked to this customer will remain saved.`)) {
        return;
    }

    try {
        await apiRequest(`/customers/${id}`, { method: 'DELETE' });
        showToast("Customer deleted successfully", "success");
        await loadCustomers();
    } catch (err) {
        showToast(`Cannot delete customer: ${err.message}`, "error");
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}
