/**
 * Sales & Invoicing Client Logic
 */

let availableProducts = [];
let customerList = [];
let cart = [];

const customerSelect = document.getElementById("saleCustomerSelect");
const productSelect = document.getElementById("productSelect");
const itemPrice = document.getElementById("itemPrice");
const itemQty = document.getElementById("itemQty");
const availableStock = document.getElementById("availableStock");
const addItemBtn = document.getElementById("addItemBtn");
const cartTable = document.getElementById("cartTable");
const grandTotalEl = document.getElementById("grandTotal");
const completeSaleBtn = document.getElementById("completeSaleBtn");
const salesTable = document.getElementById("salesTable");
const invoiceModal = document.getElementById("invoiceModal");
const printableInvoice = document.getElementById("printableInvoice");

document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        loadCustomers(),
        loadProductsForSale(),
        loadSalesHistory()
    ]);

    productSelect.addEventListener("change", handleProductSelection);
    addItemBtn.addEventListener("click", handleAddToCart);
    completeSaleBtn.addEventListener("click", handleCompleteSale);
});

async function loadCustomers() {
    try {
        customerList = await apiRequest('/customers');
        customerSelect.innerHTML = '<option value="">Walk-in Retail Customer</option>';
        customerList.forEach(c => {
            customerSelect.innerHTML += `<option value="${c.id}">${escapeHtml(c.customerName)} (${c.phone || c.email || 'Client'})</option>`;
        });
    } catch (err) {
        console.error("Failed to load customers:", err);
    }
}

async function loadProductsForSale() {
    try {
        availableProducts = await apiRequest('/products');
        productSelect.innerHTML = '<option value="">-- Choose in-stock product --</option>';
        availableProducts.forEach(p => {
            const stock = p.quantity ?? 0;
            const disabled = stock === 0 ? 'disabled' : '';
            const statusLabel = stock === 0 ? ' (OUT OF STOCK)' : ` [Stock: ${stock} ${p.unit || 'pcs'}]`;
            productSelect.innerHTML += `<option value="${p.id}" ${disabled}>${escapeHtml(p.productName)} - ₹${Number(p.sellingPrice || 0).toLocaleString('en-IN')}${statusLabel}</option>`;
        });
    } catch (err) {
        console.error("Failed to load products for sale:", err);
    }
}

function handleProductSelection() {
    const pId = Number(productSelect.value);
    const p = availableProducts.find(item => item.id === pId);

    if (p) {
        itemPrice.value = p.sellingPrice != null ? p.sellingPrice : 0;
        availableStock.innerText = p.quantity;
        itemQty.max = p.quantity;
        itemQty.value = 1;
    } else {
        itemPrice.value = '';
        availableStock.innerText = '0';
        itemQty.value = 1;
    }
}

function handleAddToCart() {
    const pId = Number(productSelect.value);
    const qty = parseInt(itemQty.value);

    if (!pId) {
        showToast("Please choose a product to add", "warning");
        return;
    }

    const p = availableProducts.find(item => item.id === pId);
    if (!p) return;

    if (qty <= 0) {
        showToast("Quantity must be at least 1", "warning");
        return;
    }

    // Check against cart already added + available
    const existingIndex = cart.findIndex(c => c.productId === pId);
    const existingQty = existingIndex >= 0 ? cart[existingIndex].quantity : 0;

    if (existingQty + qty > p.quantity) {
        showToast(`Cannot sell more than available stock (${p.quantity} available)`, "error");
        return;
    }

    if (existingIndex >= 0) {
        cart[existingIndex].quantity += qty;
        cart[existingIndex].subtotal = cart[existingIndex].quantity * cart[existingIndex].unitPrice;
    } else {
        const unitPrice = parseFloat(p.sellingPrice) || 0;
        cart.push({
            productId: p.id,
            productName: p.productName,
            sku: p.sku || `PRD-${p.id}`,
            quantity: qty,
            unitPrice: unitPrice,
            subtotal: qty * unitPrice
        });
    }

    renderCart();
    // Reset selection
    productSelect.value = '';
    itemPrice.value = '';
    itemQty.value = 1;
    availableStock.innerText = '0';
}

function renderCart() {
    cartTable.innerHTML = "";

    if (cart.length === 0) {
        cartTable.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:15px; color:#9ca3af;">No products added to current sale order.</td></tr>`;
        grandTotalEl.innerText = '₹0.00';
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        total += item.subtotal;
        cartTable.innerHTML += `
            <tr>
                <td><strong>${escapeHtml(item.productName)}</strong> <span style="font-size:12px; color:#6b7280;">(${escapeHtml(item.sku)})</span></td>
                <td>₹${Number(item.unitPrice).toLocaleString('en-IN')}</td>
                <td><strong>${item.quantity}</strong></td>
                <td><strong>₹${Number(item.subtotal).toLocaleString('en-IN')}</strong></td>
                <td>
                    <button class="delete-btn" onclick="removeFromCart(${index})" style="padding:4px 8px; font-size:12px;">Remove</button>
                </td>
            </tr>
        `;
    });

    grandTotalEl.innerText = `₹${Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

async function handleCompleteSale() {
    if (cart.length === 0) {
        showToast("Please add at least one product to the sale order", "warning");
        return;
    }

    const customerId = customerSelect.value ? Number(customerSelect.value) : null;

    const salePayload = {
        customerId: customerId,
        items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))
    };

    completeSaleBtn.disabled = true;
    completeSaleBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Transaction...';

    try {
        const result = await apiRequest('/sales', {
            method: 'POST',
            body: JSON.stringify(salePayload)
        });

        showToast(`Sale completed! Invoice #${result.invoiceNumber}`, "success");

        // Clear cart
        cart = [];
        renderCart();

        // Refresh products and sales history
        await Promise.all([
            loadProductsForSale(),
            loadSalesHistory()
        ]);

        // Open invoice preview
        showInvoiceModal(result);

    } catch (err) {
        showToast(err.message, "error");
    } finally {
        completeSaleBtn.disabled = false;
        completeSaleBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Complete Sale & Generate Invoice';
    }
}

