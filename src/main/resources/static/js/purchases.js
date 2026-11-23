/**
 * Purchase Orders Client Logic
 */

let allSuppliers = [];
let allProducts = [];
let poCart = [];

const supplierSelect = document.getElementById("poSupplierSelect");
const productSelect = document.getElementById("poProductSelect");
const itemCostInput = document.getElementById("poItemCost");
const itemQtyInput = document.getElementById("poItemQty");
const addPoItemBtn = document.getElementById("addPoItemBtn");
const poCartTable = document.getElementById("poCartTable");
const poGrandTotalEl = document.getElementById("poGrandTotal");
const submitPoBtn = document.getElementById("submitPoBtn");
const poTable = document.getElementById("poTable");

document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        loadSuppliers(),
        loadProducts(),
        loadPurchaseOrders()
    ]);

    productSelect.addEventListener("change", handleProductChange);
    addPoItemBtn.addEventListener("click", handleAddItem);
    submitPoBtn.addEventListener("click", handleSubmitOrder);
});

async function loadSuppliers() {
    try {
        allSuppliers = await apiRequest('/suppliers');
        supplierSelect.innerHTML = '<option value="">-- Choose Vendor / Supplier --</option>';
        allSuppliers.forEach(s => {
            supplierSelect.innerHTML += `<option value="${s.id}">${escapeHtml(s.supplierName)}</option>`;
        });
    } catch (err) {
        console.error("Failed to load suppliers:", err);
    }
}

async function loadProducts() {
    try {
        allProducts = await apiRequest('/products');
        productSelect.innerHTML = '<option value="">-- Select Product --</option>';
        allProducts.forEach(p => {
            productSelect.innerHTML += `<option value="${p.id}">${escapeHtml(p.productName)} (SKU: ${escapeHtml(p.sku || 'N/A')})</option>`;
        });
    } catch (err) {
        console.error("Failed to load products:", err);
    }
}

function handleProductChange() {
    const pId = Number(productSelect.value);
    const p = allProducts.find(item => item.id === pId);
    if (p) {
        itemCostInput.value = p.purchasePrice != null ? p.purchasePrice : 0;
    } else {
        itemCostInput.value = '';
    }
}

function handleAddItem() {
    const pId = Number(productSelect.value);
    const qty = parseInt(itemQtyInput.value);
    const cost = parseFloat(itemCostInput.value);

    if (!pId) {
        showToast("Please choose a product", "warning");
        return;
    }
    if (qty <= 0) {
        showToast("Quantity must be at least 1", "warning");
        return;
    }
    if (isNaN(cost) || cost < 0) {
        showToast("Valid unit cost is required", "warning");
        return;
    }

    const p = allProducts.find(item => item.id === pId);
    const existingIndex = poCart.findIndex(item => item.productId === pId);

    if (existingIndex >= 0) {
        poCart[existingIndex].quantity += qty;
        poCart[existingIndex].unitCost = cost;
        poCart[existingIndex].subtotal = poCart[existingIndex].quantity * cost;
    } else {
        poCart.push({
            productId: p.id,
            productName: p.productName,
            sku: p.sku || `PRD-${p.id}`,
            quantity: qty,
            unitCost: cost,
            subtotal: qty * cost
        });
    }

    renderPoCart();
    productSelect.value = '';
    itemCostInput.value = '';
    itemQtyInput.value = 10;
}

