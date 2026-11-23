/**
 * Inventory Management System - API Client Service
 * Handles unified fetch requests, JWT authorization headers,
 * auto-redirection on 401, error handling, and toast notifications.
 */

const API_BASE = '/api';

// Toast Notification Utility
function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 360px;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const colors = {
        success: '#16a34a',
        error: '#dc2626',
        warning: '#d97706',
        info: '#2563eb'
    };
    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };

    toast.style.cssText = `
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 18px;
        border-radius: 8px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.18);
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
    `;

    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Master API Request Method
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            showToast('Session expired. Please log in again.', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            throw new Error('Unauthorized');
        }

        if (response.status === 403) {
            showToast('Permission denied for this action.', 'error');
            throw new Error('Forbidden');
        }

        if (response.status === 204) {
            return null;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMsg = data?.message || data?.errors 
                ? (typeof data.errors === 'object' ? Object.values(data.errors).join(', ') : data.message)
                : `Error ${response.status}: Request failed`;
            throw new Error(errorMsg);
        }

        return data;
    } catch (err) {
        if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
            console.error('API Error:', err);
        }
        throw err;
    }
}
