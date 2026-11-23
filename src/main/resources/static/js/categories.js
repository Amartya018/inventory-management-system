/**
 * Category Management - Live Spring Boot REST API Client
 */

const categoryTable = document.getElementById("categoryTable");
const saveBtn = document.getElementById("saveCategory");
const saveBtnText = document.getElementById("saveBtnText");
const cancelBtn = document.getElementById("cancelCategoryBtn");
const nameInput = document.getElementById("categoryName");
const descInput = document.getElementById("categoryDesc");
const formTitle = document.getElementById("formTitle");

let categories = [];
let editId = null;

document.addEventListener("DOMContentLoaded", loadCategories);

async function loadCategories() {
    try {
        categories = await apiRequest('/categories');
        renderCategories();
    } catch (err) {
        categoryTable.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:#dc2626;">Failed to load categories: ${err.message}</td></tr>`;
    }
}

function renderCategories() {
    categoryTable.innerHTML = "";

    if (!categories || categories.length === 0) {
        categoryTable.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:#6b7280;">No categories registered yet. Add one above.</td></tr>`;
        return;
    }

    categories.forEach(c => {
        categoryTable.innerHTML += `
            <tr>
                <td><strong>CAT-${c.id}</strong></td>
                <td><strong>${escapeHtml(c.categoryName)}</strong></td>
                <td>${escapeHtml(c.description || '-')}</td>
                <td>
                    <button class="edit-btn" onclick="editCategory(${c.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteCategory(${c.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

saveBtn.onclick = async function () {
    const name = nameInput.value.trim();
    const desc = descInput.value.trim();

    if (!name) {
        showToast("Category name is required", "warning");
        nameInput.focus();
        return;
    }

    try {
        if (editId) {
            await apiRequest(`/categories/${editId}`, {
                method: 'PUT',
                body: JSON.stringify({ categoryName: name, description: desc })
            });
            showToast("Category updated successfully", "success");
        } else {
            await apiRequest('/categories', {
                method: 'POST',
                body: JSON.stringify({ categoryName: name, description: desc })
            });
            showToast("Category added successfully", "success");
        }

        cancelCategoryEdit();
        await loadCategories();
    } catch (err) {
        showToast(err.message, "error");
    }
};

function editCategory(id) {
    const c = categories.find(item => item.id === id);
    if (!c) return;

    editId = id;
    nameInput.value = c.categoryName || '';
    descInput.value = c.description || '';

    formTitle.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color:#16a34a;"></i> Edit Category`;
    saveBtnText.innerText = "Update Category";
    cancelBtn.style.display = "inline-block";
    nameInput.focus();
}

function cancelCategoryEdit() {
    editId = null;
    nameInput.value = "";
    descInput.value = "";
    formTitle.innerHTML = `<i class="fa-solid fa-folder-plus" style="color:#2563eb;"></i> Add New Category`;
    saveBtnText.innerText = "Add Category";
    cancelBtn.style.display = "none";
}

async function deleteCategory(id) {
    const c = categories.find(item => item.id === id);
    const cName = c ? c.categoryName : `ID ${id}`;

    if (!confirm(`Delete category "${cName}"? Any products assigned to this category will have it cleared.`)) {
        return;
    }

    try {
        await apiRequest(`/categories/${id}`, { method: 'DELETE' });
        showToast("Category deleted successfully", "success");
        await loadCategories();
    } catch (err) {
        showToast(`Cannot delete category: ${err.message}`, "error");
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}
