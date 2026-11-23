/**
 * Settings Logic
 */

const themeBtn = document.getElementById("themeBtn");

document.addEventListener("DOMContentLoaded", () => {
    // Populate user details
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const nameEl = document.getElementById("profileName");
    const emailEl = document.getElementById("profileEmail");
    const roleEl = document.getElementById("profileRole");

    if (nameEl) nameEl.innerText = user.fullName || "User";
    if (emailEl) emailEl.innerText = user.email || "-";
    if (roleEl) roleEl.innerText = user.role || "STAFF";

    applyTheme();

    if (themeBtn) {
        themeBtn.onclick = function () {
            let isDark = localStorage.getItem("darkMode") === "true";
            isDark = !isDark;
            localStorage.setItem("darkMode", isDark);
            applyTheme();
        };
    }
});

function applyTheme() {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
        document.body.classList.add("dark");
        if (themeBtn) themeBtn.innerText = "☀ Switch to Light Mode";
    } else {
        document.body.classList.remove("dark");
        if (themeBtn) themeBtn.innerText = "🌙 Enable Dark Mode";
    }
}
