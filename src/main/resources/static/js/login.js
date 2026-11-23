const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const btnText = document.getElementById("btnText");
const errorDiv = document.getElementById("loginError");

function fillDemo(email, password) {
    document.getElementById("email").value = email;
    document.getElementById("password").value = password;
}

loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    errorDiv.style.display = "none";
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    btnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
    loginBtn.disabled = true;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Invalid email or password");
        }

        // Store JWT token and user profile
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify({
            id: data.id,
            fullName: data.fullName,
            email: data.email,
            role: data.role
        }));

        showToast("Login successful! Redirecting...", "success");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 600);

    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = "block";
        showToast(err.message, "error");
    } finally {
        btnText.textContent = "Sign In to Dashboard";
        loginBtn.disabled = false;
    }
});
