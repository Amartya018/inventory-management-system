/**
 * Dashboard dynamic data loader
 */

document.addEventListener("DOMContentLoaded", async () => {
    await loadDashboardStats();
    await loadRecentProducts();
    await loadRecentSales();
});

async function loadDashboardStats() {
    try {
        const stats = await apiRequest('/dashboard/stats');
        if (stats) {
            document.getElementById("totalProducts").innerText = stats.totalProducts ?? 0;
            document.getElementById("totalCategories").innerText = stats.totalCategories ?? 0;
            document.getElementById("totalSuppliers").innerText = stats.totalSuppliers ?? 0;
            document.getElementById("lowStock").innerText = stats.lowStockCount ?? 0;

            const salesEl = document.getElementById("totalSales");
            if (salesEl) salesEl.innerText = stats.totalSales ?? 0;

            const revenueEl = document.getElementById("totalRevenue");
            if (revenueEl) {
                const rev = stats.totalRevenue ? Number(stats.totalRevenue).toLocaleString('en-IN') : '0';
                revenueEl.innerText = `₹${rev}`;
            }
        }
    } catch (err) {
        console.error("Failed to load dashboard stats:", err);
    }
}

async function loadRecentProducts() {
    const tableBody = document.getElementById("recentProductsTable");
    if (!tableBody) return;

    try {
        const products = await apiRequest('/products');
        tableBody.innerHTML = "";

        if (!products || products.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#6b7280;">No products in inventory. <a href="products.html" style="color:#2563eb;">Add your first product</a></td></tr>`;
            return;
        }

        // Show first 5 recent products
        const recent = products.slice(0, 5);
        recent.forEach(p => {
            let statusBadge = '<span class="green" style="color:#16a34a; font-weight:bold;">Available</span>';
            if (p.quantity === 0) {
                statusBadge = '<span class="red" style="color:#dc2626; font-weight:bold;">Out of Stock</span>';
            } else if (p.quantity <= (p.minimumStock || 10)) {
                statusBadge = '<span class="orange" style="color:#d97706; font-weight:bold;">Low Stock</span>';
            }

            const sku = p.sku || `PRD-${p.id}`;
            const cat = p.categoryName || 'General';
            const price = p.sellingPrice != null ? `₹${Number(p.sellingPrice).toLocaleString('en-IN')}` : '-';

            tableBody.innerHTML += `
                <tr>
                    <td><strong>${sku}</strong></td>
                    <td>${escapeHtml(p.productName)}</td>
                    <td>${escapeHtml(cat)}</td>
                    <td>${price}</td>
                    <td><strong>${p.quantity}</strong> ${p.unit || 'pcs'}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        });
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#dc2626; padding:15px;">Failed to load products: ${err.message}</td></tr>`;
    }
}

async function loadRecentSales() {
    const salesBody = document.getElementById("recentSalesTable");
    if (!salesBody) return;

    try {
        const sales = await apiRequest('/dashboard/recent-sales');
        salesBody.innerHTML = "";

        if (!sales || sales.length === 0) {
            salesBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#6b7280;">No sales recorded yet. <a href="sales.html" style="color:#2563eb;">Create a sale</a></td></tr>`;
            return;
        }

        sales.forEach(s => {
            const dateStr = s.saleDate ? new Date(s.saleDate).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : '-';
            const amount = s.totalAmount ? `₹${Number(s.totalAmount).toLocaleString('en-IN')}` : '₹0';

            salesBody.innerHTML += `
                <tr>
                    <td><strong>${s.invoiceNumber}</strong></td>
                    <td>${escapeHtml(s.customerName || 'Walk-in')}</td>
                    <td>${amount}</td>
                    <td>${dateStr}</td>
                    <td><span class="green" style="color:#16a34a; font-weight:bold;">${s.status}</span></td>
                </tr>
            `;
        });
    } catch (err) {
        salesBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#dc2626; padding:15px;">Failed to load recent sales</td></tr>`;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}
