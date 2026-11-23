/**
 * Stock Management & Movements Client Logic
 */

let products = [];
let movements = [];
let currentFilter = 'ALL';

const stockTable = document.getElementById("stockTable");
const movementsTable = document.getElementById("movementsTable");

document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        loadStockLevels(),
        loadMovements()
    ]);
});

async function loadStockLevels() {
    try {
        products = await apiRequest('/products');
        renderStock();
    } catch (err) {
        stockTable.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#dc2626;">Failed to load inventory: ${err.message}</td></tr>`;
    }
}

async function loadMovements() {
    try {
        movements = await apiRequest('/stock-movements');
        renderMovements();
    } catch (err) {
        movementsTable.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#dc2626;">Failed to load movement history: ${err.message}</td></tr>`;
    }
}

function filterStock(type) {
    currentFilter = type;
    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.style.opacity = '0.7';
    });
    event.target.style.opacity = '1';
    renderStock();
}

function renderStock() {
    stockTable.innerHTML = "";

    let filtered = products;
    if (currentFilter === 'LOW') {
        filtered = products.filter(p => p.quantity > 0 && p.quantity <= (p.minimumStock || 10));
    } else if (currentFilter === 'OUT') {
        filtered = products.filter(p => p.quantity === 0);
    }

    if (!filtered || filtered.length === 0) {
        stockTable.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#6b7280;">No products match the selected filter.</td></tr>`;
        return;
    }

    filtered.forEach(p => {
        let statusBadge = '<span class="green" style="color:#16a34a; font-weight:bold;">In Stock</span>';
        if (p.quantity === 0) {
            statusBadge = '<span class="red" style="color:#dc2626; font-weight:bold;">Out of Stock</span>';
        } else if (p.quantity <= (p.minimumStock || 10)) {
            statusBadge = '<span class="orange" style="color:#d97706; font-weight:bold;">Low Stock</span>';
        }

        stockTable.innerHTML += `
            <tr>
                <td><strong>${escapeHtml(p.sku || `PRD-${p.id}`)}</strong></td>
                <td><strong>${escapeHtml(p.productName)}</strong></td>
                <td>${escapeHtml(p.categoryName || '-')}</td>
                <td><span style="font-size:15px; font-weight:bold;">${p.quantity}</span></td>
                <td>${p.minimumStock || 10}</td>
                <td>${escapeHtml(p.unit || 'pcs')}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    });
}

function renderMovements() {
    movementsTable.innerHTML = "";

    if (!movements || movements.length === 0) {
        movementsTable.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#6b7280;">No movement logs recorded yet.</td></tr>`;
        return;
    }

    // Sort newest first
    const sorted = [...movements].sort((a, b) => new Date(b.movementDate) - new Date(a.movementDate));

    sorted.forEach(m => {
        const isEntry = m.movementType === 'IN';
        const typeBadge = isEntry 
            ? `<span style="background:#dcfce7; color:#166534; padding:3px 8px; border-radius:4px; font-weight:bold;"><i class="fa-solid fa-arrow-down"></i> IN</span>`
            : `<span style="background:#fee2e2; color:#991b1b; padding:3px 8px; border-radius:4px; font-weight:bold;"><i class="fa-solid fa-arrow-up"></i> OUT</span>`;

        const qtyDisplay = isEntry ? `+${m.quantity}` : `-${m.quantity}`;
        const qtyColor = isEntry ? '#16a34a' : '#dc2626';

        const dateStr = m.movementDate ? new Date(m.movementDate).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : '-';

        movementsTable.innerHTML += `
            <tr>
                <td><strong>MOV-${m.id}</strong></td>
                <td>${escapeHtml(m.productName || `Product #${m.productId}`)}</td>
                <td>${typeBadge}</td>
                <td><strong style="color:${qtyColor};">${qtyDisplay}</strong></td>
                <td><code>${escapeHtml(m.reference || 'DIRECT-ADJUSTMENT')}</code></td>
                <td>${dateStr}</td>
                <td>${escapeHtml(m.userName || 'System')}</td>
            </tr>
        `;
    });
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}
