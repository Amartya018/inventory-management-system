/**
 * Products Management - Live Spring Boot REST API Client
 */

let allProducts = [];
let allCategories = [];
let allSuppliers = [];
let editingId = null;

const productTable = document.getElementById("productTable");
const productForm = document.getElementById("productForm");
const saveBtnText = document.getElementById("saveBtnText");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

const nameInput = document.getElementById("name");
const skuInput = document.getElementById("sku");
const categorySelect = document.getElementById("categorySelect");
const supplierSelect = document.getElementById("supplierSelect");
const purchaseInput = document.getElementById("purchase");
const sellingInput = document.getElementById("selling");
const qtyInput = document.getElementById("qty");
const minStockInput = document.getElementById("minStock");
const unitInput = document.getElementById("unit");
const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filterCategory");

document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        loadCategories(),
        loadSuppliers(),
        loadProducts()
    ]);

    // Setup event listeners
    productForm.addEventListener("submit", handleSaveProduct);
    searchInput.addEventListener("input", filterAndRender);
    filterCategory.addEventListener("change", filterAndRender);
});

async function loadCategories() {
    try {
        allCategories = await apiRequest('/categories');
        populateSelect(categorySelect, allCategories, 'id', 'categoryName', '-- Select Category --');
        populateSelect(filterCategory, allCategories, 'id', 'categoryName', 'All Categories');
    } catch (err) {
        console.error("Failed to load categories:", err);
    }
}

async function loadSuppliers() {
    try {
        allSuppliers = await apiRequest('/suppliers');
        populateSelect(supplierSelect, allSuppliers, 'id', 'supplierName', '-- Select Supplier --');
    } catch (err) {
        console.error("Failed to load suppliers:", err);
    }
}

function populateSelect(selectEl, list, valProp, labelProp, defaultLabel) {
    if (!selectEl) return;
    selectEl.innerHTML = `<option value="">${defaultLabel}</option>`;
    list.forEach(item => {
        selectEl.innerHTML += `<option value="${item[valProp]}">${escapeHtml(item[labelProp])}</option>`;
    });
}

async function loadProducts() {
    try {
        allProducts = await apiRequest('/products');
        renderProducts(allProducts);
    } catch (err) {
        productTable.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:20px; color:#dc2626;">Failed to load products: ${err.message}</td></tr>`;
    }
}

function getStatusBadge(qty, minStock = 10) {
    if (qty === 0) {
        return '<span class="out" style="color:#dc2626; font-weight:bold;">Out Of Stock</span>';
    }
    if (qty <= minStock) {
        return '<span class="low" style="color:#d97706; font-weight:bold;">Low Stock</span>';
    }
    return '<span class="available" style="color:#16a34a; font-weight:bold;">Available</span>';
}

function renderProducts(data) {
    productTable.innerHTML = "";

    if (!data || data.length === 0) {
        productTable.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:25px; color:#6b7280;">No products found matching criteria.</td></tr>`;
        return;
    }

    data.forEach(p => {
        const profit = (p.sellingPrice != null && p.purchasePrice != null) 
            ? (Number(p.sellingPrice) - Number(p.purchasePrice)) 
            : 0;
        const profitColor = profit >= 0 ? '#16a34a' : '#dc2626';

        productTable.innerHTML += `
            <tr>
                <td><strong>${escapeHtml(p.sku || `PRD-${p.id}`)}</strong></td>
                <td>${escapeHtml(p.productName)}</td>
                <td>${escapeHtml(p.categoryName || '-')}</td>
                <td>${escapeHtml(p.supplierName || '-')}</td>
                <td>₹${Number(p.purchasePrice || 0).toLocaleString('en-IN')}</td>
                <td>₹${Number(p.sellingPrice || 0).toLocaleString('en-IN')}</td>
                <td style="color:${profitColor}; font-weight:bold;">₹${Number(profit).toLocaleString('en-IN')}</td>
                <td><strong>${p.quantity}</strong> ${escapeHtml(p.unit || 'pcs')}</td>
                <td>${getStatusBadge(p.quantity, p.minimumStock)}</td>
                <td>
                    <button class="edit" onclick="editProduct(${p.id})">Edit</button>
                    <button class="delete" onclick="deleteProduct(${p.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function filterAndRender() {
    const query = searchInput.value.toLowerCase().trim();
    const categoryId = filterCategory.value;

    const filtered = allProducts.filter(p => {
        const matchesQuery = !query || 
            (p.productName && p.productName.toLowerCase().includes(query)) ||
            (p.sku && p.sku.toLowerCase().includes(query));
        
        const matchesCat = !categoryId || String(p.categoryId) === String(categoryId);

        return matchesQuery && matchesCat;
    });

    renderProducts(filtered);
}

async function handleSaveProduct(e) {
    e.preventDefault();

    const productPayload = {
        productName: nameInput.value.trim(),
        sku: skuInput.value.trim() || null,
        categoryId: categorySelect.value ? Number(categorySelect.value) : null,
        supplierId: supplierSelect.value ? Number(supplierSelect.value) : null,
        purchasePrice: parseFloat(purchaseInput.value) || 0,
        sellingPrice: parseFloat(sellingInput.value) || 0,
        quantity: parseInt(qtyInput.value) || 0,
        minimumStock: parseInt(minStockInput.value) || 10,
        unit: unitInput.value.trim() || 'pcs'
    };

    try {
        if (editingId) {
            await apiRequest(`/products/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify(productPayload)
            });
            showToast("Product updated successfully", "success");
        } else {
            await apiRequest('/products', {
                method: 'POST',
                body: JSON.stringify(productPayload)
            });
            showToast("Product created successfully", "success");
        }

        cancelEdit();
        await loadProducts();
    } catch (err) {
        showToast(err.message, "error");
    }
}

function editProduct(id) {
    const p = allProducts.find(item => item.id === id);
    if (!p) return;

    editingId = id;
    nameInput.value = p.productName || '';
    skuInput.value = p.sku || '';
    categorySelect.value = p.categoryId || '';
    supplierSelect.value = p.supplierId || '';
    purchaseInput.value = p.purchasePrice != null ? p.purchasePrice : '';
    sellingInput.value = p.sellingPrice != null ? p.sellingPrice : '';
    qtyInput.value = p.quantity != null ? p.quantity : 0;
    minStockInput.value = p.minimumStock != null ? p.minimumStock : 10;
    unitInput.value = p.unit || 'pcs';

    formTitle.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color:#16a34a;"></i> Edit Product: ${escapeHtml(p.productName)}`;
    saveBtnText.textContent = "Update Product";
    cancelBtn.style.display = "inline-block";

    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
    editingId = null;
    productForm.reset();
    minStockInput.value = '10';
    unitInput.value = 'pcs';
    formTitle.innerHTML = `<i class="fa-solid fa-plus-circle" style="color:#2563eb;"></i> Add New Product`;
    saveBtnText.textContent = "Save Product";
    cancelBtn.style.display = "none";
}

async function deleteProduct(id) {
    const p = allProducts.find(item => item.id === id);
    const pName = p ? p.productName : `ID ${id}`;

    if (!confirm(`Are you sure you want to delete "${pName}"? This cannot be undone.`)) {
        return;
    }

    try {
        await apiRequest(`/products/${id}`, { method: 'DELETE' });
        showToast(`Product deleted successfully`, "success");
        await loadProducts();
    } catch (err) {
        showToast(`Cannot delete product: ${err.message}`, "error");
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}
