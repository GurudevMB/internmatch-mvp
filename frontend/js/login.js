const API_URL = "https://internmatch-mvp.onrender.com";

document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    try {
        let response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        let data = await response.json();

        if (!response.ok) {
            response = await fetch(`${API_URL}/company-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            data = await response.json();
        }

        if (!response.ok) {
            alert(data.detail || "Login failed");
            return;
        }

        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("tokenType", data.token_type || "bearer");
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);

        if (data.role === "admin") {
            location.href = "admin.html";
        } else if (data.role === "company") {
            location.href = "company-dashboard.html";
        } else {
            location.href = "dashboard.html";
        }
    } catch {
        alert("Server connection failed. Try again.");
    }
});
