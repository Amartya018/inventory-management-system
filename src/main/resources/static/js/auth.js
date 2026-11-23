/**
 * Auth Guard and User Session Handler
 */

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const token = localStorage.getItem("token");

if (!token || !currentUser) {
    window.location.href = "login.html";
} else {
    document.addEventListener("DOMContentLoaded", () => {
        // Update user greeting in header if present
        const welcomeEl = document.querySelector("header p");
        if (welcomeEl) {
            welcomeEl.innerHTML = `Welcome <strong>${currentUser.fullName || currentUser.email}</strong> <span style="background:rgba(37,99,235,0.15); color:#2563eb; padding:2px 8px; border-radius:12px; font-size:12px; margin-left:8px; font-weight:bold;">${currentUser.role}</span> 👋`;
        }

        // Apply dark mode if previously enabled
        if (localStorage.getItem("darkMode") === "true") {
            document.body.classList.add("dark");
        }

        // If staff role, hide or restrict admin-only buttons
        if (currentUser.role === 'STAFF') {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        }
    });
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    showToast("Logged out successfully", "info");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 500);
}