function renderPoCart() {
    poCartTable.innerHTML = "";

    if (poCart.length === 0) {
        poCartTable.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:15px; color:#9ca3af;">No products in order batch.</td></tr>`;
        poGrandTotalEl.innerText = '₹0.00';
        return;
    }

    let total = 0;
    poCart.forEach((item, index) => {
        total += item.subtotal;
        poCartTable.innerHTML += `
            <tr>
                <td><strong>${escapeHtml(item.productName)}</strong> <span style="font-size:12px; color:#6b7280;">(${escapeHtml(item.sku)})</span></td>
                <td>₹${Number(item.unitCost).toLocaleString('en-IN')}</td>
                <td><strong>${item.quantity}</strong></td>
                <td><strong>₹${Number(item.subtotal).toLocaleString('en-IN')}</strong></td>
                <td>
                    <button class="delete-btn" onclick="removeFromPoCart(${index})" style="padding:4px 8px; font-size:12px;">Remove</button>
                </td>
            </tr>
        `;
    });

    poGrandTotalEl.innerText = `₹${Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function removeFromPoCart(index) {
    poCart.splice(index, 1);
    renderPoCart();
}

async function handleSubmitOrder() {
    const supplierId = supplierSelect.value ? Number(supplierSelect.value) : null;

    if (!supplierId) {
        showToast("Please choose a supplier for this order", "warning");
        supplierSelect.focus();
        return;
    }

    if (poCart.length === 0) {
        showToast("Please add at least one product to the purchase order", "warning");
        return;
    }

    const payload = {
        supplierId: supplierId,
        items: poCart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost
        }))
    };

    submitPoBtn.disabled = true;
    submitPoBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting Order...';

    try {
        const order = await apiRequest('/purchases', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        showToast(`Purchase Order #${order.orderNumber} placed successfully!`, "success");

        poCart = [];
        renderPoCart();
        supplierSelect.value = '';

        await loadPurchaseOrders();
    } catch (err) {
        showToast(err.message, "error");
    } finally {
        submitPoBtn.disabled = false;
        submitPoBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Place Purchase Order';
    }
}

async function loadPurchaseOrders() {
    try {
        const orders = await apiRequest('/purchases');
        renderOrders(orders);
    } catch (err) {
        poTable.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#dc2626;">Failed to load purchase orders: ${err.message}</td></tr>`;
    }
}

function renderOrders(orders) {
    poTable.innerHTML = "";

    if (!orders || orders.length === 0) {
        poTable.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#6b7280;">No purchase orders placed yet.</td></tr>`;
        return;
    }

    orders.forEach(o => {
        const dateStr = o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : '-';
        const count = o.items ? o.items.length : 1;

        let actionButton = '';
        let statusBadge = '';

        if (o.status === 'PENDING') {
            statusBadge = '<span class="orange" style="color:#d97706; font-weight:bold;">PENDING</span>';
            actionButton = `
                <button class="edit-btn" onclick="receiveGoods(${o.id}, '${escapeHtml(o.orderNumber)}')" style="background:#16a34a; padding:6px 14px; font-size:13px;">
                    <i class="fa-solid fa-box-open"></i> Receive Goods
                </button>
            `;
        } else if (o.status === 'RECEIVED') {
            statusBadge = '<span class="green" style="color:#16a34a; font-weight:bold;"><i class="fa-solid fa-check"></i> RECEIVED</span>';
            actionButton = '<span style="color:#6b7280; font-size:12px;">Stock Updated</span>';
        } else {
            statusBadge = `<span style="color:#6b7280;">${o.status}</span>`;
        }

        poTable.innerHTML += `
            <tr>
                <td><strong>${escapeHtml(o.orderNumber)}</strong></td>
                <td>${escapeHtml(o.supplierName || 'Unknown')}</td>
                <td>${count} item(s)</td>
                <td><strong>₹${Number(o.totalAmount || 0).toLocaleString('en-IN')}</strong></td>
                <td>${dateStr}</td>
                <td>${statusBadge}</td>
                <td>${actionButton}</td>
            </tr>
        `;
    });
}

async function receiveGoods(orderId, orderNum) {
    if (!confirm(`Confirm receiving shipment for Order #${orderNum}?\n\nThis will automatically increase product inventory stock in the database and create a verified stock movement record.`)) {
        return;
    }

    try {
        await apiRequest(`/purchases/${orderId}/receive`, { method: 'PUT' });
        showToast(`Order #${orderNum} marked as RECEIVED. Inventory stock increased!`, "success");
        await Promise.all([
            loadPurchaseOrders(),
            loadProducts()
        ]);
    } catch (err) {
        showToast(`Failed to receive order: ${err.message}`, "error");
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}