async function loadSalesHistory() {
    try {
        const sales = await apiRequest('/sales');
        renderSalesHistory(sales);
    } catch (err) {
        salesTable.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#dc2626;">Failed to load sales: ${err.message}</td></tr>`;
    }
}

function renderSalesHistory(sales) {
    salesTable.innerHTML = "";

    if (!sales || sales.length === 0) {
        salesTable.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#6b7280;">No sales recorded yet.</td></tr>`;
        return;
    }

    sales.forEach(s => {
        const dateStr = s.saleDate ? new Date(s.saleDate).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : '-';
        const itemsCount = s.items ? s.items.length : 1;

        salesTable.innerHTML += `
            <tr>
                <td><strong>${escapeHtml(s.invoiceNumber)}</strong></td>
                <td>${escapeHtml(s.customerName || 'Walk-in Retail')}</td>
                <td>${itemsCount} item(s)</td>
                <td><strong>₹${Number(s.totalAmount || 0).toLocaleString('en-IN')}</strong></td>
                <td>${dateStr}</td>
                <td><span class="green" style="color:#16a34a; font-weight:bold;">${s.status}</span></td>
                <td>
                    <button class="edit-btn" onclick="fetchAndShowInvoice(${s.id})" style="padding:6px 12px; font-size:13px;">
                        <i class="fa-solid fa-file-invoice"></i> View Invoice
                    </button>
                </td>
            </tr>
        `;
    });
}

async function fetchAndShowInvoice(saleId) {
    try {
        const sale = await apiRequest(`/sales/${saleId}/invoice`);
        showInvoiceModal(sale);
    } catch (err) {
        showToast("Failed to load invoice details: " + err.message, "error");
    }
}

function showInvoiceModal(sale) {
    const dateStr = sale.saleDate ? new Date(sale.saleDate).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
    
    let itemsHtml = '';
    (sale.items || []).forEach((item, idx) => {
        itemsHtml += `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding:10px;">${idx + 1}</td>
                <td style="padding:10px;"><strong>${escapeHtml(item.productName)}</strong></td>
                <td style="padding:10px; text-align:center;">${item.quantity}</td>
                <td style="padding:10px; text-align:right;">₹${Number(item.unitPrice).toLocaleString('en-IN')}</td>
                <td style="padding:10px; text-align:right;"><strong>₹${Number(item.subtotal).toLocaleString('en-IN')}</strong></td>
            </tr>
        `;
    });

    printableInvoice.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color:#1f2937;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #2563eb; padding-bottom:15px; margin-bottom:20px;">
                <div>
                    <h2 style="margin:0; color:#2563eb; font-size:24px;">📦 INVENTORY SYSTEM</h2>
                    <p style="margin:4px 0 0; color:#6b7280; font-size:12px;">Official Sales Tax Invoice</p>
                </div>
                <div style="text-align:right;">
                    <h3 style="margin:0; font-size:18px;">INVOICE</h3>
                    <p style="margin:4px 0 0; font-weight:bold; color:#1f2937;">${escapeHtml(sale.invoiceNumber)}</p>
                    <p style="margin:2px 0 0; font-size:12px; color:#6b7280;">Date: ${dateStr}</p>
                </div>
            </div>

            <div style="margin-bottom:20px; background:#f8fafc; padding:12px; border-radius:6px;">
                <p style="margin:0; font-size:13px;"><strong>Billed To:</strong> ${escapeHtml(sale.customerName || 'Walk-in Retail Customer')}</p>
                <p style="margin:4px 0 0; font-size:12px; color:#6b7280;">Payment Status: <strong style="color:#16a34a;">PAID / ${sale.status}</strong></p>
            </div>

            <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
                <thead>
                    <tr style="background:#2563eb; color:white;">
                        <th style="padding:10px; text-align:left;">#</th>
                        <th style="padding:10px; text-align:left;">Product Description</th>
                        <th style="padding:10px; text-align:center;">Qty</th>
                        <th style="padding:10px; text-align:right;">Unit Price</th>
                        <th style="padding:10px; text-align:right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div style="text-align:right; border-top:2px solid #e5e7eb; padding-top:15px;">
                <p style="font-size:14px; margin:0; color:#4b5563;">Total Payable Amount:</p>
                <h2 style="font-size:26px; margin:5px 0 0; color:#16a34a;">₹${Number(sale.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            </div>

            <div style="margin-top:40px; text-align:center; font-size:12px; color:#9ca3af; border-top:1px dashed #e5e7eb; padding-top:15px;">
                Thank you for your business! For queries, contact inventory-support@ims.com
            </div>
        </div>
    `;

    invoiceModal.style.display = "block";
}

function closeInvoiceModal() {
    invoiceModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target === invoiceModal) {
        closeInvoiceModal();
    }
};

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}
