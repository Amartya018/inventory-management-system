/**
 * Inventory Reports & Charts Logic
 */

let myChart = null;

document.addEventListener("DOMContentLoaded", async () => {
    await loadReportsData();
});

async function loadReportsData() {
    try {
        const [stats, products] = await Promise.all([
            apiRequest('/dashboard/stats'),
            apiRequest('/products')
        ]);

        if (stats) {
            document.getElementById("totalProducts").innerText = stats.totalProducts ?? 0;
            document.getElementById("totalCategories").innerText = stats.totalCategories ?? 0;
            document.getElementById("totalSuppliers").innerText = stats.totalSuppliers ?? 0;
        }

        let totalQty = 0;
        let totalCost = 0;
        let totalRetail = 0;
        let inStock = 0;
        let lowStock = 0;
        let outStock = 0;

        (products || []).forEach(p => {
            const qty = Number(p.quantity || 0);
            const purchase = Number(p.purchasePrice || 0);
            const selling = Number(p.sellingPrice || 0);
            const minStock = Number(p.minimumStock || 10);

            totalQty += qty;
            totalCost += (qty * purchase);
            totalRetail += (qty * selling);

            if (qty === 0) {
                outStock++;
            } else if (qty <= minStock) {
                lowStock++;
            } else {
                inStock++;
            }
        });

        document.getElementById("totalStockQuantity").innerText = totalQty.toLocaleString('en-IN');
        document.getElementById("totalInventoryCost").innerText = `₹${totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        document.getElementById("totalInventoryRetail").innerText = `₹${totalRetail.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

        // Render Chart
        renderChart(inStock, lowStock, outStock);

    } catch (err) {
        console.error("Failed to load reports data:", err);
    }
}

function renderChart(inStock, lowStock, outStock) {
    const canvas = document.getElementById("inventoryChart");
    if (!canvas) return;

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: [
                `In Stock (${inStock})`,
                `Low Stock (${lowStock})`,
                `Out of Stock (${outStock})`
            ],
            datasets: [{
                data: [inStock, lowStock, outStock],
                backgroundColor: [
                    "#16a34a", // Green
                    "#f59e0b", // Amber
                    "#dc2626"  // Red
                ],
                borderWidth: 2,
                borderColor: "#ffffff"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}
