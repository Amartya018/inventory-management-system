/**
 * Public Landing Page App Script
 */

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

    if (token && currentUser) {
        // Change login link to dashboard in navbar
        const navLinks = document.querySelectorAll(".navbar ul a");
        navLinks.forEach(link => {
            if (link.getAttribute("href") === "login.html") {
                link.setAttribute("href", "dashboard.html");
                link.innerHTML = `<i class="fa-solid fa-gauge-high"></i> Dashboard (${currentUser.role})`;
                link.style.color = "#60a5fa";
                link.style.fontWeight = "bold";
            }
        });

        // Change hero button
        const getStartedBtn = document.querySelector(".hero-buttons .primary-btn");
        if (getStartedBtn && getStartedBtn.getAttribute("href") === "login.html") {
            getStartedBtn.setAttribute("href", "dashboard.html");
            getStartedBtn.innerHTML = `Go to Dashboard <i class="fa-solid fa-arrow-right"></i>`;
        }
    }
});
